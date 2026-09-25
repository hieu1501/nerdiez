"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { FileText, MessagesSquare, RefreshCw, X } from "lucide-react";
import { fetchAllCategories, type CategoryPublicDetailDTO } from "@/lib/api";
import { categoryHref } from "@/lib/resource-links";
import { useAuth } from "./auth-provider";
import Header from "./header";
import BrandMark from "./components/brand-mark";
import { SubjectIcon } from "./components/subject";

function activeCategory(pathname: string): string | null {
  const match = pathname.match(/^\/(?:categories|articles)\/([^/]+)/);
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

const railLink = "group flex min-h-10 items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm no-underline transition-colors";
const railActive = "bg-surface font-semibold text-ink shadow-card";
const railIdle = "text-muted hover:bg-soft hover:text-ink";

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{children}</p>;
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
    {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-10 rounded-lg bg-soft motion-safe:animate-pulse" />)}
  </div>;
  if (failed) return <div className="px-2.5 text-xs leading-5 text-muted">
    <p>Couldn’t load subjects.</p>
    <button type="button" onClick={retry} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-accent"><RefreshCw className="h-3.5 w-3.5" />Retry</button>
  </div>;
  if (!categories.length) return <p className="px-2.5 text-xs leading-5 text-muted">No subjects yet.</p>;
  return <nav aria-label="Subjects" className="space-y-1">
    {categories.map((category) => {
      const active = selected === category.slugName;
      return <Link key={category.slugName} href={categoryHref(category.slugName)} onClick={close} aria-current={active ? "page" : undefined}
        className={`${railLink} ${active ? railActive : railIdle}`}>
        <SubjectIcon slug={category.slugName} size="sm" />
        <span className="truncate">{category.name}</span>
      </Link>;
    })}
  </nav>;
}

function PersonalLinks({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const onMe = pathname === "/me";
  const view = params.get("view") === "topics" ? "topics" : "articles";
  const items = [
    { href: "/me", label: "My articles", icon: FileText, active: onMe && view === "articles" },
    { href: "/me?view=topics", label: "My questions", icon: MessagesSquare, active: onMe && view === "topics" },
  ];
  return <nav aria-label="Your content" className="space-y-1">
    {items.map(({ href, label, icon: Icon, active }) => <Link key={href} href={href} onClick={close} aria-current={active ? "page" : undefined} className={`${railLink} ${active ? railActive : railIdle}`}>
      <span className="flex h-6 w-6 items-center justify-center"><Icon className="h-4 w-4" aria-hidden="true" /></span>{label}
    </Link>)}
  </nav>;
}

function Rail({ subjectProps, signedIn, close }: { subjectProps: Parameters<typeof SubjectLinks>[0]; signedIn: boolean; close?: () => void }) {
  return <div className="space-y-6">
    <div><SectionLabel>Subjects</SectionLabel><SubjectLinks {...subjectProps} close={close} /></div>
    {signedIn && <div><SectionLabel>Your space</SectionLabel><Suspense><PersonalLinks close={close} /></Suspense></div>}
    <div className="rounded-xl border border-dashed border-line px-3.5 py-3 text-xs leading-5 text-muted">
      <p className="font-semibold text-ink">Read · Ask · Explain</p>
      <p className="mt-1">Learn from shared experience, then explain a topic in your own words.</p>
    </div>
  </div>;
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
  const signedIn = status === "authenticated" && Boolean(profile);
  return <div className="flex min-h-screen flex-col">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm">Skip to content</a>
    <Header navigationOpen={drawerOpen} onOpenNavigation={() => setDrawerOpen(true)} />
    <div className="mx-auto flex w-full max-w-[1320px] flex-1">
      <aside className="hidden w-60 shrink-0 px-4 py-6 lg:block">
        <div className="sticky top-[88px]"><Rail subjectProps={subjectProps} signedIn={signedIn} /></div>
      </aside>
      <main id="main-content" className="min-w-0 flex-1">{children}</main>
    </div>
    <footer className="w-full border-t border-line px-4 py-6">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 text-xs text-muted sm:px-2">
        <span className="inline-flex items-center gap-2"><BrandMark className="h-5 w-5" />Nerdiez</span>
        <span>Read, ask, and explain — one topic at a time.</span>
      </div>
    </footer>
    <dialog ref={drawer} id="subjects-drawer" aria-labelledby="subjects-drawer-title" onCancel={() => setDrawerOpen(false)} onClose={() => setDrawerOpen(false)}
      onClick={(event) => { if (event.target === event.currentTarget) setDrawerOpen(false); }}
      className="m-0 h-dvh max-h-none w-[min(86vw,18rem)] max-w-none border-0 border-r border-line bg-paper p-0 text-ink shadow-pop backdrop:bg-black/45">
      <div className="flex h-16 items-center justify-between border-b border-line px-4">
        <h2 id="subjects-drawer-title" className="flex items-center gap-2.5 text-[17px] font-bold"><BrandMark />Nerdiez</h2>
        <button type="button" autoFocus onClick={() => setDrawerOpen(false)} aria-label="Close subjects" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink"><X className="h-5 w-5" /></button>
      </div>
      <div className="overflow-y-auto px-3 py-5"><Rail subjectProps={subjectProps} signedIn={signedIn} close={() => setDrawerOpen(false)} /></div>
    </dialog>
  </div>;
}
