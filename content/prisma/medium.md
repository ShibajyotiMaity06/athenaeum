# Prisma - Medium Interview Questions

## Theory Questions & Answers

### Q1: What is the N+1 problem in Prisma and how do include/select fix it?
* Looping `for (const post of posts) post.author` issues one query per iteration — the client does NOT auto-batch lazy access.
* Fix: single `findMany({ include: { author: true } })` producing two total queries (posts + IN-list of authors).
* Detection: Prisma client query logging (`log:["query"]`) exposes the storm instantly.

---

### Q2: How do nested writes (mutation shorthand) behave transactionally?
```ts
prisma.user.update({
  where: { id }, data: { posts: { create: {...}, deleteMany: { published: false } } }
})
```
* Nested create/update/deleteMany run INSIDE one implicit transaction — atomicity free without $transaction wrapper.
* Limits: cross-model ordering logic beyond nesting still needs interactive transactions.

---

### Q3: What are relation load strategies (joins) in newer Prisma versions?
* `relationLoadStrategy: "join"` (Postgres) emits LEFT JOINs fetching relations in ONE round trip vs classic two-query batch.
* Choose join for latency-sensitive paths with wide networks; batch (default) often cheaper for huge child sets (row multiplication on joins).
* Per-query choice — benchmark both directions on representative data.

---

### Q4: How does Prisma handle optimistic concurrency?
* No @Version primitive natively; pattern: filter update by expected value:
```ts
prisma.doc.updateMany({ where: { id, version }, data: { content, version: { increment: 1 } } })
```
* count===0 ⇒ concurrent modification → retry/merge UX.
* updateMany bypasses unique checks returning count — deliberate semantics worth knowing.

---

### Q5: What are the interactive transaction limits and how do you design around them?
* Defaults maxWait 2s / timeout 5s — long logic inside throws P2028.
* Design: keep txns SHORT (pure DB mutations), move IO/computation outside, pass ids across boundaries; raise limits only deliberately with lock-spread awareness.
* Interactive txns hold a connection — nested pool starvation under concurrency is the hidden cost.

---

### Q6: What is the difference between delete/deleteMany and cascades configuration?
* delete throws P2003 FK violation when children exist unless schema declares `onDelete: Cascade`.
* Referential actions configurable per relation: onDelete/onUpdate — Cascade/SetNull/Restrict/NoAction (DB-enforced).
* deleteMany silently skips nothing — returns count; pair with soft-delete middleware patterns instead when history matters.

---

### Q7: What is Prisma middleware vs client extensions ($extends)?
* Legacy middleware intercepts ALL queries (logging, soft-delete injection) pre-$extends era; sequential mutation of args/results.
* Client extensions (modern): `$extends.query` component rules typed per-model, plus model/result custom methods, `queryRaw` hooks — composable, better TS.
* Soft-delete canonical extension: rewrite delete→update deletedAt, add global not-deleted filters via query component.

---

### Q8: What is the acceleration/PgBouncer prepared statements issue (P1001-style errors)?
* PgBouncer transaction mode + server-side prepared statements conflict → cryptic prepared statement errors under load.
* Fixes: pgbouncer 1.21+ protocol tracking, or Prisma `?pgbouncer=true` flag disabling client prepare, or direct-url separate path for migrations.
Classic prod-onset mystery — recognizing symptoms earns senior credit.

---

### Q9: How does full-text search map in Prisma today?
* Postgres searchVector fields unsupported natively → raw SQL escape hatch ($queryRaw with tsvector/tsquery + ranking) OR maintain tsvector column via migration SQL + raw filtering.
* Preview/full-text features evolving; check current support matrix before promising native APIs.
Interview framing: know the boundary and the raw-SQL bridge pattern.

---

### Q10: How do you seed databases canonically?
* `prisma db seed` convention mapping to `"prisma": {"seed": "tsx prisma/seed.ts"}` in package.json.
* Seed runs after migrate dev/reset automatically; production seeding via explicit deploy step (idempotent upserts keyed on natural ids).
* Never rely on seeds for test isolation inside suites — factories per test.

