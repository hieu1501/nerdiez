"use client";

import { useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent, type RefObject } from "react";
import { Bold, BookOpen, Code, Columns2, Heading1, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListChecks, ListOrdered, Minus, Pencil, Quote, SquareCode, Strikethrough, Table } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownPlugins } from "@/app/components/markdown";

type Mode = "write" | "split" | "preview";
interface Edit { start: number; end: number; text: string; selectStart: number; selectEnd: number }

const TABLE = "| Column | Column |\n| --- | --- |\n| Cell | Cell |";

// Goes through execCommand so the browser's undo history keeps the change.
function applyEdit(textarea: HTMLTextAreaElement, edit: Edit, onChange: (value: string) => void) {
  textarea.focus();
  textarea.setSelectionRange(edit.start, edit.end);
  if (!document.execCommand("insertText", false, edit.text)) {
    onChange(textarea.value.slice(0, edit.start) + edit.text + textarea.value.slice(edit.end));
  }
  requestAnimationFrame(() => textarea.setSelectionRange(edit.selectStart, edit.selectEnd));
}

function wrap(value: string, start: number, end: number, before: string, after: string, placeholder: string): Edit {
  const selected = value.slice(start, end);
  if (selected.startsWith(before) && selected.endsWith(after) && selected.length >= before.length + after.length) {
    const inner = selected.slice(before.length, selected.length - after.length);
    return { start, end, text: inner, selectStart: start, selectEnd: start + inner.length };
  }
  const inner = selected || placeholder;
  return { start, end, text: before + inner + after, selectStart: start + before.length, selectEnd: start + before.length + inner.length };
}

