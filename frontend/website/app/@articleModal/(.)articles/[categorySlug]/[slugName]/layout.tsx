import type { ReactNode } from "react";
import ArticleModal from "@/app/components/article-modal";

// One dialog wraps loading, error, and the loaded article, so it isn't reopened when content arrives.
export default function ArticleModalLayout({ children }: { children: ReactNode }) {
  return <ArticleModal>{children}</ArticleModal>;
}
