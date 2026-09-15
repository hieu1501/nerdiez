"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { categoryHref } from "@/lib/resource-links";
import { EmptyState } from "@/app/components/content-ui";

export default function ArticleNotFound() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  return <div className="mx-auto max-w-[720px] px-5 py-10 sm:px-8"><EmptyState title="Article not found" description="This article is no longer available at this address." /><Link href={categoryHref(categorySlug)} className="mt-6 inline-block text-sm underline underline-offset-4">Back to category</Link></div>;
}
