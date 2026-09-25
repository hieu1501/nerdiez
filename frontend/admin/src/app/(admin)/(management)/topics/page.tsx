"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { topicsService, type Topic } from "@/services/topics";
import { useResource } from "@/hooks/useResource";
import PageHeader from "@/components/management/PageHeader";
import TopicEditor from "@/components/management/TopicEditor";
import DeleteConfirmation from "@/components/management/DeleteConfirmation";
import { actionClass, LoadState, PageFooter, panelClass, StatusBadge, TagChips } from "@/components/management/ContentUI";

type SortField = "slug" | "category.slugName";
export default function TopicsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ field: SortField; direction: "asc" | "desc" }>({ field: "slug", direction: "asc" });
  const [editor, setEditor] = useState<{ topic?: Topic } | null>(null);
  const [deleting, setDeleting] = useState<Topic | null>(null);
  const load = useCallback(() => topicsService.getAll({ page, size: 10, sort: `${sort.field},${sort.direction}` }), [page, sort]);
  const resource = useResource(load);
  const data = resource.data;
  const changeSort = (field: SortField) => {
    setSort({ field, direction: sort.field === field && sort.direction === "asc" ? "desc" : "asc" });
    setPage(0);
  };
  const sortHeader = (field: SortField, label: string) => <th scope="col" className="px-5 py-4 font-medium" aria-sort={sort.field === field ? sort.direction === "asc" ? "ascending" : "descending" : "none"}><button onClick={() => changeSort(field)} className="whitespace-nowrap hover:text-brand-500">{label} <span aria-hidden="true">{sort.field === field ? sort.direction === "asc" ? "↑" : "↓" : "↕"}</span></button></th>;
  return <div>
    <PageHeader title="Topics" description="Questions from the community. New topics stay private until you activate them." onAdd={() => setEditor({})} addLabel="Add Topic" />
    <div className={panelClass}>
      {resource.loading || resource.error || !data?.items.length ? <>
        <LoadState loading={resource.loading} error={resource.error} empty={page > 0 ? "No topics on this page." : "No topics yet. Create the first discussion."} retry={resource.reload} />
        {!resource.loading && !resource.error && page > 0 && <button className={`${actionClass} m-5`} onClick={() => setPage(0)}>Back to first page</button>}
      </> : <>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/60 text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400"><tr>
            {sortHeader("slug", "Title")}
            <th scope="col" className="px-5 py-4 font-medium">Author</th>
            {sortHeader("category.slugName", "Category")}
            {["Tags", "Status", "Actions"].map((label) => <th key={label} scope="col" className="px-5 py-4 font-medium">{label}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">{data.items.map((topic) => <tr key={topic.topicId}>
            <td className="min-w-56 max-w-sm px-5 py-4"><Link href={`/topics/${topic.topicId}`} className="font-medium text-gray-900 hover:text-brand-500 dark:text-white">{topic.name}</Link></td>
            <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{topic.author.username}</td>
            <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{topic.category.name}</td>
            <td className="min-w-40 px-5 py-4"><TagChips tags={topic.tags} /></td>
            <td className="px-5 py-4"><StatusBadge active={topic.isActive} /></td>
            <td className="px-5 py-4"><div className="flex gap-4"><Link className={actionClass} href={`/topics/${topic.topicId}`}>View</Link><button className={actionClass} onClick={() => setEditor({ topic })}>Edit</button><button className="text-sm font-medium text-error-500 hover:underline" onClick={() => setDeleting(topic)}>Delete</button></div></td>
          </tr>)}</tbody>
        </table></div>
        <PageFooter data={data} page={page} onPageChange={setPage} noun="topics" />
      </>}
    </div>
    {editor && <TopicEditor topic={editor.topic} onClose={() => setEditor(null)} onChanged={resource.reload} onSaved={(saved) => { setEditor(null); if (!editor.topic) router.push(`/topics/${saved.topicId}`); else resource.reload(); }} />}
    {deleting && <DeleteConfirmation name={deleting.name} onClose={() => setDeleting(null)} onDelete={() => topicsService.delete(deleting.topicId)} onDeleted={() => { setDeleting(null); if (data?.items.length === 1 && page > 0) setPage(page - 1); resource.reload(); }} />}
  </div>;
}
