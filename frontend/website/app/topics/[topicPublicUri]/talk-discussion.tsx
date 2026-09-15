"use client";

import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MessagesSquare, Pencil, Plus, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/app/auth-provider";
import { CompactLoading } from "@/app/components/content-ui";
import { personalErrorMessage } from "@/app/me/personal-feedback";
import { ApiError, type SliceResponse } from "@/lib/api";
import { createTalk, patchTalk, deletePersonalContent, fetchPersonalTalks, type PersonalTalkContentDTO } from "@/lib/personal-api";
import { editorStorageKey } from "@/lib/auth-storage";
import { parseTalkDraft, talkDraftChanged, talkDraftError, talkDraftKey, talkPatch, type TalkDraft } from "@/lib/talk-drafts";
import { formatDate, PAGE_SIZE, publicIdentifier, topicHref, type TalkView } from "@/lib/resource-links";
import TalkEditor from "./talk-editor";

type EditableTalk = { publicUri: string; content: string };
type Props = { topicPublicUri: string; view: TalkView; page: number; children: ReactNode };
const DiscussionContext = createContext<{
  draft: TalkDraft | null; editor: ReactNode; pending: boolean; recovered: boolean;
  edit: (talk: EditableTalk) => void; remove: (talk: EditableTalk, count: number) => void;
  navigate: (view: TalkView, page: number) => void;
} | null>(null);
function useDiscussion() {
  const value = useContext(DiscussionContext);
  if (!value) throw new Error("Talk controls require TalkDiscussion");
  return value;
}

export default function TalkDiscussion(props: Props) {
  const { profile, status } = useAuth();
  return <DiscussionSession key={`${props.topicPublicUri}:${profile?.username ?? status}`} {...props} />;
}

