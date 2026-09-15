"use client";

import { useRef, useState, type FormEvent } from "react";
import { tagsService, type Tag } from "@/services/tags";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import VisibilitySaveConfirmation from "./VisibilitySaveConfirmation";
import { Field, inputClass } from "./ContentUI";

export default function TagEditor({ tag, onClose, onSaved }: { tag?: Tag; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(tag?.slugName ?? "");
  const [isActive, setIsActive] = useState(tag?.isActive ?? false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const close = () => { if (!busy.current) onClose(); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setError("A tag name is required."); return; }
    setError("");
    setConfirming(true);
  };
  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      const data = { name: name.trim(), isActive };
      if (tag) await tagsService.update(tag.tagId, data);
      else await tagsService.create(data);
      onSaved();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save tag.");
      setConfirming(false);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return <Modal title="Tag editor" isOpen onClose={close} className="m-4 max-w-md p-6" showCloseButton={false}>
    <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">{tag ? "Edit tag" : "Create tag"}</h3>
    {error && <p role="alert" className="mb-4 text-sm text-error-500">{error}</p>}
    {confirming ? <VisibilitySaveConfirmation itemType="tag" itemName={name} isActive={isActive} saving={saving} onCancel={() => { if (!saving) setConfirming(false); }} onConfirm={save} /> : <form onSubmit={submit} className="space-y-4">
      <Field label="Name"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={tag ? 255 : 256} required /></Field>
      <p className="text-xs text-gray-500 dark:text-gray-400">Saved as a slug that can be used across articles and topics.</p>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />Active</label>
      <div className="flex justify-end gap-3 pt-3"><Button variant="outline" onClick={close}>Cancel</Button><Button type="submit">Save</Button></div>
    </form>}
  </Modal>;
}
