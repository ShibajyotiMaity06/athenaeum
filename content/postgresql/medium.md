# PostgreSQL - Medium Interview Questions

## Theory Questions & Answers

### Q1: Explain MVCC in Postgres and how it avoids read-write blocking.
* Every row version carries xmin/xmax transaction ids; readers see snapshots where versions are committed-visible - writers create NEW versions instead of mutating in place.
* Result: readers never block writers, writers never block readers.
* Cost: dead tuple accumulation requiring VACUUM; long transactions hold back horizon causing bloat.

---

### Q2: What do xmin/xmax/cmin/cmax hide and how are they used practically?
* System columns on every row: xmin (creating txid), xmax (deleting/locking txid).
* Practical uses: optimistic concurrency checks (`WHERE id=$1 AND xmin=$2` detecting concurrent modification without version column), debugging visibility issues.
* Interview favorite: "how do you detect a row changed between SELECT and UPDATE" answered via xmin.

---

### Q3: What is VACUUM's full job and what is the free space map?
* Removes dead tuples (marking space reusable in FSM), freezes old xids preventing wraparound, updates visibility map enabling index-only scans.
* Aggressive vs regular vacuum thresholds; autovacuum workers tuned per table.
* Long-running transactions pin the xmin horizon → bloat explosion - monitoring oldest-xid/backed-up-tuples essential.

---

### Q4: What is transaction ID wraparound and why does it cause outages?
* xid is 32-bit comparing modulo wraparound space (~2^31 per epoch); Postgres must freeze rows (mark permanently-committed) before old xids risk future comparison ambiguity.
* If wraparound approaches, autovacuum goes aggressive anti-wraparound mode; at limit, system REFUSES writes (single-user mode cleanup) - the famous outage class.
Monitoring: `datfrozenxid` age alerts well before danger.

---

### Q5: Compare B-tree, GIN, GiST, BRIN and Hash indexes with use cases.
* B-tree: equality/range/sort default.
* GIN: inverted index for jsonb containment, arrays, full-text - fast lookups, slower updates.
* GiST: extensible R-tree family - ranges (tstzrange overlap exclusion constraints), geometric, kNN distance ordering.
* BRIN: block-range summaries for huge append-only time-series - tiny, fast builds.
* Hash: equality-only, WAL-logged since v10 - rarely wins over btree.
Exclusion constraints (GiST) power booking-no-overlap rules declaratively.

---

### Q6: What is a covering index / INCLUDE columns / index-only scan?
```sql
CREATE INDEX ON orders (customer_id) INCLUDE (total, status);
```
* Index-only scan answers queries from index alone - requires visibility map all-visible pages (vacuum dependency!).
* INCLUDE columns extend coverage without bloating key ordering structure.
Verify via EXPLAIN showing "Index Only Scan"; heap fetches counter reveals vacuum lag.

---

### Q7: How does the query planner estimate costs and where does it go wrong?
* Statistics (pg_statistic via ANALYZE): distinct counts, histograms, correlation. Costs model IO+CPU units.
* Wrong plans from: stale stats post-bulk-load, correlated columns (extended statistics CREATE STATISTICS fix), skewed distributions (MCV lists help partially), non-scalar functions opaque to planner.
Diagnosis flow: compare estimated vs actual rows in EXPLAIN ANALYZE - divergence marks the lying node.

---

### Q8: What are partial indexes and when do they shine?
```sql
CREATE INDEX ON orders(created_at) WHERE status='pending';
```
* Index only matching subset - tiny, hot, perfect for status-driven queues or soft-delete filters (`WHERE deleted_at IS NULL`).
* Planner uses it when predicate provably matches query conditions - keep predicates in sync literally.

---

### Q9: What isolation anomalies exist under READ COMMITTED and how do statements re-check?
* Each STATEMENT takes fresh snapshot → non-repeatable reads within one transaction possible.
* UPDATE re-evaluates its WHERE against newest row version after lock wait (EvalPlanQual) - can change results mid-flight; may also skip updated-moved rows (partition moves).
* Fix semantics with SELECT ... FOR UPDATE pre-lock or raise isolation level.

---

### Q10: How do FOR UPDATE / FOR SHARE / NOWAIT / SKIP LOCKED behave?
* Row locks until tx end; FOR UPDATE blocks writers, SHARE blocks writers allows readers-writers conflicts nuance.
* NOWAIT errors instantly instead of waiting; SKIP LOCKED skips contested rows - worker queue pattern cornerstone:
```sql
SELECT id FROM jobs WHERE state='queued'
ORDER BY priority LIMIT 1 FOR UPDATE SKIP LOCKED;
```

### Q11: What are window functions and how do frames work?
```sql
AVG(amount) OVER (PARTITION BY customer ORDER BY day
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
```
* PARTITION divides, ORDER defines sequence, frame bounds define included rows - ROWS (physical) vs RANGE (value-based, peers included) differ critically on ties.
* Common: running totals (`UNBOUNDED PRECEDING`), moving averages, LAG/LEAD deltas, RANK family.
Frame mistakes on duplicate sort keys are the classic bug interviewers probe.

---

### Q12: How do recursive CTEs work and what guards prevent runaway recursion?
```sql
WITH RECURSIVE tree AS (
  SELECT id,parent_id,1 depth FROM nodes WHERE parent_id IS NULL
  UNION ALL
  SELECT n.id,n.parent_id,t.depth+1 FROM nodes n JOIN tree t ON n.parent_id=t.id
)
```
* Anchor evaluated once; recursive member iterates against working set until empty.
* Cycle guard: track path array or depth cap in WHERE - infinite loops otherwise hang workers.
Performance: breadth materialization memory; PG16 search/breadth clauses simplify cycle detection.

