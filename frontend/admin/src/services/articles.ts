import { api } from "./api";

import { pageQuery, type UserRefDTO, type CategoryAdminRefDTO, type TagAdminRefDTO, type VoteStatsDTO, type PageResponse, type PageQuery } from "./content-types";
export type { UserRefDTO, CategoryAdminRefDTO, PageResponse } from "./content-types";

export interface AdminPostBriefContentDTO {
  id: number;
  slugName: string;
  title: string;
  author: UserRefDTO;
  category: CategoryAdminRefDTO;
  tags: TagAdminRefDTO[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  canonicalUri: string;
}

export interface AdminPostBriefDTO {
  content: AdminPostBriefContentDTO;
  voteStats: VoteStatsDTO;
}

export interface AdminPostDetailContentDTO {
  id: number;
  slug: string;
  title: string;
  content: string;
  author: UserRefDTO;
  category: CategoryAdminRefDTO;
  createdAt: string;
  updatedAt: string;
  tags: TagAdminRefDTO[];
  featuredImage: string | null;
  description: string | null;
  isActive: boolean;
  canonicalUri: string;
}

export interface AdminPostDetailDTO {
  content: AdminPostDetailContentDTO;
  voteStats: VoteStatsDTO;
}

export type ArticlePage = PageResponse<AdminPostBriefDTO>;

export type ArticleQuery = PageQuery;

export interface CreatePostRequestDTO {
  title: string;
  content: string;
  description?: string | null;
  featuredImage?: string | null;
  categoryId: number;
  tagIds: number[];
  isActive?: boolean | null;
}

export interface PatchPostRequestDTO {
  title?: string;
  content?: string;
  featuredImage?: string | null;
  description?: string | null;
  tagIds?: number[] | null;
  isActive?: boolean | null;
}

export const articlesService = {
  getAll: (params?: ArticleQuery) =>
    api.get<ArticlePage>(`/articles${pageQuery(params)}`, true),

  getById: (id: number) => api.get<AdminPostDetailDTO>(`/articles/${id}`, true),

  create: (data: CreatePostRequestDTO) =>
    api.post<AdminPostDetailDTO>("/articles", data, true),

  patch: (id: number, data: PatchPostRequestDTO) =>
    api.patch<AdminPostDetailDTO>(`/articles/${id}`, data, true),

  delete: (id: number) => api.delete<void>(`/articles/${id}`, true),
};
