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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isHtml(str: string): boolean {
  return /^\s*<[a-z][^>]*>/i.test(str);
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const counts = new Map<string, number>();

    if (isHtml(content)) {
      const regex = /<h([1-3])(?:\s[^>]*)?>(.+?)<\/h\1>/gi;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const level = parseInt(match[1]);
        const text = match[2].replace(/<[^>]+>/g, "").trim();
        let id = slugify(text);
        const count = counts.get(id) ?? 0;
        if (count > 0) id += `-${count}`;
        counts.set(id, (counts.get(id) ?? 0) + 1);
        items.push({ id, text, level });
      }
    } else {
      const regex = /^(#{1,3})[ \t]+(.+)$/gm;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        let id = slugify(text);
        const count = counts.get(id) ?? 0;
        if (count > 0) id += `-${count}`;
        counts.set(id, (counts.get(id) ?? 0) + 1);
        items.push({ id, text, level });
      }
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
