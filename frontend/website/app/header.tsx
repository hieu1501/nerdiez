"use client";

import Link from "next/link";
import { useCallback, useLayoutEffect, useState } from "react";
import { LogIn, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useAuth } from "./auth-provider";

const THEME_KEY = "theme";

export default function Header({ navigationOpen, onOpenNavigation }: { navigationOpen: boolean; onOpenNavigation: () => void }) {
  const { profile, status, loginOpen, requestSignIn, retryProfile, signOut } = useAuth();
  const profileChecked = status !== "checking";
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
      document.documentElement.style.colorScheme = stored;
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    localStorage.setItem(THEME_KEY, next);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);
    try { await signOut(); }
    catch { setSignOutError("Could not sign out. Please try again."); }
    finally { setSigningOut(false); }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <nav
        className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-5"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-4">
          <button type="button" onClick={onOpenNavigation} aria-label="Open subjects" aria-expanded={navigationOpen} aria-controls="subjects-drawer" className="rounded-md border border-line p-1.5 text-muted hover:text-ink lg:hidden"><Menu className="h-4 w-4" /></button>
          <Link
            href="/categories"
            className="text-lg font-bold tracking-tight no-underline transition-opacity hover:opacity-70"
          >
            Nerdy
          </Link>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {!profileChecked && (
            <div className="h-8 w-16 rounded-md border border-line" aria-hidden="true" />
          )}
          {profileChecked && profile && (
            <>
              <Link href="/me" aria-label="Profile" className="inline-flex max-w-[180px] items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-xs no-underline hover:bg-soft">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-soft text-[11px] font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden truncate sm:inline">@{profile.username}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                aria-label="Sign out"
                className="inline-flex items-center gap-1.5 rounded-md border border-line p-1.5 text-xs text-muted transition-colors hover:text-ink sm:px-2.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          )}
          {profileChecked && !profile && (
            <button
              type="button"
              id="login-nav-button"
              aria-expanded={loginOpen}
              aria-controls="universal-sign-in-dialog"
              aria-haspopup="dialog"
              onClick={status === "error" ? retryProfile : () => requestSignIn()}
              className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-ink"
            >
              <LogIn className="h-3.5 w-3.5" />
              {status === "error" ? "Retry session" : "Login"}
            </button>
          )}
          <button
            type="button"
            id="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-line p-1.5 text-xs text-muted transition-colors hover:text-ink sm:px-2.5"
          >
            <Sun className="theme-icon-light h-3.5 w-3.5" />
            <Moon className="theme-icon-dark h-3.5 w-3.5" />
            <span className="theme-label-light hidden sm:inline">Light</span>
            <span className="theme-label-dark hidden sm:inline">Dark</span>
          </button>
        </div>
      </nav>
      {signOutError && <p role="alert" className="mx-auto max-w-[1280px] px-5 pb-2 text-xs text-downvote">{signOutError}</p>}
    </header>
  );
}
