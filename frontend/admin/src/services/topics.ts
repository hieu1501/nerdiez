import { api } from "./api";

export interface TopicAdminDetailDTO {
  topicId: number;
  name: string;
  slugName: string;
  description: string | null;
  isActive: boolean;
  category: {
    categoryId: number;
    name: string;
    slugName: string;
  };
}

export type Topic = TopicAdminDetailDTO;

export interface CreateTopicRequestDTO {
  name: string;
  description?: string | null;
  categoryId: number;
  isActive?: boolean | null;
}

export interface ReplaceTopicRequestDTO {
  name: string;
  description?: string | null;
  categoryId: number;
  isActive?: boolean | null;
}

export const topicsService = {
  getAll: () => api.get<TopicAdminDetailDTO[]>("/topics/all", true),
  create: (data: CreateTopicRequestDTO) =>
    api.post<TopicAdminDetailDTO>("/topics", data, true),
  update: (topicId: number, data: ReplaceTopicRequestDTO) =>
    api.put<TopicAdminDetailDTO>(`/topics/${topicId}`, data, true),
  delete: (topicId: number) => api.delete<void>(`/topics/${topicId}`, true),
};
