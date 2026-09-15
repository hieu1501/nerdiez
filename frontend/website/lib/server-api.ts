import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { ApiError, type CategoryPublicDetailDTO, type PublicPostBriefDTO, type PublicPostDetailDTO, type PublicTalkDTO, type SliceResponse, type TopicPublicDetailDTO } from "./api";
import { publicIdentifier } from "./resource-links";

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

async function fetchFromServer(path: string, personalized = false): Promise<Response> {
  const cookieHeader = personalized ? (await cookies()).toString() : "";
  const request = (cookie?: string) => fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json", ...(cookie ? { cookie } : {}) },
  });
  let res = await request(cookieHeader);
  if (res.status === 401 && cookieHeader) res = await request();
  return res;
}

async function readJson<T>(path: string, personalized = false): Promise<T> {
  const res = await fetchFromServer(path, personalized);
  if (!res.ok) throw new ApiError(path, res.status);
  return (await res.json()) as T;
}

export const getCategories = cache((): Promise<CategoryPublicDetailDTO[]> => readJson("/api/categories"));

export function getArticleSlice(categorySlug: string, page: number, size: number): Promise<SliceResponse<PublicPostBriefDTO>> {
  return readJson(`/api/categories/${encodeURIComponent(categorySlug)}/articles?page=${page}&size=${size}`);
}

export const getArticleDetail = cache(async (publicUri: string): Promise<PublicPostDetailDTO | null> => {
  const path = `/api/articles/${encodeURIComponent(publicUri)}`;
  const res = await fetchFromServer(path, true);
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(path, res.status);
  return (await res.json()) as PublicPostDetailDTO;
});

export const getTopicSlice = cache((categorySlug: string, page: number, size: number): Promise<SliceResponse<TopicPublicDetailDTO>> =>
  readJson(`/api/categories/${encodeURIComponent(categorySlug)}/topics?page=${page}&size=${size}`, true)
);

export const getTopicDetail = cache(async (publicUri: string): Promise<TopicPublicDetailDTO | null> => {
  const categories = await getCategories();
  for (const category of categories) {
    for (let page = 0; ; page++) {
      const slice = await getTopicSlice(category.slugName, page, 100);
      const topic = slice.items.find((item) => publicIdentifier(item.canonicalUri, "topics") === publicUri);
      if (topic) return topic;
      if (!slice.hasNext) break;
    }
  }
  return null;
});

export function getTalkSlice(topicPublicUri: string, page: number, size: number): Promise<SliceResponse<PublicTalkDTO>> {
  return readJson(`/api/topics/${encodeURIComponent(topicPublicUri)}/talks?page=${page}&size=${size}`, true);
}

export const resolveLegacyArticle = cache(async (categorySlug: string, slugName: string): Promise<string | null> => {
  let match: string | null = null;
  for (let page = 0; ; page++) {
    const slice = await getArticleSlice(categorySlug, page, 30);
    for (const article of slice.items) {
      if (article.content.slugName !== slugName) continue;
      const identifier = publicIdentifier(article.content.canonicalUri, "articles");
      if (match && match !== identifier) return null;
      match = identifier;
    }
    if (!slice.hasNext) return match;
  }
});
