import { api } from "./api";

export interface Topic {
  topicId: number;
  name: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
}

export const topicsService = {
  getAll: () => api.get<Topic[]>("/topics/all", false),
  getById: (topicId: number) => api.get<Topic>(`/topics/${topicId}`, false),
  create: (data: { name: string; description?: string; categoryId: number }) =>
    api.post<Topic>("/topics", data, true),
  update: (topicId: number, data: { name?: string; description?: string; categoryId?: number }) =>
    api.patch<Topic>(`/topics/${topicId}`, data, true),
  delete: (topicId: number) => api.delete<void>(`/topics/${topicId}`, true),
};
