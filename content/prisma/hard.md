# Prisma - Hard Interview Questions

## Theory Questions & Answers

### Q1: How does the query compiler/engine architecture shape performance characteristics?
* Client serializes typed JSON queries over a Rust engine (query compiler plans SQL) - separate process communication historically, driver adapters now allow in-process pure-TS path.
* Implications: serialization overhead per query visible at very high RPS; prepared statement reuse differs per adapter; raw-SQL escapes bypass planning entirely.
* Diagnose with engine logs + PG pg_stat_statements comparing generated SQL quality against hand-tuned baselines.

---

### Q2: What is the exact lifecycle of migrations from schema edit to prod, including edge commands?
1. Edit schema → `migrate dev --name x` diffs against SHADOW db creating migration folder (migration_lock.toml guards provider).
2. Local apply + generate.
3. CI: `migrate deploy` against ephemeral DB verifying chain integrity + `migrate diff` drift check.
4. Prod pipeline: deploy-only runner with advisory locking; failed migration marked via `resolve` after manual fix.
Edge: squashing old migrations (`migrate dev --name squash`) requires coordinated reset discipline across environments.

---

### Q3: What are the referential action defaults and their cross-database differences?
* Optional relations default SetNull; required → Restrict on Postgres/MySQL; SQLite legacy emulation differs (`onDelete: NoAction` mapping to deferred enforcement quirks).
* relationMode "prisma" (emulated FKs client-side) vs "foreignKeys" (native) - emulated mode loses DB-level integrity, breaks external writers; deprecated direction worth flagging.
Migration-time enforcement changes require table rewrites on some engines - plan accordingly.

---

### Q4: How do you implement soft deletes GLOBALLY with correct relation filtering?
Client extension approach:
```ts
$extends({
  query: { $allModels: { async $allOperations({args,query,operation}) {
    if (["findMany","findFirst"].includes(operation)) inject notDeleted(args)
    ...
```
Plus rewriting delete→update. Traps: include-nested relations bypass top-level rewrite (must walk nested args recursively), aggregate counts, raw queries untouched, unique lookups returning deleted rows via findUnique need explicit filters.
Comprehensive suites asserting deleted visibility across EVERY access path distinguish real implementations.

---

### Q5: What is the connection pool math under serverless (Vercel/Lambda)?
* Each lambda instance opens own pool → connection explosion past provider limits.
* Solutions ladder: Accelerate proxy pooling; PgBouncer transaction mode direct URL (+pgbouncer=true flag); global singleton client reuse within warm instance.
* Math example: 1000 concurrent instances × pool 5 = 5000 connections vs PG max 200 → must centralize.
Cold-start + first-query latency budgeting included in answer.

---

### Q6: What are the failure semantics of $transaction array vs interactive under concurrency?
* Array: all-or-nothing commit; individual query errors abort whole batch; no read-then-write logic possible inside.
* Interactive: holds connection; deadlock/serialization errors surface as P2034 - retry wrapper with backoff REQUIRED for hot rows.
* Deadlock avoidance discipline: consistent lock ordering across codebase (sort mutation ids) - document as convention.

---

### Q7: How do you model polymorphic associations given no native support?
Options:
* Separate nullable FKs per target type + CHECK exactly-one-set constraint.
* Generic (type,id) columns - loses FK integrity, needs app-level validation + composite index.
* Supertype table pattern (Commentable base every commentable joins) - normalized but join-heavy.
Recommendation heuristics: few known types → separate FKs; open-ended plugin ecosystems → supertype table.

---

### Q8: How do you enforce row-level security while using Prisma's pooled connections?
* RLS relies on session variables (`SET LOCAL app.tenant_id`); Prisma pools sessions unpredictably → wrap tenant-scoped operations in interactive transaction issuing SET LOCAL first (transaction-scoped, auto-reset on commit).
* Pooler interplay: transaction-mode pooling preserves SET LOCAL semantics within txn - safe pairing.
* Bypass role for migrations/admin paths; adversarial tests crossing tenants prove policy.

---

### Q9: What is the cost model of deep include chains and when do you denormalize instead?
* Nested includes compile into either batched IN queries per level or joins (strategy flag) - depth × breadth multiplies payload assembly time and memory.
* Symptoms: response assembly dominating CPU profiles, giant JSON responses.
* Remedies: flatten API shapes via explicit selects; materialize read models (summary tables updated via transactions/cdc); cursor pagination limiting depth exposure.
Measure assembly separately from SQL time - engine logs enable that split.

---

