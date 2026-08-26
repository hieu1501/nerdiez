"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { articlesService } from "@/services/articles";
import { categoriesService, Category } from "@/services/categories";
import { topicsService, Topic } from "@/services/topics";
import { uploadFile } from "@/services/upload";
import { compressImage } from "@/lib/compress";
import { isAllowedImageUrl } from "@/lib/url";
import { ApiError } from "@/services/api";
import { useToast } from "@/components/ui/toast/useToast";
import ToastContainer from "@/components/ui/toast/Toast";
import { Modal } from "@/components/ui/modal";
import RichTextEditor from "@/components/management/RichTextEditor";
import TableOfContents from "@/components/management/TableOfContents";
import Select from "@/components/form/Select";
import MultiSelect from "@/components/form/MultiSelect";
import Button from "@/components/ui/button/Button";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; status: string }>({ show: false, status: "" });

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

  const availableTopics = useMemo(
    () => topics.filter((topic) => topic.category.categoryId === categoryId),
    [categoryId, topics],
  );

  const handleCategoryChange = (value: string) => {
    const nextCategoryId = Number(value);
    if (nextCategoryId === categoryId) return;

    if (selectedTopicIds.length > 0) {
      toast.info("Selected topics were cleared because the category changed.");
    }
    setCategoryId(nextCategoryId);
    setSelectedTopicIds([]);
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setFeaturedImage("");
      setCoverPreviewUrl("");
      return;
    }
    setUploadingImage(true);
    try {
      const compressed = await compressImage(file);
      const url = await uploadFile(compressed);
      setCoverPreviewUrl(url);
      setShowCoverModal(true);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to upload cover image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const confirmCoverImage = () => {
    setFeaturedImage(coverPreviewUrl);
    setShowCoverModal(false);
  };

  const cancelCoverImage = () => {
    setCoverPreviewUrl("");
    setShowCoverModal(false);
  };

  const handleSave = async (status: string) => {
    setConfirmDialog({ show: false, status: "" });
    if (!title.trim() || !categoryId || selectedTopicIds.length === 0) {
      toast.error("Title, category, and at least one topic are required.");
      return;
    }
    const availableTopicIds = new Set(availableTopics.map((topic) => topic.topicId));
    if (selectedTopicIds.some((topicId) => !availableTopicIds.has(Number(topicId)))) {
      toast.error("Every selected topic must belong to the selected category.");
      return;
    }
    if (featuredImage && !isAllowedImageUrl(featuredImage)) {
      toast.error("Cover image URL is not valid. Please re-upload.");
      return;
    }
    setSaving(true);
    try {
      await articlesService.create({ title: title, content: content, description: description, featuredImage: featuredImage, categoryId: categoryId, isActive: status === "Published", topicIds: selectedTopicIds.map(Number) });
      router.push("/articles");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-4 2xl:px-8">
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
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
            onClick={() => setConfirmDialog({ show: true, status: "Draft" })}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            variant="primary"
            onClick={() => setConfirmDialog({ show: true, status: "Published" })}
            disabled={saving}
          >
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

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
        <div className="w-full">
          <label htmlFor="description" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of the article"
            rows={2}
            className="block w-full px-4 py-2.5 text-sm border rounded-lg border-gray-300 bg-transparent text-gray-900 placeholder-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:placeholder-white/30 dark:focus:border-brand-800"
          />
        </div>
        <div className="w-44">
          <Select
            label="Category"
            options={categories.map((c) => ({
              value: String(c.categoryId),
              label: c.name,
            }))}
            placeholder="Select category"
            defaultValue={categoryId ? String(categoryId) : ""}
            onChange={handleCategoryChange}
          />
        </div>
        <div className="w-60">
          <MultiSelect
            label="Topics"
            options={availableTopics.map((t) => ({
              value: String(t.topicId),
              text: t.name,
              selected: selectedTopicIds.includes(String(t.topicId)),
            }))}
            value={selectedTopicIds}
            onChange={setSelectedTopicIds}
            disabled={!categoryId}
            placeholder={
              !categoryId
                ? "Select a category first"
                : availableTopics.length === 0
                  ? "No topics available"
                  : "Select topics..."
            }
            emptyMessage="No topics available for this category"
          />
        </div>
        <div className="w-44">
          <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Cover Image
          </label>
          <label className={`relative block aspect-[16/10] w-full rounded-lg border border-dashed text-sm ${uploadingImage ? "border-brand-300 text-brand-500 cursor-wait" : "cursor-pointer border-gray-300 text-gray-500 hover:border-brand-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-800"}`}>
            {featuredImage ? (
              <img src={featuredImage} alt="Cover" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center">
                {uploadingImage ? "Uploading..." : "Upload image"}
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingImage}
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            />
            {featuredImage && !uploadingImage && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleImageChange(null); }}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs text-white hover:bg-error-600"
              >
                ×
              </button>
            )}
          </label>
        </div>
      </div>

      <div className="flex gap-8 mb-20">
        <div className="w-[85%] min-w-0">
          <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>
        <aside className="hidden xl:block flex-1 min-w-0">
          <TableOfContents content={content} />
        </aside>
      </div>

      <Modal isOpen={confirmDialog.show} onClose={() => setConfirmDialog({ show: false, status: "" })} showCloseButton={false} className="!p-6 max-w-sm">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Confirm Status</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to <strong>{confirmDialog.status === "Published" ? "publish" : "save as draft"}</strong> this article?
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setConfirmDialog({ show: false, status: "" })}>Cancel</Button>
            <Button variant={confirmDialog.status === "Published" ? "primary" : "outline"} onClick={() => handleSave(confirmDialog.status)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCoverModal} onClose={cancelCoverImage} showCloseButton={false} className="!p-6 max-w-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Cover Image Preview</h3>
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
            <img src={coverPreviewUrl} alt="Cover preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={cancelCoverImage}>Cancel</Button>
            <Button variant="primary" onClick={confirmCoverImage}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
