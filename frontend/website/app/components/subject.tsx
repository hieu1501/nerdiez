import { BookOpen, Cpu, FlaskConical, Landmark, TrendingUp, type LucideIcon } from "lucide-react";

const TONES = ["tone-violet", "tone-rose", "tone-teal", "tone-blue", "tone-amber"] as const;

// Known subjects get fixed colours; anything new gets a stable hashed one.
const KNOWN: { match: RegExp; tone: (typeof TONES)[number]; icon: LucideIcon }[] = [
  { match: /comput|^cs$|program|algorithm|software/, tone: "tone-blue", icon: Cpu },
  { match: /econ|financ|market|business/, tone: "tone-amber", icon: TrendingUp },
  { match: /science|physic|chem|bio|math/, tone: "tone-violet", icon: FlaskConical },
  { match: /history|politic|law|philosoph/, tone: "tone-rose", icon: Landmark },
];

export function subjectStyle(slug: string): { tone: string; icon: LucideIcon } {
  const key = slug.toLowerCase();
  const known = KNOWN.find((entry) => entry.match.test(key));
  if (known) return { tone: known.tone, icon: known.icon };
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return { tone: TONES[Math.abs(hash) % TONES.length], icon: BookOpen };
}

export function SubjectIcon({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const { tone, icon: Icon } = subjectStyle(slug);
  const box = size === "lg" ? "h-12 w-12 rounded-xl" : size === "sm" ? "h-6 w-6 rounded-md" : "h-8 w-8 rounded-lg";
  const glyph = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return <span aria-hidden="true" className={`${tone} ${box} flex shrink-0 items-center justify-center bg-(--tone-soft) text-(--tone)`}>
    <Icon className={glyph} />
  </span>;
}

export function SubjectChip({ slug, name }: { slug: string; name: string }) {
  const { tone } = subjectStyle(slug);
  return <span className={`${tone} inline-flex items-center gap-1.5 rounded-full bg-(--tone-soft) px-2.5 py-0.5 text-[11px] font-semibold text-(--tone)`}>
    <span className="h-1.5 w-1.5 rounded-full bg-(--tone)" aria-hidden="true" />{name}
  </span>;
}
