import { api } from "./api";

export interface UserRefDTO {
  username: string;
}

export interface CategoryAdminRefDTO {
  categoryId: number;
  name: string;
  slugName: string;
}

export interface TopicAdminRefDTO {
  topicId: number;
  name: string;
  slugName: string;
}

export interface PostVoteStatsDTO {
  upvoteCount: number;
  downvoteCount: number;
}

export interface AdminPostBriefContentDTO {
  id: number;
  slugName: string;
  title: string;
  author: UserRefDTO;
  category: CategoryAdminRefDTO;
  topics: TopicAdminRefDTO[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AdminPostBriefDTO {
  content: AdminPostBriefContentDTO;
  voteStats: PostVoteStatsDTO;
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
  topics: TopicAdminRefDTO[];
  featuredImage: string | null;
  description: string | null;
  isActive: boolean;
}

export interface AdminPostDetailDTO {
  content: AdminPostDetailContentDTO;
  voteStats: PostVoteStatsDTO;
}

export interface PageResponse<T> {
  items: T[];
  size: number;
  offset: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type ArticlePage = PageResponse<AdminPostBriefDTO>;

export interface ArticleQuery {
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreatePostRequestDTO {
  title: string;
  content: string;
  description?: string | null;
  featuredImage?: string | null;
  categoryId: number;
  topicIds?: number[] | null;
  isActive?: boolean | null;
}

export interface PutPostRequestDTO {
  title: string;
  content: string;
  featuredImage?: string | null;
  description?: string | null;
  categoryId: number;
  topicIds?: number[] | null;
  isActive?: boolean | null;
}

export interface PatchPostRequestDTO {
  title?: string;
  content?: string;
  featuredImage?: string | null;
  description?: string | null;
  categoryId?: number;
  topicIds?: number[] | null;
  isActive?: boolean | null;
}

export const articlesService = {
  getAll: (params?: ArticleQuery) => {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.size !== undefined) qs.set("size", String(params.size));
    if (params?.sort) qs.set("sort", params.sort);
    const query = qs.toString();
    return api.get<ArticlePage>(`/articles/all${query ? `?${query}` : ""}`, true);
  },

  getById: (id: number) => api.get<AdminPostDetailDTO>(`/articles/${id}`, true),

  create: (data: CreatePostRequestDTO) =>
    api.post<AdminPostDetailDTO>("/articles", data, true),

  update: (id: number, data: PutPostRequestDTO) =>
    api.put<AdminPostDetailDTO>(`/articles/${id}`, data, true),

  patch: (id: number, data: PatchPostRequestDTO) =>
    api.patch<AdminPostDetailDTO>(`/articles/${id}`, data, true),

  delete: (id: number) => api.delete<void>(`/articles/${id}`, true),
};
