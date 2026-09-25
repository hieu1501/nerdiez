"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, MessagesSquare, Plus, Pencil, Trash2, ArrowUpRight } from "lucide-react";
import { ApiError } from "@/lib/api";
import { fetchPersonalArticles, fetchPersonalTopics, deletePersonalContent, personalHref } from "@/lib/personal-api";
import { articleHref, topicHref, publicIdentifier, PAGE_SIZE, formatDate, type CategoryView } from "@/lib/resource-links";
import { useAuth } from "@/app/auth-provider";
import { EmptyState, ListLoading, Pagination, Tags } from "@/app/components/content-ui";
import { SubjectChip } from "@/app/components/subject";
import { PersonalFailure, personalErrorMessage } from "./personal-feedback";

interface Item {
  publicUri: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  tags: { slugName: string }[];
  updatedAt?: string;
  isActive: boolean;
}
interface Result { items: Item[]; hasPrevious: boolean; hasNext: boolean }

export default function MyContent({ view, page }: { view: CategoryView; page: number }) {
  const { profile, expireSession } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const deleteLock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const request = view === "articles" ? fetchPersonalArticles(page - 1, PAGE_SIZE) : fetchPersonalTopics(page - 1, PAGE_SIZE);
    request.then((slice) => {
      if (cancelled) return;
      const items = slice.items.map((entry): Item => {
        if ("content" in entry) {
          const item = entry.content;
          return { publicUri: publicIdentifier(item.canonicalUri, "articles", "personal"), title: item.title, categorySlug: item.category.slugName, categoryName: item.category.name, tags: item.tags, updatedAt: item.updatedAt, isActive: item.isActive };
        }
        return { publicUri: publicIdentifier(entry.canonicalUri, "topics", "personal"), title: entry.name, categorySlug: entry.category.slugName, categoryName: entry.category.name, tags: entry.tags, isActive: entry.isActive };
      });
      if (!items.length && page > 1) {
        // After deletion, return to the preceding page. A direct out-of-range
        // URL goes to page one instead of walking through every empty page.
        router.replace(personalHref(view, reload > 0 ? page - 1 : 1));
        return;
      }
      setResult({ items, hasNext: slice.hasNext, hasPrevious: slice.hasPrevious });
    }).catch((failure) => {
      if (cancelled) return;
      if (failure instanceof ApiError && failure.status === 401) expireSession();
      else setError(failure);
    });
    return () => { cancelled = true; };
  }, [view, page, reload, profile?.username, expireSession, router]);

  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
    else if (!selected && dialog.current?.open) dialog.current?.close();
  }, [selected]);

  const refresh = () => { setError(null); setResult(null); setReload((value) => value + 1); };
  const remove = async () => {
    if (!selected || deleteLock.current) return;
    deleteLock.current = true;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePersonalContent(view, selected.publicUri);
      setSelected(null);
      setNotice(view === "articles" ? "Article deleted." : "Topic deleted.");
      refresh();
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) expireSession();
      else setDeleteError(personalErrorMessage(failure));
    } finally { deleteLock.current = false; setDeleting(false); }
  };

  return <>
    <header className="card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-accent-soft blur-2xl" aria-hidden="true" />
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          {profile?.avatarUrl && !avatarFailed
            // eslint-disable-next-line @next/next/no-img-element -- Google's image host rejects some hotlinked requests that send a Referer.
            ? <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" onError={() => setAvatarFailed(true)} className="h-14 w-14 shrink-0 rounded-full border border-line bg-soft object-cover" />
            : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xl font-bold text-accent" aria-hidden="true">{profile?.displayName.charAt(0).toUpperCase()}</span>}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{profile?.displayName}</h1>
            <p className="truncate text-sm text-muted">@{profile?.username}</p>
          </div>
        </div>
        <Link href={`/me/${view}/new`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-button px-3.5 text-sm font-semibold text-button-text no-underline hover:bg-accent-hover"><Plus className="h-4 w-4" />{view === "articles" ? "New article" : "New question"}</Link>
      </div>
    </header>
    <nav className="mt-6 flex gap-6 border-b border-line" aria-label="My content types">
      {(["articles", "topics"] as const).map((tab) => {
        const Icon = tab === "articles" ? BookOpen : MessagesSquare;
        return <Link key={tab} href={personalHref(tab)} aria-current={view === tab ? "page" : undefined} className={`-mb-px inline-flex items-center gap-2 border-b-2 pb-3 text-sm no-underline ${view === tab ? "border-accent font-semibold text-ink" : "border-transparent text-muted hover:text-ink"}`}><Icon className="h-4 w-4" />{tab === "articles" ? "Articles" : "Questions"}</Link>;
      })}
    </nav>
    {notice && <p role="status" className="mt-5 rounded-lg bg-accent-soft px-3.5 py-2.5 text-sm font-medium text-accent">{notice}</p>}
    <p className="mt-4 text-xs leading-6 text-muted">Drafts are only visible to you here. {view === "topics" ? "New questions stay drafts until an administrator approves them." : "Open a draft to keep writing or publish it."}</p>
    {error ? <div className="mt-4"><PersonalFailure error={error} retry={refresh} /></div> : !result ? <ListLoading label={`Loading your ${view}`} /> : <>
      {!result.items.length && <EmptyState title={view === "articles" ? "No articles yet" : "No questions yet"} description={view === "articles" ? "Write about something you learned recently." : "Ask about a concept you want explained."} />}
      {result.items.length > 0 && <div className="mt-4 space-y-3">
      {result.items.map((item) => <article key={item.publicUri} className="card group p-4 transition-colors hover:border-accent/50 sm:p-5">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted"><SubjectChip slug={item.categorySlug} name={item.categoryName} /><span className={`rounded-full px-2 py-0.5 font-medium ${item.isActive ? "bg-accent-soft text-accent" : "bg-highlight-soft text-highlight"}`}>{item.isActive ? "Public" : "Draft"}</span>{item.updatedAt && <time className="ml-auto" dateTime={item.updatedAt}>Updated {formatDate(item.updatedAt)}</time>}</div>
        <h2 className="mt-2.5 text-base font-bold tracking-tight"><Link href={`/me/${view}/${encodeURIComponent(item.publicUri)}/edit`} className="no-underline hover:text-accent">{item.title}</Link></h2>
        <div className="mt-2"><Tags tags={item.tags} /></div>
        <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-3 text-xs">
          <Link href={`/me/${view}/${encodeURIComponent(item.publicUri)}/edit`} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-medium no-underline hover:bg-soft"><Pencil className="h-3.5 w-3.5" />Edit</Link>
          <button type="button" onClick={() => { setDeleteError(null); setSelected(item); }} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-muted hover:bg-soft hover:text-danger"><Trash2 className="h-3.5 w-3.5" />Delete</button>
          {item.isActive && <Link href={view === "articles" ? articleHref(item.categorySlug, item.publicUri) : topicHref(item.publicUri)} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-muted no-underline hover:bg-soft hover:text-accent">View public page<ArrowUpRight className="h-3.5 w-3.5" /></Link>}
        </div>
      </article>)}</div>}
      <Pagination page={page} hasPrevious={result.hasPrevious} hasNext={result.hasNext} previousHref={personalHref(view, page - 1)} nextHref={personalHref(view, page + 1)} label="My content pages" />
    </>}
    <dialog ref={dialog} onClose={() => { if (!deleteLock.current) setSelected(null); }} onCancel={(event) => { if (deleteLock.current) event.preventDefault(); }} aria-labelledby="delete-title" aria-describedby="delete-description" className="fixed inset-0 m-auto w-[min(90vw,26rem)] rounded-2xl border border-line bg-surface p-6 text-ink shadow-pop backdrop:bg-black/50">
      <h2 id="delete-title" className="text-lg font-bold">Delete {view === "articles" ? "article" : "question"}?</h2>
      <p className="mt-3 font-semibold">{selected?.title}</p>
      <p id="delete-description" className="mt-3 text-sm leading-7 text-muted">{`This permanently deletes your ${view === "articles" ? "article" : "topic"}. This action cannot be undone.`}</p>
      {deleteError && <p role="alert" className="mt-3 text-sm text-danger">{deleteError}</p>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={deleting} onClick={() => setSelected(null)} className="h-9 rounded-lg border border-line px-4 text-sm font-medium hover:bg-soft disabled:opacity-50">Cancel</button><button type="button" disabled={deleting} onClick={remove} className="h-9 rounded-lg bg-danger px-4 text-sm font-semibold text-white disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button></div>
    </dialog>
  </>;
}
