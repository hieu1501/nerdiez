import Link from "next/link";
import { ApiError } from "@/lib/api";

export function personalErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "You don’t have permission to manage this content.";
    if (error.status === 404) return "This content is no longer available in your account.";
    if (error.status === 400 || error.status === 422) return "Your changes weren’t accepted. Check the fields and try again.";
    if (error.status === 409) return "This content has changed or cannot be removed right now. Reload it before trying again.";
  }
  return "We couldn’t complete that request. Please try again in a moment.";
}
export function PersonalFailure({ error, retry }: { error: unknown; retry: () => void }) {
  return <div className="card px-5 py-10 text-center" role="alert">
    <p className="font-semibold">{personalErrorMessage(error)}</p>
    <div className="mt-5 flex justify-center gap-2 text-sm"><button type="button" onClick={retry} className="h-9 rounded-lg bg-button px-3.5 font-semibold text-button-text hover:bg-accent-hover">Retry</button><Link href="/me" className="inline-flex h-9 items-center rounded-lg border border-line px-3.5 font-medium no-underline hover:bg-soft">My content</Link></div>
  </div>;
}
