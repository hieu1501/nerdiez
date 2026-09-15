export type CategoryView = "articles" | "topics";
export const PAGE_SIZE = 10;

// Canonical URIs belong to the backend. Only their resource identifier is used
// to build same-origin frontend links and requests to the configured backend.
export function publicIdentifier(canonicalUri: string, resource: "articles" | "topics" | "talks", audience: "public" | "personal" = "public"): string {
  const url = new URL(canonicalUri, "http://canonical.local");
  const prefix = `/api/${audience === "personal" ? "me/" : ""}${resource}/`;
  if (!url.pathname.startsWith(prefix) || url.search || url.hash) {
    throw new Error(`Invalid ${resource} canonical URI`);
  }
  const identifier = decodeURIComponent(url.pathname.slice(prefix.length));
  if (!identifier || /[/\\?#]/.test(identifier) || identifier === "." || identifier === "..") {
    throw new Error(`Invalid ${resource} public identifier`);
  }
  return identifier;
}

export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return 1;
  const page = Number(raw);
  // Spring's page and offset calculations use signed 32-bit page numbers.
  return Number.isSafeInteger(page) && page > 0 && page <= 2147483647 ? page : 1;
}

export function categoryHref(categorySlug: string, view: CategoryView = "articles", page = 1): string {
  const query = new URLSearchParams();
  if (view === "topics") query.set("view", view);
  if (page > 1) query.set("page", String(page));
  return `/categories/${encodeURIComponent(categorySlug)}${query.size ? `?${query}` : ""}`;
}

export function newContentHref(view: CategoryView, categorySlug: string): string {
  return `/me/${view}/new?category=${encodeURIComponent(categorySlug)}`;
}

export function parseCategorySelection(value: string | string[] | undefined): string | undefined {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected?.trim() || undefined;
}

export function articleHref(categorySlug: string, publicUri: string): string {
  return `/articles/${encodeURIComponent(categorySlug)}/${encodeURIComponent(publicUri)}`;
}

export type TalkView = "all" | "mine";

export function topicHref(publicUri: string, page = 1, view: TalkView = "all"): string {
  const query = new URLSearchParams();
  if (view === "mine") query.set("view", view);
  if (page > 1) query.set("page", String(page));
  return `/topics/${encodeURIComponent(publicUri)}${query.size ? `?${query}` : ""}`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
