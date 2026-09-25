// Mirrors design/icon/nerdiez-icon.svg (light) and nerdiez-icon-dark.svg (dark); the public site uses the same mark.
export default function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="9" className="fill-brand-500 dark:fill-brand-400" />
    <path d="M8.8 26V14.5l14.4 11.5V14.5" fill="none" className="stroke-white dark:stroke-[#07130f]" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
    <g className="fill-[#3f968a] stroke-[#1a1c1e] dark:fill-[#8fe0cb] dark:stroke-[#f2b65a]" strokeWidth="2.3">
      <circle cx="10.6" cy="13.6" r="4" />
      <circle cx="21.4" cy="13.6" r="4" />
    </g>
    <path d="M14.5 13.3q1.5-1.1 3 0" fill="none" className="stroke-[#1a1c1e] dark:stroke-[#f2b65a]" strokeWidth="2.1" strokeLinecap="round" />
    <path d="M26.6 6.9q.35 2.15 2.5 2.5q-2.15.35-2.5 2.5q-.35-2.15-2.5-2.5q2.15-.35 2.5-2.5Z" className="fill-[#f2b65a] stroke-[#f2b65a] dark:fill-white dark:stroke-white" strokeWidth=".7" strokeLinejoin="round" />
    <path d="M28.9 6.3l-.7.7" className="stroke-[#f2b65a] dark:stroke-white" strokeWidth="1.1" strokeLinecap="round" />
  </svg>;
}
