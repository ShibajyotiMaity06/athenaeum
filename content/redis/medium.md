# Redis - Medium Interview Questions

## Theory Questions & Answers

### Q1: Explain Redis persistence trade-offs: AOF fsync policies and rewrite mechanics.
* appendfsync always/everysec/no - durability vs latency spectrum; everysec default losing ≤1s on crash.
* AOF rewrite forks child replaying current state into compact new file; copy-on-write memory spike during rewrite is the ops surprise (plan headroom ~2x dataset).
* auto-aof-rewrite-percentage triggers sizing; monitor aof_last_bgrewrite_status.

---

### Q2: How does replication work and what can be lost on failover?
* Asynchronous by default: replicas stream replication feed; WAIT command provides sync acknowledgment option (latency cost).
* Failover loses unreplicated writes - min-replicas-to-write guards accepting writes without healthy replicas.
* Replicas are read-only serve reads; read-replica staleness visible via master_repl_offset deltas.

---

### Q3: What is Sentinel vs Cluster - decision boundaries?
* Sentinel: HA for single-master topology (monitoring, automatic failover, client discovery). Data fits one node; scaling = vertical + read replicas.
* Cluster: automatic sharding across 16384 hash slots; multi-key ops require same slot (hash tags {}); resharding online.
Choose Sentinel for simplicity till dataset/QPS demands sharding; Cluster adds client complexity everywhere.

---

### Q4: How do hash slots and hash tags work in Redis Cluster?
* CRC16(key) mod 16384 assigns slots; MOVED/ASK redirects guide clients.
* Hash tags `{user42}.profile` and `{user42}.cart` co-locate related keys enabling MGET/Lua across them.
* Resharding migrates slots live via CLUSTER SETSLOT migrating/importing + MIGRATE COPY batches.

---

### Q5: What is the atomicity model of Lua scripting (EVAL)?
* Script executes atomically mid-command-stream - perfect check-and-set sequences (rate limiter, token bucket).
* Constraints: no external reads besides KEYS/ARGV passed (cluster-safe requirement), deterministic scripts only (no random/time without effects flags), script timeout kills blocking.
* SCRIPT LOAD + EVALSHA avoids resending bodies; NOSCRIPT fallback handling standard in clients.

---

### Q6: Design a distributed rate limiter with Redis precisely.
Sliding window log variant:
```lua
local c = redis.call('ZCARD', key)
if c < limit then
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, window)
  return 1
end return 0
```
Plus ZREMRANGEBYSCORE trim first. Token bucket variant stores tokens+last_refill computing refill lazily.
Clock authority: pass TIME via redis.call('TIME') inside script avoiding app skew. Decision: fail-open vs closed per endpoint documented.

---

### Q7: What are Redis Streams and consumer groups?
* XADD appends entries (auto-id ts-seq); XREADGROUP groups deliver each message to ONE consumer with PEL (pending entries list) tracking delivery.
* XACK after processing; XAUTOCLAIM reassigns stalled pendings from dead consumers - at-least-once semantics built-in.
* MAXLEN trimming bounds memory; vs pub/sub: durable, replayable, load-balanced.

---

### Q8: What is client-side caching (RESP3) and invalidation flow?
* Client caches responses locally; server pushes invalidation messages when keys change (CLIENT TRACKING on).
* Massive latency wins for hot reads; memory cost per client; invalidation storm risks on hot written keys - prefix-scoped tracking mitigates.
Requires RESP3-capable clients; fallback polling patterns for older stacks.

### Q9: What is the Big-O reality of common operations?
* Most single-key ops O(1); LRANGE full list O(N); ZRANGE by index O(log N + M); KEYS O(N) blocking; SMEMBERS O(N).
* DEL on giant keys blocks too → UNLINK async frees in background.
* Latency SLOs die from one accidental O(N) on a million-member collection - know your cardinalities.

---

### Q10: How does Redis Cluster handle multi-key operations and Lua?
* All keys in command/script must hash to SAME slot; otherwise CROSSSLOT error.
* Hash tags `{user123}:cart` force co-location enabling MGET/Lua across related keys.
* Design key grammar around slot affinity BEFORE scaling out - retrofitting is painful.

---

### Q11: What is cache-aside write pattern vs write-through here?
* Cache-aside: app writes DB then invalidates/deletes redis key (delete > update - avoids stale-write races). Next read repopulates.
* Write-through: write cache+DB together via abstraction layer.
* Delete-on-write race caveat: concurrent read repopulating stale value between DB write and delete - mitigations: short TTL floor, versioned keys, or delayed double-delete.

---

### Q12: What are memory optimizations for large datasets?
* Small hashes/zsets use listpack encoding automatically (hash-max-listpack-entries tuning) - massive per-key savings.
* Avoid giant values (>100KB) fragmenting; split or compress client-side before SET.
* Monitor `INFO memory`: mem_fragmentation_ratio >1.5 signals fragmentation/allocator issues (activedefrag option).

---

### Q13: What is the difference between BRPOP timeout semantics and BLPOP across multiple keys?
* BLPOP key1 key2 timeout checks keys IN ORDER, returns first available - priority queue behavior via ordering.
* Timeout 0 = block forever (dangerous without socket hygiene); clients reconnect handling required after server timeouts.
* Streams with XREADGROUP BLOCK generally replace blocking-list queues in modern designs.

---

### Q14: What is the keyspace notification feature?
* `CONFIG SET notify-keyspace-events Ex` publishes events (expired, evicted, del) to `__keyspace@0__:*` / `__keyevent@0__:*` channels.
* Uses: reacting to session expiry, cache-eviction analytics.
Caveats: delivery best-effort (pub/sub), expired-event timing lazy/active cycle dependent - never sole source of truth for critical flows.

---

### Q15: What operational metrics/alerts matter most for a Redis fleet?
* Memory used vs maxmemory + fragmentation ratio; evicted_keys rate (cache thrash signal); rejected_connections; replication lag (master_repl_offset deltas); blocked_clients (blocking op pileups); latency spikes via LATENCY HISTORY.
* Persistence health: last bgsave status, aof pending writes.
Alert philosophy: predict OOM/repl-lag incidents hours ahead, not after failover.


