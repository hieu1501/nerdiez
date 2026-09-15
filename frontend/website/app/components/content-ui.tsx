import Link from "next/link";
import { SearchX } from "lucide-react";
import type { TagPublicRefDTO } from "@/lib/api";

export function Tags({ tags }: { tags: TagPublicRefDTO[] }) {
  if (!tags.length) return null;
  return <span className="flex flex-wrap gap-1.5" aria-label="Tags">
    {tags.map((tag) => <span key={tag.slugName} className="rounded border border-accent/25 bg-accent-soft px-1.5 py-0.5 text-[11px] text-accent">#{tag.slugName}</span>)}
  </span>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="mt-6 rounded-lg border border-line px-5 py-10 text-center">
    <SearchX className="mx-auto h-6 w-6 text-muted" aria-hidden="true" />
    <p className="mt-4 font-bold">{title}</p>
    {description && <p className="mt-2 text-sm leading-6 text-muted">{description}</p>}
  </div>;
}

export function Pagination({ page, hasPrevious, hasNext, previousHref, nextHref, label }: {
  page: number; hasPrevious: boolean; hasNext: boolean; previousHref: string; nextHref: string; label: string;
}) {
  if (!hasPrevious && !hasNext) return null;
  return <nav className="mt-8 flex items-center justify-center gap-3" aria-label={label}>
    {hasPrevious && page > 1 && <Link href={previousHref} className="rounded-md border border-line px-4 py-2 text-sm no-underline transition-colors hover:border-ink">Previous</Link>}
    <span className="text-sm text-muted" aria-current="page">Page {page}</span>
    {hasNext && <Link href={nextHref} className="rounded-md border border-line px-4 py-2 text-sm no-underline transition-colors hover:border-ink">Next</Link>}
  </nav>;
}

export function ListLoading({ label = "Loading content" }: { label?: string }) {
  return <div className="mt-6" aria-busy="true" aria-label={label}>
    {Array.from({ length: 5 }, (_, index) => <div key={index} className="border-b border-line py-6 motion-safe:animate-pulse">
      <div className="h-5 w-2/3 rounded bg-soft" />
      <div className="mt-3 h-4 w-full rounded bg-soft" />
      <div className="mt-2 h-4 w-1/2 rounded bg-soft" />
    </div>)}
  </div>;
}

export function CompactLoading({ label = "Loading content" }: { label?: string }) {
  return <div className="py-10" aria-busy="true" aria-label={label}>
    <div className="h-5 w-2/3 rounded bg-soft motion-safe:animate-pulse" />
  </div>;
}
