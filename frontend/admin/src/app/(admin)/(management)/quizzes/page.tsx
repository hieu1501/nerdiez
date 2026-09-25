"use client";

import { useState, FormEvent, useEffect } from "react";
import { quizzesService, Quiz } from "@/services/quizzes";
import { ApiError } from "@/services/api";
import { useToast } from "@/components/ui/toast/useToast";
import ToastContainer from "@/components/ui/toast/Toast";
import PageHeader from "@/components/management/PageHeader";
import DeleteConfirmation from "@/components/management/DeleteConfirmation";
import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
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

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Quiz | null>(null);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizzesService.getAll();
      setQuizzes(data);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Cannot connect to server. Please ensure the API is running.";
      toast.error(`Failed to load quizzes: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get("title") as string;
    const timeLimit = data.get("timeLimit") as string;
    if (!title || !timeLimit) return;

    try {
      if (editing) {
        const updated = await quizzesService.update(editing.id, { title, timeLimit });
        setQuizzes((prev) => prev.map((q) => (q.id === editing.id ? updated : q)));
      } else {
        const created = await quizzesService.create({ title, timeLimit });
        setQuizzes((prev) => [...prev, created]);
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed to save quiz. Check server connection.");
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setEditing(quiz);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const totalPages = Math.ceil(quizzes.length / pageSize);
  const paged = quizzes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
      {deleting && (
        <DeleteConfirmation
          name={deleting.title}
          onClose={() => setDeleting(null)}
          onDelete={() => quizzesService.delete(deleting.id)}
          onDeleted={() => {
            setDeleting(null);
            setQuizzes((prev) => prev.filter((q) => q.id !== deleting.id));
          }}
        />
      )}
      <PageHeader title="Quizzes" onAdd={() => { setEditing(null); setModalOpen(true); }} addLabel="Add Quiz" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-dark">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">No quizzes found.</div>
        ) : (
          <>
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Title</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Questions</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Time Limit</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paged.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{quiz.title}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{quiz.questions}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{quiz.timeLimit}</TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge size="sm" color={quiz.status === "Active" ? "success" : "warning"}>{quiz.status}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(quiz)} className="text-brand-500 hover:text-brand-600 text-sm font-medium">Edit</button>
                        <button onClick={() => setDeleting(quiz)} className="text-error-500 hover:text-error-600 text-sm font-medium">Delete</button>
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
            {editing ? "Edit Quiz" : "Add Quiz"}
          </h3>
        </div>
        <Form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input id="title" name="title" placeholder="Enter quiz title" defaultValue={editing?.title ?? ""} required />
            </div>
            <div>
              <Label htmlFor="timeLimit">Time Limit</Label>
              <select id="timeLimit" name="timeLimit" defaultValue={editing?.timeLimit ?? ""} className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800">
                <option value="" disabled>Select time limit</option>
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="60 min">60 min</option>
                <option value="90 min">90 min</option>
              </select>
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
