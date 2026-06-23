"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { api } from "@/services/api";

interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
}

interface BackendAuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  needsUsername: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  setUsername: (username: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithGithub: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function loadInitialState(): { user: User | null; token: string | null } {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }
  try {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    if (storedToken && storedUser) {
      const user = JSON.parse(storedUser) as User;
      return { user, token: storedToken };
    }
  } catch {
    // ignore
  }
  return { user: null, token: null };
}

function saveAuth(token: string, user: User) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

function makeUser(
  backendData: BackendAuthResponse,
  email?: string
): { token: string; user: User } {
  const token = backendData.accessToken;
  const jwtPayload = parseJwtPayload(token);
  const username = (jwtPayload?.sub as string) || "";
  const user: User = {
    id: "",
    email: email || "",
    username,
  };
  return { token, user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadInitialState().user);
  const [token, setToken] = useState<string | null>(loadInitialState().token);
  const [isLoading, setIsLoading] = useState(false);

  const needsUsername = user !== null && !user.username;

  const handleAuthResponse = (data: BackendAuthResponse, email?: string) => {
    const { token: t, user: u } = makeUser(data, email);
    setToken(t);
    setUser(u);
    saveAuth(t, u);
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.post<BackendAuthResponse>("/auth/login", {
        username: email,
        password,
      });
      handleAuthResponse(data, email);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.post<BackendAuthResponse>("/auth/register", {
        email,
        password,
      });
      handleAuthResponse(data, email);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuth();
  }, []);

  const setUsername = async (newUsername: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const updatedUser = await api.post<User>(
        "/auth/username",
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const merged = { ...user!, ...updatedUser };
      setUser(merged);
      localStorage.setItem("auth_user", JSON.stringify(merged));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setIsLoading(true);
    try {
      const data = await api.post<BackendAuthResponse>("/auth/google", {
        credential,
      });
      const googlePayload = parseJwtPayload(credential);
      const email = (googlePayload?.email as string) || "";
      handleAuthResponse(data, email);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGithub = () => {
    window.location.href = "/api/auth/github";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        needsUsername,
        signIn,
        signUp,
        signOut,
        setUsername,
        loginWithGoogle,
        loginWithGithub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
