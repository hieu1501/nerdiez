"use client";

import { useMemo } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const regex = /<h([1-3])(\s[^>]*)?>(.*?)<\/h[1-3]>/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const attrs = match[2] || "";
      const inner = match[3];
      const text = inner.replace(/<[^>]*>/g, "");
      const idMatch = attrs.match(/id=["']([^"']+)["']/);
      const id = idMatch ? idMatch[1] : `h-${items.length}`;
      items.push({ id, text, level });
    }

    return items;
  }, [content]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="sticky top-24">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
        Table of Contents
      </h3>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `${(h.level - minLevel) * 12}px` }}
          >
            <a
              href={`#${h.id}`}
              className="block text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors truncate"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