---

### Q13: What is the difference between EXISTS and IN with NULLs?
* `x IN (subquery)` with NULL members yields UNKNOWN → whole NOT IN returns zero rows (classic trap).
* NOT EXISTS unaffected by nulls and typically plans as anti-join efficiently.
Rule: for nullable subqueries always prefer EXISTS/NOT EXISTS semantics.

---

### Q14: What do LATERAL joins enable?
* Subquery referencing preceding FROM items - per-row computation:
top-N per group:
```sql
SELECT * FROM users u
CROSS JOIN LATERAL (
  SELECT * FROM orders o WHERE o.user_id=u.id
  ORDER BY created DESC LIMIT 3) recent;
```
* Powers index-friendly correlated limits that plain window functions can't match at scale.

---

### Q15: What are generated columns and expression indexes?
* `GENERATED ALWAYS AS (lower(email)) STORED` - derived values maintained automatically; indexable.
* Expression indexes achieve similar without storing: `CREATE INDEX ON users (lower(email))` matching `WHERE lower(email)=...`.
Constraint: expressions must be IMMUTABLE - now()/random banned.

---

### Q16: What is partial vs filtered unique enforcement for soft deletes?
```sql
CREATE UNIQUE INDEX ON users(email) WHERE deleted_at IS NULL;
```
* Allows multiple tombstones sharing email while enforcing uniqueness among live rows.
* Planner uses partial indexes only when predicates provably subset - keep query WHERE clauses aligned literally.
Alternative: COALESCE composite tricks - messier.

---

### Q17: What is the role of ANALYZE / extended statistics?
* ANALYZE samples tables into pg_statistic driving estimates.
* CREATE STATISTICS (dependencies, ndistinct, mcv lists) teaches planner about CORRELATED columns fixing notorious multi-filter misestimates.
Verify impact by comparing rows estimated-vs-actual pre/post.

---

### Q18: What lock modes matter and how do you inspect blocking?
* ACCESS SHARE (reads) vs ACCESS EXCLUSIVE (DDL/truncate) - even SELECT blocks behind A.E. lock.
* Row locks FOR UPDATE etc. separate layer.
Diagnosis: pg_locks join pg_stat_activity, blocking_pids(pid) function; terminate offending long-holder via pg_terminate_backend when warranted.

---

### Q19: What does CONCURRENTLY mean for index builds?
* CREATE INDEX CONCURRENTLY builds without blocking writes using two table scans + invalidation windows; slower, can't run inside transaction, may leave INVALID index on failure (drop & retry).
* Required discipline for production indexes on hot tables; migration tooling must map to it.

---

### Q20: How does connection pooling interact with Postgres session state?
* pgbouncer transaction pooling breaks: prepared statements (pre-PG10 protocol features), SET/session variables, LISTEN, advisory locks held across transactions, cursors WITH HOLD.
* Solutions: session mode per heavy user, or app redesign using SET LOCAL + transaction-scoped everything.
RDS Proxy/PgBouncer-1.21+ protocol-level tracking eases prepared statements pain - version awareness matters.

### Q21: What are materialized views' refresh strategies?
* REFRESH MATERIALIZED VIEW locks readers; CONCURRENTLY variant diffs changes allowing reads but REQUIRES a unique index on the matview.
* Scheduling via pg_cron or app-side jobs; incremental refresh patterns via triggers into summary tables for tight-freshness needs.
* Storage + refresh cost trade-off vs live aggregation - measure both.

---

### Q22: What is table partitioning and when does it pay off?
* Declarative PARTITION BY RANGE/LIST/HASH splitting one logical table; queries prune irrelevant partitions via constraints.
* Pays off at large scale: partition drops replace DELETE storms, maintenance per-partition (vacuum/index), archival by detaching.
* Rules: partition key in every hot query predicate; unique constraints must include partition key.

---

### Q23: How do you implement full-text search ranking properly?
```sql
SELECT *, ts_rank_cd(search_vec, query) AS rank
FROM docs, websearch_to_tsquery('english', $1) query
WHERE search_vec @@ query
ORDER BY rank DESC LIMIT 20;
```
* Weighted vectors built via setweight over fields; GIN index on vector column.
* Trigram (pg_trgm) similarity complements typo tolerance; highlight via ts_headline.
Escalation boundary: facets/typo-heavy multilingual → external engines.

---

### Q24: What are advisory locks and their application-level uses?
* Session-level (`pg_advisory_lock`) and transaction-level (`pg_advisory_xact_lock`) named integer/string locks.
* Uses: singleton cron mutual exclusion, serializing cache rebuilds, multi-step business guards without row locks.
* Discipline: xact variants auto-release (safer); monitor pg_locks mode='advisory'; key namespace registry prevents collisions.

---

### Q25: What is LISTEN/NOTIFY and its modern usage?
* In-session pub/sub: `LISTEN channel` + `NOTIFY channel, 'payload'` delivered to connected listeners transactionally (notify only fires on commit!).
* Uses: cache invalidation fan-out, realtime triggers feeding SSE bridges, outbox wake-up signals.
* Pooling caveat: dedicated long-lived connections required (transaction poolers break LISTEN) - architecture note interviewers probe.



