export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 dark:bg-gray-900">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-100 blur-3xl dark:bg-brand-500/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-highlight-soft blur-3xl dark:bg-highlight/10" aria-hidden="true" />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
