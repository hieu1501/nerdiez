import { api } from "./api";

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
}

export const authService = {
  setUsername: (username: string) =>
    api.post<User>("/auth/username", { username }, false),

  logout: () => api.post("/auth/logout", {}, false),
};
