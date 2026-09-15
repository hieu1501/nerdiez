"use client";

import { useState, FormEvent, useEffect } from "react";
import { usersService, User } from "@/services/users";
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

const roles = [
  { value: "Admin", label: "Admin" },
  { value: "Editor", label: "Editor" },
  { value: "Teacher", label: "Teacher" },
  { value: "Student", label: "Student" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<User | null>(null);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Cannot connect to server. Please ensure the API is running.";
      toast.error(`Failed to load users: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const role = data.get("role") as string;
    if (!name || !email || !role) return;

    try {
      if (editing) {
        const updated = await usersService.update(editing.id, { name, email, role });
        setUsers((prev) => prev.map((u) => (u.id === editing.id ? updated : u)));
      } else {
        const created = await usersService.create({ name, email, role });
        setUsers((prev) => [...prev, created]);
      }
      setModalOpen(false);
      setEditing(null);
    } catch {
      toast.error("Failed to save user. Check server connection.");
    }
  };

  const handleEdit = (user: User) => {
    setEditing(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const totalPages = Math.ceil(users.length / pageSize);
  const paged = users.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
      {deleting && (
        <DeleteConfirmation
          name={deleting.name}
          onClose={() => setDeleting(null)}
          onDelete={() => usersService.delete(deleting.id)}
          onDeleted={() => {
            setDeleting(null);
            setUsers((prev) => prev.filter((u) => u.id !== deleting.id));
          }}
        />
      )}
      <PageHeader title="Users" onAdd={() => { setEditing(null); setModalOpen(true); }} addLabel="Add User" />
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">Loading...</div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">No users found.</div>
        ) : (
          <>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paged.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{user.name}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{user.email}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color={user.role === "Admin" ? "primary" : user.role === "Teacher" ? "info" : "light"}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge size="sm" color={user.status === "Active" ? "success" : "error"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(user)} className="text-brand-500 hover:text-brand-600 text-sm font-medium">Edit</button>
                        <button onClick={() => setDeleting(user)} className="text-error-500 hover:text-error-600 text-sm font-medium">Delete</button>
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
            {editing ? "Edit User" : "Add User"}
          </h3>
        </div>
        <Form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Enter full name" defaultValue={editing?.name ?? ""} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Enter email address" defaultValue={editing?.email ?? ""} required />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select id="role" name="role" defaultValue={editing?.role ?? ""} className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800">
                <option value="" disabled>Select role</option>
                {roles.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
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
