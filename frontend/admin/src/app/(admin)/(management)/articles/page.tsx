"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { articlesService, Article } from "@/services/articles";
import { ApiError } from "@/services/api";
import { useToast } from "@/components/ui/toast/useToast";
import ToastContainer from "@/components/ui/toast/Toast";
import PageHeader from "@/components/management/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";

type SortKey = "title" | "authorUsername" | "category" | "updatedAt" | "isActive" | "upvoteCount" | "downvoteCount";
type SortDir = "asc" | "desc";

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const pageSize = 5;

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const articlesData = await articlesService.getAll();
      setArticles(articlesData);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Cannot connect to server. Please ensure the API is running.";
      toast.error(`Failed to load articles: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await articlesService.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("Failed to delete article. Check server connection.");
    }
  };

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getSortValue = (article: Article, key: SortKey): string | number => {
    switch (key) {
      case "title": return article.title.toLowerCase();
      case "authorUsername": return article.authorUsername?.toLowerCase() ?? "";
      case "category": return article.category?.name?.toLowerCase() ?? "";
      case "updatedAt": return article.updatedAt ?? "";
      case "isActive": return article.isActive ? 1 : 0;
      case "upvoteCount": return article.upvoteCount ?? 0;
      case "downvoteCount": return article.downvoteCount ?? 0;
    }
  };

  const sorted = useMemo(() => {
    const copy = [...articles];
    copy.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [articles, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const SortHeader = ({ label, col }: { label: string; col: SortKey }) => {
    const active = sortKey === col;
    const arrow = active ? (sortDir === "asc" ? " \u25B2" : " \u25BC") : "";
    return (
      <TableCell
        isHeader
        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300"
        onClick={() => handleSort(col)}
      >
        {label}{arrow}
      </TableCell>
    );
  };

  return (
    <div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
      <PageHeader
        title="Articles"
        onAdd={() => router.push("/articles/new")}
        addLabel="Add Article"
      />
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">No articles found.</div>
        ) : (
          <>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <SortHeader label="Title" col="title" />
                  <SortHeader label="Author" col="authorUsername" />
                  <SortHeader label="Category" col="category" />
                  <SortHeader label="Upvotes" col="upvoteCount" />
                  <SortHeader label="Downvotes" col="downvoteCount" />
                  <SortHeader label="Last Modified" col="updatedAt" />
                  <SortHeader label="Status" col="isActive" />
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paged.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{article.title}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{article.authorUsername}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{article.category ? article.category.name : "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">{article.upvoteCount ?? 0}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span className="text-red-500 dark:text-red-400 font-medium">{article.downvoteCount ?? 0}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge size="sm" color={article.isActive ? "success" : "warning"}>{article.isActive ? "Published" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/articles/${article.id}`)}
                          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/articles/${article.id}/edit`)}
                          className="text-brand-500 hover:text-brand-600 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-error-500 hover:text-error-600 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex justify-end px-5 py-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
