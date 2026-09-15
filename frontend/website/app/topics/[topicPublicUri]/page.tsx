import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getTalkSlice, getTopicDetail } from "@/lib/server-api";
import { categoryHref, formatDate, PAGE_SIZE, parsePage, publicIdentifier } from "@/lib/resource-links";
import { CompactLoading, Tags } from "@/app/components/content-ui";
import TalkDiscussion, { TalkEntry, TalkPagination } from "./talk-discussion";
import { TalkVotes, TalkVotesProvider } from "./talk-votes";

export default async function TopicPage({ params, searchParams }: {
  params: Promise<{ topicPublicUri: string }>;
  searchParams: Promise<{ page?: string | string[]; view?: string | string[] }>;
}) {
  const [{ topicPublicUri }, query] = await Promise.all([params, searchParams]);
  const topic = await getTopicDetail(topicPublicUri);
  if (!topic) notFound();
  const page = parsePage(query.page);
  const view = query.view === "mine" ? "mine" : "all";
  return <div className="topic-reader mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
    <nav aria-label="Breadcrumb">
      <Link href={categoryHref(topic.category.slugName, "topics")} className="inline-flex items-center gap-2 text-sm text-muted no-underline hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />{topic.category.name}<span aria-hidden="true">/</span>Topics
      </Link>
    </nav>
    <nav aria-label="On this page" className="mt-6 flex gap-5 border-b border-line pb-2.5 text-xs sm:mt-8">
      <a href="#overview" className="font-bold text-ink no-underline hover:underline underline-offset-4">Overview</a>
      <a href="#discussion" className="inline-flex items-center gap-2 text-muted no-underline hover:text-ink"><MessagesSquare className="h-4 w-4" aria-hidden="true" />Discussion</a>
    </nav>
    <article id="overview" className="article-in mx-auto max-w-[720px] scroll-mt-20 py-7 sm:py-10">
      <h1 className="text-2xl font-bold leading-[1.2] tracking-tight sm:text-3xl">{topic.name}</h1>
      <div className="mt-6 flex items-center gap-3">
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{Array.from(topic.author.username)[0]?.toUpperCase()}</span>
        <p className="text-sm text-muted">Asked by <span className="font-bold text-ink">{topic.author.username}</span></p>
      </div>
      <div className="mt-5"><Tags tags={topic.tags} /></div>
      {topic.description && <div className="reader-content mt-9 sm:mt-11"><ReactMarkdown remarkPlugins={[remarkGfm]}>{topic.description}</ReactMarkdown></div>}
    </article>
    <section id="discussion" className="scroll-mt-20 border-t border-line pb-5 pt-6 sm:pt-8" aria-labelledby="discussion-heading">
      <div className="mx-auto max-w-[720px]">
        <TalkDiscussion topicPublicUri={topicPublicUri} view={view} page={page}>
          {view === "all" && <Suspense key={`${topicPublicUri}:${page}`} fallback={<CompactLoading label="Loading discussion" />}>
            <TalkResults topicPublicUri={topicPublicUri} page={page} />
          </Suspense>}
        </TalkDiscussion>
      </div>
    </section>
  </div>;
}

async function TalkResults({ topicPublicUri, page }: { topicPublicUri: string; page: number }) {
  const slice = await getTalkSlice(topicPublicUri, page - 1, PAGE_SIZE);
  const votes = slice.items.map((talk) => ({ publicUri: publicIdentifier(talk.content.canonicalUri, "talks"), voteStats: talk.voteStats, userVote: talk.userVote }));
  return <>
    {slice.items.length === 0 && <div className="my-6 rounded-lg bg-soft px-5 py-8">
      <p className="font-bold">{page > 1 ? "No replies on this page" : "No replies yet"}</p>
    </div>}
    <TalkVotesProvider key={`${topicPublicUri}:${page}`} topicPublicUri={topicPublicUri} page={page} initialVotes={votes}>
      {slice.items.map((talk, index) => <article key={talk.content.canonicalUri} id={`talk-${votes[index].publicUri}`} className="article-in scroll-mt-20 border-b border-line py-6 sm:py-8" style={{ animationDelay: `${index * 35}ms` }}>
        <header className="flex items-start gap-3">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-soft text-sm font-bold text-muted">{Array.from(talk.content.author.username)[0]?.toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{talk.content.author.username}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
              <time dateTime={talk.content.createdAt}>{formatDate(talk.content.createdAt)}</time>
              {talk.content.updatedAt !== talk.content.createdAt && <span>Updated <time dateTime={talk.content.updatedAt}>{formatDate(talk.content.updatedAt)}</time></span>}
            </div>
          </div>
        </header>
        <TalkEntry talk={{ publicUri: votes[index].publicUri, content: talk.content.content }} author={talk.content.author.username} count={slice.items.length}>
        <div className="mt-5 sm:pl-12">
          <div className="reader-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{talk.content.content}</ReactMarkdown></div>
          <div className="mt-5"><TalkVotes initialVote={votes[index]} /></div>
        </div>
        </TalkEntry>
      </article>)}
    </TalkVotesProvider>
    <TalkPagination page={page} hasPrevious={slice.hasPrevious} hasNext={slice.hasNext} />
  </>;
}
