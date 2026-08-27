#!/usr/bin/env node
/**
 * Syncs the interview-prep markdown collection into ./content.
 * Never fails the build — if the source is missing it keeps existing content.
 */
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, process.env.CONTENT_SOURCE || "../interview-prep");
const target = join(root, "content");

if (!existsSync(source)) {
  console.warn(`[content] Source not found at ${source} — keeping existing ./content as-is.`);
  process.exit(0);
}

let files = 0;
for (const stack of readdirSync(source)) {
  const stackDir = join(source, stack);
  if (!statSync(stackDir).isDirectory()) continue;
  if (stack.startsWith(".") || stack === "node_modules") continue;
  for (const file of readdirSync(stackDir)) {
    if (!file.endsWith(".md")) continue;
    const destDir = join(target, stack);
    mkdirSync(destDir, { recursive: true });
    const targetFile = join(destDir, file);
    if (!existsSync(targetFile)) {
      copyFileSync(join(stackDir, file), targetFile);
      files++;
    }
  }
}
console.log(`[content] Verified codex files (imported ${files} new) from ${source} → ./content`);
