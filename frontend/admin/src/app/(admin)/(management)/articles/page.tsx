"use client";

import { useState, FormEvent, useEffect } from "react";
import { articlesService, Article } from "@/services/articles";
import { ApiError } from "@/services/api";
import PageHeader from "@/components/management/PageHeader";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";

const categories = [
  { value: "Technology", label: "Technology" },
  { value: "Science", label: "Science" },
  { value: "Education", label: "Education" },
  { value: "Lifestyle", label: "Lifestyle" },
];

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await articlesService.getAll();
      console.log(data);
      setArticles(data);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(`Failed to load articles: ${e.message}`);
      } else {
        setError("Cannot connect to server. Please ensure the API is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get("title") as string;
    const author = data.get("author") as string;
    const category = data.get("category") as string;
    if (!title || !author || !category) return;

    try {
      if (editing) {
        const updated = await articlesService.update(editing.id, { title, author, category });
        setArticles((prev) => prev.map((a) => (a.id === editing.id ? updated : a)));
      } else {
        const created = await articlesService.create({ title, author, category });
        setArticles((prev) => [...prev, created]);
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      alert("Failed to save article. Check server connection.");
    }
  };

  const handleEdit = (article: Article) => {
    setEditing(article);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await articlesService.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete article. Check server connection.");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const totalPages = Math.ceil(articles.length / pageSize);
  const paged = articles.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <PageHeader title="Articles" onAdd={() => { setEditing(null); setModalOpen(true); }} addLabel="Add Article" />
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">Loading...</div>
        ) : error ? (
          <div className="p-6">
            <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">No articles found.</div>
        ) : (
          <>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Title</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Author</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Category</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paged.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{article.title}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{article.author}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{article.category}</TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge size="sm" color={article.status === "Published" ? "success" : "warning"}>{article.status}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(article)} className="text-brand-500 hover:text-brand-600 text-sm font-medium">Edit</button>
                        <button onClick={() => handleDelete(article.id)} className="text-error-500 hover:text-error-600 text-sm font-medium">Delete</button>
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
      <Modal key={editing?.id ?? "new"} isOpen={modalOpen} onClose={closeModal} className="max-w-xl w-full p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {editing ? "Edit Article" : "Add Article"}
          </h3>
        </div>
        <Form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Article Title</Label>
              <Input id="title" name="title" placeholder="Enter article title" defaultValue={editing?.title ?? ""} required />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input id="author" name="author" placeholder="Enter author name" defaultValue={editing?.author ?? ""} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" defaultValue={editing?.category ?? ""} className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800">
                <option value="" disabled>Select category</option>
                {categories.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <TextArea placeholder="Enter article content" rows={4} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