function DiscussionSession({ topicPublicUri, view, page, children }: Props) {
  const { profile, status, requestSignIn, expireSession, retryProfile } = useAuth();
  const router = useRouter();
  const markerKey = profile ? editorStorageKey(profile.username, `talks-open:${encodeURIComponent(topicPublicUri)}`) : null;
  // Authenticated sessions mount only after the browser profile check completes.
  const [recovery] = useState(() => {
    if (!profile || !markerKey) return { draft: null, warning: false };
    try {
      const uri = sessionStorage.getItem(markerKey);
      const restored = uri === null ? null : parseTalkDraft(sessionStorage.getItem(talkDraftKey(profile.username, topicPublicUri, uri || undefined)));
      return { draft: restored && (restored.publicUri ?? "") === uri ? restored : null, warning: false };
    } catch { return { draft: null, warning: true }; }
  });
  const [draft, setDraft] = useState<TalkDraft | null>(recovery.draft);
  const [recovered, setRecovered] = useState(Boolean(recovery.draft));
  const [error, setError] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(recovery.warning);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState<(EditableTalk & { count: number }) | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const alive = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  useEffect(() => {
    if (!draft || !talkDraftChanged(draft)) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft]);
  const clearDraft = () => {
    if (profile && markerKey && draft) {
      try { sessionStorage.removeItem(talkDraftKey(profile.username, topicPublicUri, draft.publicUri)); sessionStorage.removeItem(markerKey); }
      catch { setStorageWarning(true); }
    }
    setDraft(null); setError(null); setRecovered(false);
  };
  const discard = () => {
    if (lock.current) return false;
    if (draft && talkDraftChanged(draft) && !window.confirm("Discard unsaved changes?")) return false;
    clearDraft();
    return true;
  };
  const open = (talk?: EditableTalk) => {
    if (status !== "authenticated" || !profile) { requestSignIn("Sign in to add a reply."); return; }
    if (!discard()) return;
    const next: TalkDraft = { publicUri: talk?.publicUri, content: talk?.content ?? "", originalContent: talk?.content ?? "" };
    setDraft(next); setNotice(null);
  };
  const update = (fields: Partial<Pick<TalkDraft, "content">>) => {
    if (!draft || !profile || !markerKey) return;
    const next = { ...draft, ...fields };
    setDraft(next); setError(null);
    try { sessionStorage.setItem(talkDraftKey(profile.username, topicPublicUri, next.publicUri), JSON.stringify(next)); sessionStorage.setItem(markerKey, next.publicUri ?? ""); }
    catch { setStorageWarning(true); }
  };
  const navigate = (nextView: TalkView, nextPage: number) => {
    if (!discard()) return;
    router.push(`${topicHref(topicPublicUri, nextPage, nextView)}#discussion`);
  };
  const fail = (failure: unknown, deleting = false) => {
    if (failure instanceof ApiError && failure.status === 401) expireSession();
    else (deleting ? setDeleteError : setError)(personalErrorMessage(failure));
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || !profile || lock.current) return;
    const validation = talkDraftError(draft);
    if (validation) { setError(validation); return; }
    lock.current = true; setPending(true); setError(null);
    try {
      if (draft.publicUri) {
        const patch = talkPatch(draft);
        if (Object.keys(patch).length) await patchTalk(draft.publicUri, patch);
      } else await createTalk({ content: draft.content, topicPublicUri, isActive: true });
      if (!alive.current) return;
      const created = !draft.publicUri;
      clearDraft(); setNotice(created ? "Reply published." : "Reply updated."); setReload((value) => value + 1);
      if (created) router.push(`${topicHref(topicPublicUri, 1, "mine")}#discussion`);
      router.refresh();
    } catch (failure) { if (alive.current) fail(failure); }
    finally { lock.current = false; if (alive.current) setPending(false); }
  };
  const remove = (talk: EditableTalk, count: number) => {
    if (!discard()) return;
    setDeleteError(null); setSelected({ ...talk, count });
  };
  const confirmDelete = async () => {
    if (!selected || lock.current || !profile) return;
    lock.current = true; setPending(true); setDeleteError(null);
    try {
      await deletePersonalContent("talks", selected.publicUri);
      if (!alive.current) return;
      setSelected(null); setNotice("Reply deleted."); setReload((value) => value + 1);
      if (selected.count === 1 && page > 1) router.replace(`${topicHref(topicPublicUri, page - 1, view)}#discussion`);
      router.refresh();
    } catch (failure) { if (alive.current) fail(failure, true); }
    finally { lock.current = false; if (alive.current) setPending(false); }
  };
  const editor = draft && <TalkEditor key={draft.publicUri ?? "new"} draft={draft} pending={pending} error={error} recovered={recovered} update={update} submit={save} cancel={discard} />;
  return <DiscussionContext.Provider value={{ draft, editor, pending, recovered, edit: open, remove, navigate }}>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 id="discussion-heading" className="flex items-center gap-2 text-lg font-bold"><MessagesSquare className="h-4 w-4 text-muted" aria-hidden="true" />Discussion</h2>
      <button type="button" disabled={pending || status === "checking" || status === "error"} onClick={() => open()} className="inline-flex items-center gap-1.5 rounded-md bg-button px-3 py-2 text-xs font-bold text-button-text disabled:opacity-50"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add reply</button>
    </div>
    <nav aria-label="Discussion filter" className="mt-5 flex gap-5 border-b border-line">
      {(["all", "mine"] as const).map((tab) => <button key={tab} type="button" disabled={pending} aria-current={view === tab ? "page" : undefined} onClick={() => navigate(tab, 1)} className={`-mb-px border-b-2 pb-2.5 text-xs disabled:opacity-50 ${view === tab ? "border-ink font-bold" : "border-transparent text-muted"}`}>{tab === "all" ? "All replies" : "My replies"}</button>)}
    </nav>
    {status === "error" && <p role="alert" className="mt-4 text-sm">Could not check your session. <button type="button" onClick={retryProfile} className="underline">Retry</button></p>}
    {notice && <p role="status" className="mt-4 text-sm text-upvote">{notice}</p>}
    {storageWarning && <p role="status" className="mt-4 text-sm text-muted">Draft recovery is unavailable. Copy your writing before leaving.</p>}
    {draft && (!draft.publicUri || recovered) && editor}
    {view === "all" ? children : status === "authenticated" && profile ? <MyTalks key={`${page}:${reload}`} topicPublicUri={topicPublicUri} page={page} username={profile.username} /> : status === "checking" ? <CompactLoading label="Checking session" /> : status !== "error" && <div className="py-10 text-center"><button type="button" onClick={() => requestSignIn("Sign in to view your replies.")} className="rounded-lg border border-line px-4 py-2 text-sm">Sign in to view your replies</button></div>}
    <dialog ref={dialog} aria-labelledby="delete-talk-title" aria-describedby="delete-talk-description" onCancel={(event) => { event.preventDefault(); if (!lock.current) setSelected(null); }} onClose={() => { if (!lock.current) setSelected(null); }} className="fixed inset-0 m-auto w-[min(90vw,26rem)] rounded-lg border border-line bg-paper p-5 text-ink backdrop:bg-ink/50">
      <h2 id="delete-talk-title" className="text-xl font-bold">Delete reply?</h2><p id="delete-talk-description" className="mt-3 text-sm text-muted">This permanently deletes your reply. This cannot be undone.</p>
      {deleteError && <p role="alert" className="mt-4 text-sm text-downvote">{deleteError}</p>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" autoFocus disabled={pending} onClick={() => setSelected(null)} className="rounded-lg border border-line px-4 py-2 text-sm">Cancel</button><button type="button" disabled={pending} onClick={confirmDelete} className="rounded-lg bg-downvote px-4 py-2 text-sm font-bold text-paper disabled:opacity-50">{pending ? "Deleting…" : "Delete reply"}</button></div>
    </dialog>
  </DiscussionContext.Provider>;
}

