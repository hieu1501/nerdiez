import { api } from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface UserPayload {
  name: string;
  email: string;
  role: string;
}

export const usersService = {
  getAll: () => api.get<User[]>("/users"),

  getById: (id: number) => api.get<User>(`/users/${id}`),

  create: (data: UserPayload) => api.post<User>("/users", data),

  update: (id: number, data: Partial<UserPayload>) =>
    api.patch<User>(`/users/${id}`, data),

  delete: (id: number) => api.delete<void>(`/users/${id}`),
};
