// Mirrors design/icon/nerdiez-icon.svg (light) and nerdiez-icon-dark.svg (dark) via theme tokens.
export default function BrandMark({ className = "h-7 w-7" }: { className?: string }) {
  return <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="9" fill="var(--accent)" />
    <path d="M8.8 26V14.5l14.4 11.5V14.5" fill="none" stroke="var(--accent-ink)" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
    <g fill="var(--mark-lens)" stroke="var(--mark-frame)" strokeWidth="2.3">
      <circle cx="10.6" cy="13.6" r="4" />
      <circle cx="21.4" cy="13.6" r="4" />
    </g>
    <path d="M14.5 13.3q1.5-1.1 3 0" fill="none" stroke="var(--mark-frame)" strokeWidth="2.1" strokeLinecap="round" />
    <path d="M26.6 6.9q.35 2.15 2.5 2.5q-2.15.35-2.5 2.5q-.35-2.15-2.5-2.5q2.15-.35 2.5-2.5Z" fill="var(--mark-spark)" stroke="var(--mark-spark)" strokeWidth=".7" strokeLinejoin="round" />
    <path d="M28.9 6.3l-.7.7" stroke="var(--mark-spark)" strokeWidth="1.1" strokeLinecap="round" />
  </svg>;
}
