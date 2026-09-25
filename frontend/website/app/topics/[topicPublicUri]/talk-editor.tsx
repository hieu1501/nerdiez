"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { markdownPlugins } from "@/app/components/markdown";
import { BookOpen, Pencil } from "lucide-react";
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
  const tab = (active: boolean) => `inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${active ? "bg-surface font-semibold text-ink shadow-card" : "text-muted hover:text-ink"}`;
  return <form onSubmit={submit} className="card my-4 overflow-hidden border-accent/40 transition-shadow focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/15" aria-label={draft.publicUri ? "Edit reply" : "Add reply"}>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-soft/60 px-4 py-2.5">
      <label htmlFor={`${id}-content`} className="text-sm font-semibold">{draft.publicUri ? "Edit your explanation" : "Your explanation"}</label>
      <div className="inline-flex rounded-lg bg-soft p-0.5" role="group" aria-label="Editor view">
        <button type="button" aria-pressed={!preview} onClick={() => setPreview(false)} className={tab(!preview)}><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Write</button>
        <button type="button" aria-pressed={preview} onClick={() => setPreview(true)} className={tab(preview)}><BookOpen className="h-3.5 w-3.5" aria-hidden="true" />Preview</button>
      </div>
    </div>
    {recovered && <p role="status" className="border-b border-line bg-highlight-soft px-4 py-2 text-sm">Unsaved changes restored. Review before saving.</p>}
    <fieldset disabled={pending} className="disabled:opacity-60">
      <textarea ref={contentInput} id={`${id}-content`} required={!preview} maxLength={10_000} rows={10} value={draft.content} onChange={(event) => update({ content: event.target.value })}
        placeholder={"Start with the intuition, then walk through an example.\n\nMarkdown works: **bold**, `code`, lists, tables…"}
        className={`block min-h-56 w-full resize-y bg-surface px-4 py-3 font-mono text-sm leading-6 text-ink placeholder:text-muted/70 focus:outline-none ${preview ? "hidden" : ""}`} />
      {preview && <div className="reader-content reader-compact min-h-56 bg-surface px-4 py-3">{draft.content.trim() ? <ReactMarkdown remarkPlugins={markdownPlugins}>{draft.content}</ReactMarkdown> : <p className="text-muted">Nothing to preview yet.</p>}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <span className="text-xs text-muted">Markdown supported · {draft.content.length.toLocaleString("en")}/10,000</span>
        <div className="flex gap-2">
          <button type="button" onClick={cancel} className="h-9 rounded-lg px-3.5 text-sm font-medium text-muted hover:bg-soft hover:text-ink">Cancel</button>
          <button type="submit" className="h-9 rounded-lg bg-button px-3.5 text-sm font-semibold text-button-text hover:bg-accent-hover">{pending ? "Saving…" : draft.publicUri ? "Save changes" : "Publish reply"}</button>
        </div>
      </div>
    </fieldset>
    {error && <p role="alert" className="border-t border-line px-4 py-2.5 text-sm text-danger">{error}</p>}
  </form>;
}
