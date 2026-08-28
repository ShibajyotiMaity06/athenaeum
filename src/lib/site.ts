export const SITE = {
  name: "DevPrep",
  tagline: "Systematic Technical Interview Preparation",
  headline: "Stop preparing randomly. Prepare systematically.",
  url: "https://devprep.online",
  description:
    "3,600+ curated technical interview questions across React, JavaScript, Node.js, TypeScript, SQL, DBMS, OS, Docker, System Design & 20+ technologies. Organized Easy to Hard. ₹399 lifetime access.",
  shortDescription:
    "Systematic technical interview prep platform with 3,600+ questions across 27+ technologies.",
  email: "support@devprep.online",
  totalQuestions: "3,600+",
  totalTechnologies: "27+",
  levelsCount: 3
} as const;

/** One-time, lifetime prices. Amounts are in minor units (paise / cents). */
export const PRICING = {
  INR: { amount: 39900, display: "₹399", note: "India — one-time, lifetime access, inclusive of all taxes" },
  USD: { amount: 900, display: "$9", note: "International — one-time, lifetime access" }
} as const;

export type CurrencyCode = keyof typeof PRICING;

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
      "context-api"
    ],
    keyFocusAreas: [
      "Core JavaScript: Closures, Prototypes, Event Loop, Promises, Async/Await",
      "React Mastery: Hooks, Virtual DOM, Reconciliation, Fiber, Concurrent Mode",
      "TypeScript: Generics, Utility Types, Type Narrowing, Discriminated Unions",
      "Frontend Performance: Core Web Vitals, SSR vs SSG vs ISR, Bundle Optimization",
      "State Management: Redux Toolkit, Zustand, Context API trade-offs"
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
      "docker"
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
      "hld"
    ],
    keyFocusAreas: [
      "End-to-End Type Safety: TypeScript from database models (Prisma) to API and React client",
      "Rendering Patterns: SSR, RSC (React Server Components), Client Components, Edge rendering",
      "Authentication & Security: CSRF, XSS, CORS, Secure Cookies, Session Management",
      "Data Layer Integration: Efficient ORM queries, N+1 problem mitigation, transactions",
      "System Architecture: High-level design, database replication, CDN edge caching"
    ]
  },
  "sde-interview-questions": {
    slug: "sde-interview-questions",
    roleName: "Software Development Engineer (SDE)",
    title: "SDE Interview Questions — Core CS & System Design",
    shortTitle: "SDE & Core CS",
    metaTitle: "SDE Interview Questions (2026 Guide) — OS, DBMS, Networks, HLD, LLD | DevPrep",
    metaDescription:
      "Ace SDE-1, SDE-2, and SDE-3 interviews at top tech companies. Comprehensive coverage of Operating Systems, DBMS, Computer Networks, OOPs, HLD, and LLD.",
    overview:
      "The foundational and architectural pillars required for SDE roles at product companies and tier-1 tech firms. Focuses on deep Computer Science fundamentals and robust system design.",
    techSlugs: [
      "os",
      "dbms",
      "computer-networks",
      "oops",
      "lld",
      "hld",
      "sql",
      "docker",
      "java"
    ],
    keyFocusAreas: [
      "Operating Systems: Processes vs Threads, Virtual Memory, Paging, Mutex/Semaphore, CPU Scheduling",
      "DBMS: Normalization, Transaction Isolation Levels, WAL, B+ Trees, Concurrency Control",
      "Computer Networks: TCP 3-Way Handshake, TCP vs UDP, DNS resolution, TLS/HTTPS, HTTP/2 & HTTP/3",
      "Low-Level Design (LLD): SOLID Principles, Design Patterns (Factory, Strategy, Observer, Decorator)",
      "High-Level Design (HLD): Scalability, Load Balancers, Sharding, Consistent Hashing, CAP Theorem"
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
    name: "System Design & DevOps",
    description: "Scalable architecture, object design, and containerization",
    slugs: ["hld", "lld", "docker"]
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
    related: ["lld", "docker", "redis", "dbms", "computer-networks", "os"],
    roles: ["sde-interview-questions", "backend-interview-questions", "full-stack-interview-questions"]
  },
  lld: {
    related: ["oops", "java", "typescript", "hld"],
    roles: ["sde-interview-questions", "backend-interview-questions"]
  }
};
