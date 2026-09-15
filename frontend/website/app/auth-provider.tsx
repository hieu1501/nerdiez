"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile, requestJson, type UserProfileResponseDTO } from "@/lib/api";
import { clearPersonalStorage, consumeSignInReturn, rememberSignInReturn } from "@/lib/auth-storage";
import SignInDialog from "./sign-in-dialog";

type AuthStatus = "checking" | "authenticated" | "anonymous" | "error";
interface AuthContextValue {
  profile: UserProfileResponseDTO | null;
  status: AuthStatus;
  loginOpen: boolean;
  requestSignIn: (description?: string) => void;
  expireSession: () => void;
  retryProfile: () => void;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponseDTO | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [prompt, setPrompt] = useState<string | null>(null);
  const generation = useRef(0);

  const [profileAttempt, setProfileAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const current = ++generation.current;
    fetchProfile().then((result) => {
      if (cancelled || generation.current !== current) return;
      setProfile(result);
      setStatus(result ? "authenticated" : "anonymous");
      if (result) {
        setPrompt(null);
        const destination = consumeSignInReturn();
        if (destination) router.replace(destination);
      }
    }).catch(() => {
      if (!cancelled && generation.current === current) {
        setProfile(null);
        setStatus("error");
      }
    });
    return () => { cancelled = true; };
  }, [router, profileAttempt]);

  const requestSignIn = useCallback((description = "Choose a sign-in provider.") => setPrompt(description), []);
  const expireSession = useCallback(() => {
    generation.current++;
    setProfile(null);
    setStatus("anonymous");
    setPrompt("Your session has expired. Sign in to continue.");
  }, []);
  const retryProfile = useCallback(() => { setStatus("checking"); setProfileAttempt((attempt) => attempt + 1); }, []);
  const signOut = useCallback(async () => {
    await requestJson<void>("/api/auth/logout", { method: "POST" });
    generation.current++;
    clearPersonalStorage();
    setProfile(null);
    setStatus("anonymous");
    setPrompt(null);
    router.replace("/");
    router.refresh();
  }, [router]);

  return <AuthContext.Provider value={{ profile, status, loginOpen: prompt !== null, requestSignIn, expireSession, retryProfile, signOut }}>
    {children}
    <SignInDialog id="universal-sign-in-dialog" open={prompt !== null} description={prompt ?? undefined} onClose={() => setPrompt(null)}
      onContinue={() => rememberSignInReturn(`${window.location.pathname}${window.location.search}${window.location.hash}`)} />
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, profile, requestSignIn, retryProfile } = useAuth();
  useEffect(() => {
    if (status === "anonymous") requestSignIn("Sign in to view and manage your articles and topics.");
  }, [status, requestSignIn]);
  if (status === "authenticated" && profile) return <div key={profile.username}>{children}</div>;
  return <div className="rounded-lg border border-line px-5 py-10 text-center" aria-busy={status === "checking"}>
    <h2 className="text-lg font-bold">{status === "checking" ? "Checking your session…" : status === "error" ? "We couldn’t check your session" : "Sign in required"}</h2>
    {status !== "checking" && <button type="button" onClick={status === "error" ? retryProfile : () => requestSignIn()} className="mt-5 rounded-md bg-button px-4 py-2 text-xs font-bold text-button-text">{status === "error" ? "Retry" : "Sign in"}</button>}
  </div>;
}
