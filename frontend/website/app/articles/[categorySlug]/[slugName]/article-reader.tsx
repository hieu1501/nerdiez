import { isValidElement } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownPlugins } from "@/app/components/markdown";
import type { PublicPostDetailDTO } from "@/lib/api";
import ArticleVotes from "./article-votes";
import { Avatar, readingMinutes, Tags } from "@/app/components/content-ui";
import { SubjectChip } from "@/app/components/subject";
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
    <div className={`mx-auto w-full max-w-[1180px] px-4 sm:px-6 ${inModal ? "pb-12 pt-6" : "py-7 sm:py-10"}`}>
      <div className="grid gap-10 min-[1180px]:grid-cols-[minmax(0,760px)_220px] min-[1180px]:justify-center min-[1180px]:gap-12">
        <article className="mx-auto w-full max-w-[760px] min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {!inModal && <Link href={categoryHref(categorySlug)} aria-label={`Back to ${categoryName}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted no-underline transition-colors hover:bg-soft hover:text-ink">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>}
              <Link href={categoryHref(categorySlug)} className="no-underline"><SubjectChip slug={categorySlug} name={categoryName} /></Link>
              <Tags tags={article.content.tags} />
            </div>

            <h1 className="mt-4 text-[clamp(1.5rem,3.2vw,2rem)] font-bold leading-[1.2] tracking-[-0.022em]">
              {article.content.title}
            </h1>

            {article.content.description && (
              <p className="mt-2.5 max-w-[64ch] text-[15px] leading-6 text-muted">
                {article.content.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted" aria-label="Article details">
              <span className="inline-flex items-center gap-2.5">
                <Avatar name={article.content.author.username} />
                <span className="font-semibold text-ink">{article.content.author.username}</span>
              </span>
              {publishedAt && <time dateTime={article.content.createdAt} className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {publishedAt}
              </time>}
              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" aria-hidden="true" />{readingMinutes(article.content.content)} min read</span>
            </div>
          </header>

          {article.content.featuredImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={article.content.featuredImage}
              alt=""
              loading="lazy"
              className="mt-5 aspect-[2/1] w-full rounded-2xl border border-line bg-soft object-cover"
            />
          )}

          {toc.length > 0 && <div className="min-[1180px]:hidden"><ArticleTableOfContents items={toc} presentation={presentation} /></div>}

          <div className="reader-content pt-5 sm:pt-6">
            <ReactMarkdown
              remarkPlugins={markdownPlugins}
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

          <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Was this helpful?</p>
              <p className="text-xs text-muted">Your vote helps others find clear explanations.</p>
            </div>
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
