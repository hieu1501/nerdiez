import { api, ApiError } from "./api";
import { pageQuery, type PageQuery, type PageResponse, type UserRefDTO, type CategoryAdminRefDTO, type TagAdminRefDTO } from "./content-types";
export interface TopicAdminRefDTO {
  topicId: number;
  name: string;
  slugName: string;
  category: CategoryAdminRefDTO;
}
export interface TopicAdminDetailDTO extends TopicAdminRefDTO {
  description: string | null;
  author: UserRefDTO;
  tags: TagAdminRefDTO[];
  isActive: boolean;
  canonicalUri: string;
}
export type Topic = TopicAdminDetailDTO;
export interface CreateTopicRequestDTO {
  name: string;
  description: string;
  categoryId: number;
  tagIds: number[];
  isActive: boolean;
}
export type PatchTopicRequestDTO = Omit<CreateTopicRequestDTO, "categoryId">;
export const topicsService = {
  getAll: (params?: PageQuery) => api.get<PageResponse<Topic>>(`/topics${pageQuery(params)}`, true),
  // Full topic data is currently available only through the admin listing.
  // Public APIs cannot substitute here: inactive topics must remain accessible.
  getById: async (id: number, signal?: AbortSignal): Promise<Topic> => {
    if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError("Topic not found.", 404, `/admin/api/topics/${id}`);
    let page = 0;
    while (!signal?.aborted) {
      const result = await topicsService.getAll({ page, size: 100, sort: "slug,asc" });
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const topic = result.items.find((item) => item.topicId === id);
      if (topic) return topic;
      if (!result.hasNext || result.items.length === 0) break;
      page += 1;
    }
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    throw new ApiError("Topic not found.", 404, `/admin/api/topics/${id}`);
  },
  create: (data: CreateTopicRequestDTO) => api.post<Topic>("/topics", data, true),
  update: (id: number, data: PatchTopicRequestDTO) => api.patch<Topic>(`/topics/${id}`, data, true),
  delete: (id: number) => api.delete<void>(`/topics/${id}`, true),
};
