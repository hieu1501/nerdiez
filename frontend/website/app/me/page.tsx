import { parsePage } from "@/lib/resource-links";
import MyContent from "./my-content";

export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string; page?: string | string[] }> }) {
  const query = await searchParams;
  const view = query.view === "topics" ? "topics" : "articles";
  const page = parsePage(query.page);
  return <MyContent key={`${view}:${page}`} view={view} page={page} />;
}
