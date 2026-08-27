# Prisma - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is Prisma and what are its components?
* Type-safe ORM for Node/TypeScript: **schema.prisma** (single source of truth), **Prisma Migrate** (declarative migrations), **Prisma Client** (generated typed query builder), Studio (GUI).
* Replaces hand-written SQL strings with autocomplete-checked APIs — runtime errors become compile errors.

---

### Q2: What does schema.prisma contain?
Three blocks:
* datasource (provider postgres/sqlite/mysql, url from env).
* generator (client output).
* model definitions with fields, types, attributes (@id, @default, @relation, @@index, @@unique).
Everything — DB shape AND client API — derives from this file.

---

### Q3: How do you define a one-to-many relation?
```prisma
model Author {
  id    Int    @id @default(autoincrement())
  books Book[]
}
model Book {
  id       Int    @id @default(autoincrement())
  author   Author @relation(fields: [authorId], references: [id])
  authorId Int
}
```
* Scalar FK field (authorId) explicit + @relation wiring; back-relation list on the other side.
* onDelete defaults: required relation → Restrict, optional → SetNull.

---

### Q4: What is prisma generate and when must it run?
* Reads schema producing typed client into node_modules/.prisma — run after ANY schema change (postinstall hook recommended in CI/deploy).
* Forgetting it after pull/migrate = "Property X does not exist" TS errors — the classic first-week mistake.

---

### Q5: What CRUD basics does the client provide?
```ts
await prisma.user.create({ data: { email } });
await prisma.user.findUnique({ where: { email } });
await prisma.user.update({ where: { id }, data: { name } });
await prisma.user.deleteMany({ where: { inactive: true } });
findMany({ take, skip, orderBy, where })
```
* All fully typed from schema; filters compose nested objects; unique fields enable findUnique.

---

### Q6: What is include vs select?
* `include: { posts: true }` returns full model PLUS relations.
* `select: { email: true, posts: { select: { title: true } } }` shapes exact payload (only listed fields returned).
Nested combinations supported to any depth — shape responses at query time.

---

### Q7: How does filtering work (where)?
```ts
where: { price: { gte: 10, lte: 50 }, OR: [{ title: { contains: "rust" } }, { tags: { has: "systems" } }] }
```
* Operators mirror SQL (_gt/_in/_contains/_mode insensitive); logical AND/OR/NOT nest arbitrarily.
* List filters: has/hasSome on scalar lists.

---

### Q8: How do transactions work in Prisma?
* Sequential: `prisma.$transaction([...queries])` array executes atomically.
* Interactive: `prisma.$transaction(async tx => { await tx.a...; await tx.b...; })` — logic-aware with timeout/max-wait limits (interactive default 5s — long work fails by design).

---

### Q9: What is prisma migrate dev vs deploy?
* `migrate dev`: creates migration from schema diff against shadow database, applies locally, may reset drift.
* `migrate deploy`: applies pending migrations in order — CI/production only command (never creates/resets).
* Shadow DB requirement: Postgres needs a privileged empty database for diffing.

---

### Q10: What is db push and when is it appropriate?
* `prisma db push` syncs schema WITHOUT migration files — prototyping-only tool.
* Danger in prod: no history/rollback trail. Rule: prototype fast with push, switch to migrate before real users.

### Q11: How do enums and scalar lists work?
```prisma
enum Role { USER ADMIN }
tags String[]
```
* Enums generate TS union types; DB-level enum on Postgres, string columns elsewhere.
* Scalar lists map to Postgres arrays (no MySQL support) with has/hasSome filters.

---

### Q12: What are self-relations used for?
```prisma
model Category {
  id       Int        @id @default(autoincrement())
  parentId Int?
  parent   Category?  @relation("Tree", fields:[parentId], references:[id])
  children Category[] @relation("Tree")
}
```
* Named relations disambiguate the two sides — hierarchies, friendships, referral chains all ride this pattern.

---

### Q13: What is @@map / @map for legacy databases?
* @map renames field↔column; @@map renames model↔table — lets idiomatic TS names coexist with ugly/legacy DB naming without views.
* Introspection (prisma db pull) regenerates schema from existing DBs honoring existing maps.

---

### Q14: What does Prisma Studio offer?
* Visual GUI for browsing/editing data respecting relations — great for demos, debugging, ops fixes.
* Read-only discipline suggestion in prod environments.

---

### Q15: What logging options exist on PrismaClient?
```ts
new PrismaClient({ log: ["query", "info", "warn", "error"] })
```
* query logging prints generated SQL + duration — first stop for perf debugging.
* Event-based listeners enable structured capture into observability pipelines.

---

### Q16: What is the difference between findFirst and findUnique?
* findUnique requires a filter on unique fields only (@id/@unique) — cheapest.
* findFirst accepts arbitrary where + orderBy, returning first match — flexible but non-indexed paths scan.
Type system enforces unique-only constraints on findUnique where input.

---

### Q17: How do you handle pagination in Prisma?
* Offset: skip/take — deep pages degrade like any OFFSET.
* Cursor: `cursor: { id }, take: n` keyset pagination constant-time with indexed sort keys — preferred for infinite scroll feeds.

---

### Q18: What is $queryRaw and when to use it?
```ts
await prisma.$queryRaw<Book[]>`SELECT * FROM books WHERE year > ${y}`;
```
* Tagged template parameterizes safely ($queryRawUnsafe = string building — injection risk).
* Escapes for window functions/raw analytics the query builder can't express. $executeRaw for mutations.

---

### Q19: What is introspection (db pull)?
* Generates schema.prisma from an EXISTING database — the entry path for adopting Prisma onto legacy systems.
* Unsupported features surface as comments requiring manual modeling decisions; repeated pulls overwrite hand edits unless mapped carefully.

---

### Q20: Where does the generated client live and how do you keep CI fast?
* node_modules/.prisma/client by default; custom output dir recommended (monorepo friendliness + visibility).
* Cache generation artifacts keyed by schema hash; postinstall ensures fresh after dependency installs.


