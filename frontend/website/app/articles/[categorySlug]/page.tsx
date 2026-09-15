import { redirect } from "next/navigation";
import { categoryHref, parsePage } from "@/lib/resource-links";

export default async function Page({ params, searchParams }: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const [{ categorySlug }, query] = await Promise.all([params, searchParams]);
  redirect(categoryHref(categorySlug, "articles", parsePage(query.page)));
}
