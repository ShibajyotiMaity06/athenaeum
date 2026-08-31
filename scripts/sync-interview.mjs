import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data", "interview");
const DOCS_FILE = join(process.cwd(), "docs.json");

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "external";
  }
}

export function cleanMarkdownAsterisks(str) {
  if (!str || typeof str !== "string") return str;
  return str
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/(^|[^\w*])\*([^*\n]+?)\*([^\w*]|$)/g, "$1$2$3")
    .replace(/\*\*/g, "");
}

export function normalizeTechSlug(rawTech = "") {
  const clean = (rawTech || "").trim().toLowerCase();
  if (
    clean === "operating systems" ||
    clean === "oprating systems" ||
    clean === "operating-systems" ||
    clean === "oprating-systems" ||
    clean === "os"
  ) {
    return "operating-systems";
  }
  if (
    clean === "computer networks" ||
    clean === "computernetworks" ||
    clean === "computer-networks" ||
    clean === "networks" ||
    clean === "networking" ||
    clean === "cn"
  ) {
    return "computer-networks";
  }
  if (clean === "typescript" || clean === "ts") {
    return "typescript";
  }
  if (clean === "nextjs" || clean === "next.js" || clean === "next") {
    return "nextjs";
  }
  if (clean === "nodejs" || clean === "node.js" || clean === "node") {
    return "nodejs";
  }
  if (clean === "javascript" || clean === "js") {
    return "javascript";
  }
  if (clean === "react" || clean === "reactjs" || clean === "react.js" || clean === "react 19" || clean === "react-19") {
    return "react";
  }
  if (clean === "dbms" || clean === "database" || clean === "databases") {
    return "dbms";
  }
  if (clean === "sql" || clean === "postgresql" || clean === "mysql") {
    return "sql";
  }
  if (clean === "java" || clean === "core java" || clean === "core-java") {
    return "java";
  }
  return clean.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "javascript";
}

const STACK_METADATA = {
  nodejs: {
    name: "Node.js",
    headline: "Runtime Internals, Libuv, Streams, Worker Threads & Non-Blocking Architecture",
    description:
      "Curated real-world Node.js interview questions focusing on event loop phases, microtasks vs macrotasks, worker threads, streams, backpressure, IPC, memory profiling, and high-concurrency server architectures.",
    icon: "nodejs"
  },
  javascript: {
    name: "JavaScript",
    headline: "V8 Engine Internals, Closures, Prototypal Inheritance & Modern ESNext",
    description:
      "Core JavaScript interview questions spanning scope, TDZ, hoisting, closures, event delegation, garbage collection, memory leaks, custom async utilities, and modern ECMAScript specifications.",
    icon: "javascript"
  },
  typescript: {
    name: "TypeScript",
    headline: "Type System Mechanics, Generics, Conditional Types, Type Narrowing & AST",
    description:
      "Essential TypeScript interview questions covering advanced generics, mapped types, template literal types, conditional type inference (infer), branded types, covariance/contravariance, and compiler options.",
    icon: "typescript"
  },
  react: {
    name: "React & React 19",
    headline: "React 19 Actions, Server Components, Hooks, State Architecture & Performance",
    description:
      "Curated React questions covering TypeScript prop narrowing, useActionState, useOptimistic, RSCs, state libraries (Zustand/RTK), virtualization, and enterprise performance optimizations.",
    icon: "react"
  },
  nextjs: {
    name: "Next.js",
    headline: "App Router, Server Actions, SSR/SSG/ISR, Middleware, Caching & Performance",
    description:
      "Production-grade Next.js interview questions covering App Router conventions, Server vs Client Components, Server Actions, streaming SSR with Suspense, caching layers, middleware routing, and SEO optimization.",
    icon: "nextjs"
  },
  sql: {
    name: "SQL",
    headline: "Relational Queries, Window Functions, CTEs, Indexing & Query Tuning",
    description:
      "Curated SQL interview questions spanning aggregations, self-joins, recursive CTEs, ranking window functions, partitioning, and complex analytical queries.",
    icon: "sql"
  },
  dbms: {
    name: "DBMS",
    headline: "ACID Properties, Concurrency Control, MVCC, B-Trees & Distributed Transactions",
    description:
      "Deep-dive DBMS interview questions covering storage engines, indexing mechanics, lock escalation, isolation levels, write-ahead logging (WAL), snapshot isolation, and distributed 2PC/CAP replication.",
    icon: "dbms"
  },
  java: {
    name: "Java",
    headline: "JVM Memory Model, Garbage Collection, Concurrency, OOP & Collections Internals",
    description:
      "Curated Core & Advanced Java interview questions covering JVM memory structure, GC algorithms, multithreading, synchronization primitives, CompletableFuture, Collections internals, and thread-safe data structures.",
    icon: "java"
  },
  "computer-networks": {
    name: "Computer Networks",
    headline: "OSI & TCP/IP Stack, Routing, Transport Protocols, DNS, TLS & Network Security",
    description:
      "Essential Computer Networks interview questions covering TCP 3-way handshake, UDP, flow and congestion control, DNS resolution, HTTP/2 & HTTP/3, TLS handshake, subnetting, and real-time networking protocols.",
    icon: "computernetworks"
  },
  "operating-systems": {
    name: "Operating Systems",
    headline: "Processes, Threads, Concurrency, Deadlocks, Virtual Memory & Kernel Architecture",
    description:
      "Core Operating Systems interview questions spanning process lifecycles, CPU scheduling algorithms, virtual memory paging, page fault handling, synchronization primitives, deadlocks, and system calls.",
    icon: "os"
  }
};

