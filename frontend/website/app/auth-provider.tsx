"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile, type UserProfileResponseDTO } from "@/lib/api";
import { api } from "@/lib/api-client";
import { clearPersonalStorage, consumeSignInReturn, loadStoredProfile, rememberSignInReturn, storeProfile } from "@/lib/auth-storage";
import SignInDialog from "./sign-in-dialog";

type AuthStatus = "checking" | "authenticated" | "anonymous" | "error";
interface AuthContextValue {
  profile: UserProfileResponseDTO | null;
  status: AuthStatus;
  loginOpen: boolean;
  // returnTo: where to land after sign-in; defaults to the current page.
  requestSignIn: (description?: string, returnTo?: string) => void;
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
  const returnTo = useRef<string | null>(null);
  const generation = useRef(0);

  const [profileAttempt, setProfileAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const current = ++generation.current;
    fetchProfile().then((result) => {
      if (cancelled || generation.current !== current) return;
      storeProfile(result);
      setProfile(result);
      setStatus(result ? "authenticated" : "anonymous");
      if (result) {
        setPrompt(null);
        const destination = consumeSignInReturn();
        if (destination) router.replace(destination);
      }
    }).catch(() => {
      if (cancelled || generation.current !== current) return;
      // Backend unreachable: keep the last known user, like the admin app
      const stored = loadStoredProfile();
      setProfile(stored);
      setStatus(stored ? "authenticated" : "error");
    });
    return () => { cancelled = true; };
  }, [router, profileAttempt]);

  const requestSignIn = useCallback((description = "Choose a sign-in provider.", destination?: string) => {
    returnTo.current = destination ?? null;
    setPrompt(description);
  }, []);
  const expireSession = useCallback(() => {
    generation.current++;
    storeProfile(null);
    setProfile(null);
    setStatus("anonymous");
    returnTo.current = null;
    setPrompt("Your session has expired. Sign in to continue.");
  }, []);
  const retryProfile = useCallback(() => { setStatus("checking"); setProfileAttempt((attempt) => attempt + 1); }, []);
  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/logout", {}, false);
    } catch {
      // ignore
    }
    generation.current++;
    storeProfile(null);
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
      onContinue={() => rememberSignInReturn(returnTo.current ?? `${window.location.pathname}${window.location.search}${window.location.hash}`)} />
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
  return <div className="card px-5 py-12 text-center" aria-busy={status === "checking"}>
    <h2 className="text-lg font-bold">{status === "checking" ? "Checking your session…" : status === "error" ? "We couldn’t check your session" : "Sign in required"}</h2>
    {status !== "checking" && <button type="button" onClick={status === "error" ? retryProfile : () => requestSignIn()} className="mt-5 h-9 rounded-lg bg-button px-4 text-sm font-semibold text-button-text hover:bg-accent-hover">{status === "error" ? "Retry" : "Sign in"}</button>}
  </div>;
}
