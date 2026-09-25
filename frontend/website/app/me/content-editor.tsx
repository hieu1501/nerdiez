"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Check, Eye, EyeOff, ImagePlus, Trash2 } from "lucide-react";
import { ApiError, fetchAllCategories, type CategoryPublicDetailDTO, type TagPublicRefDTO } from "@/lib/api";
import { createArticle, createTopic, fetchPersonalArticle, fetchPersonalTopic, fetchTags, patchArticle, patchTopic, personalHref, type PatchArticleRequest, type PatchTopicRequest } from "@/lib/personal-api";
import { type CategoryView } from "@/lib/resource-links";
import { editorStorageKey } from "@/lib/auth-storage";
import { compressImage } from "@/lib/compress";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/app/auth-provider";
import { ListLoading } from "@/app/components/content-ui";
import { PersonalFailure, personalErrorMessage } from "./personal-feedback";
import MarkdownEditor from "./markdown-editor";

interface Fields { title: string; description: string; content: string; categorySlug: string; tagSlugs: string[]; featuredImage: string | null; isActive: boolean }
interface EditorData { fields: Fields; categories: CategoryPublicDetailDTO[]; tags: TagPublicRefDTO[] }
const emptyFields: Fields = { title: "", description: "", content: "", categorySlug: "", tagSlugs: [], featuredImage: null, isActive: false };

function restoreFields(key: string, original: Fields): Fields | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (!value || typeof value !== "object") return null;
    const fields = value as Record<string, unknown>;
    if (!["title", "description", "content", "categorySlug"].every((field) => typeof fields[field] === "string") || !Array.isArray(fields.tagSlugs) || !fields.tagSlugs.every((tag) => typeof tag === "string")) return null;
    const featuredImage = typeof fields.featuredImage === "string" || fields.featuredImage === null ? fields.featuredImage : original.featuredImage;
    const isActive = typeof fields.isActive === "boolean" ? fields.isActive : original.isActive;
    return { ...original, ...fields, featuredImage, isActive } as Fields;
  } catch { return null; }
}

function CoverSkeleton({ label }: { label: string }) {
  return <div role="status" aria-label={label} className="flex aspect-[2/1] w-full items-center justify-center bg-soft motion-safe:animate-pulse">
    <span className="h-7 w-7 rounded-full border-[3px] border-accent/25 border-t-accent motion-safe:animate-spin" aria-hidden="true" />
  </div>;
}

// Shows a spinner until the image has decoded, instead of its alt text flashing in.
function CoverPreview({ src, busy }: { src: string; busy: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return <div className="relative">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="Cover preview" onLoad={() => setLoaded(true)} onError={() => setLoaded(true)}
      ref={(image) => { if (image?.complete && image.naturalWidth) setLoaded(true); }}
      className={`aspect-[2/1] w-full bg-soft object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`} />
    {(!loaded || busy) && <div className="absolute inset-0"><CoverSkeleton label={busy ? "Uploading cover image" : "Loading cover image"} /></div>}
  </div>;
}

export default function ContentEditor({ resource, publicUri, initialCategorySlug }: { resource: CategoryView; publicUri?: string; initialCategorySlug?: string }) {
  const { profile, expireSession } = useAuth();
  const [data, setData] = useState<EditorData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [categories, tags, detail] = await Promise.all([
        fetchAllCategories(), fetchTags(),
        publicUri ? resource === "articles" ? fetchPersonalArticle(publicUri) : fetchPersonalTopic(publicUri) : Promise.resolve(null),
      ]);
      if (publicUri && !detail) throw new ApiError("Content not found", 404, `/api/me/${resource}/${publicUri}`);
      let fields: Fields = { ...emptyFields, categorySlug: categories.some((category) => category.slugName === initialCategorySlug) ? initialCategorySlug ?? "" : "" };
      if (detail) {
        if ("content" in detail) {
          fields = { title: detail.content.title, description: detail.content.description ?? "", content: detail.content.content, categorySlug: detail.content.category.slugName, tagSlugs: detail.content.tags.map((tag) => tag.slugName), featuredImage: detail.content.featuredImage, isActive: detail.content.isActive };
        } else {
          fields = { ...emptyFields, title: detail.name, description: detail.description ?? "", categorySlug: detail.category.slugName, tagSlugs: detail.tags.map((tag) => tag.slugName), isActive: detail.isActive };
        }
      }
      if (!cancelled) setData({ fields, categories, tags });
    };
    load().catch((failure) => {
      if (cancelled) return;
      if (failure instanceof ApiError && failure.status === 401) expireSession();
      else setError(failure);
    });
    return () => { cancelled = true; };
  }, [resource, publicUri, initialCategorySlug, reload, profile?.username, expireSession]);
  if (error) return <PersonalFailure error={error} retry={() => { setError(null); setReload((value) => value + 1); }} />;
  if (!data || !profile) return <ListLoading label="Loading editor" />;
  return <EditorForm key={`${profile.username}:${resource}:${publicUri ?? "new"}`} data={data} resource={resource} publicUri={publicUri} username={profile.username} />;
}

