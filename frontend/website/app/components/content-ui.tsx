import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import type { TagPublicRefDTO } from "@/lib/api";

export function Tags({ tags, limit }: { tags: TagPublicRefDTO[]; limit?: number }) {
  if (!tags.length) return null;
  const shown = limit ? tags.slice(0, limit) : tags;
  return <span className="flex flex-wrap gap-1.5" aria-label="Tags">
    {shown.map((tag) => <span key={tag.slugName} className="rounded-md bg-soft px-2 py-0.5 text-[11px] font-medium text-muted">#{tag.slugName}</span>)}
    {shown.length < tags.length && <span className="px-1 py-0.5 text-[11px] text-muted">+{tags.length - shown.length}</span>}
  </span>;
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-10 w-10 text-sm" : size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return <span aria-hidden="true" className={`${box} flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent`}>
    {Array.from(name)[0]?.toUpperCase()}
  </span>;
}

export function readingMinutes(markdown: string): number {
  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 220));
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="card mt-6 px-5 py-12 text-center">
    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-soft"><SearchX className="h-5 w-5 text-muted" aria-hidden="true" /></span>
    <p className="mt-4 font-semibold">{title}</p>
    {description && <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted">{description}</p>}
  </div>;
}

export const pagerButton = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-sm font-medium no-underline transition-colors hover:border-accent hover:text-accent disabled:opacity-50";

export function Pagination({ page, hasPrevious, hasNext, previousHref, nextHref, label }: {
  page: number; hasPrevious: boolean; hasNext: boolean; previousHref: string; nextHref: string; label: string;
}) {
  if (!hasPrevious && !hasNext) return null;
  return <nav className="mt-8 flex items-center justify-center gap-3" aria-label={label}>
    {hasPrevious && page > 1 && <Link href={previousHref} className={pagerButton}><ChevronLeft className="h-4 w-4" aria-hidden="true" />Previous</Link>}
    <span className="min-w-16 text-center text-sm text-muted" aria-current="page">Page {page}</span>
    {hasNext && <Link href={nextHref} className={pagerButton}>Next<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>}
  </nav>;
}

export function ListLoading({ label = "Loading content" }: { label?: string }) {
  return <div className="mt-6 space-y-3" aria-busy="true" aria-label={label}>
    {Array.from({ length: 4 }, (_, index) => <div key={index} className="card p-5 motion-safe:animate-pulse">
      <div className="h-5 w-2/3 rounded bg-soft" />
      <div className="mt-3 h-4 w-full rounded bg-soft" />
      <div className="mt-2 h-4 w-1/2 rounded bg-soft" />
    </div>)}
  </div>;
}

export function CompactLoading({ label = "Loading content" }: { label?: string }) {
  return <div className="card my-4 p-5" aria-busy="true" aria-label={label}>
    <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-soft motion-safe:animate-pulse" /><div className="h-4 w-40 rounded bg-soft motion-safe:animate-pulse" /></div>
    <div className="mt-4 h-4 w-2/3 rounded bg-soft motion-safe:animate-pulse" />
  </div>;
}
