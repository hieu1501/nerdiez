export default function ArticleLoading() {
  return (
    <div
      className="mx-auto grid w-full max-w-[1180px] gap-12 px-4 py-7 sm:px-6 sm:py-10 min-[1180px]:grid-cols-[minmax(0,760px)_220px] min-[1180px]:justify-center"
      aria-busy="true"
      aria-label="Loading article"
    >
      <div className="min-w-0">
        <div className="h-6 w-32 animate-pulse rounded-full bg-soft" />
        <div className="mt-5 h-11 w-4/5 animate-pulse rounded bg-soft" />
        <div className="mt-3 h-11 w-3/5 animate-pulse rounded bg-soft" />
        <div className="mt-5 h-5 w-full animate-pulse rounded bg-soft" />
        <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-soft" />
        <div className="mt-6 h-8 w-64 animate-pulse rounded bg-soft" />
        <div className="mt-7 aspect-[2/1] w-full animate-pulse rounded-2xl bg-soft" />
        <div className="mt-10 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-soft" />
          <div className="h-4 w-full animate-pulse rounded bg-soft" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-soft" />
        </div>
      </div>
      <div className="hidden min-[1180px]:block">
        <div className="h-3 w-28 animate-pulse rounded bg-soft" />
        <div className="mt-5 space-y-3 border-l border-line pl-4">
          <div className="h-3 w-full animate-pulse rounded bg-soft" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-soft" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-soft" />
        </div>
      </div>
    </div>
  );
}