### Q10: How do you test schema migrations against production-like data shapes?
Stack:
* Anonymized production snapshot restored into Testcontainers PG (pg_restore subset sampling preserving distributions).
* Apply pending migrations measuring duration + lock waits (pg_stat_progress hooks) against THAT data - catches full-table rewrite surprises.
* Post-migration parity checksums (row counts, aggregates) validating transform correctness.
Plain empty-schema migration tests miss exactly the failures that page you at midnight.

### Q11: How do you implement cursor pagination with multi-column stable ordering?
* Cursor encodes tuple (createdAt, id) base64; where clause:
```ts
where: { OR: [
  { createdAt: { lt: c.createdAt } },
  { createdAt: c.createdAt, id: { lt: c.id } }
]}
```
with orderBy matching both columns - tie-breaker prevents row skipping on equal timestamps.
* Helper `buildCursorWhere` reused across models; tests asserting no-dup/no-miss over shuffled inserts.

---

### Q12: What is the P2024/P2028 family and how do you architect around pool exhaustion?
* P2024 = connection pool timeout (pool exhausted within wait) - under-provisioning or leaked interactive transactions.
* Fixes: right-size pool_url params, ensure every $transaction resolves/catches, queue-level shedding at 503 before timeout, metrics on pool wait durations.
* Serverless → external pooling covered separately; long-lived servers need leak audits via open-connection gauges.

---

### Q13: How does Prisma interact with database views / materialized views?
* Views unsupported in schema - access via $queryRaw typed manually; keep view definitions versioned as migrations SQL.
* Mapping trick: define model with @@map to view name + mark read-only by convention (client can still write - discipline/lint required).
* MatView refresh orchestration from app via $executeRaw scheduled jobs; staleness surfaced in API metadata.

---

### Q14: What is the strategy for handling enum evolution across schema + client versions?
* Postgres native enums require ALTER TYPE ADD VALUE (non-transactional pre-12 quirks, cannot remove values).
* Safer modeling: text column + Prisma enum for typing only? Loses DB validation. Middle path: check constraint updated via raw migrations.
* Client rollout ordering: add value → deploy clients reading it → backend accepts it; removal reversed with usage telemetry floor.

---

### Q15: How do you implement audit/history tables alongside Prisma models without fighting the ORM?
Options:
* DB triggers writing history rows - catches ALL writers including raw SQL/migrations (recommended for compliance).
* Client extension intercepting update/delete building diffs - misses non-Prisma writes; simpler deployment.
* Hybrid: triggers capture, app enriches actor context via session variable set inside transaction wrapper.
Query patterns: per-entity timeline views joining audit partitions by (entity_type,id).

---

### Q16: How do you handle very large text/binary payloads with Prisma?
* Bytes field maps bytea; streaming NOT supported through client - full buffer loads into memory.
* Large files belong in object storage with keys in DB; DB stores metadata only.
* Large text: consider TOAST awareness (out-of-line storage automatic), avoid selecting giant columns in list queries via explicit select.

---

### Q17: What is the interplay between Prisma Client singleton patterns and Next.js dev HMR?
* Hot reload re-evaluates modules creating new clients exhausting connections - canonical global-singleton guard:
```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
```
* Production keeps module single instance naturally; serverless differs (covered elsewhere).

---

### Q18: How would you benchmark Prisma vs raw SQL for a hot endpoint credibly?
Protocol:
* pg_stat_statements comparing generated SQL execution time vs hand-written candidate.
* Engine overhead measured separately: client timing minus DB time from logs.
* Payload assembly costs profiled (Node CPU sampling) - serialization sometimes dominates.
Decision output documented with p50/p95 numbers under realistic concurrency; revisit after major Prisma upgrades (engine changes shift baselines).

---

### Q19: What is the migration story for adding FKs/constraints to huge existing tables?
* Adding FK validates existing rows - full scan + lock risks. Path: ADD CONSTRAINT ... NOT VALID (instant) then VALIDATE CONSTRAINT (weaker lock, online) via raw migration SQL paired with Prisma state using SeparateDatabaseAndState-equivalent (`migrate diff` manual edits).
* Cleanup orphan sweep BEFORE validation; retry logic for validation lock timeouts.
Interview framing shows DDL-under-traffic literacy beyond ORM defaults.

---

### Q20: Final synthesis: when would you advise AGAINST Prisma for a team, and what migration seam preserves optionality?
Disqualifiers:
* Heavy analytical SQL dominance (window functions, CTEs everywhere) - query builder fights you constantly.
* Extreme connection-efficiency requirements without budget for Accelerate-style layers.
* Legacy schemas with constructs outside schema language (composite types, inheritance) forcing raw-SQL majority.
Seam design: repository layer owning ALL persistence calls - swap engines (Prisma→Kysely/Drizzle/raw) behind interfaces without touching domain code. Reversibility priced upfront is the staff-level signature.


