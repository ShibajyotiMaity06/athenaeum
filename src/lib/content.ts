import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js/lib/common";
import {
  LEVELS,
  RELATED_TECH_MAP,
  ROLE_PILLARS,
  toContentLevel,
  toSeoLevel,
  type SeoLevelSlug
} from "@/lib/site";

/* ── Markdown rendering (server-only) ─────────────────────────────────────── */

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    }
  })
);

marked.use({
  renderer: {
    link(token) {
      const href = token.href || "#";
      const title = token.title ? ` title="${token.title}"` : "";
      const text = token.text || token.raw || href;
      const isExternal = href.startsWith("http://") || href.startsWith("https://");
      
      if (isExternal) {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer"${title}>${text}</a>`;
      }
      return `<a href="${href}"${title}>${text}</a>`;
    }
  }
});

marked.setOptions({ gfm: true, breaks: false });

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

/* ── Content discovery ────────────────────────────────────────────────────── */

const CONTENT_DIR = join(process.cwd(), "content");

export const PRETTY_NAMES: Record<string, string> = {
  "computer-networks": "Computer Networks",
  "context-api": "Context API",
  css: "CSS",
  dbms: "DBMS",
  django: "Django",
  docker: "Docker",
  express: "Express.js",
  fastapi: "FastAPI",
  hld: "System Design · HLD",
  html: "HTML",
  java: "Java",
  javascript: "JavaScript",
  lld: "Object Design · LLD",
  mongodb: "MongoDB",
  nextjs: "Next.js",
  node: "Node.js",
  oops: "OOPs",
  os: "Operating Systems",
  postgresql: "PostgreSQL",
  prisma: "Prisma",
  react: "React",
  redis: "Redis",
  "spring-boot": "Spring Boot",
  sql: "SQL",
  typescript: "TypeScript",
  redux: "Redux",
  zustand: "Zustand",
  "frontend-system-design": "Frontend System Design"
};

