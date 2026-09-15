"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { RefreshCw, UserRound, X } from "lucide-react";
import { fetchAllCategories, type CategoryPublicDetailDTO } from "@/lib/api";
import { categoryHref } from "@/lib/resource-links";
import { useAuth } from "./auth-provider";
import Header from "./header";

function activeCategory(pathname: string): string | null {
  const match = pathname.match(/^\/(?:categories|articles)\/([^/]+)/);
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

function SubjectLinks({ categories, loading, failed, retry, close }: {
  categories: CategoryPublicDetailDTO[];
  loading: boolean;
  failed: boolean;
  retry: () => void;
  close?: () => void;
}) {
  const pathname = usePathname();
  const selected = activeCategory(pathname);
  if (loading) return <div className="space-y-2 px-2" aria-label="Loading subjects" aria-busy="true">
    {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-8 rounded-md bg-soft motion-safe:animate-pulse" />)}
  </div>;
  if (failed) return <div className="px-2 text-xs leading-5 text-muted">
    <p>Couldn’t load subjects.</p>
    <button type="button" onClick={retry} className="mt-2 inline-flex items-center gap-1.5 font-bold text-ink"><RefreshCw className="h-3.5 w-3.5" />Retry</button>
  </div>;
  if (!categories.length) return <p className="px-2 text-xs leading-5 text-muted">No subjects yet.</p>;
  return <nav aria-label="Subjects" className="space-y-1">
    {categories.map((category) => {
      const active = selected === category.slugName;
      return <Link key={category.slugName} href={categoryHref(category.slugName)} onClick={close} aria-current={active ? "page" : undefined}
        className={`group flex min-h-9 items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] no-underline transition-colors ${active ? "bg-accent-soft font-bold text-ink" : "text-muted hover:bg-soft hover:text-ink"}`}>
        <span className="truncate">#{category.slugName}</span>
      </Link>;
    })}
  </nav>;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { profile, status } = useAuth();
  const [categories, setCategories] = useState<CategoryPublicDetailDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllCategories().then((result) => {
      if (!cancelled) { setCategories(result); setLoading(false); }
    }).catch(() => {
      if (!cancelled) { setFailed(true); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [attempt]);

  useEffect(() => {
    if (drawerOpen && !drawer.current?.open) drawer.current?.showModal();
    if (!drawerOpen && drawer.current?.open) drawer.current.close();
  }, [drawerOpen]);

  const retry = () => { setLoading(true); setFailed(false); setAttempt((value) => value + 1); };
  const subjectProps = { categories, loading, failed, retry };
  return <div className="flex min-h-screen flex-col">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-paper focus:px-3 focus:py-2 focus:text-sm">Skip to content</a>
    <Header navigationOpen={drawerOpen} onOpenNavigation={() => setDrawerOpen(true)} />
    <div className="mx-auto flex w-full max-w-[1280px] flex-1">
      <aside className="hidden w-52 shrink-0 border-r border-line px-3 py-5 lg:block">
        <div className="sticky top-[76px]">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Subjects</p>
          <SubjectLinks {...subjectProps} />
          {status === "authenticated" && profile && <Link href="/me" className="mt-5 flex items-center gap-2 border-t border-line px-2.5 pt-5 text-xs text-muted no-underline hover:text-ink"><UserRound className="h-4 w-4" />Your profile</Link>}
        </div>
      </aside>
      <main id="main-content" className="min-w-0 flex-1">{children}</main>
    </div>
    <footer className="w-full border-t border-line px-4 py-5">
      <p className="mx-auto max-w-[1280px] text-center text-xs text-muted">Nerdy · read, ask, explain</p>
    </footer>
    <dialog ref={drawer} id="subjects-drawer" aria-labelledby="subjects-drawer-title" onCancel={() => setDrawerOpen(false)} onClose={() => setDrawerOpen(false)}
      onClick={(event) => { if (event.target === event.currentTarget) setDrawerOpen(false); }}
      className="m-0 h-dvh w-[min(86vw,18rem)] max-w-none border-0 border-r border-line bg-drawer p-0 text-ink shadow-2xl backdrop:bg-ink/45">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 id="subjects-drawer-title" className="text-sm font-bold">Subjects</h2>
        <button type="button" autoFocus onClick={() => setDrawerOpen(false)} aria-label="Close subjects" className="rounded-md border border-line p-1.5 text-muted hover:text-ink"><X className="h-4 w-4" /></button>
      </div>
      <div className="overflow-y-auto px-2 py-4"><SubjectLinks {...subjectProps} close={() => setDrawerOpen(false)} /></div>
    </dialog>
  </div>;
}
