import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Layers,
  Lock,
  Search,
  Sparkles,
  Zap
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import GeoPrice from "@/components/GeoPrice";
import { getCurrentUser } from "@/lib/auth";
import {
  getAllLevelParams,
  getDocument,
  getStack,
  slugToTech,
  type Question
} from "@/lib/content";
import {
  FREE_PREVIEW_COUNT,
  LEVELS,
  LEVEL_LABELS,
  SITE,
  toContentLevel,
  toSeoLevel
} from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string; level: string }>;
}

export async function generateStaticParams() {
  return getAllLevelParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, level: rawLevel } = await params;
  const tech = slugToTech(slug);
  const stack = getStack(tech);
  const doc = getDocument(tech, rawLevel);

  if (!stack || !doc) {
    return { title: "Interview Questions | DevPrep" };
  }

  const seoLevel = toSeoLevel(rawLevel);
  const levelLabel = LEVELS.find((l) => l.slug === seoLevel)?.label || seoLevel;
  const title = `${stack.name} Interview Questions (${levelLabel}) | DevPrep`;
  const description = `${doc.total}+ ${stack.name} ${levelLabel} interview questions with comprehensive model answers and code examples. First 5 questions free.`;
  const canonicalUrl = `${SITE.url}/${stack.hubSlug}/${seoLevel}`;
  const ogImageUrl = `${SITE.url}/api/og?slug=${stack.hubSlug}&level=${seoLevel}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE.name,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl]
    }
  };
}

export default async function LevelPage({ params }: PageProps) {
  const { slug, level: rawLevel } = await params;
  const tech = slugToTech(slug);
  const stack = getStack(tech);
  const doc = getDocument(tech, rawLevel);

  if (!stack || !doc) {
    notFound();
  }

  const user = await getCurrentUser();
  const fullAccess = Boolean(user && (user.access.granted || user.role === "admin"));
  const seoLevel = toSeoLevel(rawLevel);
  const levelMeta = LEVELS.find((l) => l.slug === seoLevel)!;

  // Split theory and coding challenges
  const locked = !fullAccess;
  const visibleTheory: Question[] = locked
    ? doc.theory.slice(0, FREE_PREVIEW_COUNT)
    : doc.theory;
  const visibleChallenges: Question[] = fullAccess ? doc.challenges : [];
  const lockedTheoryCount = locked ? Math.max(0, doc.theory.length - FREE_PREVIEW_COUNT) : 0;
  const lockedChallengesCount = locked ? doc.challenges.length : 0;
  const totalLocked = lockedTheoryCount + lockedChallengesCount;

  // Sideways links to the other 2 levels
  const siblingLevels = LEVELS.filter((l) => l.slug !== seoLevel);

  // Structured Data: Breadcrumbs + FAQPage strictly for free visible questions!
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${stack.name} Interview Questions`,
        item: `${SITE.url}/${stack.hubSlug}`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: levelMeta.label,
        item: `${SITE.url}/${stack.hubSlug}/${seoLevel}`
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: visibleTheory.map((q) => ({
      "@type": "Question",
      name: q.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.plainTextPreview || q.title
      }
    }))
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <JsonLd data={[breadcrumbsJsonLd, faqJsonLd]} />

      {/* ── Breadcrumb Navigation ── */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">
          HOME
        </Link>
        <span>/</span>
        <Link href={`/${stack.hubSlug}`} className="hover:text-[var(--accent)] transition-colors">
          {stack.name.toUpperCase()}
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-bold">{levelMeta.label.toUpperCase()}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        {/* ── Main Content Column ── */}
        <div>
          {/* Header Panel */}
          <header className="industrial-card p-8 sm:p-10 mb-10 corner-screws">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-green" />
                <span className="stamped-label-accent">{stack.name.toUpperCase()} · {levelMeta.label.toUpperCase()} CODEX</span>
              </div>
              <div className="vent-slots">
                <div className="vent-slot" />
                <div className="vent-slot" />
                <div className="vent-slot" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)]">
              {stack.name} Interview Questions — {levelMeta.label}
            </h1>

            <p className="mt-3 text-base text-[var(--text-muted)] leading-relaxed">
              {levelMeta.blurb}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 pt-6 border-t border-[rgba(186,190,204,0.4)]">
              <span className="px-3 py-1 rounded bg-[var(--bg-recessed)] font-mono text-xs font-bold text-[var(--text-primary)]">
                {doc.theory.length} Theory Questions
              </span>
              {doc.challenges.length > 0 && (
                <span className="px-3 py-1 rounded bg-[var(--bg-recessed)] font-mono text-xs font-bold text-[var(--text-primary)]">
                  {doc.challenges.length} Implementation Folios
                </span>
              )}
              {locked ? (
                <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                  5 Free Model Answers
                </span>
              ) : (
                <span className="px-3 py-1 rounded bg-rose-100 text-rose-800 font-mono text-xs font-bold">
                  Full Access Unlocked
                </span>
              )}
            </div>
          </header>

          {/* ── Questions List ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="stamped-label">THEORY QUESTIONS &amp; SOLUTIONS</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Showing {visibleTheory.length} of {doc.theory.length} questions
              </span>
            </div>

            {visibleTheory.map((q, idx) => (
              <details
                key={q.id}
                id={`q-${q.num || idx + 1}`}
                className="tech-question group rounded-xl bg-[var(--bg-chassis)] border border-[var(--border-card)] shadow-[var(--shadow-card)] p-5 hover:shadow-[var(--shadow-floating)] transition-all scroll-mt-24"
                open={idx < 2}
              >
                <summary className="font-sans font-semibold text-base sm:text-lg text-[var(--text-primary)] select-none">
                  <span className="font-mono text-xs font-bold text-[var(--accent)] min-w-[2.5rem] px-2 py-1 rounded bg-[var(--bg-recessed)] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                    Q{q.num || idx + 1}
                  </span>
                  <span className="q-title flex-1 leading-snug">{q.title}</span>
                  <ChevronDown className="q-icon w-5 h-5 shrink-0" />
                </summary>

                <div className="mt-5 pt-4 border-t border-[rgba(186,190,204,0.4)] pl-2 sm:pl-10">
                  <div
                    className="manuscript"
                    dangerouslySetInnerHTML={{ __html: q.html }}
                  />
                </div>
              </details>
            ))}

            {/* Implementation challenges if unlocked */}
            {visibleChallenges.length > 0 && (
              <div className="mt-10 pt-8 border-t border-[rgba(186,190,204,0.6)]">
                <span className="stamped-label mb-4 block">PRACTICAL CODING FOLIOS</span>
                <div className="space-y-4">
                  {visibleChallenges.map((c, idx) => (
                    <details
                      key={c.id}
                      id={`c-${idx + 1}`}
                      className="tech-question group rounded-xl bg-[var(--bg-chassis)] border border-[var(--border-card)] shadow-[var(--shadow-card)] p-5"
                    >
                      <summary className="font-sans font-semibold text-base text-[var(--text-primary)] select-none">
                        <span className="font-mono text-xs font-bold text-[var(--accent)] min-w-[2.5rem] px-2 py-1 rounded bg-[var(--bg-recessed)]">
                          CODE #{idx + 1}
                        </span>
                        <span className="q-title flex-1 leading-snug">{c.title}</span>
                        <ChevronDown className="q-icon w-5 h-5 shrink-0" />
                      </summary>
                      <div className="mt-5 pt-4 border-t border-[rgba(186,190,204,0.4)] pl-2 sm:pl-10">
                        <div
                          className="manuscript"
                          dangerouslySetInnerHTML={{ __html: c.html }}
                        />
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Locked State Upgrade Banner ── */}
          {locked && totalLocked > 0 && (
            <div className="mt-12 p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-[#2d3436] to-[#1e272e] text-white shadow-[var(--shadow-floating)] border border-[#1e272e] text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[rgba(255,71,87,0.2)] text-[var(--accent)] mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Unlock the remaining {totalLocked} {stack.name} ({levelMeta.label}) questions
              </h2>
              <p className="mt-3 text-sm text-[#a8b2d1] max-w-xl mx-auto leading-relaxed">
                You&apos;ve completed the 5 free sample questions. Get unrestricted lifetime access to every question, model answer, implementation challenge, and all 27+ technologies for a single payment.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/pricing"
                  className="btn-industrial btn-industrial-primary py-4 px-10 text-sm w-full sm:w-auto"
                >
                  <span>Unlock Everything — <GeoPrice className="ml-1" /></span>
                </Link>
                <Link
                  href={`/login?next=${encodeURIComponent(`/${stack.hubSlug}/${seoLevel}`)}`}
                  className="btn-industrial btn-industrial-secondary py-4 px-8 text-sm w-full sm:w-auto"
                >
                  <span>Already Enrolled? Sign In</span>
                </Link>
              </div>
              <p className="mt-4 text-xs font-mono text-[#a8b2d1]">
                One-time settlement (<GeoPrice />) · Lifetime access · Zero subscription
              </p>
            </div>
          )}

          {/* ── Sideways Navigation to Other Levels ── */}
          <section className="mt-16 pt-10 border-t border-[rgba(186,190,204,0.6)]">
            <span className="stamped-label mb-2 block">CROSS-DIFFICULTY NAVIGATION</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
              Continue Preparing {stack.name}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {siblingLevels.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={`/${stack.hubSlug}/${sibling.slug}`}
                  className="industrial-card p-5 group flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">
                      {sibling.label.toUpperCase()} LEVEL
                    </span>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{sibling.sublabel}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Desktop Quick-Jump Sidebar ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Table of contents panel */}
            <div className="industrial-card p-5">
              <span className="stamped-label mb-3 block">ON THIS PAGE</span>
              <nav aria-label="Question table of contents" className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-2">
                {visibleTheory.map((q, idx) => (
                  <a
                    key={q.id}
                    href={`#q-${q.num || idx + 1}`}
                    className="block text-xs text-[var(--text-muted)] hover:text-[var(--accent)] truncate py-1 transition-colors font-mono"
                    title={q.title}
                  >
                    <span className="text-[var(--accent)] font-bold mr-1.5">Q{q.num || idx + 1}</span>
                    {q.title}
                  </a>
                ))}
              </nav>
            </div>

            {/* Tech Hub & Levels Navigation */}
            <div className="industrial-recessed p-5">
              <span className="stamped-label mb-2 block">TECHNOLOGY HUB</span>
              <Link
                href={`/${stack.hubSlug}`}
                className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All {stack.name} Questions</span>
              </Link>
              <div className="mt-4 pt-3 border-t border-[rgba(186,190,204,0.5)] flex flex-col gap-1.5">
                {LEVELS.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/${stack.hubSlug}/${l.slug}`}
                    className={`text-xs py-1 px-2 rounded font-mono transition-colors ${
                      l.slug === seoLevel
                        ? "bg-[var(--bg-chassis)] font-bold text-[var(--accent)] shadow-[var(--shadow-recessed)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {l.label} ({stack.levels.find((stat) => stat.seoSlug === l.slug)?.theoryCount || 0})
                  </Link>
                ))}
              </div>
            </div>

            {/* Lifetime Access Upgrade Mini-card */}
            {locked && (
              <div className="industrial-card p-5 text-center">
                <span className="stamped-label-accent">LIFETIME ACCESS</span>
                <p className="font-mono text-xl font-bold mt-1 text-[var(--text-primary)]">
                  <GeoPrice />
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  All 3,600+ questions unlocked
                </p>
                <Link
                  href="/pricing"
                  className="btn-industrial btn-industrial-primary py-2.5 px-4 text-xs w-full mt-3"
                >
                  <span>Unlock Full Bank</span>
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
