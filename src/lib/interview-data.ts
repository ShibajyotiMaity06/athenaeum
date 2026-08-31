import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  type InterviewDifficulty,
  type InterviewSource,
  type InterviewQuestion,
  type UniqueSource,
  type InterviewStack,
  FREE_QUESTIONS_LIMIT
} from "./interview-types";

export * from "./interview-types";

const DATA_DIR = join(process.cwd(), "data", "interview");

let cachedStacks: InterviewStack[] | null = null;

export function loadInterviewData(): InterviewStack[] {
  if (cachedStacks) return cachedStacks;

  if (!existsSync(DATA_DIR)) {
    return [];
  }

  try {
    const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "index.json");
    const stacks: InterviewStack[] = [];

    for (const file of files) {
      try {
        const content = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8")) as InterviewStack;
        if (content && content.slug && Array.isArray(content.questions)) {
          stacks.push(content);
        }
      } catch (err) {
        console.error(`Failed to read interview stack file ${file}:`, err);
      }
    }

    // Preferred visual track order
    const order = [
      "nodejs",
      "javascript",
      "typescript",
      "react",
      "nextjs",
      "java",
      "sql",
      "dbms",
      "computer-networks",
      "operating-systems"
    ];
    stacks.sort((a, b) => {
      const idxA = order.indexOf(a.slug);
      const idxB = order.indexOf(b.slug);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    cachedStacks = stacks;
    return stacks;
  } catch (error) {
    console.error("Failed to load interview data from data/interview/:", error);
    return [];
  }
}

export function getInterviewStacks(): InterviewStack[] {
  return loadInterviewData();
}

export function getInterviewStack(slug: string): InterviewStack | null {
  const stacks = loadInterviewData();
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    stacks.find(
      (s) =>
        s.slug.toLowerCase() === slug.toLowerCase() ||
        s.slug.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
        (slug === "node" && s.slug === "nodejs") ||
        ((slug === "networks" || slug === "computernetworks" || slug === "cn") && s.slug === "computer-networks") ||
        ((slug === "os" || slug === "operatingsystems" || slug === "opratingsystems") && s.slug === "operating-systems") ||
        ((slug === "ts" || slug === "type-script") && s.slug === "typescript") ||
        ((slug === "next" || slug === "next-js") && s.slug === "nextjs")
    ) ?? null
  );
}

export function getInterviewQuestions(
  slug: string,
  difficulty?: InterviewDifficulty | "all"
): InterviewQuestion[] {
  const stack = getInterviewStack(slug);
  if (!stack) return [];
  if (!difficulty || difficulty === "all") return stack.questions;
  return stack.questions.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
}

export function getInterviewSources(slug: string): UniqueSource[] {
  const stack = getInterviewStack(slug);
  return stack ? stack.sources : [];
}
