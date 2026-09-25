"use client";

import { useEffect, useState } from "react";

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

// Indent by depth below the shallowest heading, so an article starting at H2 isn't pushed right.
function ContentsLinks({ items, activeId }: { items: TableOfContentsItem[]; activeId: string }) {
  const topLevel = Math.min(...items.map((item) => item.level));
  return <nav className="mt-4 border-l border-line" aria-label="Table of contents">
    {items.map((item) => {
      const active = item.id === activeId;
      return <a
        key={item.id}
        href={`#${item.id}`}
        aria-current={active ? "location" : undefined}
        style={{ paddingLeft: `${12 + (item.level - topLevel) * 14}px` }}
        className={`-ml-px block border-l-2 py-1.5 pr-1 text-[13px] leading-5 no-underline transition-colors ${active ? "border-accent font-semibold text-accent" : "border-transparent text-muted hover:border-line hover:text-ink"}`}
      >
        {item.text}
      </a>;
    })}
  </nav>;
}

export default function ArticleTableOfContents({ items, presentation = "page" }: {
  items: TableOfContentsItem[];
  presentation?: "page" | "modal";
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const stickyPosition = presentation === "modal"
    ? "top-6 max-h-[calc(100dvh-7rem)]"
    : "top-[76px] max-h-[calc(100dvh-6.5rem)]";

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => heading !== null);
    if (!headings.length) return;

    const observer = new IntersectionObserver((entries) => {
      const entering = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (entering[0]) setActiveId(entering[0].target.id);
    }, { rootMargin: "-80px 0px -70% 0px", threshold: 0 });

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return <>
    <details className="card mt-8 px-4 py-3 min-[1180px]:hidden">
      <summary className="cursor-pointer select-none text-sm font-semibold">On this page</summary>
      <ContentsLinks items={items} activeId={activeId} />
    </details>

    <aside className="hidden h-full min-[1180px]:block" aria-label="Article navigation">
      <div className={`sticky overflow-y-auto pr-2 ${stickyPosition}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">On this page</p>
        <ContentsLinks items={items} activeId={activeId} />
      </div>
    </aside>
  </>;
}
