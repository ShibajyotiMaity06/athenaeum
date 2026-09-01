# PostgreSQL - Hard Interview Questions

## Theory Questions & Answers

### Q1: Detail the visibility check: how does a tuple decide if it's visible to a snapshot?
* Tuple headers store xmin/xmax with hint bits; snapshot holds xmin-horizon, xmax, in-progress xid array.
* Visible when inserting txn committed before snapshot AND (no deleter OR deleter uncommitted/not-visible).
* Hint bits cache commit status avoiding clog lookups; clog slru pages matter for cold reads.
* Frozen rows (xid=FrozenTransactionId semantics via heap_new_infomask bits) visible to ALL snapshots enabling wraparound safety.

---

### Q2: What is HOT update and which conditions disable it?
* Heap-Only Tuple updates skip index insertion when NO indexed column changed AND page has free space - following versions found via chain from old index entries.
* Disablers: touching indexed columns, full pages (fillfactor exhausted) forcing new page.
* Consequences: HOT-heavy workloads dramatically reduce index write amplification - fillfactor tuning per update-pattern table is the lever.
Diagnose: n_tup_hot_upd vs total ratio in pg_stat_user_tables.

---

### Q3: Explain SSI internals: SIREAD locks and dangerous structures.
* Serializable transactions take predicate-level SIREAD locks (coarse: page/table granularity) recording READS without blocking writers; writers acquiring tuples check rw-conflicts against concurrent SIREAD holders.
* Dangerous structure = two consecutive rw-antidependencies in the dependency graph forming potential pivot cycle → one participant aborted (serialization_failure) even without physical conflict.
* False positives possible (conservative); retry discipline mandatory application-side.
Contrast vs SQL Server range locks: abort-based optimism vs blocking pessimism.

---

### Q4: What does WAL contain at record level and why is full_page_writes essential?
* Records: page references, per-change payloads (insert tuple bytes, delete xmax), commit/abort markers with timestamps; sequence-ordered by LSN.
* full_page_writes: first touch of a page post-checkpoint logs ENTIRE page image - guards torn-page partial writes making crash recovery deterministic.
* wal_compression shrinks FPW records; checkpoint tuning (completion spread) smooths FPW bursts.
Recovery = redo from last checkpoint replaying WAL - durability's mechanical truth.

---

### Q5: How does logical decoding produce changes, and what are slot lifecycle hazards?
* Background walsenders decode WAL via output plugins (pgoutput/test_decoding) reordering by transaction; replication slots pin restart_lsn preventing WAL recycling for disconnected consumers.
* Hazards: abandoned slots → disk-full outage; invalid slots after max_slot_wal_keep_size exceed; catalog xmin horizon affecting autovacuum on catalogs.
* Ops guardrails: lag byte alerts, heartbeat tables keeping idle consumers advancing, scheduled slot audits.

---

### Q6: How do GiST exclusion constraints enforce "no overlapping bookings"?
```sql
EXCLUDE USING gist (room_id WITH =, during WITH &&)
```
* Generalized index enforces arbitrary operator constraints across rows - equality on room plus overlap (`&&`) on tstzrange forbids double-booking declaratively.
* Requires btree_gist extension for scalar equality operators inside GiST.
Concurrency-proof by construction - no application race can violate it; conflict errors mapped to friendly UX.

---

### Q7: What is the buffer manager doing: clock-sweep, ring buffers, and shared hits?
* Shared buffers hold page copies pinned during access; eviction via clock-sweep (usage_count decay) approximating LRU cheaply.
* Bulk table scans use small ring buffers avoiding evicting the entire hot cache - explains why big sequential scans don't nuke your cache.
* hit ratios per relation via pg_statio views guide memory sizing; temp buffers separate for sort spill metadata.

---

### Q8: What happens end-to-end on COMMIT under synchronous replication?
* Local WAL flush → leader sends records → waits for standby ack per synchronous_standby_names (ANY/FIRST quorum forms) → replies client.
* Failure modes: standby lagging stalls commits (availability trade-off), switching sync standby mid-flight handled by priorities.
* performance note: group commit coalesces flushes amortizing cost across concurrent commits.

---

