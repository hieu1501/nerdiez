import { notFound, redirect } from "next/navigation";
import { getArticleDetail, getCategories, resolveLegacyArticle } from "@/lib/server-api";
import { articleHref, publicIdentifier } from "@/lib/resource-links";
import type { ArticleReaderProps } from "./article-reader";

export async function loadArticleReaderProps(params: Promise<{ categorySlug: string; slugName: string }>): Promise<ArticleReaderProps> {
  const { categorySlug, slugName } = await params;
  const category = (await getCategories()).find((item) => item.slugName === categorySlug);
  if (!category) notFound();
  if (!slugName.includes("~")) {
    const identifier = await resolveLegacyArticle(categorySlug, slugName);
    if (identifier) redirect(articleHref(categorySlug, identifier));
    notFound();
  }
  const article = await getArticleDetail(slugName);
  if (!article) notFound();
  const canonicalHref = articleHref(article.content.category.slugName, publicIdentifier(article.content.canonicalUri, "articles"));
  if (canonicalHref !== articleHref(categorySlug, slugName)) redirect(canonicalHref);
  return { categorySlug, categoryName: category.name, publicUri: slugName, article };
}
