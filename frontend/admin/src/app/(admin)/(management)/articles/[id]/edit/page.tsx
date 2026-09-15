"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { articlesService, AdminPostDetailContentDTO } from "@/services/articles";
import { tagsService, Tag } from "@/services/tags";
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

  const [article, setArticle] = useState<AdminPostDetailContentDTO | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const showError = toast.error;
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; status: string }>({ show: false, status: "" });

  useEffect(() => {
    Promise.all([
      articlesService.getById(id),
      tagsService.getAll(),
    ])
      .then(([response, tops]) => {
        const art = response.content;
        setArticle(art);
        setTitle(art.title);
        setCategoryId(art.category.categoryId);
        setContent(art.content || "");
        setDescription(art.description || "");
        setFeaturedImage(art.featuredImage ?? "");
        setTags(tops);
        setSelectedTagIds(art.tags.map((tag) => tag.tagId));
      })
      .catch((e) => {
        showError(e instanceof ApiError ? e.message : "Failed to load article.");
      })
      .finally(() => setLoading(false));
  }, [id, showError]);

  const availableTags = [
    ...tags,
    ...(article?.tags.filter((tag) => !tags.some((item) => item.tagId === tag.tagId)) ?? []),
  ];


  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setFeaturedImage(article?.featuredImage ?? "");
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
    if (saving) return;
    setConfirmDialog({ show: false, status: "" });
    if (!title.trim() || !content.trim() || !categoryId || selectedTagIds.length === 0) {
      toast.error("Title, content, category, and at least one tag are required.");
      return;
    }
    const availableTagIds = new Set(availableTags.map((tag) => tag.tagId));
    if (selectedTagIds.some((tagId) => !availableTagIds.has(tagId))) {
      toast.error("One or more selected tags are no longer available.");
      return;
    }
    if (featuredImage && !isAllowedImageUrl(featuredImage)) {
      toast.error("Cover image URL is not valid. Please re-upload.");
      return;
    }
    if (article) {
      const changed =
        title !== article.title ||
        content !== (article.content || "") ||
        description !== (article.description || "") ||
        featuredImage !== (article.featuredImage ?? "") ||
        selectedTagIds.length !== article.tags.length ||
        selectedTagIds.some((tagId, index) => tagId !== article.tags[index]?.tagId) ||
        (status === "Published") !== article.isActive;
      if (!changed) {
        router.push("/articles");
        return;
      }
    }
    setSaving(true);
    try {
      await articlesService.patch(id, { title, content, featuredImage, description, tagIds: selectedTagIds, isActive: status === "Published" });
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
          <span className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Category</span>
          <p className="py-2.5 text-sm text-gray-800 dark:text-white/90">{article.category.name}</p>
        </div>
        <div className="w-60">
          <MultiSelect
            label="Tags"
            options={availableTags.map((t) => ({
              value: String(t.tagId),
              text: t.slugName,
              selected: selectedTagIds.includes(t.tagId),
            }))}
            value={selectedTagIds.map(String)}
            onChange={(selected) => setSelectedTagIds(selected.map(Number))}
            placeholder="Select tags..."
            emptyMessage="No tags available. Create a tag first."
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
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={cancelCoverImage}>Cancel</Button>
            <Button variant="primary" onClick={confirmCoverImage}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