### Q9: How would you diagnose and fix severe table/index bloat without downtime?
Evidence: pgstattuple dead_tuple percentages, size vs live rows divergence.
Non-blocking remediation ladder:
* pg_repack online rebuild (trigger-captured deltas swap at end).
* Logical copy CTAS into new table + concurrent index builds + rename swap behind transaction.
* Preventive: autovacuum tuning, fillfactor headroom on hot-update tables, kill long transactions pinning cleanup.
VACUUM FULL only when exclusive window genuinely acceptable.

---

### Q10: What planner GUCs meaningfully change plans, and when do you touch them?
Candidates: random_page_cost/seq_page_cost (SSD realities), effective_cache_size (memory honesty), default_statistics_target (per-column raise), work_mem (sort/hash spills - session-scoped for heavy reports not global blowup), jit off for OLTP short queries.
Discipline: session/local SETs for specific workloads over global flips; every tweak paired with EXPLAIN (ANALYZE, BUFFERS) evidence before/after.

### Q11: What is the partition pruning mechanism and its limits?
* Planner prunes using constraint comparison at plan time (constant predicates) AND execution time (parameterized/subquery cases via runtime pruning).
* Limits: pruning fails with volatile functions, OR across partitions keys, implicit casts; unique/global constraints must include partition key.
* Enable_pruning GUC for A/B verification; EXPLAIN shows "Subplans Removed" counts.

---

### Q12: How does parallel query execution divide work (Gather/Gather Merge) and when does it backfire?
* Leader spawns workers each scanning partial ranges (parallel seq/index scans), sharing partial aggregates via Partial/Combine hash aggregates; Gather merges sorted streams preserving order.
* Backfire: small tables (startup cost dominates), contention on single hot index pages, worker starvation under concurrent parallels, per-worker costs like function calls multiplying.
Controls: max_parallel_workers_per_gather, min_parallel_table_scan_size, PARALLEL SAFE marking on functions.

---

### Q13: Explain snapshot too old / long-transaction interplay and operational mitigations.
* old_snapshot_threshold allows vacuum removal of rows needed by long snapshots → subsequent reads error ("snapshot too old") instead of silent bloat growth - availability-vs-bloat dial.
* Mitigations: kill/idle-in-transaction sessions aggressively (idle_in_transaction_session_timeout), move reporting to replicas, chunk long batch reads committing between batches.
Monitoring: longest xact age + backend_xid age dashboards.

---

### Q14: What is the difference between logical replication publications/replica identity requirements?
* Logical decode needs REPLICA IDENTITY to identify updated/deleted tuples: default uses PK; tables WITHOUT pk require FULL (heavy WAL) or reject updates/deletes.
* Schema evolution protocol: additive-first coordinated deployments; TRUNCATE replicates but sequence state does NOT - sequences must be manually synced on cutovers.
Initial sync mechanics: tables copied under snapshot then streamed from consistent LSN.

---

### Q15: What is the double-buffering interplay of shared_buffers vs OS page cache, and sizing wisdom?
* Double caching means effective cache = shared_buffers + OS cache; random_page_cost assumptions should reflect SSD reality (~1.1).
* Sizing heuristic: 25% RAM shared_buffers common ceiling of usefulness (beyond that clock-sweep inefficiencies); leave rest to OS read-ahead efficiency.
* Verify per-relation hit ratios before buying RAM - some working sets simply exceed any reasonable memory.

---

### Q16: How do you implement optimistic concurrency with xmin system columns?
```sql
UPDATE doc SET body=$2
WHERE id=$1 AND xmin = (SELECT xmin FROM doc WHERE id=$1);
```
* Zero schema addition leveraging system column as version; rowcount=0 signals conflict.
* Caveats: VACUUM/FREEZE can change hint bits? (xmin itself stable post-commit; freezing modifies infomask not xid) - safe pattern; ORM integrations map naturally.
Compare against explicit version integer portability trade-offs.

---

### Q17: What does `pg_stat_statements` teach and how do you operationalize it?
* Normalized statement store: calls, total/mean/min-max time, rows, shared block hits/reads/dirtied/written, temp blocks (spill detector!), wal bytes.
* Operational loop: top total_time offenders weekly → EXPLAIN ANALYZE with BUFFERS → fix (index/query shape) → verify entry improves.
* Reset discipline around deploys for clean attribution; track queryid stability caveats across versions.

