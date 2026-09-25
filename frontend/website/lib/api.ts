import { api, ApiError } from "./api-client";

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
  avatarUrl: string | null;
}

export interface VoteStatsDTO {
  upvoteCount: number;
  downvoteCount: number;
  version: number;
}

export type VoteValue = -1 | 0 | 1;
export type VotableResource = "articles" | "talks";

// Feed card data; the author is only in the detail DTO.
export interface PublicPostBriefContentDTO {
  slugName: string;
  title: string;
  description: string | null;
  featuredImage: string | null;
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
  author: UserRefDTO;
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

export { ApiError } from "./api-client";

export function fetchArticleDetail(publicUri: string): Promise<PublicPostDetailDTO> {
  return api.get(`/articles/${encodeURIComponent(publicUri)}`, false, { publicRead: true });
}

export function fetchTalkSlice(topicPublicUri: string, page: number, size: number): Promise<SliceResponse<PublicTalkDTO>> {
  return api.get(`/topics/${encodeURIComponent(topicPublicUri)}/talks?page=${page}&size=${size}`, false, { publicRead: true });
}

export function setResourceVote(resource: VotableResource, publicUri: string, vote: VoteValue): Promise<VoteResponseDTO> {
  return api.put(`/${resource}/${encodeURIComponent(publicUri)}/vote`, { vote }, false);
}

export function fetchAllCategories(): Promise<CategoryPublicDetailDTO[]> {
  return api.get("/categories", false, { publicRead: true });
}

export function fetchTopicSlice(categorySlug: string, page: number, size: number): Promise<SliceResponse<TopicPublicDetailDTO>> {
  return api.get(`/categories/${encodeURIComponent(categorySlug)}/topics?page=${page}&size=${size}`, false, { publicRead: true });
}

export async function fetchProfile(): Promise<UserProfileResponseDTO | null> {
  try {
    return await api.get<UserProfileResponseDTO>("/profile/me", false);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
