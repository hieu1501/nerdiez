import { CompactLoading } from "@/app/components/content-ui";

export default function Loading() {
  return <div className="mx-auto w-full max-w-[860px] px-4 py-6 sm:px-6 sm:py-8" aria-busy="true" aria-label="Loading topic and discussion">
    <div className="h-8 w-56 rounded-lg bg-soft motion-safe:animate-pulse" />
    <div className="card mt-4 p-5 sm:p-7">
      <div className="h-5 w-24 rounded-full bg-soft motion-safe:animate-pulse" />
      <div className="mt-4 h-8 w-4/5 rounded bg-soft motion-safe:animate-pulse" />
      <div className="mt-4 h-8 w-56 rounded bg-soft motion-safe:animate-pulse" />
      <div className="mt-6 space-y-2 border-t border-line pt-6"><div className="h-4 w-full rounded bg-soft motion-safe:animate-pulse" /><div className="h-4 w-2/3 rounded bg-soft motion-safe:animate-pulse" /></div>
    </div>
    <p className="mt-8 text-lg font-bold">Explanations</p>
    <CompactLoading label="Loading discussion" />
  </div>;
}
