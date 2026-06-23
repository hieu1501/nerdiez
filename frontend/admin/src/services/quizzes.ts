import { api } from "./api";

export interface Quiz {
  id: number;
  title: string;
  questions: number;
  timeLimit: string;
  status: string;
}

export interface QuizPayload {
  title: string;
  timeLimit: string;
}

export const quizzesService = {
  getAll: () => api.get<Quiz[]>("/quizzes"),

  getById: (id: number) => api.get<Quiz>(`/quizzes/${id}`),

  create: (data: QuizPayload) => api.post<Quiz>("/quizzes", data),

  update: (id: number, data: Partial<QuizPayload>) =>
    api.patch<Quiz>(`/quizzes/${id}`, data),

  delete: (id: number) => api.delete<void>(`/quizzes/${id}`),
};
