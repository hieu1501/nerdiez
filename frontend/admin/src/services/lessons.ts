import { api } from "./api";

export interface Lesson {
  id: number;
  title: string;
  subject: string;
  grade: string;
  status: string;
  content?: string;
}

export interface LessonPayload {
  title: string;
  subject: string;
  grade: string;
  content?: string;
}

export const lessonsService = {
  getAll: () => api.get<Lesson[]>("/lessons", false),

  getById: (id: number) => api.get<Lesson>(`/lessons/${id}`, false),

  create: (data: LessonPayload) => api.post<Lesson>("/lessons", data, true),

  update: (id: number, data: Partial<LessonPayload>) =>
    api.patch<Lesson>(`/lessons/${id}`, data, true),

  delete: (id: number) => api.delete<void>(`/lessons/${id}`, true),
};
