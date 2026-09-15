export interface CategoryPublicRefDTO {
  name: string;
  slugName: string;
}

export interface CategoryPublicDetailDTO extends CategoryPublicRefDTO {
  description: string | null;
}

export interface TagPublicRefDTO {
  slugName: string;
}

export interface TopicPublicRefDTO {
  name: string;
  slugName: string;
  category: CategoryPublicRefDTO;
}

export interface TopicPublicDetailDTO extends TopicPublicRefDTO {
  description: string | null;
  author: UserRefDTO;
  tags: TagPublicRefDTO[];
  canonicalUri: string;
}

export interface UserRefDTO {
  username: string;
}

export interface UserProfileResponseDTO {
  username: string;
  displayName: string;
}

export interface VoteStatsDTO {
  upvoteCount: number;
  downvoteCount: number;
  version: number;
}

export type VoteValue = -1 | 0 | 1;
export type VotableResource = "articles" | "talks";

export interface PublicPostBriefContentDTO {
  slugName: string;
  title: string;
  featuredImage: string | null;
  author: UserRefDTO;
  category: CategoryPublicRefDTO;
  tags: TagPublicRefDTO[];
  createdAt: string;
  updatedAt: string;
  canonicalUri: string;
}

export interface PublicPostBriefDTO {
  content: PublicPostBriefContentDTO;
  voteStats: VoteStatsDTO;
}

export interface PublicPostDetailContentDTO extends PublicPostBriefContentDTO {
  content: string;
  featuredImage: string | null;
  description: string | null;
}

export interface PublicPostDetailDTO {
  content: PublicPostDetailContentDTO;
  voteStats: VoteStatsDTO;
  userVote: VoteValue | null;
}

export interface PublicTalkContentDTO {
  content: string;
  author: UserRefDTO;
  topic: TopicPublicRefDTO;
  createdAt: string;
  updatedAt: string;
  canonicalUri: string;
}

export interface PublicTalkDTO {
  content: PublicTalkContentDTO;
  voteStats: VoteStatsDTO;
  userVote: VoteValue | null;
}

export interface VoteResponseDTO {
  publicUri: string;
  userVote: VoteValue;
  votes: VoteStatsDTO;
}

export interface SliceResponse<T> {
  items: T[];
  size: number;
  offset: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class ApiError extends Error {
  constructor(public readonly path: string, public readonly status: number) {
    super(`Request to ${path} failed with status ${status}`);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function requestJson<T>(path: string, options: RequestInit = {}, publicRead = false): Promise<T> {
  const init = { ...options, cache: "no-store" as const, headers: { Accept: "application/json", ...options.headers } };
  let res = await fetch(path, { ...init, credentials: "include" });
  if (res.status === 401) {
    if (await refreshAccessToken()) {
      res = await fetch(path, { ...init, credentials: "include" });
    }
    if (res.status === 401 && publicRead) {
      res = await fetch(path, { ...init, credentials: "omit" });
    }
  }
  if (!res.ok) throw new ApiError(path, res.status);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function fetchArticleDetail(publicUri: string): Promise<PublicPostDetailDTO> {
  return requestJson(`/api/articles/${encodeURIComponent(publicUri)}`, {}, true);
}

export function fetchTalkSlice(topicPublicUri: string, page: number, size: number): Promise<SliceResponse<PublicTalkDTO>> {
  return requestJson(`/api/topics/${encodeURIComponent(topicPublicUri)}/talks?page=${page}&size=${size}`, {}, true);
}

export function setResourceVote(resource: VotableResource, publicUri: string, vote: VoteValue): Promise<VoteResponseDTO> {
  return requestJson(`/api/${resource}/${encodeURIComponent(publicUri)}/vote`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vote }),
  });
}

export function fetchAllCategories(): Promise<CategoryPublicDetailDTO[]> {
  return requestJson("/api/categories", {}, true);
}

export function fetchTopicSlice(categorySlug: string, page: number, size: number): Promise<SliceResponse<TopicPublicDetailDTO>> {
  return requestJson(`/api/categories/${encodeURIComponent(categorySlug)}/topics?page=${page}&size=${size}`, {}, true);
}

export async function fetchProfile(): Promise<UserProfileResponseDTO | null> {
  try {
    return await requestJson<UserProfileResponseDTO>("/api/profile/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
