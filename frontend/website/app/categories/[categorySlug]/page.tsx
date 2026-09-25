import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { markdownPlugins } from "@/app/components/markdown";
import { ArrowRight, FileText, Lightbulb, MessageCircleQuestion, MessagesSquare, PenLine } from "lucide-react";
import { getArticleSlice, getCategories, getTopicSlice } from "@/lib/server-api";
import { articleHref, categoryHref, formatDate, newContentHref, PAGE_SIZE, parsePage, publicIdentifier, topicHref, type CategoryView } from "@/lib/resource-links";
import { Avatar, EmptyState, ListLoading, Pagination, Tags } from "@/app/components/content-ui";
import { SubjectIcon, subjectStyle } from "@/app/components/subject";
import ArticleCardVotes from "@/app/components/article-card-votes";
import SignedInLink from "@/app/components/signed-in-link";

// 12 fills whole rows of the 2- and 3-column article grid.
const ARTICLE_PAGE_SIZE = 12;

interface Props {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ view?: string | string[]; page?: string | string[] }>;
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = (await getCategories()).find((item) => item.slugName === categorySlug);
  return category ? { title: category.name, description: category.description ?? undefined } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ categorySlug }, query, categories] = await Promise.all([params, searchParams, getCategories()]);
  const category = categories.find((item) => item.slugName === categorySlug);
  if (!category) notFound();
  const view: CategoryView = query.view === "topics" ? "topics" : "articles";
  const page = parsePage(query.page);
  const { tone } = subjectStyle(categorySlug);

  // The side panel only shows with Discussions, so the article grid can use three columns.
  return <div className={`mx-auto grid w-full max-w-[1080px] gap-6 px-4 pb-12 pt-6 sm:px-6 ${view === "topics" ? "xl:grid-cols-[minmax(0,1fr)_272px]" : ""}`}>
    <div className="min-w-0">
      <header className={`${tone} card relative overflow-hidden p-5 sm:p-6`}>
        <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-(--tone-soft) blur-2xl" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <SubjectIcon slug={categorySlug} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--tone)">Subject</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-[28px]">{category.name}</h1>
            {category.description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">{category.description}</p>}
          </div>
        </div>
      </header>

      <div className="card mt-4 flex flex-wrap items-center gap-3 p-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-muted" aria-hidden="true"><Lightbulb className="h-4 w-4" /></span>
        <SignedInLink href={newContentHref(view, categorySlug)} prompt={view === "articles" ? "Sign in to write an article." : "Sign in to ask a question."} className="min-w-40 flex-1 rounded-lg bg-soft px-3.5 py-2 text-sm text-muted no-underline transition-colors hover:text-ink">
          {view === "articles" ? "Share what you learned…" : "What do you want to understand?"}
        </SignedInLink>
        <div className="flex gap-2">
          <SignedInLink href={newContentHref("articles", categorySlug)} prompt="Sign in to write an article." className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium no-underline transition-colors hover:border-accent hover:text-accent"><PenLine className="h-4 w-4" aria-hidden="true" />Write</SignedInLink>
          <SignedInLink href={newContentHref("topics", categorySlug)} prompt="Sign in to ask a question." className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium no-underline transition-colors hover:border-highlight hover:text-highlight"><MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />Ask</SignedInLink>
        </div>
      </div>

      <nav className="mt-6 flex gap-6 border-b border-line" aria-label="Subject content">
        {(["articles", "topics"] as const).map((tab) => {
          const Icon = tab === "articles" ? FileText : MessagesSquare;
          const active = view === tab;
          return <Link key={tab} href={categoryHref(categorySlug, tab)} aria-current={active ? "page" : undefined}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 pb-3 text-sm no-underline transition-colors ${active ? "border-accent font-semibold text-ink" : "border-transparent text-muted hover:text-ink"}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />{tab === "articles" ? "Articles" : "Discussions"}
          </Link>;
        })}
      </nav>

      <Suspense key={`${categorySlug}:${view}:${page}`} fallback={view === "articles" ? <ArticleGridLoading /> : <ListLoading label="Loading discussions" />}>
        <Results categorySlug={categorySlug} view={view} page={page} />
      </Suspense>
    </div>

    {view === "topics" && <aside className="hidden space-y-4 xl:block" aria-label="About this subject">
      <div className="sticky top-[88px] space-y-4">
        <section className="card p-4">
          <h2 className="text-sm font-semibold">How it works</h2>
          <ol className="mt-3 space-y-3 text-[13px] leading-5 text-muted">
            <li className="flex gap-3"><Step n={1} /><span><b className="font-semibold text-ink">Read</b> articles people wrote from real experience.</span></li>
            <li className="flex gap-3"><Step n={2} /><span><b className="font-semibold text-ink">Ask</b> about a concept you want to understand.</span></li>
            <li className="flex gap-3"><Step n={3} /><span><b className="font-semibold text-ink">Explain</b> it simply. The clearest replies get voted up.</span></li>
          </ol>
        </section>
        <section className="card p-4">
          <h2 className="text-sm font-semibold">Writing a good explanation</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-[13px] leading-5 text-muted marker:text-accent">
            <li>Start with the intuition, then the details.</li>
            <li>Use a small, concrete example.</li>
            <li>Add code, a table, or a diagram when it helps.</li>
          </ul>
        </section>
      </div>
    </aside>}
  </div>;
}

