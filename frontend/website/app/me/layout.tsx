import { RequireAuth } from "@/app/auth-provider";

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[840px] px-4 py-7 sm:px-6 sm:py-9"><RequireAuth>{children}</RequireAuth></div>;
}
