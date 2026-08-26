"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { LogIn, LogOut, Moon, Sun } from "lucide-react";
import type { UserProfileResponseDTO } from "@/lib/api";
import { fetchProfile } from "@/lib/api";
import SignInDialog from "./sign-in-dialog";

const THEME_KEY = "theme";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponseDTO | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const writingActive = pathname === "/articles" || pathname.startsWith("/articles/");

  useLayoutEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
      document.documentElement.style.colorScheme = stored;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchProfile().then((result) => {
      if (!cancelled) {
        setProfile(result);
        setProfileChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    localStorage.setItem(THEME_KEY, next);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Ignore network errors; still reset local state and navigate home.
    }
    setProfile(null);
    setProfileChecked(true);
    setLoginOpen(false);
    router.push("/");
  }, [router]);

  return (
    <header className="relative border-b border-line">
      <nav
        className="mx-auto flex w-full max-w-[960px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-5 sm:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className="text-lg font-bold tracking-tight no-underline transition-opacity hover:opacity-70"
          >
            Nerdy
          </Link>
          <span className="h-4 w-px bg-line" aria-hidden="true" />
          <Link
            href="/articles"
            aria-current={writingActive ? "page" : undefined}
            className={`relative px-1 py-2 text-sm no-underline transition-colors after:absolute after:inset-x-1 after:bottom-1 after:h-px after:origin-left after:bg-ink after:transition-transform after:duration-200 motion-reduce:after:duration-0 ${
              writingActive
                ? "font-bold text-ink after:scale-x-100"
                : "text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100"
            }`}
          >
            Writing
          </Link>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {!profileChecked && (
            <div className="h-8 w-16 rounded-md border border-line" aria-hidden="true" />
          )}
          {profileChecked && profile && (
            <>
              <span className="inline-flex max-w-[180px] items-center gap-2 rounded-md border border-line px-3 py-1.5 text-[13px]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-soft text-[11px] font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{profile.displayName}</span>
              </span>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </>
          )}
          {profileChecked && !profile && (
            <button
              type="button"
              id="login-nav-button"
              aria-expanded={loginOpen}
              aria-controls="header-sign-in-dialog"
              aria-haspopup="dialog"
              onClick={() => setLoginOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </button>
          )}
          <button
            type="button"
            id="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-ink"
          >
            <Sun className="theme-icon-light h-3.5 w-3.5" />
            <Moon className="theme-icon-dark h-3.5 w-3.5" />
            <span className="theme-label-light">Light</span>
            <span className="theme-label-dark">Dark</span>
          </button>
        </div>
      </nav>
      <SignInDialog
        id="header-sign-in-dialog"
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </header>
  );
}
