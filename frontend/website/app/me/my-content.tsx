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
    <header className="flex flex-wrap items-center justify-between gap-5 pb-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-base font-bold text-accent" aria-hidden="true">{profile?.displayName.charAt(0).toUpperCase()}</span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Profile</p>
          <h1 className="truncate text-xl font-bold sm:text-2xl">{profile?.displayName}</h1>
          <p className="truncate text-xs text-muted">@{profile?.username}</p>
        </div>
      </div>
      <Link href={`/me/${view}/new`} className="inline-flex items-center gap-2 rounded-md bg-button px-3 py-2 text-xs font-bold text-button-text no-underline"><Plus className="h-3.5 w-3.5" />{view === "articles" ? "New article" : "New topic"}</Link>
    </header>
    <nav className="inline-flex rounded-lg bg-soft p-1" aria-label="My content types">
      {(["articles", "topics"] as const).map((tab) => {
        const Icon = tab === "articles" ? BookOpen : MessagesSquare;
        return <Link key={tab} href={personalHref(tab)} aria-current={view === tab ? "page" : undefined} className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs no-underline ${view === tab ? "bg-paper font-bold shadow-sm" : "text-muted"}`}><Icon className="h-3.5 w-3.5" />{tab === "articles" ? "Articles" : "Topics"}</Link>;
      })}
    </nav>
    {notice && <p role="status" className="mt-5 rounded-lg border border-upvote/30 bg-upvote/5 p-3 text-sm">{notice}</p>}
    {view === "topics" && <p className="mt-5 text-xs leading-6 text-muted">New topics are not public until an administrator activates them. You can still edit or delete them here.</p>}
    {error ? <div className="mt-6"><PersonalFailure error={error} retry={refresh} /></div> : !result ? <ListLoading label={`Loading your ${view}`} /> : <>
      {!result.items.length && <EmptyState title={`No ${view} yet`} />}
      {result.items.length > 0 && <div className="mt-4 overflow-hidden rounded-lg border border-line">
      {result.items.map((item) => <article key={item.publicUri} className="border-b border-line px-4 py-4 last:border-b-0">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted"><span>{item.categoryName}</span><span className={`rounded-full border px-1.5 py-0.5 ${item.isActive ? "border-upvote/30 text-upvote" : "border-line"}`}>{item.isActive ? "Public" : "Not public"}</span>{item.updatedAt && <time className="ml-auto" dateTime={item.updatedAt}>Updated {formatDate(item.updatedAt)}</time>}</div>
        <h2 className="mt-2.5 text-base font-bold"><Link href={`/me/${view}/${encodeURIComponent(item.publicUri)}/edit`} className="no-underline hover:text-muted">{item.title}</Link></h2>
        <div className="mt-2.5"><Tags tags={item.tags} /></div>
        <div className="mt-3.5 flex flex-wrap gap-4 text-[11px]">
          <Link href={`/me/${view}/${encodeURIComponent(item.publicUri)}/edit`} className="inline-flex items-center gap-1.5 no-underline"><Pencil className="h-3.5 w-3.5" />Edit</Link>
          <button type="button" onClick={() => { setDeleteError(null); setSelected(item); }} className="inline-flex items-center gap-1.5 text-muted hover:text-downvote"><Trash2 className="h-3.5 w-3.5" />Delete</button>
          {item.isActive && <Link href={view === "articles" ? articleHref(item.categorySlug, item.publicUri) : topicHref(item.publicUri)} className="ml-auto inline-flex items-center gap-1.5 text-muted no-underline">View public page<ArrowUpRight className="h-3.5 w-3.5" /></Link>}
        </div>
      </article>)}</div>}
      <Pagination page={page} hasPrevious={result.hasPrevious} hasNext={result.hasNext} previousHref={personalHref(view, page - 1)} nextHref={personalHref(view, page + 1)} label="My content pages" />
    </>}
    <dialog ref={dialog} onClose={() => { if (!deleteLock.current) setSelected(null); }} onCancel={(event) => { if (deleteLock.current) event.preventDefault(); }} aria-labelledby="delete-title" aria-describedby="delete-description" className="fixed inset-0 m-auto w-[min(90vw,26rem)] rounded-lg border border-line bg-paper p-5 text-ink shadow-xl backdrop:bg-ink/50">
      <h2 id="delete-title" className="text-lg font-bold">Delete {view === "articles" ? "article" : "topic"}?</h2>
      <p className="mt-3 font-bold">{selected?.title}</p>
      <p id="delete-description" className="mt-3 text-sm leading-7 text-muted">{`This permanently deletes your ${view === "articles" ? "article" : "topic"}. This action cannot be undone.`}</p>
      {deleteError && <p role="alert" className="mt-3 text-sm text-downvote">{deleteError}</p>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={deleting} onClick={() => setSelected(null)} className="rounded-lg border border-line px-4 py-2 text-sm disabled:opacity-50">Cancel</button><button type="button" disabled={deleting} onClick={remove} className="rounded-lg bg-downvote px-4 py-2 text-sm font-bold text-paper disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button></div>
    </dialog>
  </>;
}
