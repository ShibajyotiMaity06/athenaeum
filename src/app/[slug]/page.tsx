import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Layers,
  Lock,
  Sparkles,
  Terminal,
  Zap
} from "lucide-react";
import TechHubTabs, { type TabLevelData } from "@/components/TechHubTabs";
import JsonLd from "@/components/JsonLd";
import GeoPrice from "@/components/GeoPrice";
import { getCurrentUser } from "@/lib/auth";
import {
  getAllHubParams,
  getDocument,
  getStack,
  isRolePillarSlug,
  isTechHubSlug,
  listStacks,
  prettify,
  slugToTech
} from "@/lib/content";
import {
  FREE_PREVIEW_COUNT,
  LEVELS,
  LEVEL_LABELS,
  ROLE_PILLARS,
  SITE
} from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isRolePillarSlug(slug)) {
    const role = ROLE_PILLARS[slug];
    const ogImageUrl = `${SITE.url}/api/og?slug=${slug}`;
    return {
      title: role.metaTitle,
      description: role.metaDescription,
      alternates: { canonical: `${SITE.url}/${slug}` },
      openGraph: {
        title: role.metaTitle,
        description: role.metaDescription,
        url: `${SITE.url}/${slug}`,
        siteName: SITE.name,
        type: "article",
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: role.title }]
      },
      twitter: {
        card: "summary_large_image",
        title: role.metaTitle,
        description: role.metaDescription,
        images: [ogImageUrl]
      }
    };
  }

  const tech = slugToTech(slug);
  const stack = getStack(tech);

  if (!stack) {
    return {
      title: "Interview Questions | DevPrep"
    };
  }

  const title = `${stack.name} Interview Questions and Answers — Easy, Medium & Hard | DevPrep`;
  const description = `${stack.questionCount}+ ${stack.name} technical interview questions and answers covering core concepts, practical patterns, edge cases, and runtime internals organized Easy to Hard.`;
  const ogImageUrl = `${SITE.url}/api/og?slug=${stack.hubSlug}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/${stack.hubSlug}` },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/${stack.hubSlug}`,
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

export default async function HubOrRolePage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const unlocked = Boolean(user && (user.access.granted || user.role === "admin"));

  /* ─────────────────────────────────────────────────────────────────────────
     1. ROLE-BASED PILLAR PAGE
     ───────────────────────────────────────────────────────────────────────── */
  if (isRolePillarSlug(slug)) {
    const role = ROLE_PILLARS[slug];
    const allStacks = listStacks();
    const roleStacks = allStacks.filter((s) => role.techSlugs.includes(s.slug));
    const totalRoleQuestions = roleStacks.reduce((acc, s) => acc + s.questionCount, 0);

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
          name: role.title,
          item: `${SITE.url}/${role.slug}`
        }
      ]
    };

    const collectionJsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: role.title,
      description: role.metaDescription,
      url: `${SITE.url}/${role.slug}`,
      mainEntity: {
        "@type": "ItemList",
        name: `${role.roleName} Technologies`,
        itemListElement: roleStacks.map((s, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: `${s.name} Interview Questions`,
          url: `${SITE.url}/${s.hubSlug}`
        }))
      }
    };

    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <JsonLd data={[breadcrumbsJsonLd, collectionJsonLd]} />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-bold">{role.shortTitle.toUpperCase()}</span>
        </nav>

        {/* Header Module */}
        <header className="industrial-card p-8 sm:p-12 mb-12 corner-screws">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="led-indicator led-green" />
              <span className="stamped-label-accent">CAREER TRACK PILLAR</span>
            </div>
            <div className="vent-slots">
              <div className="vent-slot" />
              <div className="vent-slot" />
              <div className="vent-slot" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
            {role.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed">
            {role.overview}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 pt-6 border-t border-[rgba(186,190,204,0.4)]">
            <div>
              <span className="stamped-label">CORE TECHNOLOGIES</span>
              <p className="font-mono text-2xl font-black text-[var(--text-primary)]">{roleStacks.length}</p>
            </div>
            <div className="h-8 w-px bg-[rgba(186,190,204,0.6)]" />
            <div>
              <span className="stamped-label">TOTAL QUESTIONS</span>
              <p className="font-mono text-2xl font-black text-[var(--accent)]">{totalRoleQuestions}+</p>
            </div>
            <div className="h-8 w-px bg-[rgba(186,190,204,0.6)]" />
            <div>
              <span className="stamped-label">LEVELS COVERED</span>
              <p className="font-mono text-2xl font-black text-[var(--text-primary)]">Easy · Medium · Hard</p>
            </div>
          </div>
        </header>

        {/* Key Focus Syllabus Section */}
        <section className="mb-14 industrial-recessed p-8">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[var(--accent)]" />
            <span>Mastery Syllabus for {role.roleName} Interviews</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
            {role.keyFocusAreas.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-[var(--bg-chassis)] rounded-lg border border-[var(--border-card)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-[var(--text-primary)]">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Technologies Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="stamped-label">TECHNOLOGY MODULES</span>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Required Technical Codices
              </h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roleStacks.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.hubSlug}`}
                className="industrial-card p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">
                      MODULE #{s.index.toString().padStart(2, "0")}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-recessed)] font-mono text-[var(--text-muted)]">
                      {s.questionCount} Questions
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {s.name}
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Easy, Medium &amp; Hard interview questions with model answers.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[rgba(186,190,204,0.4)] flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-1.5">
                    <span>EXPLORE QUESTIONS</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA / Unlocked Scholar Banner */}
        {unlocked ? (
          <div className="mt-16 text-center industrial-card p-10 border-emerald-500/30 bg-emerald-500/5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-xs font-bold uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Track Unlocked · Lifetime Scholar Access</span>
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">
              All {totalRoleQuestions}+ questions available in full
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)] max-w-lg mx-auto">
              Your account has permanent access to every question, architectural diagram, and code solution across the {role.roleName} syllabus.
            </p>
            <Link href="#technologies" className="btn-industrial btn-industrial-primary py-3.5 px-8 mt-6 inline-flex">
              <span>Explore Curriculum Modules</span>
            </Link>
          </div>
        ) : (
          <div className="mt-16 text-center industrial-card p-10">
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">
              Ready to pass your {role.roleName} interview?
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)] max-w-lg mx-auto">
              Get full access to all {totalRoleQuestions}+ questions and code solutions across the entire {role.roleName} track.
            </p>
            <Link href="/pricing" className="btn-industrial btn-industrial-primary py-3.5 px-8 mt-6 inline-flex">
              <span>Unlock Lifetime Access — <GeoPrice className="ml-1" /></span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
     2. TECHNOLOGY HUB PAGE (e.g. /react-interview-questions)
     ───────────────────────────────────────────────────────────────────────── */
  const tech = slugToTech(slug);
  const stack = getStack(tech);

  if (!stack) {
    notFound();
  }

  // Pre-load all 3 levels documents server-side for server-rendered tabs!
  const levelDataArray: TabLevelData[] = [];
  const levelDocs: Record<string, ReturnType<typeof getDocument>> = {};

  for (const levelMeta of LEVELS) {
    const doc = getDocument(tech, levelMeta.slug);
    levelDocs[levelMeta.slug] = doc;

    const totalQuestions = doc ? doc.total : 0;
    const freeQuestions = doc ? doc.theory.slice(0, FREE_PREVIEW_COUNT) : [];
    const lockedCount = unlocked ? 0 : Math.max(0, totalQuestions - freeQuestions.length);

    levelDataArray.push({
      slug: levelMeta.slug,
      label: levelMeta.label,
      sublabel: levelMeta.sublabel,
      totalQuestions,
      freeQuestions,
      lockedCount,
      levelUrl: `/${stack.hubSlug}/${levelMeta.slug}`
    });
  }

  // Related technologies and role pillars for rich internal linking
  const allStacks = listStacks();
  const relatedStacks = allStacks.filter((s) => stack.relatedSlugs.includes(s.slug)).slice(0, 6);
  const rolePillarsList = Object.values(ROLE_PILLARS).filter((r) => r.techSlugs.includes(stack.slug));

  // Structured Data (JSON-LD)
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
      }
    ]
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${stack.name} Interview Questions Preparation Track`,
    description: `${stack.questionCount}+ ${stack.name} technical interview questions organized across Easy, Medium, and Hard difficulty levels.`,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      sameAs: SITE.url
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT10H"
    }
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${stack.name} Difficulty Levels`,
    itemListElement: LEVELS.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${stack.name} Interview Questions (${l.label})`,
      url: `${SITE.url}/${stack.hubSlug}/${l.slug}`
    }))
  };

  const previewQuestions = Object.values(levelDocs)
    .filter(Boolean)
    .flatMap((d) => d?.theory?.slice(0, 3) || []);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: previewQuestions.slice(0, 8).map((q) => ({
      "@type": "Question",
      name: q.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.plainTextPreview?.substring(0, 250) || `${stack.name} interview question model answer.`
      }
    }))
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <JsonLd data={[breadcrumbsJsonLd, courseJsonLd, itemListJsonLd, faqJsonLd]} />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">
          HOME
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-bold">{stack.name.toUpperCase()}</span>
      </nav>

      {/* Header Panel */}
      <header className="industrial-card p-8 sm:p-10 mb-10 corner-screws">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="led-indicator led-green" />
            <span className="stamped-label-accent">DEVPREP CODEX · #{stack.index.toString().padStart(2, "0")}</span>
          </div>
          <div className="vent-slots">
            <div className="vent-slot" />
            <div className="vent-slot" />
            <div className="vent-slot" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
          {stack.name} Interview Questions
        </h1>

        <p className="mt-3 text-base sm:text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed">
          {stack.questionCount} curated questions graded from Foundations (Easy) to Practical Patterns (Medium) and Internals &amp; Architecture (Hard).
        </p>

        {/* Meta Stats Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[rgba(186,190,204,0.4)]">
          <div className="industrial-recessed p-3 text-center">
            <span className="stamped-label text-[10px]">TOTAL QUESTIONS</span>
            <p className="font-mono text-xl font-bold text-[var(--text-primary)]">{stack.questionCount}</p>
          </div>
          <div className="industrial-recessed p-3 text-center">
            <span className="stamped-label text-[10px]">THEORY QUESTIONS</span>
            <p className="font-mono text-xl font-bold text-[var(--accent)]">{stack.theoryCount}</p>
          </div>
          <div className="industrial-recessed p-3 text-center">
            <span className="stamped-label text-[10px]">IMPLEMENTATION FOLIOS</span>
            <p className="font-mono text-xl font-bold text-[var(--text-primary)]">{stack.challengeCount}</p>
          </div>
          <div className="industrial-recessed p-3 text-center">
            <span className="stamped-label text-[10px]">FREE QUESTIONS</span>
            <p className="font-mono text-xl font-bold text-emerald-600">5 / Level</p>
          </div>
        </div>
      </header>

      {/* ── Server-Rendered Tabs Component ── */}
      <section className="mb-14">
        <TechHubTabs
          technologyName={stack.name}
          technologySlug={stack.slug}
          levels={levelDataArray}
          unlocked={unlocked}
        />
      </section>

      {/* ── Direct Level Cards for Quick Navigation ── */}
      <section className="mb-14">
        <span className="stamped-label mb-2 block">DEDICATED LEVEL PAGES</span>
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
          Browse All {stack.name} Questions by Difficulty
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {LEVELS.map((lvl) => {
            const doc = levelDocs[lvl.slug];
            const count = doc ? doc.total : 0;
            return (
              <Link
                key={lvl.slug}
                href={`/${stack.hubSlug}/${lvl.slug}`}
                className="industrial-card p-5 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">{lvl.label}</span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">{count} Questions</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{lvl.blurb}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[rgba(186,190,204,0.4)] flex items-center justify-between text-xs font-mono font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                  <span>VIEW FULL LIST</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Related Technologies ── */}
      {relatedStacks.length > 0 && (
        <section className="mb-14 industrial-card p-8">
          <div className="mb-6">
            <span className="stamped-label">INTERNAL LINKING &amp; DEPENDENCIES</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Related Technologies to {stack.name}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {relatedStacks.map((rel) => (
              <Link
                key={rel.slug}
                href={`/${rel.hubSlug}`}
                className="p-4 rounded-xl bg-[var(--bg-recessed)] hover:bg-[var(--bg-chassis)] border border-[rgba(186,190,204,0.4)] transition-all flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                    {rel.name}
                  </h3>
                  <span className="text-xs text-[var(--text-muted)]">{rel.questionCount} Questions</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Role Pillars Associated with this Tech ── */}
      {rolePillarsList.length > 0 && (
        <section className="industrial-recessed p-6 mb-12">
          <span className="stamped-label mb-2 block">CAREER PATHWAYS</span>
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">
            {stack.name} is a key requirement for these engineering roles:
          </h2>
          <div className="flex flex-wrap gap-3">
            {rolePillarsList.map((rp) => (
              <Link
                key={rp.slug}
                href={`/${rp.slug}`}
                className="btn-industrial btn-industrial-secondary py-2 px-4 text-xs"
              >
                <span>{rp.roleName} Guide</span>
                <ArrowRight className="w-3 h-3 text-[var(--accent)]" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
