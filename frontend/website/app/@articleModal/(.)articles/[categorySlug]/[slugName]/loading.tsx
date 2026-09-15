import ArticleModal from "@/app/components/article-modal";
import ArticleLoading from "@/app/articles/[categorySlug]/[slugName]/loading";

export default function Loading() {
  return <ArticleModal><ArticleLoading /></ArticleModal>;
}
