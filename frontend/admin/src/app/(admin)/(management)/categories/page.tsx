"use client";

import { useState, FormEvent, useEffect } from "react";
import { categoriesService, Category } from "@/services/categories";
import { ApiError } from "@/services/api";
import { useToast } from "@/components/ui/toast/useToast";
import ToastContainer from "@/components/ui/toast/Toast";
import PageHeader from "@/components/management/PageHeader";
import { Modal } from "@/components/ui/modal";
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
import Pagination from "@/components/tables/Pagination";

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getAll();
      setItems(data);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Cannot connect to server. Please ensure the API is running.";
      toast.error(`Failed to load categories: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const description = form.get("description") as string;
    if (!name) return;
    try {
      if (editing) {
        await categoriesService.update(editing.categoryId, { name, description });
      } else {
        await categoriesService.create({ name, description });
      }
      await fetch();
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed to save category.");
    }
  };

  const handleEdit = (item: Category) => { setEditing(item); setModalOpen(true); };
  const handleDelete = async (categoryId: number) => {
    try {
      await categoriesService.delete(categoryId);
      await fetch();
    } catch {
      toast.error("Failed to delete category.");
    }
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const totalPages = Math.ceil(items.length / pageSize);
  const paged = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
      <PageHeader title="Categories" onAdd={() => { setEditing(null); setModalOpen(true); }} addLabel="Add Category" />
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">No categories found.</div>
        ) : (
          <>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paged.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{item.name}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.description || "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="text-brand-500 hover:text-brand-600 text-sm font-medium">Edit</button>
                        <button onClick={() => handleDelete(item.categoryId)} className="text-error-500 hover:text-error-600 text-sm font-medium">Delete</button>
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
      <Modal key={editing?.categoryId ?? "new"} isOpen={modalOpen} onClose={closeModal} className="max-w-sm w-full p-6">
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">{editing ? "Edit Category" : "Add Category"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Category name" defaultValue={editing?.name ?? ""} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <TextArea id="description" name="description" placeholder="Category description" defaultValue={editing?.description ?? ""} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