export function prettify(slug: string): string {
  return (
    PRETTY_NAMES[slug] ||
    slug
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

export interface Question {
  id: string;
  num: number;
  label: string;
  title: string;
  plainTextPreview?: string;
  html: string;
}

export interface LevelStat {
  slug: string; // "basic" | "medium" | "hard"
  seoSlug: "easy" | "medium" | "hard";
  theoryCount: number;
  challengeCount: number;
}

export interface StackSummary {
  slug: string; // e.g. "react"
  hubSlug: string; // e.g. "react-interview-questions"
  name: string;
  index: number;
  levels: LevelStat[];
  questionCount: number;
  theoryCount: number;
  challengeCount: number;
  relatedSlugs: string[];
  roleSlugs: string[];
}

export interface ParsedDocument {
  stackSlug: string;
  stackName: string;
  level: string; // "basic" | "medium" | "hard"
  seoLevel: "easy" | "medium" | "hard";
  levelLabel: string;
  theory: Question[];
  challenges: Question[];
  total: number;
}

const LEVEL_FILES = ["basic", "medium", "hard"] as const;

function readRaw(stack: string, level: string): string | null {
  const file = join(CONTENT_DIR, stack, `${level}.md`);
  if (!existsSync(file)) return null;
  return readFileSync(file, "utf-8").replace(/\r\n/g, "\n");
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[#*_~>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a section of markdown into ###-level entries with rendered bodies. */
function parseEntries(sectionMd: string): Question[] {
  const lines = sectionMd.split("\n");
  const headings: { line: number; title: string }[] = [];

  lines.forEach((line, i) => {
    const match = /^###\s+(.+?)\s*$/.exec(line);
    if (match) headings.push({ line: i, title: match[1] });
  });

  const entries: Question[] = [];
  headings.forEach((heading, idx) => {
    const end = idx + 1 < headings.length ? headings[idx + 1].line : lines.length;
    const body = lines.slice(heading.line + 1, end).join("\n").trim();
    const numMatch = /^(?:Q)?(\d+)\b/.exec(heading.title);
    const num = numMatch ? parseInt(numMatch[1], 10) : idx + 1;
    const cleanTitle = heading.title.replace(/^(?:Q)?\d+[.:)]?\s*/, "").replace(/^\d+\.\s*/, "");
    
    entries.push({
      id: `entry-${num}-${idx}`,
      num,
      label: heading.title,
      title: cleanTitle,
      plainTextPreview: stripMarkdown(body).slice(0, 200),
      html: renderMarkdown(body || "_Answer forthcoming._")
    });
  });
  return entries;
}

function splitTheoryAndChallenges(raw: string): { theory: string; challenges: string } {
  const codingIdx = raw.search(/^##\s+Coding.*$/m);
  if (codingIdx === -1) {
    const theoryIdx = raw.search(/^##\s+/m);
    const start = theoryIdx === -1 ? 0 : raw.indexOf("\n", theoryIdx) + 1;
    return { theory: raw.slice(start), challenges: "" };
  }
  const theoryHead = raw.search(/^##\s+Theory.*$/m);
  const theoryStart = theoryHead === -1 ? 0 : raw.indexOf("\n", theoryHead) + 1;
  return {
    theory: raw.slice(theoryStart, codingIdx),
    challenges: raw.slice(codingIdx).replace(/^##\s+Coding.*$\n?/m, "")
  };
}

function countEntries(sectionMd: string): number {
  const matches = sectionMd.match(/^###\s+/gm);
  return matches ? matches.length : 0;
}

const summaryCache = new Map<string, StackSummary>();
let orderedCache: StackSummary[] | null = null;

/**
 * All stacks sorted alphabetically.
 */
export function listStacks(): StackSummary[] {
  if (orderedCache) return orderedCache;
  if (!existsSync(CONTENT_DIR)) {
    orderedCache = [];
    return orderedCache;
  }

  const slugs = readdirSync(CONTENT_DIR).filter((name) => {
    try {
      return statSync(join(CONTENT_DIR, name)).isDirectory();
    } catch {
      return false;
    }
  });

  const summaries: StackSummary[] = slugs.map((slug) => {
    const cached = summaryCache.get(slug);
    if (cached) return cached;

    const levels: LevelStat[] = [];
    for (const level of LEVEL_FILES) {
      const raw = readRaw(slug, level);
      if (!raw) continue;
      const { theory, challenges } = splitTheoryAndChallenges(raw);
      levels.push({
        slug: level,
        seoSlug: toSeoLevel(level),
        theoryCount: countEntries(theory),
        challengeCount: countEntries(challenges)
      });
    }

    const rel = RELATED_TECH_MAP[slug] || { related: [], roles: [] };

    const totalTheory = levels.reduce((sum, l) => sum + l.theoryCount, 0);
    const totalChallenge = levels.reduce((sum, l) => sum + l.challengeCount, 0);

    const summary: StackSummary = {
      slug,
      hubSlug: `${slug}-interview-questions`,
      name: prettify(slug),
      index: 0,
      levels,
      questionCount: totalTheory + totalChallenge,
      theoryCount: totalTheory,
      challengeCount: totalChallenge,
      relatedSlugs: rel.related,
      roleSlugs: rel.roles
    };
    summaryCache.set(slug, summary);
    return summary;
  });

  summaries.sort((a, b) => a.name.localeCompare(b.name));
  summaries.forEach((s, i) => {
    s.index = i + 1;
  });

  orderedCache = summaries;
  return orderedCache;
}

/** Convenience split for landing-page sections. */
export function listStacksSplit(): { core: StackSummary[]; annex: StackSummary[] } {
  const all = listStacks();
  return {
    core: all.slice(0, 18),
    annex: all.slice(18)
  };
}

export function getStack(rawSlug: string): StackSummary | null {
  const techSlug = slugToTech(rawSlug);
  return listStacks().find((s) => s.slug === techSlug) ?? null;
}

const docCache = new Map<string, ParsedDocument>();

export function getDocument(rawStackSlug: string, rawLevel: string): ParsedDocument | null {
  const stackSlug = slugToTech(rawStackSlug);
  const contentLevel = toContentLevel(rawLevel);
  const seoLevel = toSeoLevel(contentLevel);
  const key = `${stackSlug}/${contentLevel}`;

  if (docCache.has(key)) return docCache.get(key)!;

  const raw = readRaw(stackSlug, contentLevel);
  if (!raw) return null;

  const stack = getStack(stackSlug);
  const { theory, challenges } = splitTheoryAndChallenges(raw);

  const levelMeta = LEVELS.find((l) => l.slug === seoLevel);

  const doc: ParsedDocument = {
    stackSlug,
    stackName: stack?.name ?? prettify(stackSlug),
    level: contentLevel,
    seoLevel,
    levelLabel: levelMeta ? levelMeta.label : prettify(contentLevel),
    theory: parseEntries(theory),
    challenges: parseEntries(challenges),
    total: 0
  };
  doc.total = doc.theory.length + doc.challenges.length;
  docCache.set(key, doc);
  return doc;
}

export function getLibraryStats() {
  const stacks = listStacks();
  return {
    technologies: stacks.length,
    volumes: stacks.length,
    codices: stacks.reduce((n, s) => n + s.levels.length, 0),
    questions: stacks.reduce((n, s) => n + s.theoryCount, 0),
    challenges: stacks.reduce((n, s) => n + s.challengeCount, 0),
    total: stacks.reduce((n, s) => n + s.questionCount, 0)
  };
}

/* ── SEO Route Mapping Helpers ────────────────────────────────────────────── */

/**
 * Converts a URL slug or raw tech slug (e.g. "react-interview-questions" or "react")
 * into canonical technology key ("react").
 */
export function slugToTech(slug: string): string {
  if (slug.endsWith("-interview-questions")) {
    return slug.replace(/-interview-questions$/, "");
  }
  return slug;
}

/**
 * Converts a tech key (e.g. "react") to URL slug ("react-interview-questions").
 */
export function techToHubSlug(techSlug: string): string {
  return `${techSlug}-interview-questions`;
}

/**
 * Checks if a route slug is a role pillar page.
 */
export function isRolePillarSlug(slug: string): boolean {
  return slug in ROLE_PILLARS;
}

/**
 * Checks if a route slug is a valid tech hub.
 */
export function isTechHubSlug(slug: string): boolean {
  const tech = slugToTech(slug);
  return listStacks().some((s) => s.slug === tech);
}

/**
 * Returns all static params for hub pages and role pages.
 * Used in generateStaticParams for `app/[slug]/page.tsx`.
 */
export function getAllHubParams(): { slug: string }[] {
  const techParams = listStacks().map((s) => ({
    slug: s.hubSlug
  }));
  const roleParams = Object.keys(ROLE_PILLARS).map((slug) => ({
    slug
  }));
  return [...techParams, ...roleParams];
}

/**
 * Returns all static params for level pages.
 * Used in generateStaticParams for `app/[slug]/[level]/page.tsx`.
 */
export function getAllLevelParams(): { slug: string; level: string }[] {
  const params: { slug: string; level: string }[] = [];
  const stacks = listStacks();

  for (const stack of stacks) {
    for (const level of ["easy", "medium", "hard"] as const) {
      params.push({
        slug: stack.hubSlug,
        level
      });
    }
  }

  return params;
}
