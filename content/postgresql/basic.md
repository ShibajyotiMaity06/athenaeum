# PostgreSQL - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is PostgreSQL and what distinguishes it?
* Advanced open-source object-relational DB known for standards compliance, extensibility (custom types/extensions), and correctness.
* Standouts: rich indexing (B-tree/GIN/GiST/BRIN), full-text search, JSONB, window functions, MVCC without read locks, transactional DDL.
* Single license (PostgreSQL License), no paid editions - feature parity everywhere.

---

### Q2: What is a primary key and how does Postgres implement it?
* Uniquely identifies rows; `PRIMARY KEY` creates a unique B-tree index + NOT NULL implicitly.
* One PK per table; choice of int/bigserial vs UUID trade-offs (size, ordering, fragmentation).
* PK index backs fast lookups; clustered tables don't exist like SQL Server - heap storage with index-organized access via the index only.

---

### Q3: What are the main differences between CHAR, VARCHAR and TEXT?
* CHAR(n): blank-padded fixed length (rarely desired).
* VARCHAR(n): variable with limit enforced.
* TEXT: unlimited - Postgres performance identical across all three; use TEXT + CHECK constraint for length when needed.
Interview nugget: unlike other engines, there's NO performance penalty choosing TEXT.

---

### Q4: What does SERIAL vs IDENTITY vs UUID mean for keys?
* `SERIAL` legacy pseudo-type creating sequence default; `GENERATED ALWAYS AS IDENTITY` SQL-standard preferred (protects against manual id inserts).
* Sequences have gaps on rollback by design.
* UUIDv4 random → index bloat/fragmentation on big tables; UUIDv7/time-ordered mitigates. Choose bigint identity for internal high-write tables.

---

### Q5: What is NULL and how do IS NULL / COALESCE work?
* NULL = unknown/absent, not zero/empty string.
* Comparisons yield NULL (`WHERE col <> 'x'` excludes NULLs!) - explicit `IS NULL`/`IS NOT NULL` required.
* `COALESCE(a,b,c)` first non-null; `NULLIF(a,b)` returns null when equal (divide-by-zero guard pattern).

---

### Q6: Explain the difference between DELETE, TRUNCATE and DROP.
* DELETE: row-by-row, WHERE allowed, fires triggers, MVCC dead tuples need vacuuming.
* TRUNCATE: removes all rows instantly (metadata operation), resets sequence optionally, table-level lock, non-MVCC safe (transactional though!).
* DROP: removes table entirely including structure/indexes.
Emptying big tables → TRUNCATE; selective removal → DELETE.

---

### Q7: What are JOIN types supported?
INNER, LEFT/RIGHT/FULL OUTER, CROSS, plus LATERAL joins (subquery per row enabling top-N-per-group patterns).
Self-joins standard for hierarchies; anti-join pattern via LEFT JOIN ... WHERE right IS NULL or NOT EXISTS.
Semi/anti semantics matter for "rows having/not-having matches" questions.

---

### Q8: What is the difference between WHERE and HAVING?
* WHERE filters rows BEFORE grouping/aggregation; HAVING filters groups AFTER aggregation.
* HAVING can reference aggregates (`HAVING COUNT(*) > 5`); WHERE cannot.
Performance rule: filter early in WHERE whenever logically possible - smaller groups to aggregate.

---

### Q9: What are LIMIT/OFFSET and why is OFFSET slow at depth?
* `LIMIT n OFFSET m` discards m sorted rows client-side after producing them - page 10000 costs ~all preceding rows.
* Keyset pagination instead: remember last sort key, `WHERE (created,id) < (:ts,:id)` with matching composite index → constant-time pages.
Trade-off: keyset can't jump to arbitrary page numbers.

---

### Q10: What are constraints available? Name CHECK usage.
NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK, EXCLUSION.
CHECK enforces row predicates: `CHECK (price >= 0 AND discount < price)` - database-level guarantee surviving buggy apps.
Constraints can be NOT VALID initially then VALIDATED later for big-table rollouts.

### Q11: What is a foreign key and what referential actions exist?
* FK enforces child values reference existing parent rows.
* ON DELETE options: CASCADE (children die), RESTRICT/NO ACTION (block deletion), SET NULL/DEFAULT.
* FKs create implicit locks on parent writes - bulk parent deletes contend with child inserts; plan accordingly.

---

### Q12: What are indexes and when does Postgres create them automatically?
* UNIQUE/PK constraints auto-create B-tree indexes; everything else manual via CREATE INDEX.
* Index types: B-tree (default equality/range), GIN (jsonb/full-text/arrays), GiST (geometric/ranges), BRIN (huge append-only tables), Hash (equality-only).
* Rule: indexes serve measured queries; each one taxes writes.