function classifyDifficulty(questionText = "", answerText = "", fallbackIdx = 0) {
  const combined = `${questionText} ${answerText}`.toLowerCase();

  // Hard: engine internals, deep browser architecture, advanced concurrency, memory management
  if (
    combined.includes("proxy") ||
    combined.includes("tail call optimization") ||
    combined.includes("tco") ||
    combined.includes("async iterator") ||
    combined.includes("for await") ||
    combined.includes("layout thrashing") ||
    combined.includes("forced synchronous reflow") ||
    combined.includes("service worker") ||
    combined.includes("typedarray") ||
    combined.includes("arraybuffer") ||
    combined.includes("weakmap") ||
    combined.includes("weakset") ||
    combined.includes("function composition") ||
    combined.includes("compose utility") ||
    combined.includes("memory leak") ||
    combined.includes("heap snapshot") ||
    combined.includes("exponential backoff") ||
    combined.includes("libuv") ||
    combined.includes("worker threads") ||
    combined.includes("b-tree") ||
    combined.includes("write-ahead log") ||
    combined.includes("two-phase locking") ||
    combined.includes("serializability") ||
    combined.includes("deadlock") ||
    combined.includes("mvcc") ||
    combined.includes("recursive cte") ||
    combined.includes("lru cache") ||
    combined.includes("completablefuture") ||
    combined.includes("custom reliability layer") ||
    combined.includes("cpu profiling") ||
    combined.includes("segfault") ||
    combined.includes("write skew")
  ) {
    return "Hard";
  }

  // Medium: intermediate design patterns, APIs, protocols, performance
  if (
    combined.includes("reflect api") ||
    combined.includes("symbol.iterator") ||
    combined.includes("iterator protocol") ||
    combined.includes("observer pattern") ||
    combined.includes("module pattern") ||
    combined.includes("revealing module") ||
    combined.includes("tree shaking") ||
    combined.includes("xss") ||
    combined.includes("localstorage") ||
    combined.includes("fetch api") ||
    combined.includes("xmlhttprequest") ||
    combined.includes("abortcontroller") ||
    combined.includes("repaint") ||
    combined.includes("reflow") ||
    combined.includes("web worker") ||
    combined.includes("concurrency and parallelism") ||
    combined.includes("sparse array") ||
    combined.includes("object.defineproperty") ||
    combined.includes("descriptor") ||
    combined.includes("new keyword") ||
    combined.includes("tagged template") ||
    combined.includes("lastindex") ||
    combined.includes("regexp") ||
    combined.includes("json.stringify") ||
    combined.includes("settimeout(fn, 0)") ||
    combined.includes("requestanimationframe") ||
    combined.includes("deep-freeze") ||
    combined.includes("deep freeze") ||
    combined.includes("window function") ||
    combined.includes("indexing") ||
    combined.includes("event loop") ||
    combined.includes("debounce") ||
    combined.includes("throttle") ||
    combined.includes("currying") ||
    combined.includes("memoization") ||
    combined.includes("tcp 3-way handshake") ||
    combined.includes("dns resolution") ||
    combined.includes("tls handshake") ||
    combined.includes("concurrentconcurrenthashmap") ||
    combined.includes("garbage collection") ||
    combined.includes("volatile keyword")
  ) {
    return "Medium";
  }

  // Easy: core concepts, primitives, straightforward definitions
  if (fallbackIdx < 15) return "Easy";
  if (fallbackIdx < 35) return "Medium";
  return "Hard";
}

