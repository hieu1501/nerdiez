import Link from "next/link";
import { ArrowRight, BookOpen, Check } from "lucide-react";

export default function Page() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid w-full max-w-[960px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.2fr_.8fr] md:items-end md:py-24">
        <div className="article-in">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Growing thoughtfully
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] sm:text-5xl md:text-6xl">
            A home for ideas worth understanding.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            Nerdy brings together clear writing and useful services for curious people.
            Start with thoughtful notes on computer science and economics, with more to
            come as the site grows.
          </p>
          <Link
            href="/articles"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-button px-5 py-3 text-sm font-bold text-button-text no-underline transition-transform motion-safe:hover:-translate-y-0.5"
          >
            Explore Writing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="article-in border-l border-line pl-6 md:pl-8"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-sm font-bold">Built for curious minds</p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Practical explanations, honest trade-offs, and space to engage with what you
            read—without unnecessary noise.
          </p>
        </div>
      </section>

      <section
        id="services"
        aria-labelledby="services-heading"
        className="border-y border-line bg-soft/40"
      >
        <div className="mx-auto w-full max-w-[960px] px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                Services
              </p>
              <h2 id="services-heading" className="mt-3 text-2xl font-bold sm:text-3xl">
                What you can use today
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted sm:text-right">
              More services will join Writing as Nerdy continues to grow.
            </p>
          </div>

          <article className="mt-8 rounded-2xl border border-line bg-paper p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex max-w-xl gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold">Writing</h3>
                    <span className="rounded-full border border-upvote/30 bg-upvote/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-upvote">
                      Available
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Browse focused notes that explain technical and economic ideas clearly,
                    with enough depth to make the trade-offs useful.
                  </p>
                </div>
              </div>

              <Link
                href="/articles"
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-line px-4 py-2.5 text-sm font-bold no-underline transition-colors hover:border-ink hover:text-ink"
              >
                Read the writing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-7 grid gap-3 border-t border-line pt-6 text-sm text-muted sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-upvote" />
                Browse by category
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-upvote" />
                Read clear explanations
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-upvote" />
                Like or dislike articles
              </li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