---

### Q13: What does EXPLAIN / EXPLAIN ANALYZE show?
* EXPLAIN prints the planner's estimated plan; ANALYZE actually executes showing real rows/times/loops per node.
* Key fields: Seq Scan vs Index Scan vs Bitmap Heap, rows estimate vs actual (big divergence = stale statistics), sort/spill memory.
* First diagnostic on any slow query - always with realistic data volumes.

---

### Q14: What is VACUUM vs autovacuum?
* MVCC deletes/updates leave dead tuples; VACUUM reclaims that space for reuse.
* Autovacuum daemon runs automatically per-table thresholds; tune per hot table (autovacuum_vacuum_scale_factor lower).
* VACUUM FULL rewrites table reclaiming disk but takes exclusive lock - last-resort maintenance.

---

### Q15: What are transactions and isolation levels in Postgres?
* BEGIN/COMMIT/ROLLBACK wrap work atomically.
* Levels: READ COMMITTED (default), REPEATABLE READ (snapshot), SERIALIZABLE (SSI detecting rw-conflicts).
* Postgres has no dirty reads even at lowest level - MVCC guarantees.

---

### Q16: What is a sequence and nextval/currval?
* Sequences generate monotonic numbers efficiently outside transaction semantics (gaps normal).
* `nextval` advances+returns; `currval` returns last value THIS session; DEFAULT via identity columns preferred over manual calls.
* Gaps are features not bugs - never assume contiguity for business logic.

---

### Q17: What is DISTINCT vs DISTINCT ON?
* DISTINCT dedupes full row set.
* **DISTINCT ON (col)** - Postgres gem: keeps FIRST row per group given matching ORDER BY - instant "latest row per user" queries:
```sql
SELECT DISTINCT ON (user_id) * FROM events
ORDER BY user_id, created_at DESC;
```

---

### Q18: What aggregate functions and GROUP BY basics apply?
COUNT/SUM/AVG/MIN/MAX + FILTER clause (`COUNT(*) FILTER (WHERE active)`), STRING_AGG, ARRAY_AGG.
GROUP BY columns must match non-aggregated selects.
`GROUPING SETS/CUBE/ROLLUP` produce multi-level aggregates in one pass.

---

### Q19: What is the difference between UNION and UNION ALL?
* UNION dedupes result (sort/hash overhead); UNION ALL concatenates raw - faster when duplicates impossible.
* Column counts/types must align; first select's names win.
Prefer UNION ALL + explicit dedup strategy when intent matters.

---

### Q20: What are views vs materialized views?
* Views: stored queries expanding inline at select time - always fresh, no storage.
* Materialized views: results persisted; refresh via REFRESH MATERIALIZED VIEW (CONCURRENTLY needs unique index, avoids read blocking).
Perfect for expensive aggregates served slightly-stale.

---

### Q21: What is RETURNING used for?
* INSERT/UPDATE/DELETE RETURNING columns returns affected rows - fetch generated ids without second round trip:
```sql
INSERT INTO orders(...) VALUES(...) RETURNING id, created_at;
```
* Enables CTE-chained multi-step writes in single statement.

---

### Q22: What are CTEs (WITH queries)?
```sql
WITH recent AS (
  SELECT * FROM orders WHERE created > now() - interval '7 days'
)
SELECT count(*) FROM recent;
```
* Named temporary result scopes enabling readable pipelines and RECURSIVE hierarchies/graph walks.
* Modern PG may inline CTEs (not materialize) unless MATERIALIZED keyword - behavior change from v11 worth knowing.

---

### Q23: What is ILIKE and full-text search basics?
* ILIKE case-insensitive pattern match - fine for small prefix searches ('abc%'), terrible with leading wildcards.
* Real search: tsvector/tsquery with GIN index, websearch_to_tsquery accepting google-style input.
Starter answer before graduating to trigram/external engines.

---

### Q24: What is JSONB and its core operators?
* Binary JSON supporting indexing; `->`, `->>` (text), `#>` path extraction; containment `@>`.
* GIN jsonb_path_ops index accelerates containment checks.
* Prefer jsonb over json type universally (deduped, indexed, faster).

---

### Q25: What is psql and which meta-commands help daily?
`\l` databases, `\c` connect, `\dt` tables, `\d+ table` structure, `\x` expanded display, `\timing` per-query timing, `\watch` rerun interval.
Server-side `\copy` for file imports avoiding client memory blowups.


