"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

export default function DeleteConfirmation({ name, onDelete, onClose, onDeleted }: {
  name: string;
  onDelete: () => Promise<void>;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const remove = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      await onDelete();
      onDeleted();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Deletion failed.");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return <Modal title="Confirm deletion" isOpen onClose={() => { if (!busy.current) onClose(); }} className="m-4 max-w-md p-6" showCloseButton={false}>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete {name}?</h3>
    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">This will permanently erase this resource. This action cannot be undone.</p>
    {error && <p role="alert" className="mt-3 text-sm text-error-500">{error}</p>}
    <div className="mt-6 flex justify-end gap-3">
      <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
      <Button onClick={remove} disabled={saving} className="!bg-error-500 hover:!bg-error-600">{saving ? "Deleting…" : "Delete permanently"}</Button>
    </div>
  </Modal>;
}
