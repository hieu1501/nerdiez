import { RequireAuth } from "@/app/auth-provider";

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[880px] px-4 py-6 sm:px-6 sm:py-8"><RequireAuth>{children}</RequireAuth></div>;
}
