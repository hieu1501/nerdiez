import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import type {
  CategoryPublicDetailDTO,
  PublicPostBriefDTO,
  PublicPostDetailDTO,
  SliceResponse,
} from "./api";

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

export const getCategories = cache(async (): Promise<CategoryPublicDetailDTO[]> => {
  try {
    const res = await fetch(`${baseUrl}/api/categories/all`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as CategoryPublicDetailDTO[];
  } catch {
    return [];
  }
});

async function fetchFromServer(path: string, cookieHeader?: string): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

export async function getArticleSlice(
  categorySlug: string,
  page: number,
  size: number
): Promise<SliceResponse<PublicPostBriefDTO>> {
  const path = `/api/articles/${encodeURIComponent(categorySlug)}?page=${page}&size=${size}`;
  const res = await fetchFromServer(path);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  return (await res.json()) as SliceResponse<PublicPostBriefDTO>;
}

export async function getArticleDetail(
  categorySlug: string,
  slugName: string
): Promise<PublicPostDetailDTO | null> {
  const path = `/api/articles/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slugName)}`;
  const cookieHeader = (await cookies()).toString();
  let res = await fetchFromServer(path, cookieHeader);
  if (res.status === 401 && cookieHeader) {
    res = await fetchFromServer(path);
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  return (await res.json()) as PublicPostDetailDTO;
}
