"use client";

import { useState } from "react";
import { tagsService, type Tag } from "@/services/tags";
import { useResource } from "@/hooks/useResource";
import PageHeader from "@/components/management/PageHeader";
import TagEditor from "@/components/management/TagEditor";
import DeleteConfirmation from "@/components/management/DeleteConfirmation";
import { actionClass, LoadState, PageFooter, panelClass, StatusBadge } from "@/components/management/ContentUI";

export default function TagsPage() {
  const resource = useResource(tagsService.getAll);
  const [page, setPage] = useState(0);
  const [editor, setEditor] = useState<{ tag?: Tag } | null>(null);
  const [deleting, setDeleting] = useState<Tag | null>(null);
  const items = resource.data ?? [];
  const currentPage = Math.min(page, Math.max(0, Math.ceil(items.length / 10) - 1));
  const pageItems = items.slice(currentPage * 10, (currentPage + 1) * 10);
  return <div>
    <PageHeader title="Tags" description="Shared labels for articles and discussions." onAdd={() => setEditor({})} addLabel="Add Tag" />
    <div className={panelClass}>
      {resource.loading || resource.error || !items.length ? <LoadState loading={resource.loading} error={resource.error} empty="No tags yet. Add a tag to organize your content." retry={resource.reload} /> : <>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/60 text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400"><tr>{["Tag", "Article use count", "Topic use count", "Status", "Actions"].map((label) => <th key={label} scope="col" className="px-5 py-4 font-medium">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">{pageItems.map((tag) => <tr key={tag.tagId}>
            <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{tag.slugName}</td>
            <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{tag.postUseCount}</td>
            <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{tag.topicUseCount}</td>
            <td className="px-5 py-4"><StatusBadge active={tag.isActive} /></td>
            <td className="px-5 py-4"><div className="flex gap-4"><button className={actionClass} onClick={() => setEditor({ tag })}>Edit</button><button className="text-sm font-medium text-error-500 hover:underline" onClick={() => setDeleting(tag)}>Delete</button></div></td>
          </tr>)}</tbody>
        </table></div>
        <PageFooter data={{ items: pageItems, offset: currentPage * 10, size: 10, totalItems: items.length, totalPages: Math.ceil(items.length / 10), hasPrevious: currentPage > 0, hasNext: (currentPage + 1) * 10 < items.length }} page={currentPage} onPageChange={setPage} noun="tags" />
      </>}
    </div>
    {editor && <TagEditor tag={editor.tag} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); resource.reload(); }} />}
    {deleting && <DeleteConfirmation name={deleting.slugName} onClose={() => setDeleting(null)} onDelete={() => tagsService.delete(deleting.tagId)} onDeleted={() => { setDeleting(null); resource.reload(); }} />}
  </div>;
}
