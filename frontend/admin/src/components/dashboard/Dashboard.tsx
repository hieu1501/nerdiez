"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Clock, FileText, FolderTree, MessagesSquare, Plus, Tags, ThumbsDown, ThumbsUp, type LucideIcon } from "lucide-react";
import { articlesService } from "@/services/articles";
import { topicsService } from "@/services/topics";
import { categoriesService } from "@/services/categories";
import { tagsService } from "@/services/tags";
import { useAuth } from "@/context/AuthContext";
import { useResource } from "@/hooks/useResource";
import { LoadState, panelClass, StatusBadge } from "@/components/management/ContentUI";

// Topics have no status filter, so the review queue scans one large page.
const REVIEW_SCAN = 100;
// Module-level loaders stay referentially stable for useResource.

const loadArticles = () => articlesService.getAll({ page: 0, size: 6, sort: "updatedAt,desc" });
const loadTopics = () => topicsService.getAll({ page: 0, size: REVIEW_SCAN, sort: "slug,asc" });
const loadCategories = () => categoriesService.getAll();
const loadTags = () => tagsService.getAll();

function Stat({ label, value, detail, icon: Icon, href, tone }: { label: string; value?: number; detail?: ReactNode; icon: LucideIcon; href: string; tone: string }) {
  return <Link href={href} className={`${panelClass} group flex items-start gap-4 p-5 transition-colors hover:border-brand-300 dark:hover:border-brand-500/40`}>
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
    <span className="min-w-0">
      <span className="block text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="mt-0.5 block text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{value ?? <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-100 align-middle dark:bg-gray-800" />}</span>
      {detail && <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{detail}</span>}
    </span>
  </Link>;
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className={panelClass}>
    <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      {action}
    </header>
    {children}
  </section>;
}

const panelLink = "inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400";

export default function Dashboard() {
  const { user } = useAuth();
  const articles = useResource(loadArticles);
  const topics = useResource(loadTopics);
  const categories = useResource(loadCategories);
  const tags = useResource(loadTags);

  const pending = topics.data?.items.filter((topic) => !topic.isActive) ?? [];
  const activeCategories = categories.data?.filter((category) => category.isActive).length;
  const topTags = [...(tags.data ?? [])].map((tag) => ({ ...tag, uses: tag.postUseCount + tag.topicUseCount })).sort((a, b) => b.uses - a.uses).slice(0, 8);
  const maxUses = Math.max(1, ...topTags.map((tag) => tag.uses));

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back{user?.displayName ? `, ${user.displayName}` : ""}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Here’s what needs attention on nerdiez today.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/articles/new" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 text-sm font-medium text-white hover:bg-brand-600"><Plus className="h-4 w-4" />New article</Link>
        <Link href="/topics" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">Manage topics</Link>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Articles" value={articles.data?.totalItems} icon={FileText} href="/articles" tone="bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400" />
      <Stat label="Topics" value={topics.data?.totalItems} icon={MessagesSquare} href="/topics" tone="bg-highlight-soft text-highlight dark:bg-highlight/15"
        detail={topics.data && <>{pending.length}{topics.data.hasNext ? "+" : ""} awaiting review</>} />
      <Stat label="Categories" value={categories.data?.length} icon={FolderTree} href="/categories" tone="bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-400"
        detail={activeCategories !== undefined && `${activeCategories} visible on the site`} />
      <Stat label="Tags" value={tags.data?.length} icon={Tags} href="/tags" tone="bg-theme-purple-500/10 text-theme-purple-500" />
    </div>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Panel title="Awaiting review" action={<Link href="/topics" className={panelLink}>All topics<ArrowRight className="h-3.5 w-3.5" /></Link>}>
        {topics.loading || topics.error ? <LoadState loading={topics.loading} error={topics.error} empty="" retry={topics.reload} />
          : !pending.length ? <p className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No topics are waiting for review.</p>
          : <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {pending.slice(0, 6).map((topic) => <li key={topic.topicId}>
              <Link href={`/topics/${topic.topicId}`} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-highlight-soft text-highlight dark:bg-highlight/15"><Clock className="h-4 w-4" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">{topic.name}</span>
                  <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{topic.category.name} · asked by {topic.author.username}</span>
                </span>
                <span className="text-xs font-medium text-brand-600 dark:text-brand-400">Review</span>
              </Link>
            </li>)}
            {pending.length > 6 && <li className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">+{pending.length - 6} more on the Topics page</li>}
          </ul>}
      </Panel>

      <Panel title="Most used tags" action={<Link href="/tags" className={panelLink}>Manage<ArrowRight className="h-3.5 w-3.5" /></Link>}>
        {tags.loading || tags.error ? <LoadState loading={tags.loading} error={tags.error} empty="" retry={tags.reload} />
          : !topTags.length ? <p className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No tags yet.</p>
          : <ul className="space-y-3 px-5 py-4">
            {topTags.map((tag) => <li key={tag.tagId}>
              <div className="flex items-center justify-between text-sm"><span className="truncate font-medium text-gray-800 dark:text-gray-200">#{tag.slugName}</span><span className="tabular-nums text-xs text-gray-500 dark:text-gray-400">{tag.postUseCount} articles · {tag.topicUseCount} topics</span></div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-brand-500 dark:bg-brand-400" style={{ width: `${(tag.uses / maxUses) * 100}%` }} /></div>
            </li>)}
          </ul>}
      </Panel>
    </div>

    <Panel title="Recently updated articles" action={<Link href="/articles" className={panelLink}>All articles<ArrowRight className="h-3.5 w-3.5" /></Link>}>
      {articles.loading || articles.error ? <LoadState loading={articles.loading} error={articles.error} empty="" retry={articles.reload} />
        : !articles.data?.items.length ? <p className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No articles yet.</p>
        : <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="text-xs text-gray-500 dark:text-gray-400"><tr>{["Title", "Category", "Updated", "Votes", "Status"].map((label) => <th key={label} scope="col" className="px-5 py-3 font-medium">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">{articles.data.items.map(({ content: article, voteStats }) => <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
            <td className="max-w-md px-5 py-3"><Link href={`/articles/${article.id}`} className="block truncate font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">{article.title}</Link><span className="text-xs text-gray-500 dark:text-gray-400">by {article.author.username}</span></td>
            <td className="whitespace-nowrap px-5 py-3 text-gray-500 dark:text-gray-400">{article.category?.name ?? "—"}</td>
            <td className="whitespace-nowrap px-5 py-3 text-gray-500 dark:text-gray-400">{new Date(article.updatedAt).toLocaleDateString()}</td>
            <td className="whitespace-nowrap px-5 py-3"><span className="inline-flex items-center gap-3 text-xs"><span className="inline-flex items-center gap-1 text-success-600 dark:text-success-500"><ThumbsUp className="h-3.5 w-3.5" />{voteStats.upvoteCount}</span><span className="inline-flex items-center gap-1 text-error-500"><ThumbsDown className="h-3.5 w-3.5" />{voteStats.downvoteCount}</span></span></td>
            <td className="px-5 py-3"><StatusBadge active={article.isActive} /></td>
          </tr>)}</tbody>
        </table></div>}
    </Panel>
  </div>;
}
