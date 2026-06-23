import { api } from "./api";

export interface Article {
  id: number;
  title: string;
  author: string;
  category: string;
  status: string;
  content?: string;
}

export interface ArticlePayload {
  title: string;
  author: string;
  category: string;
  content?: string;
}

export const articlesService = {
  getAll: () => api.get<Article[]>("/admin/articles"),

  getById: (id: number) => api.get<Article>(`/articles/${id}`),

  create: (data: ArticlePayload) => api.post<Article>("/articles", data),

  update: (id: number, data: Partial<ArticlePayload>) =>
    api.patch<Article>(`/articles/${id}`, data),

  delete: (id: number) => api.delete<void>(`/articles/${id}`),
};
