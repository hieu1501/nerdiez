"use client";

import { useRef, useState, type FormEvent } from "react";
import { talksService, type AdminTalkContentDTO } from "@/services/talks";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import RichTextEditor from "./RichTextEditor";
import VisibilitySaveConfirmation from "./VisibilitySaveConfirmation";
import { Field, inputClass } from "./ContentUI";

export default function TalkEditor({ topicId, talk, onClose, onSaved }: {
  topicId: number;
  talk?: AdminTalkContentDTO;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(talk?.title ?? "");
  const [content, setContent] = useState(talk?.content ?? "");
  const [isActive, setIsActive] = useState(talk?.isActive ?? false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const close = () => { if (!busy.current) onClose(); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError("");
    setConfirming(true);
  };
  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const data = { title: title.trim(), content, isActive };
      if (talk) await talksService.update(talk.id, data);
      else await talksService.create({ ...data, topicId });
      onSaved();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save talk.");
      setConfirming(false);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return <Modal title="Talk editor" isOpen onClose={close} className="m-4 max-h-[90vh] max-w-4xl overflow-y-auto p-6" showCloseButton={false}>
    <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">{talk ? "Edit talk" : "Add talk"}</h3>
    {error && <p role="alert" className="mb-4 text-sm text-error-500">{error}</p>}
    {confirming ? <VisibilitySaveConfirmation itemType="talk" itemName={title} isActive={isActive} saving={saving} onCancel={() => { if (!saving) setConfirming(false); }} onConfirm={save} /> : <form onSubmit={submit} className="space-y-4">
      <Field label="Title"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
      <div><p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Content</p><RichTextEditor content={content} onChange={setContent} /></div>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />Active</label>
      <div className="flex justify-end gap-3 pt-3"><Button variant="outline" onClick={close}>Cancel</Button><Button type="submit">Save</Button></div>
    </form>}
  </Modal>;
}
