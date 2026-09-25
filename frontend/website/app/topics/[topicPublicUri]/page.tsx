import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, MessageCircleQuestion } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownPlugins } from "@/app/components/markdown";
import { getTalkSlice, getTopicDetail } from "@/lib/server-api";
import { categoryHref, formatDate, PAGE_SIZE, parsePage, publicIdentifier } from "@/lib/resource-links";
import { Avatar, CompactLoading, Tags } from "@/app/components/content-ui";
import { SubjectChip } from "@/app/components/subject";
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
  return <div className="mx-auto w-full max-w-[860px] px-4 py-6 sm:px-6 sm:py-8">
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
      <Link href={categoryHref(topic.category.slugName, "topics")} className="inline-flex h-8 w-8 items-center justify-center rounded-lg no-underline hover:bg-soft hover:text-ink" aria-label={`Back to ${topic.category.name} discussions`}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></Link>
      <Link href={categoryHref(topic.category.slugName)} className="no-underline"><SubjectChip slug={topic.category.slugName} name={topic.category.name} /></Link>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      <Link href={categoryHref(topic.category.slugName, "topics")} className="no-underline hover:text-ink">Discussions</Link>
    </nav>
    <article id="overview" className="card article-in mt-4 scroll-mt-24 p-5 sm:p-7">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-highlight-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-highlight"><MessageCircleQuestion className="h-3.5 w-3.5" aria-hidden="true" />Question</span>
      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">{topic.name}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-2 text-sm text-muted"><Avatar name={topic.author.username} />Asked by <span className="font-semibold text-ink">{topic.author.username}</span></span>
        <Tags tags={topic.tags} />
      </div>
      {topic.description && <div className="reader-content reader-compact mt-6 border-t border-line pt-6"><ReactMarkdown remarkPlugins={markdownPlugins}>{topic.description}</ReactMarkdown></div>}
    </article>
    <section id="discussion" className="mt-8 scroll-mt-24 pb-5" aria-labelledby="discussion-heading">
      <TalkDiscussion topicPublicUri={topicPublicUri} view={view} page={page}>
        {view === "all" && <Suspense key={`${topicPublicUri}:${page}`} fallback={<CompactLoading label="Loading discussion" />}>
          <TalkResults topicPublicUri={topicPublicUri} page={page} />
        </Suspense>}
      </TalkDiscussion>
    </section>
  </div>;
}

async function TalkResults({ topicPublicUri, page }: { topicPublicUri: string; page: number }) {
  const slice = await getTalkSlice(topicPublicUri, page - 1, PAGE_SIZE);
  const votes = slice.items.map((talk) => ({ publicUri: publicIdentifier(talk.content.canonicalUri, "talks"), voteStats: talk.voteStats, userVote: talk.userVote }));
  return <>
    {slice.items.length === 0 && <div className="card mt-4 px-5 py-10 text-center">
      <p className="font-semibold">{page > 1 ? "No replies on this page" : "No explanations yet"}</p>
      {page === 1 && <p className="mt-1 text-sm text-muted">Be the first to explain this topic.</p>}
    </div>}
    <TalkVotesProvider key={`${topicPublicUri}:${page}`} topicPublicUri={topicPublicUri} page={page} initialVotes={votes}>
      {slice.items.map((talk, index) => <article key={talk.content.canonicalUri} id={`talk-${votes[index].publicUri}`} className="card article-in mt-2 scroll-mt-24 px-3.5 py-3 sm:px-4" style={{ animationDelay: `${index * 35}ms` }}>
        <header className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
          <Avatar name={talk.content.author.username} size="sm" />
          <span className="text-[13px] font-semibold text-ink">{talk.content.author.username}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={talk.content.createdAt}>{formatDate(talk.content.createdAt)}</time>
          {talk.content.updatedAt !== talk.content.createdAt && <span>· Updated <time dateTime={talk.content.updatedAt}>{formatDate(talk.content.updatedAt)}</time></span>}
        </header>
        <TalkEntry talk={{ publicUri: votes[index].publicUri, content: talk.content.content }} author={talk.content.author.username} count={slice.items.length} footer={<TalkVotes initialVote={votes[index]} />}>
          <div className="reader-content reader-dense mt-1.5 sm:pl-8"><ReactMarkdown remarkPlugins={markdownPlugins}>{talk.content.content}</ReactMarkdown></div>
        </TalkEntry>
      </article>)}
    </TalkVotesProvider>
    <TalkPagination page={page} hasPrevious={slice.hasPrevious} hasNext={slice.hasNext} />
  </>;
}
