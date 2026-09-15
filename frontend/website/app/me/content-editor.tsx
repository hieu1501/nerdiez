"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ApiError, fetchAllCategories, type CategoryPublicDetailDTO, type TagPublicRefDTO } from "@/lib/api";
import { createArticle, createTopic, fetchPersonalArticle, fetchPersonalTopic, fetchTags, patchArticle, patchTopic, personalHref, type PatchArticleRequest, type PatchTopicRequest } from "@/lib/personal-api";
import { type CategoryView } from "@/lib/resource-links";
import { editorStorageKey } from "@/lib/auth-storage";
import { useAuth } from "@/app/auth-provider";
import { ListLoading } from "@/app/components/content-ui";
import { PersonalFailure, personalErrorMessage } from "./personal-feedback";

interface Fields { title: string; description: string; content: string; categorySlug: string; tagSlugs: string[] }
interface EditorData { fields: Fields; categories: CategoryPublicDetailDTO[]; tags: TagPublicRefDTO[]; featuredImage: string | null; isActive: boolean }
const emptyFields: Fields = { title: "", description: "", content: "", categorySlug: "", tagSlugs: [] };

function restoreFields(key: string, original: Fields): Fields | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (!value || typeof value !== "object") return null;
    const fields = value as Record<string, unknown>;
    if (!["title", "description", "content", "categorySlug"].every((field) => typeof fields[field] === "string") || !Array.isArray(fields.tagSlugs) || !fields.tagSlugs.every((tag) => typeof tag === "string")) return null;
    return { ...original, ...fields } as Fields;
  } catch { return null; }
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
      if (publicUri && !detail) throw new ApiError(`/api/me/${resource}/${publicUri}`, 404);
      let fields = { ...emptyFields, categorySlug: categories.some((category) => category.slugName === initialCategorySlug) ? initialCategorySlug ?? "" : "", tagSlugs: [] as string[] };
      let featuredImage: string | null = null;
      let isActive = false;
      if (detail) {
        if ("content" in detail) {
          fields = { title: detail.content.title, description: detail.content.description ?? "", content: detail.content.content, categorySlug: detail.content.category.slugName, tagSlugs: detail.content.tags.map((tag) => tag.slugName) };
          featuredImage = detail.content.featuredImage;
          isActive = detail.content.isActive;
        } else {
          fields = { title: detail.name, description: detail.description ?? "", content: "", categorySlug: detail.category.slugName, tagSlugs: detail.tags.map((tag) => tag.slugName) };
          isActive = detail.isActive;
        }
      }
      if (!cancelled) setData({ fields, featuredImage, categories, tags, isActive });
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
  const [preview, setPreview] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const saveLock = useRef(false);
  const isArticle = resource === "articles";
  const noun = isArticle ? "article" : "topic";
  const inputClass = "mt-1.5 block w-full rounded-md border border-line bg-paper px-3 py-2 text-sm leading-6 text-ink focus:border-ink disabled:bg-soft disabled:text-muted";
  const tagOptions = [...new Set([...data.tags.map((tag) => tag.slugName), ...data.fields.tagSlugs])].sort();
  const matchingTags = tagOptions.filter((tag) => tag.toLowerCase().includes(tagSearch.toLowerCase()));

  const update = (changes: Partial<Fields>) => {
    const next = { ...fields, ...changes };
    setFields(next);
    setMessage(null);
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { setStorageWarning(true); }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saveLock.current) return;
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
        if (isArticle) {
          const patch: PatchArticleRequest = {};
          if (title !== data.fields.title) patch.title = title;
          if (fields.content !== data.fields.content) patch.content = fields.content;
          if (description !== data.fields.description) patch.description = description;
          if (tagsChanged) patch.tagSlugs = fields.tagSlugs;
          if (Object.keys(patch).length) await patchArticle(publicUri, patch);
        } else {
          const patch: PatchTopicRequest = {};
          if (title !== data.fields.title) patch.name = title;
          if (description !== data.fields.description) patch.description = description;
          if (tagsChanged) patch.tagSlugs = fields.tagSlugs;
          if (Object.keys(patch).length) await patchTopic(publicUri, patch);
        }
      } else if (isArticle) {
        await createArticle({ title, description: description || null, content: fields.content, categorySlug: fields.categorySlug, tagSlugs: fields.tagSlugs, isActive: true });
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

  return <>
    <Link href={personalHref(resource)} className="inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink"><ArrowLeft className="h-4 w-4" />My {resource}</Link>
    <header className="mb-6 mt-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Workbench</p><h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">{publicUri ? "Edit" : "New"} {noun}</h1></header>
    {recovered && <p role="status" className="mb-6 rounded-lg border border-line bg-soft p-3 text-sm">Recovered your unsaved changes. Review them before saving.</p>}
    <form onSubmit={submit}>
      <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
        <legend className="sr-only">{publicUri ? "Edit" : "Create"} {noun}</legend>
        <label className="block text-sm font-bold">{isArticle ? "Title" : "Topic name"}<input required maxLength={isArticle ? undefined : 256} value={fields.title} onChange={(event) => update({ title: event.target.value })} className={inputClass} /></label>
        <label className="block text-sm font-bold">{isArticle ? "Summary (optional)" : "Description (optional)"}<textarea rows={3} maxLength={isArticle ? undefined : 512} value={fields.description} onChange={(event) => update({ description: event.target.value })} className={inputClass} />{!isArticle && <span className="mt-1 block text-right text-xs font-normal text-muted">{fields.description.length}/512</span>}</label>
        {isArticle && <section aria-labelledby="content-label">
          <div className="flex items-center justify-between gap-4"><label id="content-label" htmlFor="article-content" className="text-sm font-bold">Article content</label><button type="button" aria-pressed={preview} onClick={() => setPreview((value) => !value)} className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs">{preview ? <Pencil className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}{preview ? "Write" : "Preview"}</button></div>
          <textarea id="article-content" required={!preview} rows={16} value={fields.content} onChange={(event) => update({ content: event.target.value })} className={`${inputClass} font-mono ${preview ? "hidden" : ""}`} />
          {preview && <div className="reader-content mt-2 min-h-64 rounded-lg border border-line p-5">{fields.content.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{fields.content}</ReactMarkdown> : <p className="text-muted">No content yet.</p>}</div>}
        </section>}
        <label className="block text-sm font-bold">Category<select required disabled={Boolean(publicUri)} value={fields.categorySlug} onChange={(event) => update({ categorySlug: event.target.value })} className={inputClass}>
          <option value="">Choose a category</option>{data.categories.map((category) => <option key={category.slugName} value={category.slugName}>{category.name}</option>)}
          {publicUri && !data.categories.some((category) => category.slugName === fields.categorySlug) && <option value={fields.categorySlug}>{fields.categorySlug}</option>}
        </select>{publicUri && <span className="mt-1 block text-xs font-normal text-muted">The category stays the same after creation.</span>}</label>
        <fieldset><legend className="text-sm font-bold">Tags <span className="font-normal text-muted">(choose at least one)</span></legend>
          <label className="sr-only" htmlFor="tag-search">Find a tag</label><input id="tag-search" type="search" placeholder="Find a tag…" value={tagSearch} onChange={(event) => setTagSearch(event.target.value)} className={inputClass} />
          <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto">{matchingTags.map((tag) => <label key={tag} className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs ${fields.tagSlugs.includes(tag) ? "border-ink bg-soft" : "border-line text-muted"}`}><input type="checkbox" checked={fields.tagSlugs.includes(tag)} onChange={(event) => update({ tagSlugs: event.target.checked ? [...fields.tagSlugs, tag] : fields.tagSlugs.filter((value) => value !== tag) })} />{tag}</label>)}</div>
          {!matchingTags.length && <p className="mt-3 text-sm text-muted">{tagOptions.length ? "No tags match your search." : "No tags are available yet. A tag is required before you can save."}</p>}
        </fieldset>
        {data.featuredImage && <p className="text-xs text-muted">This article’s existing featured image will be kept.</p>}
        <div className="rounded-lg border border-line bg-soft/40 px-4 py-3 text-sm leading-7 text-muted">{publicUri ? `This ${noun} is currently ${data.isActive ? "public" : "not public"}. Saving keeps its current visibility.` : isArticle ? "Your article will be public when you publish it." : "Your topic will be saved to My content. It becomes public when an administrator activates it."}</div>
      </fieldset>
      {storageWarning && <p role="status" className="mt-4 text-sm text-muted">This browser cannot keep a recovery copy. Copy your writing before leaving to sign in.</p>}
      {message && <p role="alert" className="mt-5 text-sm text-downvote">{message}</p>}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <Link href={personalHref(resource)} onClick={(event) => { if (saving) event.preventDefault(); }} className="text-sm text-muted underline underline-offset-4">Back to My content</Link>
        <button type="submit" disabled={saving || !tagOptions.length || (!publicUri && !data.categories.length)} className="rounded-md bg-button px-4 py-2 text-xs font-bold text-button-text disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : publicUri ? "Save changes" : isArticle ? "Publish article" : "Save topic"}</button>
      </div>
    </form>
  </>;
}
