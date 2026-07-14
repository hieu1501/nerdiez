"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { articlesService } from "@/services/articles";
import { categoriesService, Category } from "@/services/categories";
import { topicsService, Topic } from "@/services/topics";
import { ApiError } from "@/services/api";
import RichTextEditor from "@/components/management/RichTextEditor";
import TableOfContents from "@/components/management/TableOfContents";
import MultiSelect from "@/components/form/MultiSelect";
import Button from "@/components/ui/button/Button";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      categoriesService.getAll(),
      topicsService.getAll(),
    ])
      .then(([cats, tops]) => {
        setCategories(cats);
        setTopics(tops);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (status: string) => {
    setError("");
    if (!title.trim() || !category) {
      setError("Title and category are required.");
      return;
    }
    setSaving(true);
    try {
      await articlesService.create({ title, category, status, content, topicIds: selectedTopicIds.map(Number) });
      router.push("/articles");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-4 2xl:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          New Article
        </h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/articles")}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave("Draft")}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave("Published")}
            disabled={saving}
          >
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="flex items-start gap-6 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="title" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="block w-full h-11 px-4 text-sm border rounded-lg border-gray-300 bg-transparent text-gray-900 placeholder-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:placeholder-white/30 dark:focus:border-brand-800"
          />
        </div>
        <div className="w-44">
          <label htmlFor="category" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-60">
          <MultiSelect
            label="Topics"
            options={topics.map((t) => ({
              value: String(t.topicId),
              text: t.name,
              selected: selectedTopicIds.includes(String(t.topicId)),
            }))}
            defaultSelected={selectedTopicIds}
            onChange={setSelectedTopicIds}
          />
        </div>
      </div>

      <div className="flex gap-8 mb-20">
        <div className="w-[65%] min-w-0">
          <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>
        <aside className="hidden xl:block flex-1">
          <TableOfContents content={content} />
        </aside>
      </div>
    </div>
  );
}
