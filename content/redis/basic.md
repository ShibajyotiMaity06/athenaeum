# Redis - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is Redis and what is it used for?
* In-memory data structure store (key-value with rich types) usable as cache, message broker, and lightweight database.
* Common uses: caching, sessions, rate limiting, leaderboards, queues, pub/sub, distributed locks.
* Single-threaded command execution (mostly) → atomic per-command, predictable latency; persistence optional (RDB/AOF).

---

### Q2: What data types does Redis provide?
* STRING (counters, tokens), LIST (queues via LPUSH/BRPOP), SET (unique members, set ops), HASH (objects), ZSET (sorted sets - leaderboards/ranges).
* Plus specialized: Streams (event logs/consumer groups), Bitmaps (presence flags), HyperLogLog (cardinality estimates), Geospatial.
Choosing the right type unlocks atomic server-side operations instead of client-side read-modify-write.

---

### Q3: What is TTL / key expiration?
* `EXPIRE key seconds` or SET with EX option; TTL auto-deletes keys - the backbone of caching semantics.
* `TTL` returns remaining seconds (-1 no expiry, -2 missing); PERSIST removes expiry.
* Expiration is lazy (checked on access) + active sampling cycle - expired-but-uncached keys may linger briefly in memory.

---

### Q4: What is the difference between RDB and AOF persistence?
* RDB: point-in-time binary snapshots on interval - compact, fast restarts, risk of losing recent writes.
* AOF: append-only log of every write - configurable fsync policy (always/everysec/no), better durability, larger files + rewrite compaction.
* Hybrid (aof-use-rdb-preamble default modern): fast load + durability. Choose per loss-tolerance budget.

---

### Q5: What is a cache hit/miss and how do you compute ratio?
* Hit = served from redis; miss = fell through to origin DB.
* Ratio = hits/(hits+misses) via INFO stats keyspace metrics.
* Low ratios signal wrong TTLs, poor key design, or genuinely uncachable data - investigate before scaling hardware.

---

### Q6: What are eviction policies when memory fills?
maxmemory-policy options: noeviction (errors on writes), allkeys-lru/lfu, volatile-lru/lfu/ttl (only expiring keys), allkeys-random.
Typical cache config: allkeys-lru or volatile-lru with generous maxmemory.
LFU suits skewed access patterns where recently-used ≠ frequently-used.

---

### Q7: How do you increment counters atomically?
`INCR key` / `INCRBY key n` - atomic server-side, no read-modify-write race even across clients.
Floats: INCRBYFLOAT. Hash fields: HINCRBY.
Foundation of rate limiters, view counters, id generators (with padding prefixes).

---

### Q8: What is the difference between KEYS and SCAN?
* KEYS pattern blocks scanning entire keyspace - production killer on big datasets.
* SCAN iterates cursor-based incrementally, returning batches; safe for production loops (may return duplicates; handle count variance).
Rule: never ship KEYS; always SCAN.

### Q9: What is a Redis hash and when is it better than a JSON string?
```redis
HSET user:42 name "Ada" role "admin"
HGET user:42 name
```
* Field-level access without deserializing whole object; partial updates atomic; memory efficient for small hashes (listpack encoding).
* JSON strings simpler for opaque blobs; hashes win for read-one-field-hot patterns.

---

### Q10: What are sorted sets (ZSET) and their killer use cases?
* Members scored; ZADD/ZRANGEBYSCORE/ ZREVRANK enable leaderboards, priority queues, time-window analytics (`ZRANGEBYSCORE ts now-3600 +inf`).
* O(log n) ops; rank queries instant.
* Sliding-window rate limiting: ZADD timestamps + ZREMRANGEBYSCORE trim + ZCARD count in one pipeline/Lua.

---

### Q11: What are Redis transactions (MULTI/EXEC)?
* MULTI queues commands; EXEC executes all atomically (no interleaving) - but NO rollback on mid-failure (command errors skip, others run).
* WATCH provides check-and-set optimism: abort EXEC if watched keys changed.
For conditional logic needing rollback semantics → Lua scripts instead.

---

### Q12: What is pub/sub and its limitations?
* PUBLISH/SUBSCRIBE fire-and-forget channels - no persistence, no delivery guarantees, disconnected subscribers miss messages.
* Great for live notifications/cache invalidation fan-out; NOT for job queues.
* Streams or lists replace it where durability matters - know the boundary.

---

### Q13: How do you connect from an application and handle connection pooling?
* Clients maintain pooled connections; expensive handshakes mean reuse always.
* Configure pool size vs maxclients limit; handle timeouts/reconnects with backoff.
* RESP3 protocol enables client-side caching push invalidations on modern clients.

---

### Q14: What is the difference between cache stampede protections: locks vs probabilistic early expiry?
* Stampede: hot key expires → N concurrent misses hammer DB.
* Lock approach: first miss acquires SETNX lock, rebuilds, releases; others short-wait/poll stale fallback.
* XFetch-style probabilistic early refresh: expire earlier proportional to popularity - no lock coordination needed.
Combine both for hot keys under heavy load.

---

### Q15: What naming conventions keep a Redis keyspace manageable?
* `object-type:id:field` grammar ("session:a1b2", "rate:{user}:login"), colon hierarchy enables SCAN patterns and tooling grouping.
* Bounded key universe documented per app; TTL policy table per key class.
Chaos prevention: one team's KEYS * is another team's outage.


