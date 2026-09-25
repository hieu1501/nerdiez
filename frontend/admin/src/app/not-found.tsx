import Link from "next/link";
import BrandMark from "@/components/common/BrandMark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-gray-900">
      <BrandMark className="h-12 w-12" />
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-400">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">This admin page doesn’t exist or has moved.</p>
      <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600">Back to dashboard</Link>
    </div>
  );
}
