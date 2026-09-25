"use client";

import { CloudOff, RefreshCw } from "lucide-react";

export default function ContentError({ retry, title = "Content is temporarily unavailable" }: { retry: () => void; title?: string }) {
  return <div className="mx-auto w-full max-w-[840px] px-4 py-8 sm:px-6">
    <div className="card px-5 py-12 text-center" role="alert">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-soft"><CloudOff className="h-5 w-5 text-muted" aria-hidden="true" /></span>
      <h1 className="mt-4 font-semibold">{title}</h1>
      <p className="mt-1.5 text-sm leading-6 text-muted">We couldn’t load this page. Please try again in a moment.</p>
      <button type="button" onClick={retry} className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-button px-3.5 text-sm font-semibold text-button-text hover:bg-accent-hover"><RefreshCw className="h-4 w-4" aria-hidden="true" />Retry</button>
    </div>
  </div>;
}
