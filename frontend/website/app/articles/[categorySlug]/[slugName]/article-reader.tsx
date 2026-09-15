import { isValidElement } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PublicPostDetailDTO } from "@/lib/api";
import ArticleVotes from "./article-votes";
import { Tags } from "@/app/components/content-ui";
import { categoryHref } from "@/lib/resource-links";
import ArticleTableOfContents, { type TableOfContentsItem } from "./article-table-of-contents";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-") || "section";
}

function textFromChildren(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (isValidElement(children)) {
    return textFromChildren((children.props as { children?: React.ReactNode }).children ?? "");
  }
  return "";
}

function plainHeading(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_~`]/g, "")
    .replace(/\s+#+\s*$/, "")
    .trim();
}

function uniqueIdFactory() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

function extractHeadings(content: string): TableOfContentsItem[] {
  const items: TableOfContentsItem[] = [];
  const headingId = uniqueIdFactory();
  for (const line of content.split("\n")) {
    const match = line.match(/^(#{1,3})\s+(.+?)\s*$/);
    if (!match) continue;
    const level = match[1].length;
    const text = plainHeading(match[2]);
    items.push({ id: headingId(text), text, level });
  }
  return items;
}

export interface ArticleReaderProps {
  categorySlug: string;
  categoryName: string;
  publicUri: string;
  article: PublicPostDetailDTO;
  presentation?: "page" | "modal";
}

export default function ArticleReader({
  categorySlug,
  categoryName,
  publicUri,
  article,
  presentation = "page",
}: ArticleReaderProps) {
  const toc = extractHeadings(article.content.content);
  const nextHeadingId = uniqueIdFactory();
  const inModal = presentation === "modal";
  const publishedAt = formatDate(article.content.createdAt);

  return (
    <div className={`mx-auto w-full max-w-[1180px] px-4 sm:px-6 ${inModal ? "pb-12 pt-5" : "py-7 sm:py-10"}`}>
      <div className="grid gap-10 min-[1180px]:grid-cols-[minmax(0,760px)_220px] min-[1180px]:justify-center min-[1180px]:gap-12">
        <article className="mx-auto w-full max-w-[760px] min-w-0">
          {article.content.featuredImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={article.content.featuredImage}
              alt=""
              loading="lazy"
              className="aspect-[2/1] w-full rounded-lg border border-line bg-soft object-cover shadow-[0_18px_50px_-32px_rgba(0,0,0,0.5)]"
            />
          )}

          <header className={article.content.featuredImage ? "mt-7 sm:mt-9" : ""}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <Link
                href={categoryHref(categorySlug)}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.13em] text-muted no-underline transition-colors hover:text-ink"
              >
                {!inModal && <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />}
                {categoryName}
              </Link>
              <span className="h-px w-7 bg-line" aria-hidden="true" />
              <Tags tags={article.content.tags} />
            </div>

            <h1 className="mt-5 max-w-[18ch] text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.035em]">
              {article.content.title}
            </h1>

            {article.content.description && (
              <p className="mt-5 max-w-[64ch] text-base leading-7 text-muted sm:text-lg sm:leading-8">
                {article.content.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-line py-3 text-xs text-muted">
              <span className="inline-flex items-center gap-2" aria-label="Author">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {article.content.author.username.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm">
                  <span className="mr-1 text-muted">By</span>
                  <span className="text-ink">{article.content.author.username}</span>
                </span>
              </span>
              {publishedAt && <time dateTime={article.content.createdAt} className="ml-auto inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {publishedAt}
              </time>}
            </div>
          </header>

          {toc.length > 0 && <div className="min-[1180px]:hidden"><ArticleTableOfContents items={toc} presentation={presentation} /></div>}

          <div className="reader-content pt-8 sm:pt-10">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 id={nextHeadingId(textFromChildren(children))} className="scroll-mt-24">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 id={nextHeadingId(textFromChildren(children))} className="scroll-mt-24">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 id={nextHeadingId(textFromChildren(children))} className="scroll-mt-24">
                    {children}
                  </h3>
                ),
              }}
            >
              {article.content.content}
            </ReactMarkdown>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <ArticleVotes
              key={publicUri}
              publicUri={publicUri}
              initialVoteStats={article.voteStats}
              initialUserVote={article.userVote}
            />
          </div>
        </article>

        {toc.length > 0 && <div className="hidden h-full min-[1180px]:block"><ArticleTableOfContents items={toc} presentation={presentation} /></div>}
      </div>
    </div>
  );
}
