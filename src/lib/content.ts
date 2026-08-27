import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js/lib/common";
import { toRoman } from "@/lib/roman";
import { ANNEX_SLUGS } from "@/lib/site";

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
marked.setOptions({ gfm: true, breaks: false });

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

/* ── Content discovery ────────────────────────────────────────────────────── */

const CONTENT_DIR = join(process.cwd(), "content");

const PRETTY_NAMES: Record<string, string> = {
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
  zustand: "Zustand"
};

function prettify(slug: string): string {
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
  html: string;
}

export interface LevelStat {
  slug: string;
  theoryCount: number;
  challengeCount: number;
}

export interface StackSummary {
  slug: string;
  name: string;
  numeral: string;
  index: number;
  levels: LevelStat[];
  questionCount: number;
}

export interface ParsedDocument {
  stackSlug: string;
  stackName: string;
  level: string;
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
    entries.push({
      id: `entry-${num}-${idx}`,
      num,
      label: heading.title,
      title: heading.title.replace(/^(?:Q)?\d+[.:)]?\s*/, "").replace(/^\d+\.\s*/, ""),
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

const summaryCache = new Map<string, StackSummary>();
let orderedCache: StackSummary[] | null = null;

/**
 * All stacks, core collection first (alphabetical, numbered I…XIX),
 * then the Annex wing (numbered onward from XX).
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
        theoryCount: countEntries(theory),
        challengeCount: countEntries(challenges)
      });
    }
    const summary: StackSummary = {
      slug,
      name: prettify(slug),
      numeral: "",
      index: 0,
      levels,
      questionCount: levels.reduce((sum, l) => sum + l.theoryCount + l.challengeCount, 0)
    };
    summaryCache.set(slug, summary);
    return summary;
  });

  summaries.sort((a, b) => a.name.localeCompare(b.name));

  const core = summaries.filter((s) => !ANNEX_SLUGS.has(s.slug));
  const annex = summaries.filter((s) => ANNEX_SLUGS.has(s.slug));
  core.forEach((s, i) => {
    s.index = i + 1;
    s.numeral = toRoman(i + 1);
  });
  annex.forEach((s, i) => {
    s.index = core.length + i + 1;
    s.numeral = toRoman(core.length + i + 1);
  });

  orderedCache = [...core, ...annex];
  return orderedCache;
}

/** Convenience split for landing-page sections. */
export function listStacksSplit(): { core: StackSummary[]; annex: StackSummary[] } {
  const all = listStacks();
  return {
    core: all.filter((s) => !ANNEX_SLUGS.has(s.slug)),
    annex: all.filter((s) => ANNEX_SLUGS.has(s.slug))
  };
}

function countEntries(sectionMd: string): number {
  const matches = sectionMd.match(/^###\s+/gm);
  return matches ? matches.length : 0;
}

export function getStack(slug: string): StackSummary | null {
  return listStacks().find((s) => s.slug === slug) ?? null;
}

const docCache = new Map<string, ParsedDocument>();

export function getDocument(stackSlug: string, level: string): ParsedDocument | null {
  const key = `${stackSlug}/${level}`;
  if (docCache.has(key)) return docCache.get(key)!;

  const raw = readRaw(stackSlug, level);
  if (!raw) return null;

  const stack = getStack(stackSlug);
  const { theory, challenges } = splitTheoryAndChallenges(raw);

  const doc: ParsedDocument = {
    stackSlug,
    stackName: stack?.name ?? prettify(stackSlug),
    level,
    levelLabel:
      level === "basic" ? "Foundations" : level === "medium" ? "Intermediate" : "Advanced",
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
    volumes: stacks.length,
    codices: stacks.reduce((n, s) => n + s.levels.length, 0),
    questions: stacks.reduce(
      (n, s) => n + s.levels.reduce((m, l) => m + l.theoryCount, 0),
      0
    ),
    challenges: stacks.reduce(
      (n, s) => n + s.levels.reduce((m, l) => m + l.challengeCount, 0),
      0
    )
  };
}