function EditorForm({ data, resource, publicUri, username }: { data: EditorData; resource: CategoryView; publicUri?: string; username: string }) {
  const router = useRouter();
  const { expireSession } = useAuth();
  const storageKey = editorStorageKey(username, resource, publicUri);
  const [fields, setFields] = useState<Fields>(() => {
    const restored = restoreFields(storageKey, data.fields);
    return restored ? { ...restored, categorySlug: publicUri ? data.fields.categorySlug : restored.categorySlug } : data.fields;
  });
  const [recovered] = useState(() => restoreFields(storageKey, data.fields) !== null);
  const [tagSearch, setTagSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const saveLock = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  // Latest fields, so an update landing after an upload doesn't drop edits made meanwhile.
  const fieldsRef = useRef(fields);
  const isArticle = resource === "articles";
  const noun = isArticle ? "article" : "topic";
  const inputClass = "mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal leading-6 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/15 disabled:bg-soft disabled:text-muted";
  const tagOptions = [...new Set([...data.tags.map((tag) => tag.slugName), ...data.fields.tagSlugs])].sort();
  const matchingTags = tagOptions.filter((tag) => tag.toLowerCase().includes(tagSearch.toLowerCase()));

  const update = (changes: Partial<Fields>) => {
    const next = { ...fieldsRef.current, ...changes };
    fieldsRef.current = next;
    setFields(next);
    setMessage(null);
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { setStorageWarning(true); }
  };
  // Reads content and cursor after the await, so text typed during the upload isn't lost.
  const insertImage = async (file: File) => {
    if (!file.type.startsWith("image/") || uploading) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImage(await compressImage(file));
      const content = fieldsRef.current.content;
      const at = contentRef.current?.selectionEnd ?? content.length;
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "");
      const markdown = `\n![${alt}](${url})\n`;
      update({ content: content.slice(0, at) + markdown + content.slice(at) });
      requestAnimationFrame(() => {
        const textarea = contentRef.current;
        if (textarea) { textarea.focus(); textarea.selectionStart = textarea.selectionEnd = at + markdown.length; }
      });
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) expireSession();
      else setUploadError(failure instanceof ApiError ? failure.message : "Could not upload the image. Try again.");
    } finally { setUploading(false); }
  };
  const uploadCover = async (file: File) => {
    if (coverUploading) return;
    if (!file.type.startsWith("image/")) { setCoverError("Choose an image file."); return; }
    setCoverUploading(true);
    setCoverError(null);
    try {
      update({ featuredImage: await uploadImage(await compressImage(file)) });
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) expireSession();
      else setCoverError(failure instanceof ApiError ? failure.message : "Could not upload the cover image. Try again.");
    } finally { setCoverUploading(false); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saveLock.current) return;
    if (uploading || coverUploading) { setMessage("Wait for the image to finish uploading."); return; }
    if (!fields.title.trim() || (isArticle && !fields.content.trim()) || !fields.categorySlug || !fields.tagSlugs.length) {
      setMessage("Add a title, category, and at least one tag, plus article content when writing an article.");
      return;
    }
    if (!isArticle && (fields.title.length > 256 || fields.description.length > 512)) {
      setMessage("Topic names can be up to 256 characters and descriptions up to 512 characters.");
      return;
    }
    if (fields.tagSlugs.some((tag) => !tagOptions.includes(tag))) { setMessage("Choose tags from the available options."); return; }
    if (!publicUri && !data.categories.some((category) => category.slugName === fields.categorySlug)) { setMessage("Choose an available category."); return; }
    saveLock.current = true;
    setSaving(true);
    setMessage(null);
    try {
      const title = fields.title.trim();
      const description = fields.description.trim();
      if (publicUri) {
        const tagsChanged = [...fields.tagSlugs].sort().join("\n") !== [...data.fields.tagSlugs].sort().join("\n");
        const descriptionChanged = description !== data.fields.description;
        if (isArticle) {
          const patch: PatchArticleRequest = {};
          if (title !== data.fields.title) patch.title = title;
          if (fields.content !== data.fields.content) patch.content = fields.content;
          if (descriptionChanged) patch.description = description;
          // An empty string tells the API to remove the cover.
          if (fields.featuredImage !== data.fields.featuredImage) patch.featuredImage = fields.featuredImage ?? "";
          if (tagsChanged) patch.tagSlugs = fields.tagSlugs;
          if (fields.isActive !== data.fields.isActive) patch.isActive = fields.isActive;
          if (Object.keys(patch).length) await patchArticle(publicUri, patch);
        } else {
          const patch: PatchTopicRequest = {};
          if (title !== data.fields.title) patch.name = title;
          if (descriptionChanged) patch.description = description;
          if (tagsChanged) patch.tagSlugs = fields.tagSlugs;
          if (Object.keys(patch).length) await patchTopic(publicUri, patch);
        }
      } else if (isArticle) {
        await createArticle({ title, description: description || null, content: fields.content, featuredImage: fields.featuredImage, categorySlug: fields.categorySlug, tagSlugs: fields.tagSlugs, isActive: fields.isActive });
      } else {
        await createTopic({ name: title, description: description || null, categorySlug: fields.categorySlug, tagSlugs: fields.tagSlugs });
      }
      try { sessionStorage.removeItem(storageKey); } catch {}
      router.push(personalHref(resource));
      router.refresh();
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) expireSession();
      else setMessage(personalErrorMessage(failure));
    } finally { saveLock.current = false; setSaving(false); }
  };

  const section = "card space-y-5 p-5";
  const sectionTitle = "text-xs font-semibold uppercase tracking-[0.12em] text-muted";
  return <>
    <Link href={personalHref(resource)} className="inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink"><ArrowLeft className="h-4 w-4" />My {isArticle ? "articles" : "questions"}</Link>
    <header className="mb-6 mt-4">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{publicUri ? "Edit" : isArticle ? "Write an" : "Ask a"} {isArticle ? "article" : "question"}</h1>
      <p className="mt-1 text-sm text-muted">{isArticle ? "Share an experience, a use case, or something you learned." : "Describe the concept you want explained. Others will reply with their explanations."}</p>
    </header>
    {recovered && <p role="status" className="mb-5 rounded-lg bg-highlight-soft px-3.5 py-2.5 text-sm">Recovered your unsaved changes. Review them before saving.</p>}
    <form onSubmit={submit}>
      <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
        <legend className="sr-only">{publicUri ? "Edit" : "Create"} {noun}</legend>
        <section className={section} aria-label="Basics">
          <label className="block text-sm font-semibold">{isArticle ? "Title" : "Question"}<input required maxLength={isArticle ? undefined : 256} value={fields.title} placeholder={isArticle ? "How I finally understood dynamic programming" : "What is Kadane’s algorithm?"} onChange={(event) => update({ title: event.target.value })} className={`${inputClass} text-base font-semibold`} /></label>
          <label className="block text-sm font-semibold">{isArticle ? "Summary" : "Details"} <span className="font-normal text-muted">(optional)</span><textarea rows={3} maxLength={isArticle ? undefined : 512} value={fields.description} placeholder={isArticle ? "One or two sentences shown under the title." : "What do you already know? Where do you get stuck?"} onChange={(event) => update({ description: event.target.value })} className={inputClass} />{!isArticle && <span className="mt-1 block text-right text-xs font-normal text-muted">{fields.description.length}/512</span>}</label>
          {isArticle && <div aria-labelledby="cover-label">
            <p id="cover-label" className="text-sm font-semibold">Cover image <span className="font-normal text-muted">(optional)</span></p>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadCover(file); }} />
            {fields.featuredImage ? <div className="mt-1.5 overflow-hidden rounded-xl border border-line">
              <CoverPreview key={fields.featuredImage} src={fields.featuredImage} busy={coverUploading} />
              <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2">
                <button type="button" disabled={coverUploading} onClick={() => coverInputRef.current?.click()} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium hover:bg-soft disabled:opacity-50"><ImagePlus className="h-3.5 w-3.5" />{coverUploading ? "Uploading…" : "Replace"}</button>
                <button type="button" disabled={coverUploading} onClick={() => update({ featuredImage: null })} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-muted hover:bg-soft hover:text-danger disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />Remove</button>
              </div>
            </div> : coverUploading ? <div className="mt-1.5 overflow-hidden rounded-xl border border-line"><CoverSkeleton label="Uploading cover image" /></div> : <button type="button" onClick={() => coverInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) void uploadCover(file); }}
              className="mt-1.5 flex aspect-[4/1] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-soft/50 text-sm text-muted transition-colors hover:border-accent hover:text-accent">
              <ImagePlus className="h-5 w-5" />Upload or drop a cover image
              <span className="text-xs">Shown at the top of the article and in lists. 1MB max after compression.</span>
            </button>}
            {coverError && <p role="alert" className="mt-1 text-sm text-danger">{coverError}</p>}
          </div>}
        </section>
        {isArticle && <section className="card p-5" aria-label="Content">
          <MarkdownEditor value={fields.content} onChange={(content) => update({ content })} textareaRef={contentRef} onImage={(file) => void insertImage(file)} uploading={uploading} cover={fields.featuredImage} />
          {uploadError && <p role="alert" className="mt-1 text-sm text-danger">{uploadError}</p>}
        </section>}
        <section className={section} aria-label="Publishing">
          <p className={sectionTitle}>Publishing</p>
          <label className="block text-sm font-semibold">Subject<select required disabled={Boolean(publicUri)} value={fields.categorySlug} onChange={(event) => update({ categorySlug: event.target.value })} className={inputClass}>
            <option value="">Choose a subject</option>{data.categories.map((category) => <option key={category.slugName} value={category.slugName}>{category.name}</option>)}
            {publicUri && !data.categories.some((category) => category.slugName === fields.categorySlug) && <option value={fields.categorySlug}>{fields.categorySlug}</option>}
          </select>{publicUri && <span className="mt-1 block text-xs font-normal text-muted">The subject stays the same after creation.</span>}</label>
          <fieldset><legend className="text-sm font-semibold">Tags <span className="font-normal text-muted">(choose at least one)</span></legend>
            <label className="sr-only" htmlFor="tag-search">Find a tag</label><input id="tag-search" type="search" placeholder="Find a tag…" value={tagSearch} onChange={(event) => setTagSearch(event.target.value)} className={inputClass} />
            <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto">{matchingTags.map((tag) => { const on = fields.tagSlugs.includes(tag); return <label key={tag} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent ${on ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:border-accent/50 hover:text-ink"}`}><input type="checkbox" className="sr-only" checked={on} onChange={(event) => update({ tagSlugs: event.target.checked ? [...fields.tagSlugs, tag] : fields.tagSlugs.filter((value) => value !== tag) })} />{on && <Check className="h-3 w-3" aria-hidden="true" />}#{tag}</label>; })}</div>
            {!matchingTags.length && <p className="mt-3 text-sm text-muted">{tagOptions.length ? "No tags match your search." : "No tags are available yet. A tag is required before you can save."}</p>}
          </fieldset>
          {isArticle ? <fieldset><legend className="text-sm font-semibold">Visibility</legend>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              {([[true, "Public", Eye, `Anyone can read this ${noun}.`], [false, "Draft", EyeOff, "Only you can see it, in My content."]] as const).map(([active, label, Icon, hint]) =>
                <label key={label} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors ${fields.isActive === active ? "border-accent bg-accent-soft" : "border-line hover:border-accent/50"}`}>
                  <input type="radio" name="visibility" checked={fields.isActive === active} onChange={() => update({ isActive: active })} className="mt-1 accent-(--accent)" />
                  <span><span className="inline-flex items-center gap-1.5 font-semibold"><Icon className="h-3.5 w-3.5" />{label}</span><span className="block text-xs text-muted">{hint}</span></span>
                </label>)}
            </div>
          </fieldset> : <div className="rounded-xl bg-soft px-4 py-3 text-sm leading-6 text-muted">{data.fields.isActive ? "This question has been approved and is public." : "Questions are saved as drafts, visible only to you in My content. An administrator publishes them after review."}</div>}
        </section>
      </fieldset>
      {storageWarning && <p role="status" className="mt-4 text-sm text-muted">This browser cannot keep a recovery copy. Copy your writing before leaving to sign in.</p>}
      {message && <p role="alert" className="mt-5 rounded-lg border border-danger/30 px-3.5 py-2.5 text-sm text-danger">{message}</p>}
      <div className="sticky bottom-3 z-10 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3 shadow-card sm:px-5">
        <Link href={personalHref(resource)} onClick={(event) => { if (saving) event.preventDefault(); }} className="text-sm text-muted no-underline hover:text-ink">Cancel</Link>
        <button type="submit" disabled={saving || !tagOptions.length || (!publicUri && !data.categories.length)} className="h-9 rounded-lg bg-button px-4 text-sm font-semibold text-button-text hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : !isArticle ? (publicUri ? "Save changes" : "Submit question") : fields.isActive ? (publicUri && data.fields.isActive ? "Save changes" : "Publish article") : "Save draft"}</button>
      </div>
    </form>
  </>;
}
