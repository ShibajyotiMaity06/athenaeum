# Redis - Hard Interview Questions

## Theory Questions & Answers

### Q1: How does Redis execute commands internally and what are the latency guarantees/breakers?
* Single I/O thread processes command queue atomically (I/O threads parallelize networking in Redis 6+, execution remains serialized) → per-command O(N) costs stall EVERYTHING.
* Latency breakers to audit: KEYS/Large DEL/SLOW Lua/Big ZADD batches — SLOWLOG + LATENCY HISTORY diagnose.
* Client-side pipelining multiplies throughput without atomicity changes; MULTI differs (queued atomicity).

---

### Q2: Explain the unified request layer + RESP3 push types enabling client caching.
* RESP3 adds out-of-band push messages separate from reply ordering — foundation of CLIENT TRACKING invalidations.
* Tracking modes: exact keys / prefix broadcast; redirect option lets a dedicated tracking connection serve others.
* Failure modes: invalidation floods overwhelming slow clients; namespace design + batching mitigates.

---

### Q3: What is the full failover sequence under Sentinel, including split-brain guards?
* Subjective down (sdown) per sentinel timeout → objective down (odown quorum) → leader sentinel election (raft-ish epoch bump) → replica promotion selection (priority, offset freshness) → reconfiguration propagation.
* Split-brain guards: min-replicas-to-write + min-replicas-max-lag cause old-master writes to REJECT during partition, bounding loss window.
* Client responsibility: re-query sentinels on role errors; idempotent operations assumed across lost-write windows.

---

### Q4: What is Redis Cluster gossip, hash-slot migration state machine, and reshard safety?
* Nodes gossip cluster bus (port+10000) sharing slot ownership epochs; config epoch resolves conflicts.
* Migration: SETSLOT MIGRATING on source → IMPORTING on target → loop MIGRATE keys (blocking source ops per key) → SETSLOT NODE finalized; ASK redirection during transit honored by smart clients.
* Safety: MIGRATE is atomic per key (dump+restore+del), but application multi-key assumptions break mid-reshard — hash tags mandatory discipline.

---

### Q5: How would you implement exactly-once consumer semantics over Redis Streams?
Reality: streams give at-least-once. Exactly-once illusion assembled:
* Dedup store: processed-id SETNX within same transaction as effect (Lua combining effect+mark atomically when effect target is redis itself).
* External-effect dedup: transactional outbox pattern — stream entry written inside DB transaction via CDC relay instead of direct XADD.
* PEL reclaim (XAUTOCLAIM) with min-idle-time prevents zombie ownership; delivery counters route poison entries to dead-letter stream.

---

### Q6: What memory mechanics matter: allocator behavior, fragmentation defrag, big-key economics?
* jemalloc size-class allocations create internal fragmentation; activedefrag incrementally relocates live data (CPU cost knob).
* Copy-on-write during bgsave doubles RSS transiently for write-heavy sets — headroom planning.
* Big-key economics: one 1GB string blocks/delays more than million small ones? Both bad differently — UNLINK + SCAN-based progressive deletion for giants.

---

### Q7: How do you implement a correct distributed lock with Redlock debates included?
Single-instance correctness:
```lua
if redis.call('SET', k, token, 'NX', 'PX', ttl) then ... release via compare-token Lua
```
Fencing tokens downstream (DB conditional on token monotonicity) close the GC-pause/expiry race hole.
Redlock (multi-master quorum) contested (Kleppmann critique): clock-jump & token-loss arguments — verdict framing: use single-instance+fencing or consensus systems (etcd/zk) when mutual exclusion must be absolute; redis locks for efficiency-not-correctness domains.

---

### Q8: What does the event-loop + IO-threading model imply for mixed workloads?
* IO threads (read/write parsing) parallelize syscalls; command EXECUTION stays single-threaded — CPU-bound Lua/O(N) still serialize throughput.
* Sizing: separate instances per workload CLASS (cache vs queue vs pubsub) preventing noisy-neighbor latency coupling.
* Monitor via INFO commandstats usec_per_call distribution — rising means O(N) creep into hotpaths.

### Q9: How do you design cache invalidation for relational-backed data with versioned keys?
Pattern:
* Key grammar `cache:{tenant}:{entity}:{id}:v{version}` — version sourced from DB row (write bumps via trigger or application layer).
* Reads fetch row version cheaply (or from change stream) then compose cache key — stale versions self-orphan and TTL out.
* Bulk invalidations bump namespace generation key composed into all child keys — O(1) mass expiry without SCAN.
Consistency window documented per entity class; adversarial tests assert cross-version reads impossible.

---

### Q10: What is Redis Functions vs EVAL evolution and migration strategy?
* FUNCTIONS: named, library-scoped scripts registered server-side (FUNCTION LOAD REPLACE) with metadata — solves EVALSHA deployment/drift pain.
* Migration: wrap legacy scripts into functions preserving KEYS/ARGV contracts; no-op flag testing in staging cluster; rollback = FUNCTION DELETE + old client path.
* Cluster note: functions replicate to all nodes automatically unlike ad-hoc SCRIPT LOAD gaps.

---

### Q11: What are the correctness pitfalls of using Redis for sessions at scale?
* Persistence loss windows (AOF everysec) → logged-out users after failover; acceptable? Documented decision needed.
* Eviction policy MUST exclude sessions (volatile-ttl misconfig evicting active sessions = support storm) — dedicated ACL/user with noeviction on session keyspace via separate logical DB or instance.
* Atomic session rotation on privilege change (DEL+SET pattern inside Lua) preventing fixation reuse.

---

### Q12: How do you implement leaderboard tie-handling and pagination correctly?
* ZSET scores collide → member lexicographic tie-break by embedding reversed timestamp/uuid suffix in member while displaying clean label via mapping hash.
* Rank queries around ties: ZRANK gives position not "rank with peers" — compute peer ranges via ZRANGEBYSCORE score±epsilon when business rank must share ties.
* Deep pagination via ZREVRANGEBYSCORE cursor on last score+member tuple — stable under concurrent ZADDs.

---

### Q13: What is the interplay of maxmemory-eviction with replication durability?
* Evictions/deletes propagate to replicas as DEL commands — replica memory tracks master including eviction storms (bandwidth spikes).
* volatile-* policies with zero-TTL datasets silently become noeviction → write errors surprise teams.
* Failover after heavy eviction churn: full resync risk if backlog exceeded — repl-backlog-size tuned to eviction burst profiles.

---

### Q14: How would you build a multi-tenant noisy-neighbor protection scheme on shared Redis?
Levers:
* Per-tenant key prefixes enabling quota enforcement via token-bucket Lua keyed tenant-side.
* Separate ACL users with command restrictions (@slow category bans), per-user memory quotas (newer versions) or logical DB separation.
* Slowlog attribution: client name set per tenant (CLIENT SETNAME) correlating latency incidents to offenders.
Escalation path documented: warn → throttle → isolate tenant onto dedicated instance.

---

### Q15: Close out: which workloads should NOT run on Redis, stated with the reasoning a senior would give?
Anti-fit list:
* Primary system-of-record needing complex queries/joins — it's a structure store, not relational engine.
* Large datasets exceeding RAM economically (disk-backed variants trade the core latency promise away).
* Strong durability guarantees without operational AOF discipline + failover-loss acceptance.
* Heavy search/aggregation analytics (use search engines/OLAP).
Framing thesis: redis excels as SPEED LAYER with explicit loss/expiry budgets — the moment budgets can't be written down honestly, choose another tool.


