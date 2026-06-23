"use client";

import { useState, FormEvent } from "react";
import PageHeader from "@/components/management/PageHeader";
import ModalForm from "@/components/management/ModalForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";

interface Lesson {
  id: number;
  title: string;
  subject: string;
  grade: string;
  status: string;
}

const subjects = [
  { value: "math", label: "Math" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
];

const grades = [
  { value: "1", label: "Grade 1" },
  { value: "2", label: "Grade 2" },
  { value: "3", label: "Grade 3" },
  { value: "4", label: "Grade 4" },
  { value: "5", label: "Grade 5" },
];

const initialLessons: Lesson[] = [
  { id: 1, title: "Introduction to Algebra", subject: "Math", grade: "Grade 5", status: "Published" },
  { id: 2, title: "Photosynthesis Basics", subject: "Science", grade: "Grade 4", status: "Draft" },
  { id: 3, title: "Grammar Fundamentals", subject: "English", grade: "Grade 3", status: "Published" },
];

const fields = [
  { name: "title", label: "Lesson Title", type: "text" as const, required: true, placeholder: "Enter lesson title" },
  { name: "subject", label: "Subject", type: "select" as const, options: subjects, placeholder: "Select subject" },
  { name: "grade", label: "Grade", type: "select" as const, options: grades, placeholder: "Select grade" },
  { name: "content", label: "Content", type: "textarea" as const, placeholder: "Enter lesson content" },
];

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get("title") as string;
    const subject = data.get("subject") as string;
    const grade = data.get("grade") as string;
    const subjectLabel = subjects.find((s) => s.value === subject)?.label || subject;
    const gradeLabel = grades.find((g) => g.value === grade)?.label || grade;

    if (editing) {
      setLessons((prev) =>
        prev.map((l) =>
          l.id === editing.id ? { ...l, title, subject: subjectLabel, grade: gradeLabel } : l
        )
      );
    } else {
      setLessons((prev) => [
        ...prev,
        { id: Date.now(), title, subject: subjectLabel, grade: gradeLabel, status: "Draft" },
      ]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleEdit = (lesson: Lesson) => {
    setEditing(lesson);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const totalPages = Math.ceil(lessons.length / pageSize);
  const paged = lessons.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <PageHeader title="Lessons" onAdd={handleAdd} addLabel="Add Lesson" />
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Title</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Subject</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Grade</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paged.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{lesson.title}</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{lesson.subject}</TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{lesson.grade}</TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <Badge size="sm" color={lesson.status === "Published" ? "success" : "warning"}>{lesson.status}</Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-end">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(lesson)} className="text-brand-500 hover:text-brand-600 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(lesson.id)} className="text-error-500 hover:text-error-600 text-sm font-medium">Delete</button>
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
      </div>
      <ModalForm
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        title={editing ? "Edit Lesson" : "Add Lesson"}
        fields={fields}
        defaultValues={editing ? { title: editing.title } : {}}
      />
    </div>
  );
}
