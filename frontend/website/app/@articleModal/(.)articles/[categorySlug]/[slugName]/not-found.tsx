import ArticleModal from "@/app/components/article-modal";
import ArticleNotFound from "@/app/articles/[categorySlug]/[slugName]/not-found";

export default function NotFound() {
  return <ArticleModal><ArticleNotFound /></ArticleModal>;
}
