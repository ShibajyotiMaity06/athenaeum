export const SITE = {
  name: "DevPrep",
  tagline: "Systematic Technical Interview Preparation",
  headline: "Stop preparing randomly. Prepare systematically.",
  url:
    process.env.VITE_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.devprep.online",
  description:
    "3,600+ curated technical interview questions across React, JavaScript, Node.js, TypeScript, SQL, DBMS, OS, Docker, System Design & 20+ technologies. Organized Easy to Hard. ₹399 lifetime access.",
  shortDescription:
    "Systematic technical interview prep platform with 3,600+ questions across 27+ technologies.",
  totalQuestions: "3,600+",
  totalTechnologies: "27+",
  levelsCount: 3
} as const;

export type AccessTier = "full" | "interview";
export type PricingPlan = "full" | "interview";

export const PLANS = {
  full: {
    id: "full" as const,
    name: "Full Scholar Access",
    badge: "MOST POPULAR · ALL-ACCESS",
    shortName: "All-Access Pass",
    description: "Complete unrestricted lifetime access to all 3,600+ questions across 27+ technologies + Complete Interview Prep section + All future additions.",
    INR: { amount: 39900, display: "₹399", note: "India — one-time, lifetime access, inclusive of all taxes" },
    USD: { amount: 900, display: "$9", note: "International — one-time, lifetime access" },
    features: [
      "All 3,600+ deep-dive questions across 27+ technologies",
      "Full unrestricted access to new Interview Prep section",
      "Easy, Medium & Hard comprehensive verified answers",
      "All official documentation citations & source references",
      "Lifetime updates & all future codices included"
    ]
  },
  interview: {
    id: "interview" as const,
    name: "Interview Prep Key",
    badge: "TARGETED INTERVIEW PREP",
    shortName: "Interview Pack",
    description: "Full lifetime access to curated real-world interview questions across Node.js, JavaScript, React & modern tech with verified answers and sources.",
    INR: { amount: 29900, display: "₹299", note: "India — one-time, lifetime access, inclusive of all taxes" },
    USD: { amount: 700, display: "$7", note: "International — one-time, lifetime access" },
    features: [
      "Full access to complete Interview Prep codex",
      "150+ high-frequency real-world technical interview questions",
      "Node.js, JavaScript, React 19 & modern engineering stacks",
      "160+ curated official documentation source URLs",
      "Detailed architectural answers & practical code patterns"
    ]
  }
} as const;

/** Default pricing (Full Scholar Pass) for backward compatibility */
export const PRICING = PLANS.full;

export type CurrencyCode = "INR" | "USD";

export const PROMO_CODES: Record<string, { discountPercent: number; label: string }> = {
  EFGH: { discountPercent: 30, label: "30% Scholar Discount" },
  ATHENAEUM10: { discountPercent: 10, label: "10% Athenaeum Pass Discount" },
  SCHOLAR10: { discountPercent: 10, label: "10% Scholar Community Discount" },
  DEV10: { discountPercent: 10, label: "10% Developer Discount" },
  EARLY10: { discountPercent: 10, label: "10% Early Bird Discount" },
  INTERVIEW10: { discountPercent: 10, label: "10% Interview Prep Discount" }
};

export interface PromoCalculation {
  valid: boolean;
  code?: string;
  plan: PricingPlan;
  discountPercent: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  display: string;
  originalDisplay: string;
  savingsDisplay: string;
  message?: string;
}

