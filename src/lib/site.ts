export const SITE = {
  name: "Athenaeum",
  tagline: "The Developer's Codex",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
  description:
    "A gated scholarly library of engineering interview codices — 27 volumes, 3,600+ curated questions across web, systems and databases, graded from Foundations to Advanced. Read five questions free in every codex; one small key unlocks all.",
  established: "MMXXVI",
  email: "warden@athenaeum.dev"
} as const;

/** One-time, lifetime prices. Amounts are in minor units (paise / cents). */
export const PRICING = {
  INR: { amount: 39900, display: "₹399", note: "India — inclusive of all taxes" },
  USD: { amount: 900, display: "$9", note: "International — one-time payment" }
} as const;

export type CurrencyCode = keyof typeof PRICING;

/**
 * Annex volumes — the "More" wing of the library.
 * Core volumes keep Roman numerals I–XIX; the annex continues XX onward.
 */
export const ANNEX_SLUGS = new Set([
  "redux",
  "context-api",
  "django",
  "fastapi",
  "spring-boot",
  "postgresql",
  "redis",
  "prisma"
]);

export const LEVELS = [
  { slug: "basic", label: "Foundations", numeral: "I", blurb: "Core concepts, definitions and first principles." },
  { slug: "medium", label: "Intermediate", numeral: "II", blurb: "Mechanisms, patterns, trade-offs and practice." },
  { slug: "hard", label: "Advanced", numeral: "III", blurb: "Internals, architecture, failure modes and depth." }
] as const;

export type LevelSlug = (typeof LEVELS)[number]["slug"];

export function isLevelSlug(value: string): value is LevelSlug {
  return LEVELS.some((l) => l.slug === value);
}

export const LEVEL_LABEL: Record<string, string> = {
  basic: "Basic · Foundations",
  medium: "Medium · Intermediate",
  hard: "Hard · Advanced"
};

/** How many theory passages any visitor may read before the seal appears. */
export const FREE_PREVIEW_COUNT = 5;
