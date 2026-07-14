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
  getAll: () => api.get<Quiz[]>("/quizzes", false),

  getById: (id: number) => api.get<Quiz>(`/quizzes/${id}`, false),

  create: (data: QuizPayload) => api.post<Quiz>("/quizzes", data, true),

  update: (id: number, data: Partial<QuizPayload>) =>
    api.patch<Quiz>(`/quizzes/${id}`, data, true),

  delete: (id: number) => api.delete<void>(`/quizzes/${id}`, true),
};