export function calculatePromoPrice(
  planOrCurrency: PricingPlan | CurrencyCode = "full",
  currencyOrPromo: CurrencyCode | string | null = "INR",
  promoCodeInput?: string | null
): PromoCalculation {
  // Support flexible argument patterns:
  // 1) calculatePromoPrice(plan, currency, promoCode)
  // 2) calculatePromoPrice(currency, promoCode) -> defaults plan="full"
  let plan: PricingPlan = "full";
  let currency: CurrencyCode = "INR";
  let promoRaw: string | null | undefined = undefined;

  if (planOrCurrency === "INR" || planOrCurrency === "USD") {
    currency = planOrCurrency;
    promoRaw = typeof currencyOrPromo === "string" ? currencyOrPromo : promoCodeInput;
  } else {
    plan = planOrCurrency === "interview" ? "interview" : "full";
    if (currencyOrPromo === "INR" || currencyOrPromo === "USD") {
      currency = currencyOrPromo;
    }
    promoRaw = promoCodeInput;
  }

  const selectedPlan = PLANS[plan] || PLANS.full;
  const base = selectedPlan[currency] || selectedPlan.INR;
  const rawCode = promoRaw?.trim().toUpperCase();

  const formatPrice = (minorUnits: number, curr: CurrencyCode) => {
    const units = minorUnits / 100;
    const formatted = units % 1 === 0 ? units.toString() : units.toFixed(2);
    return curr === "INR" ? `₹${formatted}` : `$${formatted}`;
  };

  if (!rawCode) {
    return {
      valid: false,
      plan,
      discountPercent: 0,
      originalAmount: base.amount,
      discountAmount: 0,
      finalAmount: base.amount,
      display: base.display,
      originalDisplay: base.display,
      savingsDisplay: currency === "INR" ? "₹0" : "$0"
    };
  }

  const promo = PROMO_CODES[rawCode];
  if (!promo) {
    return {
      valid: false,
      plan,
      discountPercent: 0,
      originalAmount: base.amount,
      discountAmount: 0,
      finalAmount: base.amount,
      display: base.display,
      originalDisplay: base.display,
      savingsDisplay: currency === "INR" ? "₹0" : "$0",
      message: "Invalid promo code"
    };
  }

  const discountAmount = Math.round(base.amount * (promo.discountPercent / 100));
  const finalAmount = base.amount - discountAmount;

  return {
    valid: true,
    code: rawCode,
    plan,
    discountPercent: promo.discountPercent,
    originalAmount: base.amount,
    discountAmount,
    finalAmount,
    display: formatPrice(finalAmount, currency),
    originalDisplay: base.display,
    savingsDisplay: formatPrice(discountAmount, currency),
    message: `Promo code ${rawCode} applied! ${promo.discountPercent}% discount.`
  };
}

export const LEVELS = [
  {
    slug: "easy",
    contentSlug: "basic",
    label: "Easy",
    sublabel: "Foundations & Core Concepts",
    blurb: "Core concepts, definitions, basic syntax, and first principles expected in round 1 screening."
  },
  {
    slug: "medium",
    contentSlug: "medium",
    label: "Medium",
    sublabel: "Mechanisms & Practical Patterns",
    blurb: "Real-world mechanisms, state management, edge cases, performance trade-offs, and practical coding."
  },
  {
    slug: "hard",
    contentSlug: "hard",
    label: "Hard",
    sublabel: "Internals & System Architecture",
    blurb: "Deep runtime internals, memory models, distributed design, concurrency failure modes, and architectural decisions."
  }
] as const;

export type SeoLevelSlug = (typeof LEVELS)[number]["slug"];
export type ContentLevelSlug = (typeof LEVELS)[number]["contentSlug"];

export function isSeoLevelSlug(value: string): value is SeoLevelSlug {
  return LEVELS.some((l) => l.slug === value);
}

export function toContentLevel(seoLevel: string): ContentLevelSlug {
  if (seoLevel === "easy" || seoLevel === "basic") return "basic";
  if (seoLevel === "medium") return "medium";
  if (seoLevel === "hard") return "hard";
  return "basic";
}

export function toSeoLevel(contentLevel: string): SeoLevelSlug {
  if (contentLevel === "basic" || contentLevel === "easy") return "easy";
  if (contentLevel === "medium") return "medium";
  if (contentLevel === "hard") return "hard";
  return "easy";
}

export const LEVEL_LABELS: Record<string, string> = {
  easy: "Easy (Foundations)",
  medium: "Medium (Practical)",
  hard: "Hard (Internals & Architecture)",
  basic: "Easy (Foundations)"
};

/** Free preview count per level per technology */
export const FREE_PREVIEW_COUNT = 5;

/**
 * Role-based pillar pages data.
 * Used for routing, internal linking, and pillar page generation.
 */
