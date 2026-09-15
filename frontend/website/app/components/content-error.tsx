"use client";

export default function ContentError({ retry }: { retry: () => void }) {
  return <div className="mx-auto w-full max-w-[840px] px-4 py-8 sm:px-6">
    <div className="rounded-lg border border-line px-5 py-10 text-center" role="alert">
      <h1 className="font-bold">Content is temporarily unavailable</h1>
      <p className="mt-2 text-sm leading-6 text-muted">We couldn’t load this page. Please try again in a moment.</p>
      <button type="button" onClick={retry} className="mt-5 rounded-md border border-line px-3 py-2 text-xs transition-colors hover:border-ink">Retry</button>
    </div>
  </div>;
}
