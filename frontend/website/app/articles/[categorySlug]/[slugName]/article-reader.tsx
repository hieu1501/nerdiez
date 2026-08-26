import { isValidElement } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PublicPostDetailDTO } from "@/lib/api";
import VoteControls from "./vote-controls";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function textFromChildren(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (isValidElement(children)) {
    return textFromChildren((children.props as { children?: React.ReactNode }).children ?? "");
  }
  return "";
}

function extractHeadings(content: string): TocItem[] {
  const items: TocItem[] = [];
  for (const line of content.split("\n")) {
    const match = line.match(/^(#{1,3})\s+(.+?)\s*$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].replace(/[*`]/g, "").trim();
    items.push({ id: slugify(text), text, level });
  }
  return items;
}

function tocIndentClass(level: number): string {
  if (level === 3) return "pl-6";
  if (level === 2) return "pl-3";
  return "";
}

interface ArticleReaderProps {
  categorySlug: string;
  categoryName: string;
  slugName: string;
  article: PublicPostDetailDTO;
}

export default function ArticleReader({
  categorySlug,
  categoryName,
  slugName,
  article,
}: ArticleReaderProps) {
  const toc = extractHeadings(article.content.content);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_230px]">
        <article className="mx-auto w-full max-w-[720px]">
          <Link
            href={`/articles/${encodeURIComponent(categorySlug)}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted no-underline transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            {categoryName}
          </Link>

          <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl">
            {article.content.title}
          </h1>

          <div className="mt-4 flex flex-col gap-3 text-xs text-muted">
            {article.content.topics.length > 0 && (
              <span className="flex flex-wrap gap-1.5" aria-label="Topics">
                {article.content.topics.map((topic) => (
                  <span
                    key={topic.slugName}
                    className="rounded border border-accent/25 bg-accent-soft px-2 py-0.5 text-[11px] text-accent"
                  >
                    {topic.name}
                  </span>
                ))}
              </span>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2" aria-label="Author">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {article.content.author.username.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm">
                  <span className="mr-1 text-muted">By</span>
                  <span className="text-ink">{article.content.author.username}</span>
                </span>
              </span>
              <div className="ml-auto flex flex-col items-end gap-1 text-right">
                <span className="text-sm">
                  <span className="mr-2 text-[10px] font-medium uppercase tracking-widest text-muted/70">
                    Published
                  </span>
                  {formatDate(article.content.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {article.content.featuredImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={article.content.featuredImage}
              alt=""
              loading="lazy"
              className="mx-auto mt-8 aspect-[2/1] w-[95%] rounded-md object-cover"
            />
          )}

          {article.content.description && (
            <p className="mt-8 border-b border-line pb-4 text-base leading-7 text-muted">
              {article.content.description}
            </p>
          )}

          {toc.length > 0 && (
            <details className="mt-8 rounded-lg border border-line px-4 py-3 lg:hidden">
              <summary className="cursor-pointer select-none text-sm font-bold">
                Table of contents
              </summary>
              <nav className="mt-3 flex flex-col gap-1.5" aria-label="Table of contents">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`text-sm text-muted transition-colors hover:text-ink ${tocIndentClass(
                      item.level
                    )}`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </details>
          )}

          <div className="reader-content pt-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 id={slugify(textFromChildren(children))} className="scroll-mt-24">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 id={slugify(textFromChildren(children))} className="scroll-mt-24">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 id={slugify(textFromChildren(children))} className="scroll-mt-24">
                    {children}
                  </h3>
                ),
              }}
            >
              {article.content.content}
            </ReactMarkdown>
          </div>

          <div className="mt-10 flex flex-wrap items-start justify-between gap-4 border-t border-line pt-5">
            <p className="pt-2 text-sm text-muted">
              What did you think? Like or dislike this article.
            </p>
            <VoteControls
              key={`${categorySlug}/${slugName}`}
              categorySlug={categorySlug}
              slugName={slugName}
              initialVoteStats={article.voteStats}
              initialUserVote={article.userVote}
            />
          </div>
        </article>

        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted">
                On this page
              </p>
              <nav className="mt-3 flex flex-col gap-2" aria-label="On this page">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`text-sm leading-5 text-muted transition-colors hover:text-ink ${tocIndentClass(
                      item.level
                    )}`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