export interface RolePillar {
  slug: string; // e.g. "frontend-interview-questions"
  roleName: string; // "Frontend Developer"
  title: string;
  shortTitle: string;
  metaTitle: string;
  metaDescription: string;
  overview: string;
  techSlugs: string[]; // Technologies included in this pillar
  keyFocusAreas: string[];
}

export const ROLE_PILLARS: Record<string, RolePillar> = {
  "frontend-interview-questions": {
    slug: "frontend-interview-questions",
    roleName: "Frontend Engineer",
    title: "Frontend Interview Questions & Preparation Guide",
    shortTitle: "Frontend Prep",
    metaTitle: "Frontend Interview Questions (2026 Guide) — React, JS, TS, Next.js | DevPrep",
    metaDescription:
      "Master frontend engineering interviews. Comprehensive questions covering JavaScript, TypeScript, React, Next.js, CSS, HTML, Redux, and state management organized Easy to Hard.",
    overview:
      "The complete preparation syllabus for Junior, Mid-level, and Senior Frontend Engineers. Covers JavaScript event loops, DOM performance, modern React patterns, state management architecture, and CSS layouts.",
    techSlugs: [
      "react",
      "javascript",
      "typescript",
      "nextjs",
      "html",
      "css",
      "redux",
      "zustand",
      "context-api",
      "frontend-system-design"
    ],
    keyFocusAreas: [
      "Core JavaScript: Closures, Prototypes, Event Loop, Promises, Async/Await",
      "React Mastery: Hooks, Virtual DOM, Reconciliation, Fiber, Concurrent Mode",
      "TypeScript: Generics, Utility Types, Type Narrowing, Discriminated Unions",
      "Frontend Performance: Core Web Vitals, SSR vs SSG vs ISR, Bundle Optimization",
      "State Management: Redux Toolkit, Zustand, Context API trade-offs",
      "Frontend System Design: RADIO framework, infinite scrolling, collaborative editors, offline sync"
    ]
  },
  "backend-interview-questions": {
    slug: "backend-interview-questions",
    roleName: "Backend Engineer",
    title: "Backend Interview Questions & System Design Guide",
    shortTitle: "Backend Prep",
    metaTitle: "Backend Interview Questions (2026 Guide) — Node, Java, Python, SQL, Redis | DevPrep",
    metaDescription:
      "Prepare for backend developer interviews. In-depth questions on Node.js, Express, Java, Spring Boot, Python, SQL, PostgreSQL, MongoDB, Redis, and APIs.",
    overview:
      "The systematic syllabus for Backend & Systems Engineers. Covers server runtimes, concurrency models, relational and NoSQL database indexing, caching strategies, and REST/gRPC API design.",
    techSlugs: [
      "node",
      "express",
      "java",
      "spring-boot",
      "django",
      "fastapi",
      "postgresql",
      "mongodb",
      "redis",
      "sql",
      "prisma",
      "docker",
      "hld",
      "lld"
    ],
    keyFocusAreas: [
      "Server Runtimes: Node.js libuv event loop, Java JVM memory model, Python GIL",
      "Database Architecture: Indexing (B-Tree/LSM), ACID, isolation levels, query optimization",
      "Caching & Queues: Redis data structures, eviction policies, cache stampede mitigation",
      "API Design: Idempotency, rate limiting, authentication (JWT/OAuth2), schema validation",
      "Microservices & Containerization: Docker, service communication, error boundaries"
    ]
  },
  "full-stack-interview-questions": {
    slug: "full-stack-interview-questions",
    roleName: "Full Stack Engineer",
    title: "Full Stack Interview Questions & Architecture Guide",
    shortTitle: "Full Stack Prep",
    metaTitle: "Full Stack Interview Questions (2026 Guide) — End-to-End Preparation | DevPrep",
    metaDescription:
      "Crush full-stack developer interviews. Complete coverage across React, Node.js, TypeScript, PostgreSQL, Docker, System Design, and API integration.",
    overview:
      "End-to-end preparation for Full Stack Engineers bridging rich frontend interfaces with scalable backend infrastructure, data persistence, and deployment pipelines.",
    techSlugs: [
      "javascript",
      "typescript",
      "react",
      "nextjs",
      "node",
      "express",
      "postgresql",
      "mongodb",
      "sql",
      "redis",
      "docker",
      "hld",
      "frontend-system-design"
    ],
    keyFocusAreas: [
      "End-to-End Type Safety: TypeScript from database models (Prisma) to API and React client",
      "Rendering Patterns: SSR, RSC (React Server Components), Client Components, Edge rendering",
      "Authentication & Security: CSRF, XSS, CORS, Secure Cookies, Session Management",
      "Data Layer Integration: Efficient ORM queries, N+1 problem mitigation, transactions",
      "System Architecture: High-level design, database replication, CDN edge caching",
      "Frontend System Design: RADIO framework, virtualized lists, offline-first sync engines"
    ]
  },
  "sde-interview-questions": {
    slug: "sde-interview-questions",
    roleName: "Software Development Engineer (SDE)",
    title: "SDE Interview Questions — Core CS & System Design",
    shortTitle: "SDE & Core CS",
    metaTitle: "SDE Interview Questions (2026 Guide) — OS, DBMS, Networks, HLD, LLD, Frontend SD | DevPrep",
    metaDescription:
      "Ace SDE-1, SDE-2, and SDE-3 interviews at top tech companies. Comprehensive coverage of Operating Systems, DBMS, Computer Networks, OOPs, HLD, LLD, and Frontend System Design.",
    overview:
      "The foundational and architectural pillars required for SDE roles at product companies and tier-1 tech firms. Focuses on deep Computer Science fundamentals, high-level architecture, low-level design, and frontend systems.",
    techSlugs: [
      "os",
      "dbms",
      "computer-networks",
      "oops",
      "lld",
      "hld",
      "frontend-system-design",
      "sql",
      "docker",
      "java"
    ],
    keyFocusAreas: [
      "Operating Systems: Processes vs Threads, Virtual Memory, Paging, Mutex/Semaphore, CPU Scheduling",
      "DBMS: Normalization, Transaction Isolation Levels, WAL, B+ Trees, Concurrency Control",
      "Computer Networks: TCP 3-Way Handshake, TCP vs UDP, DNS resolution, TLS/HTTPS, HTTP/2 & HTTP/3",
      "Low-Level Design (LLD): SOLID Principles, Design Patterns (Factory, Strategy, Observer, Decorator)",
      "High-Level Design (HLD): Scalability, Load Balancers, Sharding, Consistent Hashing, CAP Theorem",
      "Frontend System Design: Virtualization, Collaborative Editors (OT/CRDT), Offline Sync, Video Streaming"
    ]
  }
};

