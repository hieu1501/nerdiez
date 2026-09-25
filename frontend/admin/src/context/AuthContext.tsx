"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { api, ApiError } from "@/services/api";

// Mirrors the backend's UserProfileResponseDTO from /api/profile/me
interface User {
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

// Pages a signed-out visitor must be able to see; /forbidden is reached right after a rejected login.
const PUBLIC_PATHS = ["/signin", "/forbidden"];

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

  useEffect(() => {
    let isActive = true;
    const stored = loadStoredUser();
    void api
      .get<User>("/profile/me", false)
      .then((authenticatedUser) => {
        if (!isActive) return;
        storeUser(authenticatedUser);
        setUser(authenticatedUser);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        if (error instanceof ApiError && error.status === 401) {
          storeUser(null);
          setUser(null);
          if (
            typeof window !== "undefined" &&
            !PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path))
          ) {
            window.location.href = "/signin";
          }
        } else {
          setUser(stored);
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const signOut = async () => {
    try {
      await api.post("/auth/logout", {}, false);
    } catch {
      // ignore
    }
    setUser(null);
    storeUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signOut,
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
