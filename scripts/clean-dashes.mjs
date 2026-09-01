import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data", "interview");
const DOCS_FILE = join(process.cwd(), "docs.json");

export function removeBigDashes(text) {
  if (!text || typeof text !== "string") return text;

  let str = text;

  // Replace em-dash (—) and en-dash (–) with a clean spaced hyphen " - " or simple punctuation
  // If at the start of a bullet line (e.g. "- item" or "— item") -> "- item"
  str = str.replace(/(^|\n)\s*[—–]\s*/g, "$1- ");

  // If in prose surrounded by text/spaces
  str = str.replace(/\s*[—–]\s*/g, " - ");

  // Double hyphens used as em dashes e.g. "word -- word" or "word--word"
  str = str.replace(/(\w+)\s*--\s*(\w+)/g, "$1 - $2");
  str = str.replace(/([),."`'])\s*--\s*(\w+)/g, "$1 - $2");
  str = str.replace(/(\w+)\s*--\s*([("`'])/g, "$1 - $2");
  str = str.replace(/\s+--\s+/g, " - ");

  // Fix any accidental triple or double spaces
  str = str.replace(/[ \t]{2,}/g, " ");

  return str;
}

// 1. Process docs.json if present
try {
  const rawDocs = readFileSync(DOCS_FILE, "utf8");
  const cleanedDocs = removeBigDashes(rawDocs);
  writeFileSync(DOCS_FILE, cleanedDocs, "utf8");
  console.log("[clean-dashes] docs.json sanitized.");
} catch (e) {
  console.warn("[clean-dashes] docs.json not found or error:", e.message);
}

// 2. Process all interview stack json files
const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
let totalQuestionsCleaned = 0;

for (const file of files) {
  const filePath = join(DATA_DIR, file);
  try {
    const raw = readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);

    if (Array.isArray(json)) {
      // index.json
      const cleaned = json.map((item) => ({
        ...item,
        headline: removeBigDashes(item.headline),
        description: removeBigDashes(item.description)
      }));
      writeFileSync(filePath, JSON.stringify(cleaned, null, 2), "utf8");
      console.log(`[clean-dashes] ${file} (index) cleaned.`);
      continue;
    }

    if (json && Array.isArray(json.questions)) {
      let count = 0;
      json.questions = json.questions.map((q) => {
        const oldQ = q.question;
        const oldA = q.answer;
        const newQ = removeBigDashes(q.question);
        const newA = removeBigDashes(q.answer);
        if (oldQ !== newQ || oldA !== newA) {
          count++;
        }
        return {
          ...q,
          question: newQ,
          answer: newA
        };
      });

      if (json.headline) json.headline = removeBigDashes(json.headline);
      if (json.description) json.description = removeBigDashes(json.description);

      writeFileSync(filePath, JSON.stringify(json, null, 2), "utf8");
      totalQuestionsCleaned += count;
      console.log(`[clean-dashes] ${file}: ${count} questions sanitized.`);
    }
  } catch (err) {
    console.error(`[clean-dashes] Error processing ${file}:`, err.message);
  }
}

console.log(`\n[clean-dashes] Finished! Total questions updated: ${totalQuestionsCleaned}`);
