"use client";

import { PlusIcon } from "@/icons";

interface PageHeaderProps {
  title: string;
  onAdd: () => void;
  addLabel: string;
}

export default function PageHeader({ title, onAdd, addLabel }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h2>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
      >
        <PlusIcon />
        {addLabel}
      </button>
    </div>
  );
}
