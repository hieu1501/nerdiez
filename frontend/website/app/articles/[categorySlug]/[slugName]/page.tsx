import { notFound } from "next/navigation";
import { getArticleDetail, getCategories } from "@/lib/server-api";
import ArticleReader from "./article-reader";

interface PageProps {
  params: Promise<{ categorySlug: string; slugName: string }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { categorySlug, slugName } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slugName === categorySlug);
  if (!category) {
    notFound();
  }
  const article = await getArticleDetail(categorySlug, slugName);
  if (!article) {
    notFound();
  }
  return (
    <ArticleReader
      categorySlug={categorySlug}
      categoryName={category.name}
      slugName={slugName}
      article={article}
    />
  );
}
