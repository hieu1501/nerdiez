export default function ArticleLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[720px] px-5 py-10 sm:px-8 sm:py-14"
      aria-busy="true"
      aria-label="Loading article"
    >
      <div className="h-4 w-32 animate-pulse rounded bg-soft" />
      <div className="mt-6 h-8 w-3/4 animate-pulse rounded bg-soft" />
      <div className="mt-4 h-4 w-40 animate-pulse rounded bg-soft" />
      <div className="mt-10 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-soft" />
        <div className="h-4 w-full animate-pulse rounded bg-soft" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-soft" />
      </div>
    </div>
  );
}
