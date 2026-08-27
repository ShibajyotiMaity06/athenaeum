import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import OrnateDivider from "@/components/OrnateDivider";
import GeoPrice from "@/components/GeoPrice";
import { getCurrentUser } from "@/lib/auth";
import { getStack } from "@/lib/content";
import { LEVELS } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ stack: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { stack: slug } = await params;
  const stack = getStack(slug);
  if (!stack) return { title: "Volume" };
  return {
    title: `${stack.name} interview questions — Basic, Medium & Hard`,
    description: `Open the ${stack.name} codex: ${stack.questionCount} curated interview questions across three degrees, with worked implementation folios. First five passages free.`,
    alternates: { canonical: `/library/${slug}` }
  };
}

export default async function StackPage({ params }: Params) {
  const { stack: slug } = await params;
  const stack = getStack(slug);
  if (!stack) notFound();

  const user = await getCurrentUser();
  const unlocked = Boolean(user && (user.access.granted || user.role === "admin"));

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-10">
        <Link href="/library" className="nav-link inline-flex items-center gap-2">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Reading Room
        </Link>
      </nav>

      <header className="text-center">
        <p className="kicker">Volume {stack.numeral}</p>
        <h1 className="font-heading mt-4 text-5xl">{stack.name}</h1>
        <p className="mt-4 font-body italic text-faded">
          {stack.questionCount} passages · graded across three degrees · first five free
        </p>
        <OrnateDivider className="mx-auto mt-8 w-72" />
      </header>

      <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
        {LEVELS.map((levelMeta) => {
          const stat = stack.levels.find((l) => l.slug === levelMeta.slug);
          if (!stat) return null;

          const href = unlocked
            ? `/library/${stack.slug}/${levelMeta.slug}`
            : `/library/${stack.slug}/${levelMeta.slug}?preview=1`;

          return (
            <Link
              key={levelMeta.slug}
              href={href}
              className="corner-flourish group relative flex flex-col rounded border border-grain bg-oak p-8 transition-all duration-300 hover:border-brass/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            >
              {!unlocked && (
                <span className="absolute right-5 top-5 flex items-center gap-1.5 rounded border border-grain bg-background px-2 py-1 font-display text-[9px] uppercase tracking-[0.2em] text-faded">
                  5 free inside
                </span>
              )}

              <p className="kicker">Degree {levelMeta.numeral}</p>
              <h2 className="font-heading mt-3 text-2xl">{levelMeta.label}</h2>

              <dl className="mt-5 space-y-2 font-body text-sm text-faded">
                <div className="flex justify-between border-b border-grain pb-2">
                  <dt>Theory passages</dt>
                  <dd className="text-parchment">{stat.theoryCount}</dd>
                </div>
                {stat.challengeCount > 0 && (
                  <div className="flex justify-between">
                    <dt>Implementation folios</dt>
                    <dd className="text-parchment">{stat.challengeCount}</dd>
                  </div>
                )}
              </dl>

              <p className="mt-5 flex-1 font-body italic leading-relaxed text-faded">
                {levelMeta.blurb}
              </p>

              <span className="mt-7 inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.22em] text-brass">
                {unlocked ? "Begin reading" : "Read free preview"}
                <ArrowLeft className="h-3.5 w-3.5 rotate-180 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
              </span>
              {unlocked ? null : (
                <span className="mt-3 flex items-center gap-1.5 font-body text-xs text-faded">
                  <Lock className="h-3 w-3" strokeWidth={1.75} /> full codex after the key
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {!unlocked && (
        <p className="mt-14 text-center font-body italic text-faded">
          Every degree opens fully with one contribution —{" "}
          <GeoPrice className="not-italic text-brass font-medium" /> —{" "}
          <Link href="/pricing" className="link-brass not-italic underline underline-offset-4">
            visit the ledger
          </Link>
          .
        </p>
      )}
    </>
  );
}