export function TalkEntry({ talk, author, count, children }: { talk: EditableTalk; author: string; count: number; children: ReactNode }) {
  const { profile } = useAuth();
  const { draft, editor, pending, recovered, edit, remove } = useDiscussion();
  const owned = profile?.username === author;
  // Recovered editors appear above the list even if their talk is on another page.
  const editing = owned && draft?.publicUri === talk.publicUri;
  return <>
    {owned && <div className="mt-4 flex justify-end gap-4 text-xs text-muted"><button type="button" disabled={pending} onClick={() => edit(talk)} className="inline-flex items-center gap-1.5 hover:text-ink disabled:opacity-50"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Edit</button><button type="button" disabled={pending} onClick={() => remove(talk, count)} className="inline-flex items-center gap-1.5 hover:text-downvote disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Delete</button></div>}
    {editing && !recovered ? editor : children}
  </>;
}

export function TalkPagination({ page, hasPrevious, hasNext, view = "all" }: { page: number; hasPrevious: boolean; hasNext: boolean; view?: TalkView }) {
  const { navigate, pending } = useDiscussion();
  if (!hasPrevious && !hasNext) return null;
  return <nav aria-label="Discussion pages" className="mt-8 flex items-center justify-center gap-3 text-sm">
    {hasPrevious && page > 1 && <button type="button" disabled={pending} onClick={() => navigate(view, page - 1)} className="rounded-md border border-line px-4 py-2">Previous</button>}
    <span aria-current="page" className="text-muted">Page {page}</span>
    {hasNext && <button type="button" disabled={pending} onClick={() => navigate(view, page + 1)} className="rounded-md border border-line px-4 py-2">Next</button>}
  </nav>;
}

function MyTalks({ topicPublicUri, page, username }: { topicPublicUri: string; page: number; username: string }) {
  const { expireSession } = useAuth();
  const [slice, setSlice] = useState<SliceResponse<PersonalTalkContentDTO> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchPersonalTalks(topicPublicUri, page - 1, PAGE_SIZE).then((result) => {
      if (!cancelled) setSlice(result);
    }).catch((failure) => {
      if (cancelled) return;
      if (failure instanceof ApiError && failure.status === 401) expireSession();
      else setError(personalErrorMessage(failure));
    });
    return () => { cancelled = true; };
  }, [topicPublicUri, page, username, attempt, expireSession]);
  if (error) return <div role="alert" className="py-8 text-sm"><p>{error}</p><button type="button" onClick={() => { setError(null); setAttempt((value) => value + 1); }} className="mt-3 underline">Retry</button></div>;
  if (!slice) return <CompactLoading label="Loading your replies" />;
  return <>
    {!slice.items.length && <p className="py-10 text-sm text-muted">{page > 1 ? "No replies on this page." : "You have no replies in this topic."}</p>}
    {slice.items.map((talk) => {
      const publicUri = publicIdentifier(talk.canonicalUri, "talks", "personal");
      return <article key={publicUri} id={`talk-${publicUri}`} className="scroll-mt-20 border-b border-line py-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted"><span className="font-bold text-ink">{username}</span><time dateTime={talk.createdAt}>{formatDate(talk.createdAt)}</time>{!talk.isActive && <span className="rounded border border-line px-2 py-1">Not public</span>}{talk.updatedAt !== talk.createdAt && <span>Updated <time dateTime={talk.updatedAt}>{formatDate(talk.updatedAt)}</time></span>}</div>
        <TalkEntry talk={{ publicUri, content: talk.content }} author={username} count={slice.items.length}>
          <div className="reader-content mt-5"><ReactMarkdown remarkPlugins={[remarkGfm]}>{talk.content}</ReactMarkdown></div>
        </TalkEntry>
      </article>;
    })}
    <TalkPagination page={page} hasPrevious={slice.hasPrevious} hasNext={slice.hasNext} view="mine" />
  </>;
}
