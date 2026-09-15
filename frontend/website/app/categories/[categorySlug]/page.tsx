import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpRight, BookOpen, MessagesSquare, PencilLine, ThumbsDown, ThumbsUp } from "lucide-react";
import { getArticleSlice, getCategories, getTopicSlice } from "@/lib/server-api";
import { articleHref, categoryHref, formatDate, newContentHref, PAGE_SIZE, parsePage, publicIdentifier, topicHref, type CategoryView } from "@/lib/resource-links";
import { EmptyState, ListLoading, Pagination, Tags } from "@/app/components/content-ui";

interface Props {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ view?: string | string[]; page?: string | string[] }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ categorySlug }, query, categories] = await Promise.all([params, searchParams, getCategories()]);
  const category = categories.find((item) => item.slugName === categorySlug);
  if (!category) notFound();
  const view: CategoryView = query.view === "topics" ? "topics" : "articles";
  const page = parsePage(query.page);

  const isArticles = view === "articles";
  return <div className="mx-auto w-full max-w-[840px] px-4 pb-10 pt-7 sm:px-6 sm:pt-9">
    <header className="pb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Subject</p>
      <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{category.description}</p>}
    </header>
    <Link href={newContentHref(view, categorySlug)} className="group flex items-center gap-3 rounded-lg border border-line bg-paper px-3 py-3 no-underline transition-colors hover:border-ink hover:bg-soft/45">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent"><PencilLine className="h-4 w-4" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1 text-sm text-muted group-hover:text-ink">{isArticles ? "What do you want to share?" : "What do you want to know?"}</span>
      <span className="rounded-md bg-button px-3 py-1.5 text-xs font-bold text-button-text">{isArticles ? "Write article" : "Ask a question"}</span>
    </Link>
    <nav className="mt-5 inline-flex rounded-lg bg-soft p-1" aria-label="Subject content">
      {(["articles", "topics"] as const).map((tab) => {
        const Icon = tab === "articles" ? BookOpen : MessagesSquare;
        return <Link key={tab} href={categoryHref(categorySlug, tab)} aria-current={view === tab ? "page" : undefined}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs no-underline transition-colors ${view === tab ? "bg-paper font-bold text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />{tab === "articles" ? "Articles" : "Topics"}
        </Link>;
      })}
    </nav>
    <Suspense key={`${categorySlug}:${view}:${page}`} fallback={isArticles ? <ArticleListLoading /> : <ListLoading label="Loading topics" />}>
      <Results categorySlug={categorySlug} view={view} page={page} />
    </Suspense>
  </div>;
}

function ArticleListLoading() {
  return <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading articles">
    {Array.from({ length: 4 }, (_, index) => <div key={index} className="overflow-hidden rounded-lg border border-line sm:grid sm:grid-cols-[176px_minmax(0,1fr)]">
      <div className="aspect-[16/9] bg-soft motion-safe:animate-pulse sm:aspect-auto sm:min-h-36" />
      <div className="p-4">
        <div className="h-5 w-3/4 rounded bg-soft motion-safe:animate-pulse" />
        <div className="mt-3 h-3 w-2/5 rounded bg-soft motion-safe:animate-pulse" />
        <div className="mt-5 flex gap-2">
          <div className="h-5 w-16 rounded bg-soft motion-safe:animate-pulse" />
          <div className="h-5 w-20 rounded bg-soft motion-safe:animate-pulse" />
        </div>
      </div>
    </div>)}
  </div>;
}

async function Results({ categorySlug, view, page }: { categorySlug: string; view: CategoryView; page: number }) {
  const slice = view === "articles" ? await getArticleSlice(categorySlug, page - 1, PAGE_SIZE) : await getTopicSlice(categorySlug, page - 1, PAGE_SIZE);
  return <>
    {slice.items.length === 0 && <EmptyState title={`No ${view} ${page > 1 ? "on this page" : "here yet"}`}  />}
    {slice.items.length > 0 && <div className={view === "articles" ? "mt-4 space-y-3" : "mt-4 overflow-hidden rounded-lg border border-line"}>
      {slice.items.map((item, index) => {
        if ("voteStats" in item) {
          const { content, voteStats } = item;
          const publishedAt = formatDate(content.createdAt);
          return <article key={content.canonicalUri} className="article-in overflow-hidden rounded-lg border border-line" style={{ animationDelay: `${index * 35}ms` }}>
            <Link href={articleHref(categorySlug, publicIdentifier(content.canonicalUri, "articles"))}
              className={`group grid h-full no-underline transition-colors hover:bg-soft/45 ${content.featuredImage ? "sm:grid-cols-[176px_minmax(0,1fr)]" : ""}`}>
              {content.featuredImage && <div className="aspect-[16/9] overflow-hidden bg-soft sm:aspect-auto sm:min-h-36">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={content.featuredImage} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.025]" />
              </div>}
              <div className="flex min-w-0 flex-col p-4">
                <div className="flex items-start gap-4">
                  <h3 className="min-w-0 flex-1 text-base font-bold leading-snug group-hover:text-muted">{content.title}</h3>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
                {publishedAt && <time dateTime={content.createdAt} className="mt-2 text-[11px] text-muted">{publishedAt}</time>}
                <div className="mt-4 flex flex-wrap items-end gap-3 sm:mt-auto sm:pt-4">
                  <Tags tags={content.tags} />
                  <span className="ml-auto flex shrink-0 items-center gap-3 text-xs" aria-label="Likes and dislikes">
                    <span className="inline-flex items-center gap-1 text-upvote"><ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />{voteStats.upvoteCount}<span className="sr-only"> likes</span></span>
                    <span className="inline-flex items-center gap-1 text-downvote"><ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />{voteStats.downvoteCount}<span className="sr-only"> dislikes</span></span>
                  </span>
                </div>
              </div>
            </Link>
          </article>;
        }
        return <article key={item.canonicalUri} className="article-in border-b border-line last:border-b-0" style={{ animationDelay: `${index * 35}ms` }}>
          <Link href={topicHref(publicIdentifier(item.canonicalUri, "topics"))} className="group block px-4 py-4 no-underline transition-colors hover:bg-soft/45">
            <div className="flex items-start justify-between gap-5">
              <h3 className="text-base font-bold leading-snug group-hover:text-muted">{item.name}</h3>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
            {item.description && <div className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-muted">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ children }) => <span>{children}</span>, img: () => null }}>{item.description}</ReactMarkdown>
            </div>}
            <p className="mt-2 text-[11px] text-muted">Asked by {item.author.username}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-3"><Tags tags={item.tags} /><span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted"><MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" />Read replies</span></div>
          </Link>
        </article>;
      })}
    </div>}
    <Pagination page={page} hasPrevious={slice.hasPrevious} hasNext={slice.hasNext} previousHref={categoryHref(categorySlug, view, page - 1)} nextHref={categoryHref(categorySlug, view, page + 1)} label={`${view} pages`} />
  </>;
}
