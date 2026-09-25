"use client";

import { useCallback, useRef, useState } from "react";
import MDEditor, {
  commands,
  executeCommand,
  selectLine,
  selectWord,
  type ICommand,
  type RefMDEditor,
} from "@uiw/react-md-editor";
import remarkBreaks from "remark-breaks";
import { uploadFile } from "@/services/upload";
import { ApiError } from "@/services/api";
import { compressImage } from "@/lib/compress";

interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
}

function setValue(ta: HTMLTextAreaElement, value: string) {
  const start = ta.selectionStart;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, "value"
  )?.set;
  setter?.call(ta, value);
  ta.selectionStart = ta.selectionEnd = start;
  ta.dispatchEvent(new Event("input", { bubbles: true }));
}

function stripHtmlWrapper(s: string): string {
  return s
    .replace(/^<html><head><\/head><body>\s*/i, "")
    .replace(/\s*<\/body><\/html>$/i, "");
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<RefMDEditor>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    setUploadError(null);
    try {
      const compressed = await compressImage(file);
      const url = await uploadFile(compressed);
      if (url) {
        const caption = file.name.replace(/\.[^.]+$/, "");
        const ta = editorRef.current?.textarea;
        if (ta) {
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          const img = `\n![${caption}](${url})\n`;
          const value = ta.value.slice(0, start) + img + ta.value.slice(end);
          const setter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, "value"
          )?.set;
          setter?.call(ta, value);
          ta.selectionStart = ta.selectionEnd = start + img.length;
          ta.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    } catch (e) {
      setUploadError(e instanceof ApiError ? e.message : "Failed to upload image.");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  }, [handleImageUpload]);

  const handlePaste = useCallback(async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(event.clipboardData?.items ?? []);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) await handleImageUpload(file);
        break;
      }
    }
  }, [handleImageUpload]);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLTextAreaElement>) => {
    const files = event.dataTransfer?.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        event.preventDefault();
        await handleImageUpload(file);
        break;
      }
    }
  }, [handleImageUpload]);

  const focusTextarea = () => {
    const ta = editorRef.current?.textarea;
    if (ta) ta.focus();
  };

  const headingCmd = (prefix: string, label: string, shortcuts: string): ICommand => ({
    name: `heading${prefix.trim()}`,
    keyCommand: label.toLowerCase(),
    icon: <span className="font-semibold text-sm leading-none">{label}</span>,
    buttonProps: { title: `Heading ${label}`, "aria-label": `Heading ${label}` },
    shortcuts,
    execute: (state, api) => {
      api.textArea.focus();
      const { text, selection } = state;
      const { start: lineStart, end: lineEnd } = selectLine({ text, selection });
      const line = text.slice(lineStart, lineEnd);
      const stripped = line.replace(/^#{1,6}\s*/, "");
      const headingText = stripped || "Heading text";
      const newText = text.slice(0, lineStart) + prefix + headingText + text.slice(lineEnd);
      setValue(api.textArea, newText);
      api.setSelectionRange({ start: lineStart + prefix.length, end: lineStart + prefix.length + headingText.length });
    },
  });

  const strikethroughCmd: ICommand = {
    ...commands.strikethrough,
    execute: (state, api) => {
      const prefix = state.command.prefix ?? "~~";
      const range = selectWord({ text: state.text, selection: state.selection, prefix });
      const state1 = api.setSelectionRange(range);
      if (state1.selectedText === "") {
        const placeholder = "strikethrough text";
        api.replaceSelection(`${prefix}${placeholder}${prefix}`);
        api.setSelectionRange({
          start: state1.selection.start + prefix.length,
          end: state1.selection.start + prefix.length + placeholder.length,
        });
      } else {
        executeCommand({
          api,
          selectedText: state1.selectedText,
          selection: state.selection,
          prefix,
        });
      }
    },
  };

  const imageCommand: ICommand = {    name: "image-upload",
    keyCommand: "image-upload",
    buttonProps: { "aria-label": "Upload image" },
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.91.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
      </svg>
    ),
    execute: () => {
      focusTextarea();
      fileInputRef.current?.click();
    },
  };

  const linkIcon = (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
      <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
      <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
    </svg>
  );

  const quoteIcon = (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.5 16.5a.75.75 0 01-.75-.75v-3.75a2.25 2.25 0 012.25-2.25h.75v-.75a3.75 3.75 0 013.75-3.75h.75a.75.75 0 010 1.5h-.75a2.25 2.25 0 00-2.25 2.25v.75h1.5a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25h-3a2.25 2.25 0 01-2.25-2.25zm7.5 0a.75.75 0 01-.75-.75v-3.75a2.25 2.25 0 012.25-2.25h.75v-.75a3.75 3.75 0 013.75-3.75h.75a.75.75 0 010 1.5h-.75a2.25 2.25 0 00-2.25 2.25v.75h1.5a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25h-3a2.25 2.25 0 01-2.25-2.25z" clipRule="evenodd" />
    </svg>
  );

  const codeIcon = (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" data-color-mode="light">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <MDEditor
        ref={editorRef}
        value={stripHtmlWrapper(content)}
        onChange={(val) => onChange(stripHtmlWrapper(val ?? ""))}
        preview="live"
        height="65vh"
        previewOptions={{
          remarkPlugins: [remarkBreaks],
        }}
        textareaProps={{
          onPaste: handlePaste,
          onDrop: handleDrop,
        }}
        commands={[
          headingCmd("# ", "H1", "ctrlcmd+1"),
          headingCmd("## ", "H2", "ctrlcmd+2"),
          headingCmd("### ", "H3", "ctrlcmd+3"),
          commands.divider,
          commands.bold,
          commands.italic,
          strikethroughCmd,
          commands.divider,
          { ...commands.link, icon: linkIcon },
          imageCommand,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.divider,
          { ...commands.quote, icon: quoteIcon },
          { ...commands.codeBlock, icon: codeIcon },
        ]}
      />
      {uploadError && (
        <p role="alert" className="px-3 py-2 text-sm text-error-600 border-t border-gray-300 dark:border-gray-600 dark:text-error-400">
          {uploadError}
        </p>
      )}
    </div>
  );
}
