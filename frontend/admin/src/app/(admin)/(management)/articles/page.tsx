"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { articlesService, ArticlePage } from "@/services/articles";
import { ApiError } from "@/services/api";
import { useToast } from "@/components/ui/toast/useToast";
import ToastContainer from "@/components/ui/toast/Toast";
import PageHeader from "@/components/management/PageHeader";
import DeleteConfirmation from "@/components/management/DeleteConfirmation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";
import { ArrowDownIcon, ArrowUpIcon, SortIcon } from "@/icons";

type SortField = "title" | "createdAt" | "updatedAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

type SortableHeaderProps = {
  label: string;
  field: SortField;
  activeField: SortField;
  direction: SortDir;
  onSort: (field: SortField) => void;
};

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  field,
  activeField,
  direction,
  onSort,
}) => {
  const active = activeField === field;
  return (
    <TableCell
      isHeader
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer select-none group hover:text-gray-700 dark:hover:text-gray-300"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1.5" title={`Sort by ${label}`}>
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUpIcon className="size-3 text-brand-500" />
          ) : (
            <ArrowDownIcon className="size-3 text-brand-500" />
          )
        ) : (
          <SortIcon className="size-3 opacity-40" />
        )}
      </span>
    </TableCell>
  );
};

export default function ArticlesPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [data, setData] = useState<ArticlePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<ArticlePage["items"][number]["content"] | null>(null);
  const toast = useToast();
  const showError = toast.error;

  const fetchArticles = useCallback(() => {
    return articlesService
      .getAll({
        page,
        size: PAGE_SIZE,
        sort: `${sortField},${sortDir}`,
      })
      .then((result) => {
        setData(result);
      })
      .catch((e) => {
        const msg = e instanceof ApiError ? e.message : "Cannot connect to server. Please ensure the API is running.";
        showError(`Failed to load articles: ${msg}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, sortField, sortDir, showError]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(0);
  };

  return (
    <div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
      {deleting && (
        <DeleteConfirmation
          name={deleting.title}
          onClose={() => setDeleting(null)}
          onDelete={() => articlesService.delete(deleting.id)}
          onDeleted={() => {
            setDeleting(null);
            if (data && data.items.length === 1 && page > 0) {
              setPage((p) => p - 1);
            } else {
              void fetchArticles();
            }
          }}
        />
      )}
      <PageHeader
        title="Articles"
        onAdd={() => router.push("/articles/new")}
        addLabel="Add Article"
      />
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">Loading...</div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">No articles found.</div>
        ) : (
          <>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <SortableHeader label="Title" field="title" activeField={sortField} direction={sortDir} onSort={handleSort} />
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Author</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Category</TableCell>
                  <SortableHeader label="Created" field="createdAt" activeField={sortField} direction={sortDir} onSort={handleSort} />
                  <SortableHeader label="Last Modified" field="updatedAt" activeField={sortField} direction={sortDir} onSort={handleSort} />
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Upvotes</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Downvotes</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data.items.map(({ content: article, voteStats }) => (
                  <TableRow key={article.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{article.title}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{article.author.username}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{article.category?.name || "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">{voteStats.upvoteCount ?? 0}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span className="text-red-500 dark:text-red-400 font-medium">{voteStats.downvoteCount ?? 0}</span>
                    </TableCell>
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
                          onClick={() => setDeleting(article)}
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
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {data.offset + 1}–{data.offset + data.items.length} of {data.totalItems} articles · {data.size} per page
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {page + 1} of {data.totalPages}
                </span>
                {data.totalPages > 1 && (
                  <Pagination
                    currentPage={page + 1}
                    totalPages={data.totalPages}
                    onPageChange={(p) => setPage(p - 1)}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
