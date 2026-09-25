import { redirect } from "next/navigation";
import { getCategories } from "@/lib/server-api";
import { categoryHref } from "@/lib/resource-links";
import { EmptyState } from "@/app/components/content-ui";

export default async function CategoriesPage() {
  const categories = await getCategories();
  if (categories[0]) redirect(categoryHref(categories[0].slugName));
  return <div className="mx-auto max-w-[1080px] px-4 py-6 sm:px-6">
    <EmptyState title="No subjects yet" description="Subjects will appear here when they become available." />
  </div>;
}
