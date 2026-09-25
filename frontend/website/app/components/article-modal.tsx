"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, X } from "lucide-react";

export default function ArticleModal({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => { if (element?.open) element.close(); };
  }, []);

  const close = () => router.back();

  return <dialog ref={dialog} aria-label="Article reader" onCancel={(event) => { event.preventDefault(); close(); }}
    onClick={(event) => { if (event.target === event.currentTarget) close(); }}
    className="m-auto h-dvh w-full max-h-none max-w-none overflow-hidden border-0 bg-paper p-0 text-ink shadow-pop backdrop:bg-black/55 backdrop:backdrop-blur-[2px] sm:h-[calc(100dvh-2rem)] sm:w-[min(94vw,72rem)] sm:rounded-2xl sm:border sm:border-line">
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-3 py-2 sm:px-4">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Article</span>
        <div className="flex items-center gap-2">
          <a href={pathname} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-muted no-underline transition-colors hover:bg-soft hover:text-ink">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="hidden sm:inline">Open in new tab</span><span className="sm:hidden">Open</span>
          </a>
          <button type="button" autoFocus onClick={close} aria-label="Close article" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-soft hover:text-ink">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  </dialog>;
}
