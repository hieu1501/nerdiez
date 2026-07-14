"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { api } from "@/services/api";

interface User {
  email: string;
  username?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsUsername: boolean;
  signOut: () => Promise<void>;
  setUsername: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("auth_user");
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

function storeUser(user: User | null) {
  if (user) {
    localStorage.setItem("auth_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("auth_user");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;
  const needsUsername = user !== null && !user.username;

  const checkAuth = useCallback(async () => {
    const stored = loadStoredUser();
    try {
      const user = await api.get<User>("/profile/me", false);
      storeUser(user);
      setUser(user);
    } catch {
      storeUser(null);
      setUser(null);
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/signin")
      ) {
        window.location.href = "/signin";
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signOut = async () => {
    try {
      await api.post("/auth/logout", {}, false);
    } catch {
      // ignore
    }
    setUser(null);
    storeUser(null);
  };

  const setUsername = async (newUsername: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updated = await api.post<User>("/auth/username", {
        username: newUsername,
      }, false);
      const merged = { ...user, ...updated, username: newUsername };
      setUser(merged);
      storeUser(merged);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        needsUsername,
        signOut,
        setUsername,
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
