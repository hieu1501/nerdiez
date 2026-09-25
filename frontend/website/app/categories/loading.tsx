import { ListLoading } from "@/app/components/content-ui";

export default function Loading() {
  return <div className="mx-auto max-w-[1080px] px-4 py-6 sm:px-6">
    <div className="card h-[108px] motion-safe:animate-pulse" />
    <ListLoading />
  </div>;
}
