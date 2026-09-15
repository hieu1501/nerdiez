import { CompactLoading, ListLoading } from "@/app/components/content-ui";
export default function Loading() {
  return <div className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-6 sm:py-8" aria-busy="true" aria-label="Loading topic and discussion">
    <div className="h-4 w-40 rounded bg-soft motion-safe:animate-pulse" />
    <div className="mt-8 h-9 border-b border-line" />
    <div className="mx-auto max-w-[720px] py-7 sm:py-10">
      <div className="h-3 w-48 rounded bg-soft motion-safe:animate-pulse" />
      <div className="mt-5 h-10 w-4/5 rounded bg-soft motion-safe:animate-pulse" />
      <div className="mt-6 h-9 w-48 rounded bg-soft motion-safe:animate-pulse" />
      <ListLoading label="Loading overview" />
    </div>
    <div className="border-t border-line pt-6"><div className="mx-auto max-w-[720px]"><p className="text-lg font-bold">Discussion</p><CompactLoading label="Loading discussion" /></div></div>
  </div>;
}
