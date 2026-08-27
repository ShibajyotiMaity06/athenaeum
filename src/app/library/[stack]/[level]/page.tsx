import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Lock, ScrollText } from "lucide-react";
import ReaderClient, { type ReaderGroup } from "@/components/ReaderClient";
import GeoPrice from "@/components/GeoPrice";
import { getCurrentUser } from "@/lib/auth";
import { getDocument, getStack, type Question } from "@/lib/content";
import { FREE_PREVIEW_COUNT, PRICING, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ stack: string; level: string }>;
}

function levelLabel(level: string): string {
  return level === "basic"
    ? "Basic · Foundations"
    : level === "medium"
      ? "Medium · Intermediate"
      : "Hard · Advanced";
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { stack: slug, level } = await params;
  const stack = getStack(slug);
  const doc = getDocument(slug, level);
  if (!stack || !doc) return { title: "Codex" };

  const label = levelLabel(level);
  const previewTitles = doc.theory.slice(0, FREE_PREVIEW_COUNT).map((q) => q.title);

  return {
    title: `${stack.name} ${label.split("·")[0].trim()} interview questions`,
    description:
      `Read the first ${Math.min(FREE_PREVIEW_COUNT, doc.theory.length)} of ${doc.theory.length} ` +
      `${stack.name} ${label} questions free — including: ${previewTitles.join("; ")}. ` +
      `The full codex and implementation folios open with Scholar access.`,
    alternates: { canonical: `/library/${slug}/${level}` },
    robots: { index: true, follow: true }
  };
}

