export interface CategoryPublicRefDTO {
  name: string;
  slugName: string;
}

export interface CategoryPublicDetailDTO extends CategoryPublicRefDTO {
  description: string | null;
}

export interface TopicPublicRefDTO {
  name: string;
  slugName: string;
}

export interface TopicPublicDetailDTO extends TopicPublicRefDTO {
  description: string | null;
  category: CategoryPublicRefDTO;
}

export interface UserRefDTO {
  username: string;
}

export interface UserProfileResponseDTO {
  username: string;
  displayName: string;
}

export interface PostVoteStatsDTO {
  upvoteCount: number;
  downvoteCount: number;
  version: number;
}

export type VoteValue = -1 | 0 | 1;

export interface PublicPostBriefContentDTO {
  slugName: string;
  title: string;
  author: UserRefDTO;
  category: CategoryPublicRefDTO;
  topics: TopicPublicRefDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicPostBriefDTO {
  content: PublicPostBriefContentDTO;
  voteStats: PostVoteStatsDTO;
}

export interface PublicPostDetailContentDTO {
  slugName: string;
  title: string;
  content: string;
  author: UserRefDTO;
  category: CategoryPublicRefDTO;
  createdAt: string;
  updatedAt: string;
  topics: TopicPublicRefDTO[];
  featuredImage: string | null;
  description: string | null;
}

export interface PublicPostDetailDTO {
  content: PublicPostDetailContentDTO;
  voteStats: PostVoteStatsDTO;
  userVote: VoteValue | null;
}

export interface PostVoteResponseDTO {
  categorySlug: string;
  postSlugName: string;
  userVote: VoteValue;
  votes: PostVoteStatsDTO;
}

export interface SliceResponse<T> {
  items: T[];
  size: number;
  offset: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const RESOURCES = {
  articles: "/api/articles",
  categories: "/api/categories",
  topics: "/api/topics",
  profile: "/api/profile",
  auth: "/api/auth",
} as const;

let refreshPromise: Promise<boolean> | null = null;

export class ApiError extends Error {
  constructor(
    public readonly path: string,
    public readonly status: number
  ) {
    super(`Request to ${path} failed with status ${status}`);
    this.name = "ApiError";
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${RESOURCES.auth}/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const fetchWithAuth = (init: RequestInit) =>
    fetch(path, { ...init, credentials: "include" });

  let res = await fetchWithAuth(options);
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetchWithAuth(options);
    }
  }
  if (!res.ok) {
    throw new ApiError(path, res.status);
  }
  return (await res.json()) as T;
}

export function fetchArticleDetail(
  categorySlug: string,
  slugName: string
): Promise<PublicPostDetailDTO> {
  return requestJson<PublicPostDetailDTO>(
    `${RESOURCES.articles}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slugName)}`
  );
}

export function setArticleVote(
  categorySlug: string,
  slugName: string,
  vote: VoteValue
): Promise<PostVoteResponseDTO> {
  return requestJson<PostVoteResponseDTO>(
    `${RESOURCES.articles}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slugName)}/vote`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote }),
    }
  );
}

export async function fetchAllCategories(): Promise<CategoryPublicDetailDTO[]> {
  try {
    return await requestJson<CategoryPublicDetailDTO[]>(`${RESOURCES.categories}/all`);
  } catch {
    return [];
  }
}

export async function fetchAllTopics(): Promise<TopicPublicDetailDTO[]> {
  try {
    return await requestJson<TopicPublicDetailDTO[]>(`${RESOURCES.topics}/all`);
  } catch {
    return [];
  }
}

export async function fetchProfile(): Promise<UserProfileResponseDTO | null> {
  try {
    return await requestJson<UserProfileResponseDTO>(`${RESOURCES.profile}/me`);
  } catch {
    return null;
  }
}
