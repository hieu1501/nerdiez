"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { categoryHref } from "@/lib/resource-links";
import { EmptyState } from "@/app/components/content-ui";

export default function ArticleNotFound() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  return <div className="mx-auto max-w-[760px] px-4 py-8 sm:px-6"><EmptyState title="Article not found" description="This article is no longer available at this address." /><Link href={categoryHref(categorySlug)} className="mt-5 inline-block text-sm font-medium text-accent">Back to subject</Link></div>;
}
