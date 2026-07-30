"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { articlesService, Article } from "@/services/articles";
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
import MultiSelect from "@/components/form/MultiSelect";
import Button from "@/components/ui/button/Button";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [coverDescription, setCoverDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; status: string }>({ show: false, status: "" });

  useEffect(() => {
    Promise.all([
      articlesService.getById(id),
      categoriesService.getAll(),
      topicsService.getAll(),
    ])
      .then(([art, cats, tops]) => {
        setArticle(art);
        setTitle(art.title);
        setCategoryId(art.category?.categoryId ?? 0);
        setContent(art.content || "");
        setDescription(art.description || "");
        setFeaturedImage(art.featuredImage ?? "");
        setCategories(cats);
        setTopics(tops);
        setSelectedTopicIds(art.topics?.map(topic => topic.topicId) ?? []);
      })
      .catch((e) => {
        toast.error(e instanceof ApiError ? e.message : "Failed to load article.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setFeaturedImage(article?.featuredImage ?? "");
      setCoverPreviewUrl("");
      setCoverDescription("");
      return;
    }
    setUploadingImage(true);
    try {
      const compressed = await compressImage(file);
      const url = await uploadFile(compressed);
      setCoverPreviewUrl(url);
      setCoverDescription("");
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
    setCoverDescription("");
    setShowCoverModal(false);
  };

  const handleSave = async (status: string) => {
    setConfirmDialog({ show: false, status: "" });
    if (!title.trim() || !categoryId || selectedTopicIds.length === 0) {
      toast.error("Title, category, and at least one topic are required.");
      return;
    }
    if (featuredImage && !isAllowedImageUrl(featuredImage)) {
      toast.error("Cover image URL is not valid. Please re-upload.");
      return;
    }
    if (article) {
      const changed =
        title !== article.title ||
        categoryId !== (article.category?.categoryId ?? 0) ||
        content !== (article.content || "") ||
        description !== (article.description || "") ||
        featuredImage !== (article.featuredImage ?? "") ||
        selectedTopicIds.length !== (article.topics?.length ?? 0) ||
        selectedTopicIds.some((id, i) => id !== (article.topics?.[i]?.topicId ?? -1)) ||
        (status === "Published") !== article.isActive;
      if (!changed) {
        router.push("/articles");
        return;
      }
    }
    setSaving(true);
    try {
      await articlesService.update(id, { title, content, featuredImage, description, categoryId, topicIds: selectedTopicIds, isActive: status === "Published" });
      router.push("/articles");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusClick = (status: string) => {
    const targetActive = status === "Published";
    if (article && article.isActive !== targetActive) {
      setConfirmDialog({ show: true, status });
    } else {
      handleSave(status);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6">
        <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
        <Button variant="outline" className="mt-4" onClick={() => router.push("/articles")}>
          Back to Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 2xl:px-8">
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Edit Article
        </h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/articles")}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(article?.isActive ? "Published" : "Draft")}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          {article?.isActive ? (
            <Button
              variant="outline"
              onClick={() => handleStatusClick("Draft")}
              disabled={saving}
              className="!text-error-500 !ring-error-500 hover:!bg-error-50 dark:hover:!bg-error-500/10"
            >
              {saving ? "Saving..." : "Inactivate"}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => handleStatusClick("Published")}
              disabled={saving}
            >
              {saving ? "Publishing..." : "Publish"}
            </Button>
          )}
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
          <label htmlFor="category" className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          >
            <option value={0}>Select category</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-60">
          <MultiSelect
            label="Topics"
            options={topics.map((t) => ({
              value: String(t.topicId),
              text: t.name,
              selected: selectedTopicIds.includes(t.topicId),
            }))}
            defaultSelected={selectedTopicIds.map(String)}
            onChange={(selected) => setSelectedTopicIds(selected.map(Number))}
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
        <aside className="hidden xl:block flex-1">
          <TableOfContents content={content} />
        </aside>
      </div>

      <Modal isOpen={confirmDialog.show} onClose={() => setConfirmDialog({ show: false, status: "" })} showCloseButton={false} className="!p-6 max-w-sm">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">{article?.isActive ? "Inactivate" : "Publish"} Article</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to <strong>{article?.isActive ? "inactivate" : "publish"}</strong> this article?
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
          <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <input
            type="text"
            value={coverDescription}
            onChange={(e) => setCoverDescription(e.target.value)}
            placeholder="Image description (alt text)"
            className="block w-full h-11 px-4 text-sm border rounded-lg border-gray-300 bg-transparent text-gray-900 placeholder-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:placeholder-white/30 dark:focus:border-brand-800 mb-4"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={cancelCoverImage}>Cancel</Button>
            <Button variant="primary" onClick={confirmCoverImage}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