export default async function ReaderPage({ params }: Params) {
  const { stack: slug, level } = await params;
  const stack = getStack(slug);
  const doc = getDocument(slug, level);
  if (!stack || !doc) notFound();

  const user = await getCurrentUser();
  const fullAccess = Boolean(user && (user.access.granted || user.role === "admin"));

  /* ── Free preview: first five theory passages for every visitor ── */
  const locked = !fullAccess;
  const visibleTheory: Question[] = locked
    ? doc.theory.slice(0, FREE_PREVIEW_COUNT)
    : doc.theory;
  const visibleFolio: Question[] = fullAccess ? doc.challenges : [];

  /* Stable anchor ids */
  const theory = visibleTheory.map((q, i) => ({ ...q, id: `theory-${i + 1}` }));
  const folio = visibleFolio.map((q, i) => ({ ...q, id: `folio-${i + 1}` }));

  const groups: ReaderGroup[] = [];
  if (theory.length)
    groups.push({
      key: "part-theory",
      heading: "Theory Questions & Answers",
      numeral: "Part I",
      entries: theory
    });
  if (folio.length)
    groups.push({
      key: "part-folio",
      heading: "Coding & Implementation Challenges",
      numeral: "Part II",
      entries: folio
    });

  return (
    <div className="grid gap-12 xl:grid-cols-[250px_minmax(0,1fr)]">
      {/* ── Table of contents (desktop) ── */}
      <aside className="hidden xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
          <p className="kicker">Contents</p>
          <nav aria-label="Codex contents" className="mt-6 grid gap-6">
            {groups.map((g) => (
              <div key={g.key}>
                <p className="font-display text-[10px] uppercase tracking-[0.22em] text-faded">
                  {g.numeral} — {g.heading}
                </p>
                <ul className="mt-3 grid gap-1.5 border-l border-grain pl-4">
                  {g.entries.map((e) => (
                    <li key={e.id}>
                      <a
                        href={`#${e.id}`}
                        className="block truncate font-body text-[13.5px] text-faded transition-colors hover:text-brass"
                        title={e.title}
                      >
                        <span className="text-brass/70">{e.num.toString().padStart(2, "0")}</span>{" "}
                        {e.title}
                      </a>
                    </li>
                  ))}
                  {locked && g.key === "part-theory" && (
                    <li>
                      <Link
                        href="/pricing"
                        className="flex items-center gap-1.5 font-body text-[13.5px] italic text-brass/80 hover:text-brass"
                      >
                        <Lock className="h-3 w-3" strokeWidth={1.75} />
                        {doc.theory.length - FREE_PREVIEW_COUNT} more · unlock
                      </Link>
                    </li>
                  )}
                </ul>
                {locked && g.key !== "part-theory" && doc.challenges.length > 0 && (
                  <p className="mt-3 flex items-center gap-1.5 pl-4 font-body text-[13px] italic text-brass/70">
                    <Lock className="h-3 w-3" strokeWidth={1.75} />
                    Implementation folio — sealed
                  </p>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* ── The codex ── */}
      <article>
        <nav
          aria-label="Breadcrumb"
          className="mb-10 flex flex-wrap items-center gap-2 font-body text-sm text-faded"
        >
          <Link href="/library" className="link-brass inline-flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Reading Room
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/library/${slug}`} className="link-brass">
            {doc.stackName}
          </Link>
        </nav>

        <header>
          <p className="kicker">
            Volume {stack.numeral} · {levelLabel(doc.level)}
          </p>
          <h1 className="font-heading mt-4 text-4xl leading-tight sm:text-5xl">{doc.stackName}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-body text-sm text-faded">
            <span>{doc.theory.length} theory passages</span>
            {doc.challenges.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <ScrollText className="h-4 w-4 text-brass" strokeWidth={1.5} />
                {doc.challenges.length} implementation folios
              </span>
            )}
            <span aria-hidden="true" className="text-grain">✶</span>
            {locked ? (
              <span className="inline-flex items-center gap-1.5 text-brass">
                <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                Free preview · {Math.min(FREE_PREVIEW_COUNT, doc.theory.length)} of{" "}
                {doc.total} passages
              </span>
            ) : (
              <span className="italic">Full codex · read at leisure — nothing expires</span>
            )}
          </div>
          <div className="ornate-divider mt-9" aria-hidden="true" />
        </header>

        <div className="mt-12">
          <ReaderClient groups={groups} />

          {/* ── The seal, for those on preview ── */}
          {locked && (
            <div className="ornate-frame mt-16 rounded border border-brass/50 bg-oak p-10 text-center sm:p-14">
              {!user ? (
                <>
                  <Lock className="mx-auto h-8 w-8 text-brass" strokeWidth={1.25} />
                  <h2 className="font-heading mt-6 text-3xl sm:text-4xl">
                    You&apos;ve reached the seal
                  </h2>
                  <p className="mx-auto mt-4 max-w-lg leading-relaxed text-faded">
                    The remaining{" "}
                    <strong className="text-parchment">
                      {doc.theory.length - FREE_PREVIEW_COUNT + doc.challenges.length} passages
                    </strong>{" "}
                    of this codex — plus all {SITE.name}&apos;s other volumes — open with one
                    small contribution.
                  </p>
                  <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="/register?next=%2Fpricing" className="btn btn-primary h-13 px-9 py-4">
                      Enrol &amp; unlock — <GeoPrice className="ml-1" />
                    </Link>
                    <Link
                      href={`/login?next=${encodeURIComponent(`/library/${slug}/${level}`)}`}
                      className="btn btn-secondary h-12 px-7"
                    >
                      Already inscribed? Sign in
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="wax-seal mx-auto flex h-16 w-16 rotate-3 items-center justify-center rounded-full"
                  >
                    <Lock className="h-6 w-6 text-parchment" strokeWidth={1.25} />
                  </span>
                  <h2 className="font-heading mt-7 text-3xl sm:text-4xl">
                    The rest waits behind the seal
                  </h2>
                  <p className="mx-auto mt-4 max-w-lg leading-relaxed text-faded">
                    You&apos;ve read your five free passages here. Scholar access opens this
                    codex completely — and all other volumes — with a single payment of{" "}
                    <GeoPrice className="font-semibold text-brass" />.
                  </p>
                  <Link href="/pricing" className="btn btn-primary mt-9 h-13 px-10 py-4">
                    Unlock everything — <GeoPrice className="ml-1" />
                  </Link>
                </>
              )}
              <p className="ornate-divider mx-auto mt-10 w-56" aria-hidden="true" />
              <p className="mt-6 font-body text-sm italic text-faded">
                One payment · lifetime rights · every current &amp; future volume
              </p>
            </div>
          )}

          {/* ── End-matter (full access only) ── */}
          {fullAccess && (
            <footer className="mt-20 rounded border border-grain bg-oak/50 p-8 text-center">
              <p className="font-heading text-2xl">
                End of the {levelLabel(doc.level).split("·")[0].trim()} degree
              </p>
              <p className="mx-auto mt-3 max-w-md italic leading-relaxed text-faded">
                The other degrees of this volume hold deeper water. Return to the shelf when ready.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                {(["basic", "medium", "hard"] as const)
                  .filter((l) => l !== doc.level)
                  .map((l) => (
                    <Link
                      key={l}
                      href={`/library/${slug}/${l}`}
                      className="btn btn-secondary h-11 px-6"
                    >
                      {l === "basic" ? "Foundations" : l === "medium" ? "Intermediate" : "Advanced"} →
                    </Link>
                  ))}
              </div>
            </footer>
          )}
        </div>
      </article>
    </div>
  );
}
