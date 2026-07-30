"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { articlesService, Article } from "@/services/articles";
import { ApiError } from "@/services/api";
import { useToast } from "@/components/ui/toast/useToast";
import ToastContainer from "@/components/ui/toast/Toast";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import TableOfContents from "@/components/management/TableOfContents";

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    articlesService
      .getById(id)
      .then(setArticle)
      .catch((e) => {
        toast.error(e instanceof ApiError ? e.message : "Failed to load article.");
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6">
        <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
        <Button variant="outline" className="mt-4" onClick={() => router.push("/articles")}>
          Back to Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 2xl:px-8">
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Article Details
        </h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/articles")}>
            Back
          </Button>
          <Button variant="primary" onClick={() => router.push(`/articles/${article.id}/edit`)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {article.featuredImage && (
          <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="w-48 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <img
                src={article.featuredImage}
                alt="Cover"
                className="w-full aspect-video object-cover"
              />
            </div>
            <div className="min-w-0 pt-1 text-xs text-gray-500 dark:text-gray-400">
              <p className="font-medium text-gray-700 dark:text-white/90">Featured Image</p>
              <p className="truncate">{article.featuredImage}</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            {article.title}
          </h1>

          {article.description && (
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{article.description}</p>
          )}

          <div className="mb-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Author: <strong className="text-gray-700 dark:text-white/90">{article.authorUsername}</strong></span>
            <span>Category: <strong className="text-gray-700 dark:text-white/90">{article.category?.name || "—"}</strong></span>
            <span>Status: <Badge size="sm" color={article.isActive ? "success" : "warning"}>{article.isActive ? "Published" : "Inactive"}</Badge></span>
            <span>Created: <strong className="text-gray-700 dark:text-white/90">{new Date(article.createdAt).toLocaleString()}</strong></span>
            <span>Updated: <strong className="text-gray-700 dark:text-white/90">{new Date(article.updatedAt).toLocaleString()}</strong></span>
          </div>

          {article.topics && article.topics.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {article.topics.map((t) => (
                <span
                  key={t.topicId}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-white/90"
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}

          <div className="mb-6 flex gap-6 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15a.75.75 0 01-.75-.75V7.612L7.22 9.64a.75.75 0 01-1.06-1.06l3.5-3.5a.75.75 0 011.06 0l3.5 3.5a.75.75 0 01-1.06 1.06l-2.03-2.028v6.638c0 .414-.336.75-.75.75z"/></svg>
              {article.upvoteCount}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a.75.75 0 01.75.75v6.638l2.03-2.028a.75.75 0 011.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 011.06-1.06l2.03 2.028V5.75A.75.75 0 0110 5z"/></svg>
              {article.downvoteCount}
            </span>
          </div>

          {article.content && (
            <div className="flex gap-8">
              <div className="w-[85%] min-w-0">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
              </div>
              <aside className="hidden xl:block flex-1">
                <TableOfContents content={article.content} />
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
