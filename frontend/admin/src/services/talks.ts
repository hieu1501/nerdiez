import { api } from "./api";
import { pageQuery, type PageQuery, type PageResponse, type UserRefDTO, type VoteStatsDTO } from "./content-types";
import type { TopicAdminRefDTO } from "./topics";
export interface AdminTalkContentDTO {
  id: number;
  slug: string;
  title: string;
  content: string;
  author: UserRefDTO;
  topic: TopicAdminRefDTO;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  canonicalUri: string;
}
export interface AdminTalkDTO { content: AdminTalkContentDTO; voteStats: VoteStatsDTO; }
export interface CreateTalkRequestDTO {
  title: string;
  content: string;
  topicId: number;
  isActive: boolean;
}
export type PatchTalkRequestDTO = Partial<Omit<CreateTalkRequestDTO, "topicId">>;
const talkPath = "/talks";
export const talksService = {
  getForTopic: (topicId: number, params?: PageQuery) =>
    api.get<PageResponse<AdminTalkDTO>>(`/topic/${topicId}/talks${pageQuery(params)}`, true),
  create: (data: CreateTalkRequestDTO) => api.post<AdminTalkDTO>(talkPath, data, true),
  update: (id: number, data: PatchTalkRequestDTO) => api.patch<AdminTalkDTO>(`${talkPath}/${id}`, data, true),
  delete: (id: number) => api.delete<void>(`${talkPath}/${id}`, true),
};