// Adds a prefix to every selected line, or removes it when all lines already have it.
function prefixLines(value: string, start: number, end: number, prefix: (index: number) => string, pattern: RegExp): Edit {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = value.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const remove = lines.every((line) => pattern.test(line));
  const text = lines.map((line, index) => remove ? line.replace(pattern, "") : prefix(index) + line.replace(/^(#{1,6} |> |- \[[ x]\] |- |\d+\. )/, "")).join("\n");
  return { start: lineStart, end: lineEnd, text, selectStart: lineStart, selectEnd: lineStart + text.length };
}

function block(value: string, start: number, end: number, content: string, selectFrom = 0, selectLength = content.length): Edit {
  const before = start === 0 || value.slice(0, start).endsWith("\n\n") ? "" : value.slice(0, start).endsWith("\n") ? "\n" : "\n\n";
  const after = value.slice(end).startsWith("\n") ? "\n" : "\n\n";
  const text = before + content + after;
  const selectStart = start + before.length + selectFrom;
  return { start, end, text, selectStart, selectEnd: selectStart + selectLength };
}

type Build = (value: string, start: number, end: number) => Edit;
const link: Build = (text, start, end) => {
  const label = text.slice(start, end) || "link text";
  const urlStart = start + label.length + 3;
  return { start, end, text: `[${label}](https://)`, selectStart: urlStart, selectEnd: urlStart + 8 };
};
const codeBlock: Build = (text, s, e) => { const code = text.slice(s, e) || "code"; return block(text, s, e, "```\n" + code + "\n```", 4, code.length); };
const bold: Build = (text, s, e) => wrap(text, s, e, "**", "**", "bold text");
const italic: Build = (text, s, e) => wrap(text, s, e, "_", "_", "italic text");
const TOOLS = [
  { label: "Heading 1", icon: Heading1, build: ((text, s, e) => prefixLines(text, s, e, () => "# ", /^# /)) as Build },
  { label: "Heading 2", icon: Heading2, build: ((text, s, e) => prefixLines(text, s, e, () => "## ", /^## /)) as Build },
  { label: "Heading 3", icon: Heading3, build: ((text, s, e) => prefixLines(text, s, e, () => "### ", /^### /)) as Build },
  { label: "Bold (Ctrl+B)", icon: Bold, build: bold },
  { label: "Italic (Ctrl+I)", icon: Italic, build: italic },
  { label: "Strikethrough", icon: Strikethrough, build: ((text, s, e) => wrap(text, s, e, "~~", "~~", "struck text")) as Build },
  { label: "Link (Ctrl+K)", icon: Link2, build: link },
  { label: "Quote", icon: Quote, build: ((text, s, e) => prefixLines(text, s, e, () => "> ", /^> /)) as Build },
  { label: "Bulleted list", icon: List, build: ((text, s, e) => prefixLines(text, s, e, () => "- ", /^- (?!\[)/)) as Build },
  { label: "Numbered list", icon: ListOrdered, build: ((text, s, e) => prefixLines(text, s, e, (index) => `${index + 1}. `, /^\d+\. /)) as Build },
  { label: "Task list", icon: ListChecks, build: ((text, s, e) => prefixLines(text, s, e, () => "- [ ] ", /^- \[[ x]\] /)) as Build },
  { label: "Inline code", icon: Code, build: ((text, s, e) => wrap(text, s, e, "`", "`", "code")) as Build },
  { label: "Code block", icon: SquareCode, build: codeBlock },
  { label: "Table", icon: Table, build: ((text, s, e) => block(text, s, e, TABLE, 2, 6)) as Build },
  { label: "Divider", icon: Minus, build: ((text, s, e) => block(text, s, e, "---", 3, 0)) as Build },
];
const SHORTCUTS: Record<string, Build> = { b: bold, i: italic, k: link };

export function MarkdownPreview({ content, cover }: { content: string; cover?: string | null }) {
  return <div className="reader-content min-h-64 rounded-xl border border-line bg-surface p-5">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {cover && <img src={cover} alt="" className="mb-6 aspect-[2/1] w-full rounded-lg border border-line bg-soft object-cover" />}
    {content.trim() ? <ReactMarkdown remarkPlugins={markdownPlugins}>{content}</ReactMarkdown> : <p className="text-muted">Nothing to preview yet.</p>}
  </div>;
}

export default function MarkdownEditor({ value, onChange, textareaRef, onImage, uploading, cover }: {
  value: string;
  onChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onImage: (file: File) => void;
  uploading: boolean;
  cover?: string | null;
}) {
  const [mode, setMode] = useState<Mode>("write");
  const imageInput = useRef<HTMLInputElement>(null);

  const run = (build: Build) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    applyEdit(textarea, build(textarea.value, textarea.selectionStart, textarea.selectionEnd), onChange);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
    const shortcut = SHORTCUTS[event.key.toLowerCase()];
    if (shortcut) { event.preventDefault(); run(shortcut); }
  };
  const imageFrom = (files: FileList | undefined) => Array.from(files ?? []).find((file) => file.type.startsWith("image/"));
  const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const file = imageFrom(event.clipboardData?.files);
    if (file) { event.preventDefault(); onImage(file); }
  };
  const onDrop = (event: DragEvent<HTMLTextAreaElement>) => {
    const file = imageFrom(event.dataTransfer?.files);
    if (file) { event.preventDefault(); onImage(file); }
  };


  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const button = "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-accent disabled:opacity-40";
  const modes: { id: Mode; label: string; icon: typeof Pencil; className?: string }[] = [
    { id: "write", label: "Write", icon: Pencil },
    { id: "split", label: "Side by side", icon: Columns2, className: "hidden md:inline-flex" },
    { id: "preview", label: "Preview", icon: BookOpen },
  ];

  return <section aria-labelledby="content-label">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label id="content-label" htmlFor="article-content" className="text-sm font-semibold">Article <span className="font-normal text-muted">(Markdown)</span></label>
      <div className="inline-flex rounded-lg bg-soft p-0.5" role="group" aria-label="Editor view">
        {modes.map(({ id, label, icon: Icon, className }) => <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)} className={`${className ?? "inline-flex"} items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${mode === id ? "bg-surface font-semibold text-ink shadow-card" : "text-muted hover:text-ink"}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}
      </div>
    </div>
    {/* Focus matches the other form fields: accent border plus soft ring, with inner lines tinted to match. */}
    <div className="group/editor mt-2 overflow-hidden rounded-xl border border-line transition-shadow focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/15">
      {mode !== "preview" && <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-line bg-soft px-1.5 py-1 group-focus-within/editor:border-accent/40">
        {TOOLS.map(({ label, icon: Icon, build }) => <button key={label} type="button" title={label} aria-label={label} onClick={() => run(build)} className={button}><Icon className="h-4 w-4" /></button>)}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        <input ref={imageInput} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) onImage(file); }} />
        <button type="button" title="Insert image" aria-label="Insert image" disabled={uploading} onClick={() => imageInput.current?.click()} className={button}><ImagePlus className="h-4 w-4" /></button>
      </div>}
      {/* Split panes share one fixed height so the divider spans both and each side scrolls on its own. */}
      <div className={mode === "split" ? "grid h-[32rem] md:grid-cols-2 md:divide-x md:divide-line group-focus-within/editor:divide-accent/40" : ""}>
        <textarea ref={textareaRef} id="article-content" required={mode !== "preview"} rows={20} value={value} spellCheck onKeyDown={onKeyDown} onPaste={onPaste} onDrop={onDrop} onChange={(event) => onChange(event.target.value)}
          placeholder={"Write in Markdown. ## Headings, **bold**, `code`, lists, tables…"}
          className={`block w-full bg-surface px-4 py-3 font-mono text-sm leading-6 text-ink focus:outline-none ${mode === "preview" ? "hidden" : ""} ${mode === "split" ? "h-full resize-none" : "min-h-[28rem] resize-y"}`} />
        {mode !== "write" && <div className={`bg-surface [&>div]:min-h-full [&>div]:rounded-none [&>div]:border-0 ${mode === "split" ? "hidden h-full overflow-y-auto md:block" : ""}`}><MarkdownPreview content={value} cover={mode === "preview" ? cover : null} /></div>}
      </div>
    </div>
    <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted">
      <span>{uploading ? "Uploading image…" : "Paste or drop images into the text. Images must be 1MB or smaller after compression."}</span>
      <span>{words} {words === 1 ? "word" : "words"} · {Math.max(1, Math.round(words / 220))} min read</span>
    </div>
  </section>;
}
