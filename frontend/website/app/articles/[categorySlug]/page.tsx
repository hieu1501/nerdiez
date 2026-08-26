import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getArticleSlice, getCategories } from "@/lib/server-api";
import ArticlesList, {
  ArticlesFilters,
  ArticlesListLoading,
  ArticlesPageHeader,
  CategorySectionLoading,
} from "./articles-list";

interface PageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

const PAGE_SIZE = 10;

function parsePage(value: string | string[] | undefined): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue || !/^\d+$/.test(rawValue)) return 1;
  const page = Number(rawValue);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default function CategoryPage({ params, searchParams }: PageProps) {
  return (
    <div>
      <ArticlesPageHeader />
      <Suspense fallback={<CategorySectionLoading />}>
        <CategorySection params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategorySection({ params, searchParams }: PageProps) {
  const [{ categorySlug }, query, categories] = await Promise.all([
    params,
    searchParams,
    getCategories(),
  ]);
  const currentPage = parsePage(query.page);
  const category = categories.find((c) => c.slugName === categorySlug);
  if (!category) {
    notFound();
  }
  const articleSlicePromise = getArticleSlice(categorySlug, currentPage - 1, PAGE_SIZE);

  return (
    <section className="mx-auto w-full max-w-[960px] px-5 pb-14 sm:px-8">
      <div className="border-t border-line pt-3" />
      <ArticlesFilters
        categorySlug={categorySlug}
        categoryDescription={category.description}
        categories={categories.map((item) => ({ slugName: item.slugName, name: item.name }))}
      />
      <Suspense
        key={`${categorySlug}:${currentPage}`}
        fallback={<ArticlesListLoading />}
      >
        <ArticleResults
          categorySlug={categorySlug}
          currentPage={currentPage}
          articleSlicePromise={articleSlicePromise}
        />
      </Suspense>
    </section>
  );
}

interface ArticleResultsProps {
  categorySlug: string;
  currentPage: number;
  articleSlicePromise: ReturnType<typeof getArticleSlice>;
}

async function ArticleResults({
  categorySlug,
  currentPage,
  articleSlicePromise,
}: ArticleResultsProps) {
  const articleSlice = await articleSlicePromise;
  return (
    <ArticlesList
      categorySlug={categorySlug}
      currentPage={currentPage}
      articleSlice={articleSlice}
    />
  );
}