function Step({ n }: { n: number }) {
  return <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent" aria-hidden="true">{n}</span>;
}

function ArticleGridLoading() {
  return <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading articles">
    {Array.from({ length: 6 }, (_, index) => <div key={index} className="card overflow-hidden">
      <div className="aspect-[2/1] bg-soft motion-safe:animate-pulse" />
      <div className="p-3.5">
        <div className="h-5 w-4/5 rounded bg-soft motion-safe:animate-pulse" />
        <div className="mt-2 h-5 w-3/5 rounded bg-soft motion-safe:animate-pulse" />
        <div className="mt-5 flex gap-2">
          <div className="h-5 w-16 rounded bg-soft motion-safe:animate-pulse" />
          <div className="h-5 w-20 rounded bg-soft motion-safe:animate-pulse" />
        </div>
      </div>
    </div>)}
  </div>;
}

async function Results({ categorySlug, view, page }: { categorySlug: string; view: CategoryView; page: number }) {
  const slice = view === "articles" ? await getArticleSlice(categorySlug, page - 1, ARTICLE_PAGE_SIZE) : await getTopicSlice(categorySlug, page - 1, PAGE_SIZE);
  const { tone, icon: SubjectGlyph } = subjectStyle(categorySlug);
  return <>
    {slice.items.length === 0 && <EmptyState title={view === "articles" ? `No articles ${page > 1 ? "on this page" : "here yet"}` : `No discussions ${page > 1 ? "on this page" : "here yet"}`}
      description={page > 1 ? undefined : view === "articles" ? "Be the first to share what you learned." : "Ask the first question in this subject."} />}
    {slice.items.length > 0 && <div className={view === "articles" ? "mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" : "mt-5 space-y-3"}>
      {slice.items.map((item, index) => {
        if ("voteStats" in item) {
          const { content, voteStats } = item;
          const articleUri = publicIdentifier(content.canonicalUri, "articles");
          const publishedAt = formatDate(content.createdAt);
          return <article key={content.canonicalUri} className="article-in" style={{ animationDelay: `${index * 35}ms` }}>
            <Link href={articleHref(categorySlug, articleUri)}
              className="card group flex h-full flex-col overflow-hidden no-underline transition-[border-color,box-shadow,transform] hover:border-accent/50 hover:shadow-card motion-safe:hover:-translate-y-0.5">
              <div className={`${tone} relative aspect-[2/1] overflow-hidden bg-(--tone-soft)`}>
                {content.featuredImage
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={content.featuredImage} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]" />
                  : <div className="flex h-full items-center justify-center text-(--tone) opacity-60"><SubjectGlyph className="h-8 w-8" aria-hidden="true" /></div>}
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight transition-colors group-hover:text-accent">{content.title}</h3>
                {content.description && <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-muted">{content.description}</p>}
                <div className="mt-2"><Tags tags={content.tags} limit={2} /></div>
                <div className="mt-auto flex items-center gap-4 pt-3 text-xs font-medium text-muted" aria-label="Likes and dislikes">
                  <ArticleCardVotes publicUri={articleUri} voteStats={voteStats} />
                  {publishedAt && <time dateTime={content.createdAt} className="ml-auto">{publishedAt}</time>}
                </div>
              </div>
            </Link>
          </article>;
        }
        return <article key={item.canonicalUri} className="article-in" style={{ animationDelay: `${index * 35}ms` }}>
          <Link href={topicHref(publicIdentifier(item.canonicalUri, "topics"))} className="card group flex gap-4 p-4 no-underline transition-[border-color,box-shadow] hover:border-accent/50 hover:shadow-card sm:p-5">
            <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-highlight-soft text-highlight sm:flex" aria-hidden="true"><MessageCircleQuestion className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold leading-snug tracking-tight transition-colors group-hover:text-accent">{item.name}</h3>
              {item.description && <div className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                <ReactMarkdown remarkPlugins={markdownPlugins} components={{ a: ({ children }) => <span>{children}</span>, img: () => null }}>{item.description}</ReactMarkdown>
              </div>}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="inline-flex items-center gap-2 text-xs text-muted"><Avatar name={item.author.username} size="sm" />Asked by <span className="font-medium text-ink">{item.author.username}</span></span>
                <Tags tags={item.tags} limit={3} />
                <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-accent">Explain it<ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden="true" /></span>
              </div>
            </div>
          </Link>
        </article>;
      })}
    </div>}
    <Pagination page={page} hasPrevious={slice.hasPrevious} hasNext={slice.hasNext} previousHref={categoryHref(categorySlug, view, page - 1)} nextHref={categoryHref(categorySlug, view, page + 1)} label={`${view === "articles" ? "Article" : "Discussion"} pages`} />
  </>;
}
