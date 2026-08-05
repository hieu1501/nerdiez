import { api } from "./api";

export interface Article {
  id: number;
  title: string;
  content: string;
  authorUsername: string;
  category: { categoryId: number; name: string };
  createdAt: string;
  updatedAt: string;
  topics: { topicId: number; name: string }[];
  featuredImage?: string;
  description?: string;
  upvoteCount: number;
  downvoteCount: number;
  isActive: boolean;
}

export interface ArticlePage {
  items: Article[];
  size: number;
  offset: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ArticleQuery {
  page?: number;
  size?: number;
  sort?: string;
}

export interface ArticlePayload {
  title: string;
  content: string;
  description?: string;
  featuredImage?: string;
  categoryId: number;
  topicIds?: number[];
  isActive: boolean;
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

  getById: (id: number) => api.get<Article>(`/articles/${id}`, true),

  create: (data: ArticlePayload) => api.post<Article>("/articles", data, true),

  update: (id: number, data: Partial<ArticlePayload>) => api.put<Article>(`/articles/${id}`, data, true),

  delete: (id: number) => api.delete<void>(`/articles/${id}`, true),
};
