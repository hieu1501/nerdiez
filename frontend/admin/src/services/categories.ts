import { api } from "./api";

export interface Category {
  categoryId: number;
  name: string;
  description?: string;
}

export const categoriesService = {
  getAll: () => api.get<Category[]>("/categories/all", false),
  getById: (categoryId: number) => api.get<Category>(`/categories/${categoryId}`, false),
  create: (data: { name: string; description?: string }) =>
    api.post<Category>("/categories", data, true),
  update: (categoryId: number, data: { name?: string; description?: string }) =>
    api.put<Category>(`/categories/${categoryId}`, data, true),
  delete: (categoryId: number) => api.delete<void>(`/categories/${categoryId}`, true),
};
