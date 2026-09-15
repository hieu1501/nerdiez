import ArticleReader from "./article-reader";
import { loadArticleReaderProps } from "./article-page-data";

export default async function ArticleDetailPage({ params }: { params: Promise<{ categorySlug: string; slugName: string }> }) {
  return <ArticleReader {...await loadArticleReaderProps(params)} />;
}
