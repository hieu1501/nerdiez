import { api } from "./api";
import type { TagAdminRefDTO } from "./content-types";
export interface TagAdminDetailDTO extends TagAdminRefDTO {
  postUseCount: number;
  topicUseCount: number;
  isActive: boolean;
}
export type Tag = TagAdminDetailDTO;
export interface CreateTagRequestDTO { name: string; isActive: boolean; }
export type UpdateTagRequestDTO = Partial<CreateTagRequestDTO>;
export const tagsService = {
  getAll: () => api.get<Tag[]>("/tags/all", true),
  create: (data: CreateTagRequestDTO) => api.post<Tag>("/tags", data, true),
  update: (id: number, data: UpdateTagRequestDTO) => api.patch<Tag>(`/tags/${id}`, data, true),
  delete: (id: number) => api.delete<void>(`/tags/${id}`, true),
};