---

### Q18: How do you safely run DDL on multi-TB tables (operations catalog)?
Catalog:
* CREATE INDEX CONCURRENTLY (invalid-index retry procedure).
* ADD COLUMN constant-default (PG11+ fast), SET NOT NULL via CHECK(NOT VALID)+VALIDATE two-step then NOT NULL swap.
* ALTER TYPE avoiding rewrites (int→bigint needs rewrite - plan ahead!).
* Lock monitoring during ops: pg_locks granted=false alerts; timeout guards (lock_timeout) preventing queue pile-ups behind your own migration.

---

### Q19: What is BRIN's effectiveness model and its failure modes?
* Stores min/max per block range - tiny footprint ideal for append-only correlated columns (created_at on logs/events).
* Effectiveness collapses when physical correlation breaks (random updates interleaving, out-of-order bulk loads) - planner range estimates explode.
* pages_per_range tuning + explicit re-summarization maintenance; measure via EXPLAIN showing brin filter selectivity achieved.

---

### Q20: How would you design a high-throughput insert pipeline (100k+ rows/sec) landing in Postgres?
Stack choices:
* COPY binary protocol via stdin from stream processors - fastest path by far.
* Batched multi-row INSERTs with ON CONFLICT DO NOTHING upserts; unlogged/staging tables then INSERT SELECT transforms.
* Partitioning by ingest time enabling parallel loads + cheap retention drops; indexes minimized during load (build later or partial).
* WAL/synchronous_commit trade-offs documented per durability class of data.

### Q21: How do you implement row-level expiration at scale (TTL semantics) without delete storms?
Options:
* Scheduled deletion sweeps by indexed expires_at ranges (batched, throttled).
* Partition-drop lifecycle: daily partitions, DROP old partition = O(1) - the gold standard for time-series retention.
* Partial indexes excluding expired rows keeping hot set tight.
Trade-off table per data class; never unindexed DELETE loops under traffic.

---

### Q22: What is the security model surface: roles, RLS bypass paths, and hardening checks?
* Roles grant hierarchy; BYPASSRLS attribute silently defeats policies (audit pg_roles); superusers bypass everything.
* RLS FORCE for owner rows; search_path hijacking prevention (`pg_catalog` first + revoke public schema create).
* Extensions/trusted languages review; log_statement sampling for DDL audits; pg_hba tiering per network zones.
Hardening checklist runbook executed on provision, verified via automated policy introspection queries.

---

### Q23: What does checkpoint tuning actually govern and how do you find the sweet spot?
* Checkpoints flush dirty buffers writing FPW records; too frequent = IO bursts + WAL churn; too rare = long recovery + huge WAL spikes post-checkpoint.
* Tunables: max_wal_size (primary dial), checkpoint_completion_target 0.9 spreading writes; monitor checkpoints_req vs timed ratio (req-dominated = undersized max_wal_size).
* Correlate with latency histograms - smoothing visible directly in p99 graphs.

---

### Q24: Explain prepared statement plan caching pitfalls and plan_cache_mode.
* Generic vs custom plans decided after 5 executions comparing average costs - parameter sniffing analog: skewed distributions make generic plans catastrophic for some values.
* Mitigations: plan_cache_mode=force_custom_plan for offending statements, PL/pgSQL recoding, or query restructuring removing parameter sensitivity.
Diagnose via auto_explain logging nested statements showing generic plan chosen despite better custom alternative.

---

### Q25: What final principles would you teach a team operating Postgres at scale?
Synthesis:
* Vacuum/autovacuum is your metabolism - monitor its vitals like heart-rate (bloat, xid age, autovacuum conflicts).
* Plans are estimates made honest by statistics hygiene - ANALYZE discipline plus extended stats where correlation lives.
* Migrations are production traffic: every DDL reviewed for lock/duration profile, CONCURRENTLY everywhere hot.
* Durability knobs are business decisions documented per data class.
* Measure everything through EXPLAIN (ANALYZE, BUFFERS) culture - opinions lose to buffers numbers.