### Q11: How does Prisma Migrate handle drift, and what is prisma migrate resolve?
* Drift = DB state diverging from migration history (hotfix SQL applied manually, restored backup).
* `migrate dev` detects drift offering RESET (wipes data!) — dangerous in prod; `migrate diff --from-url --to-schema-datamodel` scripts reconciliation; `migrate resolve --applied <name>` marks failed/rolled-back migrations as applied without running.
* Discipline: all schema changes via migrations; prod uses deploy-only; drift alerts via CI check comparing url vs migrations.

---

### Q12: What are the unique constraint options beyond simple @unique?
```prisma
@@unique([tenantId, slug])
@@index([status, createdAt(sort: Desc)])
```
* Composite @@unique enables findUnique on compound where inputs.
* Postgres-level named constraints stable across renames; partial unique indexes unsupported natively → raw migration SQL + @@ignore? pattern (map-only fields) for soft-delete uniqueness.

---

### Q13: How do you model many-to-many with extra relation data?
* Implicit `posts Post[]` ↔ `categories Category[]` creates hidden join table — no extra columns possible.
* Explicit model:
```prisma
model PostCategory {
  post       Post     @relation(fields:[postId],references:[id])
  postId     Int
  category   Category @relation(fields:[categoryId],references:[id])
  categoryId Int
  addedAt    DateTime @default(now())
  @@id([postId, categoryId])
}
```
* Query joins manually via the join model — more verbose, fully expressive.

---

### Q14: What are JSON field filtering capabilities and limits?
```ts
where: { metadata: { path: ["prefs","theme"], equals: "dark" } }
```
* Path filters supported on Postgres jsonb (array paths, string filtering); GIN index creation requires raw migration SQL.
* Complex containment (`@>`) exposed via `path+equals` object form or raw SQL for exotic ops — know when to escape.

---

### Q15: What is Prisma Pulse / Accelerate at a conceptual level?
* Accelerate: global connection pooling + edge caching layer (driver adapters connect through it) solving serverless connection storms.
* Pulse: change-stream/CDC product delivering DB events to app (change data capture as a service).
Interview positioning: platform add-ons addressing serverless + realtime gaps of classic ORM usage.

---

### Q16: How do you implement multi-tenancy patterns in Prisma?
Options:
* tenant_id columns + query extension enforcing tenant filter (client extension rewriting queries globally — central enforcement beats per-call discipline).
* Schema-per-tenant: multiple PrismaClient instances mapped per tenant (connection count math! pool sizing × tenants) or dynamic datasource URLs.
* RLS pairing: set tenant via $executeRaw SET LOCAL inside transaction wrapper dependency.
Leak-testing suite is mandatory regardless of chosen layer.

---

### Q17: What are the generated client's batching behaviors ($transaction array auto-batching)?
* Standalone awaited queries in same tick get auto-batched into fewer round trips (query batching engine) reducing waterfalls without explicit transactions — NOT atomic though!
* Distinction matters: batching = performance; $transaction = correctness boundary. Confusing them produces race bugs.

---

### Q18: What is the difference between P2002/P2025 error classes and handling strategy?
* P2002 unique violation (catch → friendly conflict message); P2025 record not found on update/delete (catch → 404 mapping); P2003 FK constraint.
* Central error-mapping utility converting Prisma errors → domain HTTP responses keeps handlers clean.
* Never expose raw Prisma messages to clients — information disclosure plus coupling to internals.

---

### Q19: How do you keep the schema readable at scale (naming, comments, organization)?
Conventions:
* Triple-slash doc comments surface onto generated TS types (IDE docs free).
* Group models by domain with comment banners; consistent suffixes (View, Item).
* Enum-first modeling; avoid premature generic tables (EAV) — typed schemas win tooling support.
* Schema reviews treated like API reviews since client types derive mechanically.

---

### Q20: What is your checklist before adopting Prisma on an existing production database?
1. `db pull` introspection audit — unsupported constructs listed (views, triggers, partial indexes, procedures stay outside schema).
2. Baseline migration created (`migrate diff --from-empty` → baseline) marking current state WITHOUT applying.
3. Shadow database provisioned with rights.
4. Query-perf parity tests comparing legacy SQL plans vs generated ones on hot endpoints.
5. Team training on generate/migrate lifecycle gotchas (P1001-style issues).


