"use client";

export default function ArticleError({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-5 py-14 text-center sm:px-8">
      <div className="border border-line px-6 py-14">
        <p className="font-bold">Article is temporarily unavailable</p>
        <p className="mt-2 text-sm text-muted">Could not reach the API. Please try again.</p>
        <button
          type="button"
          onClick={retry}
          className="mt-5 rounded-md border border-line px-3 py-2 text-sm transition-colors hover:text-ink"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
