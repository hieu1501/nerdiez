import Link from "next/link";
import { EmptyState } from "@/app/components/content-ui";

export default function NotFound() {
  return <div className="mx-auto max-w-[840px] px-4 py-8 sm:px-6"><EmptyState title="Subject not found" description="This subject is no longer available." /><Link href="/categories" className="mt-5 inline-block text-xs underline underline-offset-4">Browse subjects</Link></div>;
}