/** Categories for organizing the technology grid on the homepage and footer */
export const TECH_CATEGORIES = [
  {
    name: "Web & Frontend",
    description: "Modern UI libraries, typed scripting, and state management",
    slugs: ["react", "javascript", "typescript", "nextjs", "html", "css", "redux", "zustand", "context-api"]
  },
  {
    name: "Backend & Frameworks",
    description: "Server runtimes, enterprise APIs, and asynchronous frameworks",
    slugs: ["node", "express", "java", "spring-boot", "django", "fastapi"]
  },
  {
    name: "Databases & Data Layer",
    description: "Relational engines, NoSQL stores, caching, and ORMs",
    slugs: ["sql", "postgresql", "mongodb", "redis", "dbms", "prisma"]
  },
  {
    name: "Core Computer Science",
    description: "Fundamental systems, networking, and object theory",
    slugs: ["os", "computer-networks", "oops"]
  },
  {
    name: "System Design & Architecture",
    description: "High-level architecture, object design, frontend systems, and DevOps",
    slugs: ["hld", "lld", "frontend-system-design", "docker"]
  }
];

/** Related technologies mapping for high-relevance internal linking */
export const RELATED_TECH_MAP: Record<string, { related: string[]; roles: string[] }> = {
  react: {
    related: ["javascript", "typescript", "nextjs", "redux", "zustand", "context-api"],
    roles: ["frontend-interview-questions", "full-stack-interview-questions"]
  },
  javascript: {
    related: ["typescript", "react", "node", "html", "css"],
    roles: ["frontend-interview-questions", "full-stack-interview-questions"]
  },
  typescript: {
    related: ["javascript", "react", "node", "nextjs", "prisma"],
    roles: ["frontend-interview-questions", "backend-interview-questions", "full-stack-interview-questions"]
  },
  nextjs: {
    related: ["react", "typescript", "javascript", "node", "css"],
    roles: ["frontend-interview-questions", "full-stack-interview-questions"]
  },
  node: {
    related: ["express", "javascript", "typescript", "mongodb", "postgresql", "redis"],
    roles: ["backend-interview-questions", "full-stack-interview-questions"]
  },
  express: {
    related: ["node", "javascript", "mongodb", "postgresql", "redis"],
    roles: ["backend-interview-questions", "full-stack-interview-questions"]
  },
  java: {
    related: ["spring-boot", "oops", "sql", "postgresql", "lld", "hld"],
    roles: ["backend-interview-questions", "sde-interview-questions"]
  },
  "spring-boot": {
    related: ["java", "oops", "sql", "postgresql", "redis", "docker"],
    roles: ["backend-interview-questions"]
  },
  django: {
    related: ["fastapi", "sql", "postgresql", "redis", "docker"],
    roles: ["backend-interview-questions"]
  },
  fastapi: {
    related: ["django", "sql", "postgresql", "redis", "docker"],
    roles: ["backend-interview-questions"]
  },
  sql: {
    related: ["postgresql", "dbms", "mongodb", "redis", "prisma"],
    roles: ["backend-interview-questions", "sde-interview-questions", "full-stack-interview-questions"]
  },
  postgresql: {
    related: ["sql", "dbms", "prisma", "redis", "mongodb"],
    roles: ["backend-interview-questions", "full-stack-interview-questions"]
  },
  mongodb: {
    related: ["sql", "node", "express", "redis", "prisma"],
    roles: ["backend-interview-questions", "full-stack-interview-questions"]
  },
  redis: {
    related: ["sql", "postgresql", "mongodb", "node", "hld"],
    roles: ["backend-interview-questions", "sde-interview-questions", "full-stack-interview-questions"]
  },
  prisma: {
    related: ["typescript", "postgresql", "sql", "node", "nextjs"],
    roles: ["backend-interview-questions", "full-stack-interview-questions"]
  },
  html: {
    related: ["css", "javascript", "react"],
    roles: ["frontend-interview-questions"]
  },
  css: {
    related: ["html", "javascript", "react", "nextjs"],
    roles: ["frontend-interview-questions"]
  },
  redux: {
    related: ["react", "zustand", "context-api", "javascript", "typescript"],
    roles: ["frontend-interview-questions"]
  },
  zustand: {
    related: ["react", "redux", "context-api", "typescript", "javascript"],
    roles: ["frontend-interview-questions"]
  },
  "context-api": {
    related: ["react", "redux", "zustand", "javascript", "typescript"],
    roles: ["frontend-interview-questions"]
  },
  os: {
    related: ["computer-networks", "dbms", "oops", "lld", "hld"],
    roles: ["sde-interview-questions"]
  },
  dbms: {
    related: ["sql", "postgresql", "os", "computer-networks", "hld"],
    roles: ["sde-interview-questions", "backend-interview-questions"]
  },
  "computer-networks": {
    related: ["os", "dbms", "hld", "node"],
    roles: ["sde-interview-questions"]
  },
  oops: {
    related: ["java", "lld", "typescript", "os"],
    roles: ["sde-interview-questions", "backend-interview-questions"]
  },
  docker: {
    related: ["node", "spring-boot", "hld", "postgresql", "redis"],
    roles: ["backend-interview-questions", "full-stack-interview-questions", "sde-interview-questions"]
  },
  hld: {
    related: ["lld", "frontend-system-design", "docker", "redis", "dbms", "computer-networks", "os"],
    roles: ["sde-interview-questions", "backend-interview-questions", "full-stack-interview-questions"]
  },
  lld: {
    related: ["oops", "java", "typescript", "hld", "frontend-system-design"],
    roles: ["sde-interview-questions", "backend-interview-questions"]
  },
  "frontend-system-design": {
    related: ["react", "nextjs", "typescript", "hld", "lld", "javascript"],
    roles: ["frontend-interview-questions", "full-stack-interview-questions", "sde-interview-questions"]
  }
};
