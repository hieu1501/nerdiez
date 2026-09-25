"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, LogIn, LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";
import BrandMark from "./components/brand-mark";

const THEME_KEY = "theme";

function Popover({ label, trigger, children, className }: { label: string; trigger: ReactNode; children: (close: () => void) => ReactNode; className: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return <div ref={root} className="relative">
    <button type="button" aria-label={label} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)} className={className}>{trigger}</button>
    {open && <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-pop">{children(() => setOpen(false))}</div>}
  </div>;
}

const menuItem = "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink no-underline transition-colors hover:bg-soft disabled:opacity-50";

export default function Header({ navigationOpen, onOpenNavigation }: { navigationOpen: boolean; onOpenNavigation: () => void }) {
  const { profile, status, loginOpen, requestSignIn, retryProfile, signOut } = useAuth();
  const profileChecked = status !== "checking";
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

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
    root.classList.add("theme-switching");
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    // Force a style flush before re-enabling transitions, or they'd still animate.
    void getComputedStyle(root).color;
    setTimeout(() => root.classList.remove("theme-switching"), 0);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);
    try { await signOut(); }
    catch { setSignOutError("Could not sign out. Please try again."); }
    finally { setSigningOut(false); }
  };

  const iconButton = "inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-soft hover:text-ink";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6" aria-label="Main navigation">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenNavigation} aria-label="Open subjects" aria-expanded={navigationOpen} aria-controls="subjects-drawer" className={`${iconButton} lg:hidden`}><Menu className="h-5 w-5" /></button>
          <Link href="/categories" className="flex items-center gap-2.5 rounded-lg no-underline">
            <BrandMark />
            <span className="text-[17px] font-bold tracking-tight">Nerdiez</span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" id="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme" className={iconButton}>
            <Sun className="theme-icon-light h-[18px] w-[18px]" />
            <Moon className="theme-icon-dark h-[18px] w-[18px]" />
          </button>
          {!profileChecked && <div className="h-9 w-9 rounded-full bg-soft motion-safe:animate-pulse" aria-hidden="true" />}
          {profileChecked && profile && <Popover label="Account menu" className="inline-flex h-9 items-center gap-1 rounded-full py-1 pl-1 pr-1.5 transition-colors hover:bg-soft" trigger={<>
            {profile.avatarUrl && !avatarFailed
              // eslint-disable-next-line @next/next/no-img-element -- Google's image host rejects some hotlinked requests that send a Referer.
              ? <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" onError={() => setAvatarFailed(true)} className="h-7 w-7 rounded-full object-cover" />
              : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">{profile.displayName.charAt(0).toUpperCase()}</span>}
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          </>}>
            {(close) => <>
              <div className="border-b border-line px-3 pb-2.5 pt-1.5">
                <p className="truncate text-sm font-semibold">{profile.displayName}</p>
                <p className="truncate text-xs text-muted">@{profile.username}</p>
              </div>
              <div className="pt-1.5">
                <Link role="menuitem" href="/me" onClick={close} className={menuItem}><UserRound className="h-4 w-4 text-muted" />My content</Link>
                <button role="menuitem" type="button" disabled={signingOut} onClick={() => { close(); void handleSignOut(); }} className={menuItem}><LogOut className="h-4 w-4 text-muted" />{signingOut ? "Signing out…" : "Sign out"}</button>
              </div>
            </>}
          </Popover>}
          {profileChecked && !profile && (
            <button
              type="button"
              id="login-nav-button"
              aria-expanded={loginOpen}
              aria-controls="universal-sign-in-dialog"
              aria-haspopup="dialog"
              onClick={status === "error" ? retryProfile : () => requestSignIn()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-button px-3.5 text-sm font-semibold text-button-text transition-colors hover:bg-accent-hover"
            >
              <LogIn className="h-4 w-4" />
              {status === "error" ? "Retry session" : "Sign in"}
            </button>
          )}
        </div>
      </nav>
      {signOutError && <p role="alert" className="mx-auto max-w-[1320px] px-6 pb-2 text-xs text-danger">{signOutError}</p>}
    </header>
  );
}
