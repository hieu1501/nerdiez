"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TalkDraft } from "@/lib/talk-drafts";

export default function TalkEditor({ draft, pending, error, recovered, update, submit, cancel }: {
  draft: TalkDraft; pending: boolean; error: string | null; recovered: boolean;
  update: (fields: Partial<Pick<TalkDraft, "content">>) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void; cancel: () => void;
}) {
  const id = useId();
  const contentInput = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  useEffect(() => { contentInput.current?.focus(); }, []);
  const inputClass = "mt-2 block w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm leading-6 text-ink";
  return <form onSubmit={submit} className="my-5 rounded-lg border border-line bg-soft/40 p-4" aria-label={draft.publicUri ? "Edit reply" : "Add reply"}>
    <h3 className="text-base font-bold">{draft.publicUri ? "Edit reply" : "Add reply"}</h3>
    {recovered && <p role="status" className="mt-3 text-sm text-muted">Unsaved changes restored. Review before saving.</p>}
    <fieldset disabled={pending} className="mt-5 disabled:opacity-60">
      <div>
        <div className="flex items-center justify-between gap-3"><label htmlFor={`${id}-content`} className="text-sm font-bold">Reply</label><button type="button" aria-pressed={preview} onClick={() => setPreview((value) => !value)} className="rounded-md border border-line px-3 py-1.5 text-xs">{preview ? "Write" : "Preview"}</button></div>
        <textarea ref={contentInput} id={`${id}-content`} required={!preview} maxLength={10_000} rows={10} value={draft.content} onChange={(event) => update({ content: event.target.value })} className={`${inputClass} font-mono ${preview ? "hidden" : ""}`} />
        {preview && <div className="reader-content mt-2 min-h-48 rounded-lg border border-line bg-paper p-4">{draft.content.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.content}</ReactMarkdown> : <p className="text-muted">No content yet.</p>}</div>}
        <div className="mt-2 flex justify-between text-xs text-muted"><span>Markdown supported</span><span>{draft.content.length.toLocaleString("en")}/10,000</span></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2"><button type="submit" className="rounded-md bg-button px-3 py-2 text-xs font-bold text-button-text">{pending ? "Saving…" : draft.publicUri ? "Save changes" : "Publish reply"}</button><button type="button" onClick={cancel} className="rounded-md border border-line px-3 py-2 text-xs">Cancel</button></div>
    </fieldset>
    {error && <p role="alert" className="mt-4 text-sm text-downvote">{error}</p>}
  </form>;
}
