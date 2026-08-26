import { redirect } from "next/navigation";
import { getCategories } from "@/lib/server-api";

export default async function ArticlesPage() {
  const categories = await getCategories();
  const first = categories[0];
  if (first) {
    redirect(`/articles/${first.slugName}`);
  }
  return (
    <div className="mx-auto w-full max-w-[960px] px-5 py-20 text-center sm:px-8">
      <p className="font-bold">No categories available</p>
      <p className="mt-2 text-sm text-muted">
        Could not load any categories from the API. Check back soon.
      </p>
    </div>
  );
}
