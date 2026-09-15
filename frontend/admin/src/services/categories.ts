import { api } from "./api";

export interface CategoryAdminDetailDTO {
  categoryId: number;
  name: string;
  slugName: string;
  description: string | null;
  isActive: boolean;
}

export type Category = CategoryAdminDetailDTO;

export interface CreateCategoryRequestDTO {
  name: string;
  description?: string | null;
  isActive?: boolean | null;
}

export interface UpdateCategoryRequestDTO {
  name: string;
  description?: string | null;
  isActive?: boolean | null;
}

export const categoriesService = {
  getAll: () => api.get<CategoryAdminDetailDTO[]>("/categories/all", true),
  create: (data: CreateCategoryRequestDTO) =>
    api.post<CategoryAdminDetailDTO>("/categories", data, true),
  update: (categoryId: number, data: UpdateCategoryRequestDTO) =>
    api.patch<CategoryAdminDetailDTO>(`/categories/${categoryId}`, data, true),
  delete: (categoryId: number) => api.delete<void>(`/categories/${categoryId}`, true),
};
