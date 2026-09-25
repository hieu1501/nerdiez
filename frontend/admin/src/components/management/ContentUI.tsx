"use client";

import type { ReactNode } from "react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Pagination from "@/components/tables/Pagination";
import type { PageResponse, TagAdminRefDTO } from "@/services/content-types";

export const panelClass = "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-dark";
export const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white";
export const actionClass = "text-sm font-medium text-brand-600 hover:underline dark:text-brand-400";

export function StatusBadge({ active }: { active: boolean }) {
  return <Badge color={active ? "success" : "warning"} size="sm">{active ? "Active" : "Inactive"}</Badge>;
}

export function TagChips({ tags }: { tags: TagAdminRefDTO[] }) {
  return <div className="flex flex-wrap gap-1.5">{tags.length ? tags.map((tag) => <span key={tag.tagId} className="break-all rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">#{tag.slugName}</span>) : <span className="text-sm text-gray-400">No tags</span>}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"><span>{label}</span>{children}</label>;
}

export function LoadState({ loading, error, empty, retry }: { loading: boolean; error?: Error; empty: string; retry: () => void }) {
  return <div className="space-y-3 p-10 text-center text-sm text-gray-500 dark:text-gray-400" role={error ? "alert" : "status"}>
    {loading ? <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-label="Loading" /> : <p>{error ? error.message : empty}</p>}
    {error && <Button size="sm" variant="outline" onClick={retry}>Retry</Button>}
  </div>;
}

export function PageFooter({ data, page, onPageChange, noun }: { data: PageResponse<unknown>; page: number; onPageChange: (page: number) => void; noun: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
    <span>{data.totalItems ? `${data.offset + 1}–${data.offset + data.items.length} of ${data.totalItems}` : "0"} {noun}</span>
    {data.totalPages > 1 && <Pagination currentPage={page + 1} totalPages={data.totalPages} onPageChange={(value) => onPageChange(value - 1)} />}
  </div>;
}
