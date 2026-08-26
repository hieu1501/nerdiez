import Link from "next/link";
import { SearchX, ThumbsDown, ThumbsUp } from "lucide-react";
import type { PublicPostBriefDTO, SliceResponse } from "@/lib/api";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface ArticlesListCategory {
  slugName: string;
  name: string;
}

export function ArticlesPageHeader() {
  return (
    <section className="mx-auto w-full max-w-[960px] px-5 pb-8 pt-10 sm:px-8 sm:pt-14">
      <h1 className="text-4xl font-bold leading-[1.08] md:text-5xl">Nerdy</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
        Short, honest notes on computer science and economics. Clear explanations, real
        trade-offs, and an occasional code snippet — for developers who like to understand
        things deeply.
      </p>
    </section>
  );
}

interface ArticlesFiltersProps {
  categorySlug: string;
  categoryDescription: string | null;
  categories: ArticlesListCategory[];
}

export function ArticlesFilters({
  categorySlug,
  categoryDescription,
  categories,
}: ArticlesFiltersProps) {
  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter articles by topic">
        {categories.map((category) => (
          <Link
            key={category.slugName}
            href={`/articles/${encodeURIComponent(category.slugName)}`}
            aria-current={categorySlug === category.slugName ? "page" : undefined}
            className={`rounded-md border px-3 py-1.5 text-[13px] no-underline transition-colors ${
              categorySlug === category.slugName
                ? "border-ink text-ink"
                : "border-line text-muted hover:text-ink"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      {categoryDescription && (
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{categoryDescription}</p>
      )}
    </>
  );
}

export function ArticlesListLoading() {
  return (
    <div className="mt-6" aria-busy="true" aria-label="Loading articles">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b border-line py-5">
          <div className="h-5 w-2/3 animate-pulse rounded bg-soft" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-soft" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-soft" />
        </div>
      ))}
      <div className="mx-auto mt-6 h-9 w-40 animate-pulse rounded bg-soft" />
    </div>
  );
}

export function CategorySectionLoading() {
  return (
    <section className="mx-auto w-full max-w-[960px] px-5 pb-14 sm:px-8">
      <div className="border-t border-line pt-3" />
      <div className="mt-4 flex gap-2" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-8 w-24 animate-pulse rounded bg-soft" />
        ))}
      </div>
      <ArticlesListLoading />
    </section>
  );
}

interface ArticlesListProps {
  categorySlug: string;
  currentPage: number;
  articleSlice: SliceResponse<PublicPostBriefDTO>;
}

function pageHref(categorySlug: string, page: number): string {
  const path = `/articles/${encodeURIComponent(categorySlug)}`;
  return page <= 1 ? path : `${path}?page=${page}`;
}

export default function ArticlesList({
  categorySlug,
  currentPage,
  articleSlice,
}: ArticlesListProps) {
  const { items, hasNext, hasPrevious } = articleSlice;

  return (
    <>
      {items.length === 0 && (
        <div className="mt-8 border border-line px-6 py-14 text-center">
          <SearchX className="mx-auto h-6 w-6 text-muted" />
          <p className="mt-4 font-bold">No articles here yet</p>
          <p className="mt-2 text-sm text-muted">
            {currentPage > 1
              ? "There are no articles on this page."
              : "Try a different topic or check back soon."}
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-6">
          {items.map((article, index) => {
            const { content, voteStats } = article;
            return (
              <article
                key={content.slugName}
                className="article-in border-b border-line font-serif"
                style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
              >
                <Link
                  href={`/articles/${encodeURIComponent(categorySlug)}/${encodeURIComponent(content.slugName)}`}
                  className="group block py-5 no-underline"
                >
                  <div className="flex items-start justify-between gap-6">
                    <h2 className="text-lg font-bold leading-snug transition-colors group-hover:text-muted">
                      {content.title}
                    </h2>
                    <time className="shrink-0 pt-1 text-xs text-muted">
                      {formatDate(content.createdAt)}
                    </time>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-y-2 text-xs text-muted">
                    {content.topics.length > 0 && (
                      <span className="flex flex-wrap gap-1.5" aria-label="Topics">
                        {content.topics.map((topic) => (
                          <span
                            key={topic.slugName}
                            className="rounded border border-accent/25 bg-accent-soft px-2 py-0.5 text-xs text-accent"
                          >
                            {topic.name}
                          </span>
                        ))}
                      </span>
                    )}
                    <span
                      className="ml-auto flex items-center gap-3"
                      aria-label="Likes and dislikes"
                    >
                      <span className="inline-flex items-center gap-1 font-medium text-upvote">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {voteStats.upvoteCount}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-downvote">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        {voteStats.downvoteCount}
                      </span>
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}

      <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Article pages">
        {hasPrevious && (
          <Link
            href={pageHref(categorySlug, currentPage - 1)}
            className="rounded-md border border-line px-4 py-2 text-sm no-underline transition-colors hover:text-ink"
          >
            Previous
          </Link>
        )}
        {(hasPrevious || hasNext) && (
          <span className="text-sm text-muted" aria-current="page">
            Page {currentPage}
          </span>
        )}
        {hasNext && (
          <Link
            href={pageHref(categorySlug, currentPage + 1)}
            className="rounded-md border border-line px-4 py-2 text-sm no-underline transition-colors hover:text-ink"
          >
            Next
          </Link>
        )}
        {!hasPrevious && !hasNext && items.length > 0 && (
          <p className="text-sm text-muted" role="status">
            You&apos;ve reached the end of the articles.
          </p>
        )}
      </nav>
    </>
  );
}
