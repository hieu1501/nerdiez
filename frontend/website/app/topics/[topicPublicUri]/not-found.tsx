import Link from "next/link";
import { EmptyState } from "@/app/components/content-ui";
export default function NotFound() {
  return <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6"><EmptyState title="Topic not found" description="This question is no longer available." /><Link href="/categories" className="mt-5 inline-block text-xs underline underline-offset-4">Browse subjects</Link></div>;
}
