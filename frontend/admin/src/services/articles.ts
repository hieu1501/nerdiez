import { api } from "./api";

export interface Article {
  id: number;
  title: string;
  author: string;
  category: string;
  status: string;
  content?: string;
  topicIds?: number[];
  topics?: { topicId: number; title: string }[];
}

export interface ArticlePayload {
  title: string;
  author?: string;
  category: string;
  status?: string;
  content?: string;
  topicIds?: number[];
}

export const articlesService = {
  getAll: () => api.get<Article[]>("/articles", true),

  getById: (id: number) => api.get<Article>(`/articles/${id}`, false),

  create: (data: ArticlePayload) => api.post<Article>("/articles", data, true),

  update: (id: number, data: Partial<ArticlePayload>) =>
    api.patch<Article>(`/articles/${id}`, data, true),

  delete: (id: number) => api.delete<void>(`/articles/${id}`, true),
};
