"use client";

import ArticleModal from "@/app/components/article-modal";
import ArticleError from "@/app/articles/[categorySlug]/[slugName]/error";

export default function Error({ reset }: { reset: () => void }) {
  return <ArticleModal><ArticleError retry={reset} /></ArticleModal>;
}
