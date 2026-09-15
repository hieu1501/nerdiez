import ContentEditor from "@/app/me/content-editor";
import { parseCategorySelection } from "@/lib/resource-links";

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const query = await searchParams;
  const initialCategorySlug = parseCategorySelection(query.category);
  return <ContentEditor key={initialCategorySlug ?? "new"} resource="articles" initialCategorySlug={initialCategorySlug} />;
}
