import { requestJson, type CategoryPublicRefDTO, type TagPublicRefDTO, type TopicPublicRefDTO, type SliceResponse, type VoteStatsDTO } from "./api";
import { publicIdentifier, type CategoryView } from "./resource-links";

export interface PersonalPostBriefContentDTO {
  slugName: string;
  title: string;
  category: CategoryPublicRefDTO;
  tags: TagPublicRefDTO[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  canonicalUri: string;
}
export interface PersonalPostBriefDTO {
  content: PersonalPostBriefContentDTO;
  voteStats: VoteStatsDTO;
}
export interface PersonalPostDetailContentDTO extends Omit<PersonalPostBriefContentDTO, "slugName"> {
  slug: string;
  content: string;
  featuredImage: string | null;
  description: string | null;
}
export interface PersonalPostDetailDTO {
  content: PersonalPostDetailContentDTO;
  voteStats: VoteStatsDTO;
}
export interface TopicPersonalDetailDTO {
  name: string;
  slugName: string;
  description: string | null;
  category: CategoryPublicRefDTO;
  tags: TagPublicRefDTO[];
  isActive: boolean;
  canonicalUri: string;
}

// Public mutation DTOs use the slugs/URIs available in public responses.
export interface CreateArticleRequest {
  title: string;
  content: string;
  description?: string | null;
  featuredImage?: string | null;
  categorySlug: string;
  tagSlugs: string[];
  isActive?: boolean | null;
}
export type PatchArticleRequest = Partial<Pick<CreateArticleRequest,
  "title" | "content" | "description" | "featuredImage" | "tagSlugs" | "isActive"
>>;
export interface CreateTopicRequest {
  name: string;
  description?: string | null;
  categorySlug: string;
  tagSlugs: string[];
}
export type PatchTopicRequest = Partial<CreateTopicRequest>;
export interface CreateTalkRequest {
  content: string;
  topicPublicUri: string;
  isActive?: boolean | null;
}
export type PatchTalkRequest = Partial<Pick<CreateTalkRequest, "content" | "isActive">>;
export interface PersonalTalkContentDTO {
  content: string;
  topic: TopicPublicRefDTO;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  canonicalUri: string;
}
export type AuthoredResource = CategoryView | "talks";

export function fetchPersonalArticles(page: number, size: number): Promise<SliceResponse<PersonalPostBriefDTO>> {
  return requestJson(`/api/me/articles?page=${page}&size=${size}`);
}
export function fetchPersonalArticle(publicUri: string): Promise<PersonalPostDetailDTO> {
  return requestJson(`/api/me/articles/${encodeURIComponent(publicUri)}`);
}
export function fetchPersonalTopics(page: number, size: number): Promise<SliceResponse<TopicPersonalDetailDTO>> {
  return requestJson(`/api/me/topics?page=${page}&size=${size}`);
}
export async function fetchPersonalTopic(publicUri: string): Promise<TopicPersonalDetailDTO | null> {
  for (let page = 0; ; page++) {
    const slice = await fetchPersonalTopics(page, 100);
    const topic = slice.items.find((item) => publicIdentifier(item.canonicalUri, "topics", "personal") === publicUri);
    if (topic) return topic;
    if (!slice.hasNext) return null;
  }
}
export function fetchTags(): Promise<TagPublicRefDTO[]> {
  return requestJson("/api/tags", {}, true);
}
function write<T>(resource: AuthoredResource, body: unknown, publicUri?: string): Promise<T> {
  return requestJson(`/api/${resource}${publicUri ? `/${encodeURIComponent(publicUri)}` : ""}`, {
    method: publicUri ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
export function createArticle(body: CreateArticleRequest): Promise<PersonalPostDetailDTO> { return write("articles", body); }
export function patchArticle(publicUri: string, body: PatchArticleRequest): Promise<PersonalPostDetailDTO> { return write("articles", body, publicUri); }
export function createTopic(body: CreateTopicRequest): Promise<TopicPersonalDetailDTO> { return write("topics", body); }
export function patchTopic(publicUri: string, body: PatchTopicRequest): Promise<TopicPersonalDetailDTO> { return write("topics", body, publicUri); }
export function fetchPersonalTalks(topicPublicUri: string, page: number, size: number): Promise<SliceResponse<PersonalTalkContentDTO>> {
  return requestJson(`/api/me/topics/${encodeURIComponent(topicPublicUri)}/talks?page=${page}&size=${size}`);
}
export function createTalk(body: CreateTalkRequest): Promise<PersonalTalkContentDTO> { return write("talks", body); }
export function patchTalk(publicUri: string, body: PatchTalkRequest): Promise<PersonalTalkContentDTO> { return write("talks", body, publicUri); }
export function deletePersonalContent(resource: AuthoredResource, publicUri: string): Promise<void> {
  return requestJson(`/api/${resource}/${encodeURIComponent(publicUri)}`, { method: "DELETE" });
}

export function personalHref(view: CategoryView, page = 1): string {
  return `/me?view=${view}${page > 1 ? `&page=${page}` : ""}`;
}
