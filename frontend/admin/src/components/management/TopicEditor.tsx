"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import { topicsService, type Topic } from "@/services/topics";
import { tagsService } from "@/services/tags";
import { categoriesService } from "@/services/categories";
import { useResource } from "@/hooks/useResource";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import MultiSelect from "@/components/form/MultiSelect";
import VisibilitySaveConfirmation from "./VisibilitySaveConfirmation";
import { Field, inputClass, LoadState } from "./ContentUI";

export default function TopicEditor({ topic, onClose, onSaved, onChanged }: {
  topic?: Topic;
  onClose: () => void;
  onSaved: (topic: Topic) => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState(topic?.name ?? "");
  const [description, setDescription] = useState(topic?.description ?? "");
  const [categoryId, setCategoryId] = useState(topic?.category.categoryId ?? 0);
  const [tagIds, setTagIds] = useState(topic?.tags.map((tag) => String(tag.tagId)) ?? []);
  const [isActive, setIsActive] = useState(topic?.isActive ?? false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const load = useCallback(async () => {
    const [tags, categories] = await Promise.all([tagsService.getAll(), topic ? Promise.resolve([]) : categoriesService.getAll()]);
    return { tags, categories };
  }, [topic]);
  const options = useResource(load);
  const tags = [...(options.data?.tags ?? []), ...(topic?.tags.filter((tag) => !options.data?.tags.some((item) => item.tagId === tag.tagId)) ?? [])];
  const close = () => { if (!busy.current) onClose(); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!name.trim() || !categoryId || !tagIds.length) {
      setError("Title, category, and at least one tag are required.");
      return;
    }
    setConfirming(true);
  };
  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const data = { name: name.trim(), description, tagIds: tagIds.map(Number), isActive };
      const saved = topic ? await topicsService.update(topic.topicId, data) : await topicsService.create({ ...data, categoryId });
      if (saved.name !== data.name || (saved.description ?? "") !== description || saved.isActive !== isActive || saved.tags.length !== tagIds.length || saved.tags.some((tag) => !tagIds.includes(String(tag.tagId)))) {
        onChanged();
        setError("The server saved different values from your draft. Your draft is still here; review the saved topic before trying again.");
        setConfirming(false);
      } else {
        onSaved(saved);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save topic.");
      setConfirming(false);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return <Modal title="Topic editor" isOpen onClose={close} className="m-4 max-h-[90vh] max-w-xl overflow-y-auto p-6" showCloseButton={false}>
    <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">{topic ? "Edit topic" : "Create topic"}</h3>
    {error && <p role="alert" className="mb-4 text-sm text-error-500">{error}</p>}
    {confirming ? <VisibilitySaveConfirmation itemType="topic" itemName={name} isActive={isActive} saving={saving} onCancel={() => { if (!saving) setConfirming(false); }} onConfirm={save} /> : <>
      {options.loading || options.error ? <><LoadState loading={options.loading} error={options.error} empty="" retry={options.reload} /><Button variant="outline" onClick={close}>Cancel</Button></> : <form onSubmit={submit} className="space-y-4">
        <Field label="Title"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={256} required /></Field>
        <Field label="Description"><textarea className={inputClass} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={512} /></Field>
        {topic ? <div className="text-sm text-gray-600 dark:text-gray-300">Category: {topic.category.name}</div> : <Field label="Category"><select className={inputClass} value={categoryId || ""} onChange={(e) => setCategoryId(Number(e.target.value))} required><option value="" disabled>Select category</option>{options.data?.categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.name}{category.isActive ? "" : " (inactive)"}</option>)}</select></Field>}
        <MultiSelect label="Tags" options={tags.map((tag) => ({ value: String(tag.tagId), text: tag.slugName }))} value={tagIds} onChange={setTagIds} placeholder="Select tags…" emptyMessage="Create a tag first on the Tags page." />
        {!topic && !options.data?.categories.length && <p className="text-sm text-gray-500">Create a category first on the Categories page.</p>}
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />Active</label>
        <div className="flex justify-end gap-3 pt-3"><Button variant="outline" onClick={close}>Cancel</Button><Button type="submit" disabled={!tags.length || !categoryId}>Save</Button></div>
      </form>}
    </>}
  </Modal>;
}
