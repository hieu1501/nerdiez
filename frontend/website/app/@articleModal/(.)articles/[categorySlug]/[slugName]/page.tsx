import ArticleReader from "@/app/articles/[categorySlug]/[slugName]/article-reader";
import { loadArticleReaderProps } from "@/app/articles/[categorySlug]/[slugName]/article-page-data";

export default async function ArticleModalPage({ params }: { params: Promise<{ categorySlug: string; slugName: string }> }) {
  return <ArticleReader {...await loadArticleReaderProps(params)} presentation="modal" />;
}
