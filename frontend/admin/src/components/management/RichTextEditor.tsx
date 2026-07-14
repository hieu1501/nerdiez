"use client";

import { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

let headingCounter = 0;

const HeadingWithId = Heading.extend({
  renderHTML({ node }) {
    const level = node.attrs.level;
    const text = node.textContent;
    const id = node.attrs.id || `${slugify(text) || "section"}-${headingCounter++}`;
    return [`h${level}`, { id }, 0];
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      HeadingWithId,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing your article...",
      }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      headingCounter = 0;
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none px-4 py-3 dark:prose-invert",
      },
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const ToolBtn = ({
    active,
    onClick,
    title,
    children,
  }: {
    active?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
        active
          ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"
          : "text-gray-600 dark:text-gray-400"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg flex flex-col" style={{ height: "65vh" }}>
      <div className="flex flex-wrap gap-0.5 px-2 py-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolBtn>

        <span className="w-px mx-1 bg-gray-300 dark:bg-gray-600" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <em>I</em>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <span className="underline">U</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <span className="line-through">S</span>
        </ToolBtn>

        <span className="w-px mx-1 bg-gray-300 dark:bg-gray-600" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4a1 1 0 100-2 1 1 0 000 2zm3-1h9v2H5V3zm-3 5a1 1 0 100-2 1 1 0 000 2zm3-1h9v2H5V7zm-3 5a1 1 0 100-2 1 1 0 000 2zm3-1h9v2H5v-2z" />
          </svg>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered list"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.5 3.5v-1h1v1h-1zm0 5v-1h1v1h-1zm0 5v-1h1v1h-1zM6 4h8v1H6V4zm0 5h8v1H6V9zm0 5h8v1H6v-1z" />
          </svg>
        </ToolBtn>

        <span className="w-px mx-1 bg-gray-300 dark:bg-gray-600" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.5 3.5a.5.5 0 010-1h11a.5.5 0 010 1h-11zm0 5a.5.5 0 010-1h11a.5.5 0 010 1h-11zm0 5a.5.5 0 010-1h11a.5.5 0 010 1h-11z" />
          </svg>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code block"
        >
          <code className="text-xs font-mono">&lt;/&gt;</code>
        </ToolBtn>

        <span className="w-px mx-1 bg-gray-300 dark:bg-gray-600" />

        <ToolBtn onClick={addLink} active={editor.isActive("link")} title="Add link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.354 5.5H4a3 3 0 000 6h3a3 3 0 002.83-4H9a3 3 0 01-2.646 2H4a1.5 1.5 0 010-3h2.354a.5.5 0 000-1zM8.5 3a3 3 0 00-2.707 1.5h1.34A1.5 1.5 0 018.5 4h3a1.5 1.5 0 010 3H9.854a.5.5 0 000 1H11.5a3 3 0 000-6h-3z" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={addImage} title="Add image">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.502 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            <path d="M14.002 13a2 2 0 01-2 2h-10a2 2 0 01-2-2V5A2 2 0 012 3h1.18l.64-1.28A2 2 0 015.68 1h4.64a2 2 0 011.86 1.28l.64 1.28h1.18a2 2 0 012 2v8z" />
          </svg>
        </ToolBtn>

        <span className="w-px mx-1 bg-gray-300 dark:bg-gray-600" />

        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8 3a5 5 0 11-4.546 2.914.5.5 0 00.908-.417A6 6 0 1114 8a6 6 0 01-6 6 .5.5 0 010-1 5 5 0 100-10z"
            />
            <path d="M4.5 2.5v4h4" />
          </svg>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8 3a5 5 0 100 10 .5.5 0 010 1A6 6 0 1114 8a6 6 0 01-6 6 .5.5 0 010-1 5 5 0 100-10z"
            />
            <path d="M11.5 2.5v4h-4" />
          </svg>
        </ToolBtn>
      </div>
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