function parseDocsJson(raw) {
  const itemsByStack = new Map();

  function addItem(slug, item, itemIdx) {
    if (!itemsByStack.has(slug)) {
      itemsByStack.set(slug, []);
    }

    let diff = item.difficulty;
    if (diff !== "Easy" && diff !== "Medium" && diff !== "Hard") {
      diff = classifyDifficulty(item.question, item.answer, itemIdx);
    }

    const sources = (item.sources || []).map((s) => ({
      title: cleanMarkdownAsterisks(s.title || s.url || "Documentation Reference"),
      url: s.url || "#",
      domain: s.url ? extractDomain(s.url) : "docs"
    }));

    itemsByStack.get(slug).push({
      question: cleanMarkdownAsterisks(item.question || `Question #${itemIdx + 1}`),
      difficulty: diff,
      answer: cleanMarkdownAsterisks(item.answer || "Answer in review."),
      sources
    });
  }

  // 1. Check for section headers format: { "Tech Name" } \n [ ... questions ... ]
  const sectionSplitRegex = /(?=\{\s*"[^"]+"\s*\})/;
  const parts = raw.split(sectionSplitRegex);
  let parsedAnySection = false;

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const headerMatch = trimmed.match(/^\{\s*"([^"]+)"\s*\}/);
    if (headerMatch) {
      const rawTech = headerMatch[1];
      const slug = normalizeTechSlug(rawTech);
      const rest = trimmed.slice(headerMatch[0].length).trim();
      try {
        const questionsArray = JSON.parse(rest);
        if (Array.isArray(questionsArray)) {
          questionsArray.forEach((item, idx) => addItem(slug, item, idx));
          parsedAnySection = true;
        }
      } catch (err) {
        console.warn(`[interview-sync] Failed to parse JSON array for section [${rawTech}]:`, err.message);
      }
    }
  }

  if (parsedAnySection) {
    return itemsByStack;
  }

  // 2. Check if docs.json is a multi-key dictionary e.g. { "react": [...], "sql": [...] }
  try {
    const parsed = JSON.parse(raw.trim());
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [key, questions] of Object.entries(parsed)) {
        if (!Array.isArray(questions)) continue;
        const slug = normalizeTechSlug(key);
        questions.forEach((item, idx) => addItem(slug, item, idx));
      }
      return itemsByStack;
    }
  } catch {}

  // 3. Check if docs.json is a single JSON array with explicit technology tags
  try {
    const parsed = JSON.parse(raw.trim());
    if (Array.isArray(parsed)) {
      parsed.forEach((item, idx) => {
        const explicitTech = item.technology || item.tech || item.category || item.topic || "javascript";
        const slug = normalizeTechSlug(explicitTech);
        addItem(slug, item, idx);
      });
      return itemsByStack;
    }
  } catch {}

  return itemsByStack;
}

