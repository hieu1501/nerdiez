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
  return <div className="rounded-lg border border-line px-5 py-10 text-center" role="alert">
    <p className="font-bold">{personalErrorMessage(error)}</p>
    <div className="mt-5 flex justify-center gap-5 text-sm"><button type="button" onClick={retry} className="underline underline-offset-4">Retry</button><Link href="/me" className="underline underline-offset-4">My content</Link></div>
  </div>;
}
