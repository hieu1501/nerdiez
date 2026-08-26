"use client";

import { useState, FormEvent, useEffect } from "react";
import { topicsService, Topic } from "@/services/topics";
import { categoriesService, Category } from "@/services/categories";
import { ApiError } from "@/services/api";
import { useToast } from "@/components/ui/toast/useToast";
import ToastContainer from "@/components/ui/toast/Toast";
import PageHeader from "@/components/management/PageHeader";
import VisibilitySaveConfirmation from "@/components/management/VisibilitySaveConfirmation";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";

interface PendingTopicSave {
  name: string;
  description: string;
  categoryId: number;
  isActive: boolean;
}

export default function TopicsPage() {
  const [items, setItems] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [editIsActive, setEditIsActive] = useState(true);
  const [pendingSave, setPendingSave] = useState<PendingTopicSave | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetch = async () => {
    try {
      setLoading(true);
      const [topicsData, categoriesData] = await Promise.all([
        topicsService.getAll(),
        categoriesService.getAll(),
      ]);
      setItems(topicsData);
      setCategories(categoriesData);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Cannot connect to server. Please ensure the API is running.";
      toast.error(`Failed to load data: ${msg}`);
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
    const categoryId = Number(form.get("categoryId"));
    if (!name || !categoryId) return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const isActive = editing ? editIsActive : submitter?.value !== "private";

    setPendingSave({ name, description, categoryId, isActive });
  };

  const confirmSave = async () => {
    if (!pendingSave || saving) return;

    setSaving(true);
    try {
      if (editing) {
        await topicsService.update(editing.topicId, pendingSave);
      } else {
        await topicsService.create(pendingSave);
      }
      await fetch();
      setPendingSave(null);
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed to save topic.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Topic) => {
    setEditing(item);
    setEditIsActive(item.isActive);
    setModalOpen(true);
  };
  const handleDelete = async (topicId: number) => {
    try {
      await topicsService.delete(topicId);
      await fetch();
    } catch {
      toast.error("Failed to delete topic.");
    }
  };
  const cancelConfirmation = () => {
    if (!saving) setPendingSave(null);
  };
  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setPendingSave(null);
  };

  const totalPages = Math.ceil(items.length / pageSize);
  const paged = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
      <PageHeader title="Topics" onAdd={() => { if (categories.length === 0) { toast.warning("Please create a category first before adding topics."); return; } setEditing(null); setModalOpen(true); }} addLabel="Add Topic" disabled={categories.length === 0} />
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
            {categories.length === 0 ? "No categories found. Please create a category first." : "No topics found."}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Category</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
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
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.category ? item.category.name : "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge size="sm" color={item.isActive ? "success" : "warning"}>
                        {item.isActive ? "Active" : "Private"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="text-brand-500 hover:text-brand-600 text-sm font-medium">Edit</button>
                        <button onClick={() => handleDelete(item.topicId)} className="text-error-500 hover:text-error-600 text-sm font-medium">Delete</button>
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
      <Modal key={editing?.topicId ?? "new"} isOpen={modalOpen} onClose={pendingSave ? cancelConfirmation : closeModal} className="max-w-sm w-full p-6">
        <div className={pendingSave ? "hidden" : ""}>
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">{editing ? "Edit Topic" : "Add Topic"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Topic name" defaultValue={editing?.name ?? ""} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <TextArea id="description" name="description" placeholder="Topic description" defaultValue={editing?.description ?? ""} rows={3} />
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={editing?.category ? editing.category.categoryId : ""}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {editing && (
                <Switch
                  label="Active"
                  defaultChecked={editing.isActive}
                  onChange={setEditIsActive}
                />
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
              <Button type="submit" variant="primary" name="saveMode" value="active" className="order-2">
                {editing ? "Save" : "Public save"}
              </Button>
              {!editing && (
                <Button type="submit" variant="outline" name="saveMode" value="private" className="order-1">
                  Private save
                </Button>
              )}
            </div>
          </form>
        </div>
        {pendingSave && (
          <VisibilitySaveConfirmation
            itemType="topic"
            itemName={pendingSave.name}
            isActive={pendingSave.isActive}
            saving={saving}
            onCancel={cancelConfirmation}
            onConfirm={confirmSave}
          />
        )}
      </Modal>
    </div>
  );
}
