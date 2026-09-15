"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { topicsService, type Topic } from "@/services/topics";
import { talksService, type AdminTalkContentDTO } from "@/services/talks";
import { useResource } from "@/hooks/useResource";
import Button from "@/components/ui/button/Button";
import TopicEditor from "@/components/management/TopicEditor";
import TalkEditor from "@/components/management/TalkEditor";
import DeleteConfirmation from "@/components/management/DeleteConfirmation";
import { actionClass, inputClass, LoadState, PageFooter, panelClass, StatusBadge, TagChips } from "@/components/management/ContentUI";

function Talks({ topicId }: { topicId: number }) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("createdAt,desc");
  const [editor, setEditor] = useState<{ talk?: AdminTalkContentDTO } | null>(null);
  const [deleting, setDeleting] = useState<AdminTalkContentDTO | null>(null);
  const load = useCallback(() => talksService.getForTopic(topicId, { page, size: 10, sort }), [topicId, page, sort]);
  const resource = useResource(load);
  const data = resource.data;
  return <section className="space-y-4" aria-labelledby="talks-heading">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="talks-heading" className="text-xl font-semibold text-gray-900 dark:text-white">Talks{data ? <span className="ml-2 text-sm font-normal text-gray-500">({data.totalItems})</span> : null}</h2>
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Sort talks" className={`${inputClass} !w-auto`} value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}><option value="createdAt,desc">Newest first</option><option value="createdAt,asc">Oldest first</option><option value="updatedAt,desc">Recently updated</option><option value="title,asc">Title A–Z</option></select>
        <Button size="sm" onClick={() => setEditor({})}>Add Talk</Button>
      </div>
    </div>
    {resource.loading || resource.error || !data?.items.length ? <div className={panelClass}>
      <LoadState loading={resource.loading} error={resource.error} empty={page > 0 ? "No talks on this page." : "No talks yet. Add the first response."} retry={resource.reload} />
      {!resource.loading && !resource.error && page > 0 && <button className={`${actionClass} m-5`} onClick={() => setPage(0)}>Back to first page</button>}
    </div> : <>
      {data.items.map(({ content: talk, voteStats }) => <article key={talk.id} className={`${panelClass} p-5 sm:p-6`}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><h3 className="break-words text-lg font-semibold text-gray-900 dark:text-white">{talk.title}</h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{talk.author.username} · {new Date(talk.createdAt).toLocaleString()}{talk.updatedAt !== talk.createdAt && <> · Updated {new Date(talk.updatedAt).toLocaleString()}</>}</p></div>
          <StatusBadge active={talk.isActive} />
        </div>
        <div className="prose max-w-none break-words dark:prose-invert [&_pre]:overflow-x-auto"><ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} skipHtml>{talk.content.replace(/^<html><head><\/head><body>\s*/i, "").replace(/\s*<\/body><\/html>$/i, "")}</ReactMarkdown></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
          <div className="flex gap-4 text-xs"><span className="text-green-600 dark:text-green-400">{voteStats.upvoteCount} upvotes</span><span className="text-error-500">{voteStats.downvoteCount} downvotes</span></div>
          <div className="flex gap-4"><button className={actionClass} onClick={() => setEditor({ talk })}>Edit</button><button className="text-sm font-medium text-error-500 hover:underline" onClick={() => setDeleting(talk)}>Delete</button></div>
        </div>
      </article>)}
      <div className={panelClass}><PageFooter data={data} page={page} onPageChange={setPage} noun="talks" /></div>
    </>}
    {editor && <TalkEditor topicId={topicId} talk={editor.talk} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); if (!editor.talk) { setPage(0); setSort("createdAt,desc"); } resource.reload(); }} />}
    {deleting && <DeleteConfirmation name={deleting.title} onClose={() => setDeleting(null)} onDelete={() => talksService.delete(deleting.id)} onDeleted={() => { setDeleting(null); if (data?.items.length === 1 && page > 0) setPage(page - 1); resource.reload(); }} />}
  </section>;
}

function TopicDetail({ id }: { id: number }) {
  const router = useRouter();
  const load = useCallback((signal: AbortSignal) => topicsService.getById(id, signal), [id]);
  const resource = useResource(load);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [deleting, setDeleting] = useState<Topic | null>(null);
  const topic = resource.data;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/topics" className={actionClass}>← Back to Topics</Link>{topic && <div className="flex gap-3"><Button size="sm" variant="outline" onClick={() => setEditing(topic)}>Edit Topic</Button><Button size="sm" variant="outline" className="!text-error-500" onClick={() => setDeleting(topic)}>Delete Topic</Button></div>}</div>
    {resource.loading || resource.error || !topic ? <div className={panelClass}><LoadState loading={resource.loading} error={resource.error} empty="Topic not found." retry={resource.reload} /></div> : <>
      <section className={`${panelClass} p-6 sm:p-8`}>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400"><span>{topic.category.name}</span><span>By {topic.author.username}</span><StatusBadge active={topic.isActive} /></div>
        <h1 className="mb-4 break-words text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">{topic.name}</h1>
        {topic.description && <p className="mb-6 whitespace-pre-wrap break-words text-base leading-7 text-gray-600 dark:text-gray-300">{topic.description}</p>}
        <TagChips tags={topic.tags} />
      </section>
      <Talks topicId={id} />
    </>}
    {editing && <TopicEditor topic={editing} onClose={() => setEditing(null)} onChanged={resource.reload} onSaved={() => { setEditing(null); resource.reload(); }} />}
    {deleting && <DeleteConfirmation name={deleting.name} onClose={() => setDeleting(null)} onDelete={() => topicsService.delete(id)} onDeleted={() => router.push("/topics")} />}
  </div>;
}

export default function TopicDetailPage() {
  const params = useParams<{ id: string }>();
  return <TopicDetail key={params.id} id={Number(params.id)} />;
}
