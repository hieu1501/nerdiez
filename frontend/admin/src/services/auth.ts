import { api } from "./api";

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export const authService = {
  signIn: (username: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { username, password }),

  signUp: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/signup", { email, password }),

  loginWithGoogle: (credential: string) =>
    api.post<AuthResponse>("/auth/google", { credential }),

  setUsername: (username: string, token: string) =>
    api.post<User>(
      "/auth/username",
      { username },
      { headers: { Authorization: `Bearer ${token}` } }
    ),
};