export function syncInterviewData() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!existsSync(DOCS_FILE)) {
    console.log("[interview-sync] docs.json not present. Serving from persistent data/interview/ store.");
    return;
  }

  try {
    const raw = readFileSync(DOCS_FILE, "utf8");
    const itemsByStack = parseDocsJson(raw);

    console.log(`[interview-sync] Parsed ${itemsByStack.size} stacks from docs.json:`, Array.from(itemsByStack.keys()));

    // Merge each parsed stack into persistent store
    for (const [slug, newItems] of itemsByStack.entries()) {
      const filePath = join(DATA_DIR, `${slug}.json`);
      let existingData = null;

      if (existsSync(filePath)) {
        try {
          existingData = JSON.parse(readFileSync(filePath, "utf8"));
        } catch {
          existingData = null;
        }
      }

      const meta = STACK_METADATA[slug] || {
        name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
        headline: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ")} Technical Interview Preparation`,
        description: `Curated real-world interview questions and verified solutions for ${slug}.`,
        icon: slug
      };

      // Merge questions avoiding duplicate question titles (exact case-insensitive match)
      const mergedMap = new Map();
      if (existingData && Array.isArray(existingData.questions)) {
        existingData.questions.forEach((q) => {
          mergedMap.set(q.question.trim().toLowerCase(), q);
        });
      }

      newItems.forEach((q) => {
        const key = q.question.trim().toLowerCase();
        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key);
          mergedMap.set(key, { ...existing, ...q, id: existing.id });
        } else {
          mergedMap.set(key, { ...q, id: mergedMap.size + 1 });
        }
      });

      const questions = Array.from(mergedMap.values()).map((q, idx) => ({
        ...q,
        id: idx + 1
      }));

      // Aggregate sources
      const sourceMap = new Map();
      questions.forEach((q) => {
        (q.sources || []).forEach((s) => {
          if (!s.url || s.url === "#") return;
          if (!sourceMap.has(s.url)) {
            sourceMap.set(s.url, { title: s.title, url: s.url, domain: s.domain, count: 1 });
          } else {
            sourceMap.get(s.url).count += 1;
          }
        });
      });

      const sources = Array.from(sourceMap.values()).sort((a, b) => b.count - a.count);

      const stackRecord = {
        slug,
        name: meta.name,
        headline: meta.headline,
        description: meta.description,
        icon: meta.icon,
        totalQuestions: questions.length,
        easyCount: questions.filter((q) => q.difficulty === "Easy").length,
        mediumCount: questions.filter((q) => q.difficulty === "Medium").length,
        hardCount: questions.filter((q) => q.difficulty === "Hard").length,
        questions,
        sources
      };

      writeFileSync(filePath, JSON.stringify(stackRecord, null, 2), "utf8");
      console.log(`[interview-sync] Updated ${slug}.json (${questions.length} questions, ${sources.length} sources)`);
    }

    // Rebuild index.json by scanning all files in DATA_DIR
    const allStacksIndex = [];
    const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "index.json");
    
    // Sort stacks order: nodejs, javascript, typescript, react, nextjs, java, sql, dbms, computer-networks, operating-systems
    const sortOrder = [
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
    files.sort((a, b) => {
      const slugA = a.replace(".json", "");
      const slugB = b.replace(".json", "");
      const idxA = sortOrder.indexOf(slugA);
      const idxB = sortOrder.indexOf(slugB);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return slugA.localeCompare(slugB);
    });

    for (const f of files) {
      try {
        const content = JSON.parse(readFileSync(join(DATA_DIR, f), "utf8"));
        allStacksIndex.push({
          slug: content.slug,
          name: content.name,
          headline: content.headline,
          description: content.description,
          icon: content.icon,
          totalQuestions: content.totalQuestions,
          easyCount: content.easyCount,
          mediumCount: content.mediumCount,
          hardCount: content.hardCount,
          sourcesCount: content.sources ? content.sources.length : 0
        });
      } catch {}
    }

    writeFileSync(join(DATA_DIR, "index.json"), JSON.stringify(allStacksIndex, null, 2), "utf8");
    console.log(`[interview-sync] Persistent store synced across ${allStacksIndex.length} tracks.`);
  } catch (error) {
    console.error("[interview-sync] Error during ingestion:", error);
  }
}

// Run if called directly
syncInterviewData();
