"use client";

import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  onAdd: () => void;
  addLabel: string;
  disabled?: boolean;
  description?: string;
}

export default function PageHeader({ title, onAdd, addLabel, disabled, description }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      <button
        onClick={onAdd}
        disabled={disabled}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  );
}
