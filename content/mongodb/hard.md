# MongoDB - Hard Interview Questions

### Q1: Explain WiredTiger storage engine internals, specifically MVCC, page structure, checkpointing, and reconciliation.
* **Multi-Version Concurrency Control (MVCC)**: WiredTiger handles concurrent transactions by keeping multiple versions of modified documents. Readers get a point-in-time snapshot, avoiding read locks while writes occur concurrently.
* **Page Structure**: Data is organized in B-Tree pages (internal and leaf pages) in memory and on disk. Modifications are stored as in-memory "update lists" appended to the original on-disk page layout.
* **Checkpointing**: Every 60 seconds (or when journal writes reach 2GB), WiredTiger flushes all dirty in-memory pages to disk, creating a crash-consistent checkpoint. 
* **Reconciliation**: During checkpointing, the engine combines the in-memory update lists with the old on-disk page format, compiles them into a new layout, compresses it, and writes clean, new pages to disk.

### Q2: What is read concern `snapshot` and how does it guarantee read isolation in multi-document transactions?
* **Concept**: Only available within multi-document sessions/transactions.
* **Guarantee**: It provides strict snapshot isolation. The query engine reads data from a synchronized, point-in-time snapshot of the database across all replica set nodes.
* **Mechanism**: Ensures that all operations inside the transaction observe a single, consistent state of the database. Even if other clients commit transactions concurrently, the transaction's view remains completely isolated and unchanged.

### Q3: How does the election protocol version 1 (pv1) prevent split-brain scenarios in a distributed replica set?
* **Split-Brain**: A situation where network partitions cause two sub-groups of a replica set to both think they have an active primary, leading to divergent write logs.
* **PV1 Solution**: Uses strict raft-like consensus. A candidate node must receive a majority vote of *all* voting nodes (e.g., at least 2 out of 3, or 3 out of 5) to become primary.
* **Double Voting Prevention**: A voter can only vote once per election term (using term increment counters). If a network partition occurs, only the partition containing a true majority can elect a primary; the minority partition is physically blocked from electing a primary.

### Q4: Explain the step-down process of a Primary node and how to configure priority and votes parameters.
* **Step-Down**: An administrative command (`replSetStepDown`) or automatic behavior where the active primary relinquishes its role and becomes a secondary.
* **Trigger**: Happens during maintenance, or when the primary detects that it has lost connectivity to a majority of the replica set nodes.
* **Configuration**:
  * `priority`: A number (0 to 1000) indicating preference for primary. Secondary nodes with `priority: 0` can never become primary.
  * `votes`: A boolean (0 or 1) indicating voting rights. Up to 7 members in a replica set can have votes.

### Q5: How does MongoDB handle node synchronization from scratch (Initial Sync)?
* **Phase 1: Metadata & Cloning**: The syncing node creates database structures, drops existing databases, clones all collections and indexes from a sync source node, while concurrently logging any new oplog writes occurring on the sync source.
* **Phase 2: Oplog Application**: The syncing node applies the recorded oplog writes to bring its local dataset up to speed.
* **Pitfalls**: If the sync source's oplog rolls over (overwrites older records) before Phase 1 completes, the sync fails, requiring a complete restart.

### Q6: Describe the mechanics of the Balancer in a sharded cluster.
* **Balancer**: A background process running on the Config Server primary that monitors chunk counts across shards.
* **Thresholds**: Initiates chunk migrations when the difference in chunk distribution between the most-loaded and least-loaded shards exceeds migration thresholds.
* **Locking**: Uses a distributed lock (stored in config servers) to ensure only one migration runs at a time per collection.
* **Tuning**: Can be disabled, scheduled to run only during off-peak maintenance windows, or restricted to move chunk sizes using specific rate limits.

### Q7: Explain the impact of write concern `w: "majority"` with `j: true` on secondaries.
* **Primary Behavior**: The primary writes to its journal, applies the change, and waits for a majority of secondaries to write the oplog record to their journals.
* **Secondary Behavior**: The secondaries pull the oplog, write it to their disk journals, and apply it.
* **Durability Guarantee**: By enforcing `j: true` on a majority-write concern, MongoDB guarantees that even if a catastrophic power failure shuts down the entire data center immediately after write acknowledgment, the acknowledged write will remain completely intact upon server recovery.

### Q8: What is the Read Concern `linearizable` and how does it differ from `local` and `majority`?
* **Linearizable**: Reads reflect only writes successfully committed to a majority.
* **Core Difference**: Unlike `majority`, `linearizable` forces the primary node to contact a majority of other replica set members *during the read call* to verify it is still the true primary.
* **Performance Cost**: Introduces network round-trip latency to every read operation, but guarantees that the application will never read "stale" data from a primary that has been partitioned away and superseded.

### Q9: Explain the impact of the WiredTiger cache size configuration and how to tune it.
* **Default Size**: The larger of either: 50% of (RAM - 1GB), or 256MB.
* **Purpose**: Holds uncompressed dirty and clean data pages in memory for rapid read/write access.
* **Tuning**: In containerized environments, WiredTiger does not automatically detect container limits and reads host RAM instead, which can lead to OOM crashes. You must manually cap `wiredTiger.engineConfig.cacheSizeGB` to match container resources.
* **Rule of Thumb**: Allocate enough memory so that the active working set (data + indexes frequently accessed) fits entirely within the cache.

### Q10: Detail how MongoDB handles index builds. Hybrid index builds.
* **Legacy**: Foreground index builds locked the database entirely (blocking reads/writes). Background builds were slower but allowed concurrent access.
* **Hybrid Index Builds (Modern)**: Since version 4.2, index builds are hybrid. They are fast, secure, and do not block writes.
* **Mechanism**: During the build, WiredTiger scans the collection to construct the index, while concurrently writing any incoming user inserts/updates to a temporary "side-table". At the end of the build, the side-table modifications are drained and applied to the new index before it becomes active.

### Q11: How does MongoDB handle orphaned documents in sharded environments?
* **Orphaned Documents**: Documents that exist on a shard but belong to a chunk that has been migrated to another shard.
* **Cause**: Occurs because chunk migration copies data to the destination shard and updates the config server metadata, but the cleanup step on the source shard is executed asynchronously in the background.
* **Resolution**: The background clean-up thread on the source shard eventually deletes them. Modern MongoDB versions ensure that query routers (`mongos`) automatically filter out orphaned documents during reads, preventing duplicate results.

### Q12: Detail the internals of the aggregation execution engine memory limits and optimization.
* **RAM Limit**: Individual aggregation stages have an in-memory limit of **100MB**. If exceeded, the stage fails unless `allowDiskUse` is enabled.
* **Optimizer Stage Pushdown**: The query planner optimizes execution plans before running:
  * Reorders stages: Pushes `$match` and `$sort` stages to the very front of the pipeline.
  * Index optimization: Merges `$match` with `$sort` so they can run as an indexed scan (`IXSCAN`).
  * Projected pruning: Analyzes trailing `$project` stages and restricts fetched fields from disk early in the pipeline.

### Q13: Explain how the change stream resume token is constructed.
* **Structure**: A hexadecimal string containing BSON-encoded metadata:
  * The cluster time of the operation.
  * A UUID uniquely identifying the collection.
  * The operation type and internal transaction identifier.
  * The exact document `_id` and position in the oplog.
* **Fault Tolerance**: Storing this token allows client applications to survive restarts. By passing this token back via the `resumeAfter` option, MongoDB locates the exact oplog offset and streams events without duplicate processing.

### Q14: Describe the role of config servers in a sharded cluster. What happens if a majority go down?
* **Role**: Config servers hold the authoritative cluster metadata: chunk routing maps, authentication configurations, and sharding layouts.
* **Majority Offline**: If a majority of config servers fail, the metadata store becomes read-only.
* **Impact**:
  * Existing routing continues to work; reads/writes still execute on shards *if* the `mongos` routers have the metadata cached.
  * No new chunk splits, merges, or migrations can occur.
  * No administrative operations (creating collections, adding shards, or updating shard keys) can execute.

### Q15: Explain the mechanics of MongoDB's distributed transactions (Two-Phase Commit).
* **Coordinator Node**: The router or transaction session coordinator initiates the transaction.
* **Phase 1: Prepare**: The coordinator sends a "prepare" command to all participating shards. Each shard locks its local resources, writes a prepare record to its local oplog, and responds with readiness.
* **Phase 2: Commit**: Once all participants respond with success, the coordinator writes a "commit" state to its config servers and broadcasts a "commit" command to all participants. Shards apply changes permanently and release locks.

### Q16: How do you diagnose and resolve WiredTiger cache eviction issues?
* **Symptoms**: Application queries stall, and write latencies spike.
* **Diagnosis**: Check `db.serverStatus().wiredTiger.cache` metrics. Look at "percent dirty storage in cache" (eviction begins at 20% dirty, and system-wide blocks can occur if dirty pages exceed 20% or overall cache reaches 95%).
* **Resolution**:
  * Scale up the IOPS capacity of the underlying disk storage (ensure disk writes can keep up with the dirty page rate).
  * Reduce bulk write concurrency.
  * Increase `wiredTiger.engineConfig.cacheSizeGB` if host memory allows.

### Q17: Detail the performance cost of compound indexes with high multikey elements.
* **Cartesian Product**: If you create a compound index `{ tags: 1, categories: 1 }` where both fields are arrays, MongoDB must index every combination of elements in both arrays.
* **Explosion**: If `tags` has 10 elements and `categories` has 10 elements, a single document requires **100** index entries.
* **Prevention**: MongoDB physically blocks the creation of compound indexes where more than one field is an array to prevent massive write performance degradation.

### Q18: Explain how to evaluate the `explain` output fields `nReturned`, `keysExamined`, and `docsExamined`.
* **`keysExamined`**: Number of index entries scanned.
* **`docsExamined`**: Number of actual documents fetched from disk/memory.
* **`nReturned`**: Number of documents matching the query filter and returned to the client.
* **Optimal Ratio**: The gold standard is `keysExamined == docsExamined == nReturned`. 
  * If `keysExamined >> nReturned`, the index is not selective enough.
  * If `docsExamined >> nReturned`, the index does not fully cover the query filter, causing the engine to waste IOPS reading non-matching documents from disk.

### Q19: How does MongoDB implement Client-Side Field-Level Encryption (CSFLE)?
* **Architecture**: The application client holds the Master Encryption Key (MEK) via a Key Management Service (KMS).
* **Mechanism**:
  * The driver analyzes the JSON schema mapping of the target collection.
  * When a write is executed, the driver intercepts the call, contacts the KMS to retrieve a Data Encryption Key (DEK), encrypts the configured field, and sends ciphertext to the server.
  * During reads, the driver decrypts the encrypted fields automatically.

### Q20: Explain the security implications and execution limits of MongoDB's `$where` operator.
* **`$where`**: Allows running arbitrary JavaScript code to evaluate matching conditions.
* **Drawbacks**:
  * Runs single-threaded in a sandboxed JavaScript interpreter, bypassing WiredTiger's internal thread parallelism.
  * **No Index Support**: Forces a full collection scan (`COLLSCAN`) for every query.
  * **Security**: Highly vulnerable to NoSQL injection attacks if user inputs are concatenated directly into the JS execution string.

### Q21: How do you design an optimal MongoDB schema for storing time-series data?
* **Bucket Pattern (Legacy)**: Accumulating multiple readings (e.g., hourly readings) into a single document with nested sub-documents to reduce index size and document count.
* **Time-Series Collections (Modern)**: Since version 5.0, MongoDB supports native Time-Series collections.
* **Internals**: Under the hood, MongoDB automatically column-compresses data and buckets time-series readings into highly efficient, hidden physical collections, reducing disk footprint by up to 90% and speeding up analytical queries.

### Q22: Describe how to migrate a production replica set between storage engines with zero downtime.
* **Rolling Migration**:
  1. Set up a backup of the database.
  2. Take one secondary node offline.
  3. Wipe its data directory, change its configuration file to target the new storage engine (or compression setting), and start it.
  4. Allow the node to perform an Initial Sync, pulling data and rebuilding indexes under the new engine.
  5. Repeat this process for all other secondaries sequentially.
  6. Force the primary to step down, wait for a rebuilt secondary to be elected primary, and then rebuild the former primary node.

### Q23: What are write conflicts in MongoDB and how does WiredTiger resolve them?
* **Write Conflict**: Occurs when two concurrent transactions attempt to modify the exact same document at the same time.
* **Mechanism**: WiredTiger uses optimistic concurrency control. It detects that the document version has been modified by another thread since the current transaction read it.
* **Resolution**: WiredTiger aborts the losing transaction. The MongoDB server handles this abort transparently, automatically retrying the failed write operation up to a configured threshold before returning a write conflict error to the client driver.

### Q24: What is the purpose of the MongoDB cursor `noCursorTimeout` option, and what are its risks?
* **Purpose**: Prevents the MongoDB server from automatically closing an inactive cursor after the default 10 minutes of inactivity. Useful for long-running batch migrations.
* **Risks**: Every open cursor consumes server memory and resources. If an application crashes or fails to close a `noCursorTimeout` cursor explicitly, the cursor remains active indefinitely, causing memory leaks and potentially locking resources on the server.

### Q25: Explain how `$bucket` and `$bucketAuto` aggregation stages calculate boundaries.
* **`$bucket`**: Requires manually defined boundary thresholds (e.g., `[0, 10, 50, 100]`). Any value outside the boundaries falls into a default bucket or throws an error.
* **`$bucketAuto`**: Calculates boundaries dynamically using an approximate cardinality algorithm (HyperLogLog) to split the dataset into `n` buckets containing a uniform distribution of documents.

### Q26: What is a "Read-After-Write" consistency problem, and how do you solve it?
* **Issue**: An application writes to the primary, then immediately reads from a secondary using a read preference of `secondary`. Due to replication lag, the secondary might not have the write yet, causing a stale read.
* **Solution**: Use **Causal Consistency Sessions**. The driver tracks the logical session time (`clusterTime`). When reading, the driver passes the last seen write time to the secondary, forcing the read to block until the secondary replicates up to that specific cluster time.

### Q27: Detail how MongoDB handles sorting when multiple indexes can satisfy parts of a compound query.
* **Candidate Plans**: The optimizer generates multiple candidate execution plans using different indexes.
* **Trial Period**: It executes the query plans concurrently in a short "trial period" (scanning a small number of keys).
* **Winning Plan**: The plan that returns the required documents first or scans the fewest keys is designated the "winning plan" and is saved in the plan cache. All subsequent matching queries skip evaluation and use the cached plan.

### Q28: How do high insertion rates on a collection with a monotonically increasing ID impact B-Tree leaf node splits?
* **Impact**: Since IDs (like ObjectIds) are sequential, all new inserts are directed to the far-right leaf node of the B-Tree index.
* **Splitting**: This causes constant leaf-node splits on the far right. Because the split point is always at the end, the left-hand nodes remain static, leading to 50% empty space fragmentation in index leaf pages (poor page utilization).
* **Mitigation**: Use hashed indexes or random UUIDs if write distribution is highly prioritized over range-scanning optimization.

### Q29: What is the role of the `local` database in MongoDB?
* **Role**: A non-replicated database unique to each individual MongoDB instance.
* **Critical Collections**:
  * `oplog.rs`: The rolling transaction logs.
  * `replset.election`: Stores metadata about active primary elections.
  * `startup_log`: System diagnostics logged during startup.
  * `me` and `slaves`: Active tracking of replica set membership.

### Q30: How do you configure and optimize connection pool parameters for high-traffic microservices?
* **`minPoolSize`**: Keeps a minimum baseline of warm connections, eliminating connection establishment latency.
* **`maxPoolSize`**: Caps connections to prevent microservice clusters from overwhelming MongoDB with tens of thousands of simultaneous sockets.
* **`maxIdleTimeMS`**: Automatically closes idle connections that exceed the limit, reclaiming database server file descriptors.

### Q31: What is the difference between physical deletes and WiredTiger space reclamation?
* **Physical Deletes**: Running `deleteMany()` removes documents from the collection metadata but does not shrink the physical database files on disk.
* **Internal Fragmentation**: Deleting documents leaves empty slots (holes) inside WiredTiger's B-Tree data pages, which are reused for subsequent inserts.
* **Reclamation**: To physically shrink database files on disk, you must run the `compact` command on the collection, or execute a rolling node-wipe and Initial Sync.

### Q32: Detail the differences in write lock behavior between standard and capped collections.
* **Standard Collections**: Support highly parallelized concurrent inserts, relying on document-level locking and optimistic concurrency.
* **Capped Collections**: Enforce strict chronological insertion order. This requires a collection-level write lock for inserts, serializing operations and significantly capping concurrent write throughput compared to standard collections.

### Q33: How does `$graphLookup` handle cycle detection and maximum recursion depth?
* **Cycle Detection**: Automatically tracks already-visited document `_id`s in memory. If a relationship points back to an already-traversed node, it halts traversal on that branch to prevent infinite loops.
* **`maxDepth`**: An integer parameter that restricts how many times the recursion can loop (0 represents the first level of relationships).

### Q34: Explain how replica set tags work and how to use them.
* **Tags**: Arbitrary key-value pairs assigned to replica set members (e.g., `{ "dc": "east", "use": "analytics" }`).
* **Usage**: Applications specify tag sets in their connection URI or read preferences. This allows targeting specific physical subsets of nodes (e.g., routing heavy analytical reports to low-priority nodes located in specific geographic locations).

### Q35: What is the performance impact of using `$lookup` to join across sharded collections?
* **Scatter-Gather Joined Reads**: If you join from an unsharded collection to a sharded collection, the primary node must distribute the `$lookup` sub-queries across all shards in the cluster if the join field is not the shard key.
* **Network Overhead**: Generates massive inter-shard network traffic, easily saturating the cluster's network interfaces and degrading overall database throughput.

### Q36: Explain the difference between `$merge` and `$out` with respect to transactional rollback.
* **`$out`**: Creates a temporary collection, executes the entire pipeline, and atomic-renames it to the target collection at the very end. If the pipeline fails midway, the original target collection remains completely unaffected (transaction-like rollback).
* **`$merge`**: Writes documents incrementally to the target collection as they are processed in the pipeline. If the pipeline fails midway, all modifications written up to that point remain permanently stored in the target collection.

### Q37: How do you handle large-scale data deletion without causing locks or database slow-downs?
* **Issue**: Running a single `deleteMany` command targeting millions of records forces WiredTiger to maintain massive in-memory delete lists, flooding the transaction journal and causing massive write latency spikes.
* **Solution**: Execute the deletion in batches. Write a script that queries matching IDs, limits the batch (e.g., 1,000 documents), deletes them by ID, and sleeps for a few milliseconds between batches to allow the server to flush cache pages.

### Q38: Explain how TTL indexes can impact system performance and how to control them.
* **Impact**: The TTL cleanup thread runs once every 60 seconds. If a high volume of documents expire simultaneously, the background deletion can saturate disk I/O, causing transaction latency spikes.
* **Mitigation**: You cannot reschedule when the background thread runs. However, you can stagger the expirations by adding a random jitter to the indexed Date field inside documents, or perform batch deletions manually during off-peak hours instead of relying on TTL.

### Q39: How do you debug replica set partition issues (network splits) with flapping?
* **Flapping**: Nodes constantly switching between primary, secondary, and candidate states.
* **Resolution**:
  * Check network latency between nodes. If heartbeats exceed 10 seconds, increase election timeouts (`electionTimeoutMillis`) to prevent false-alarm failovers.
  * Adjust member `priority` configurations to give preferred nodes a clear advantage.
  * Ensure the replica set has an odd number of voting nodes to guarantee stable majority decisions.

### Q40: What is a "Rollback" in MongoDB replication, and how do you recover?
* **Rollback**: Occurs when a secondary node syncs with a newly elected primary and discovers that some of its own local writes (written when it was a primary) were never replicated to other nodes before it went offline.
* **Data Recovery**: MongoDB writes the rolled-back documents to BSON files inside the `rollback/` directory of the database folder. Admins must manually inspect these files and use `mongorestore` or custom parsing scripts to re-apply the lost writes.

### Q41: Describe how MongoDB handles multi-master scenarios in sharded clusters when network partitions occur.
* **Prevention**: MongoDB physically prevents multi-master scenarios because the config servers manage chunk metadata.
* **Distributed Locking**: Config servers enforce that a balancer or chunk migration lock can only be held by a single primary node. A partitioned shard node cannot accept writes for a chunk that has been migrated and verified on another shard.

### Q42: What is the role of "Sessions" in MongoDB, and how do they enable retryable writes and reads?
* **Sessions (LSD)**: Associate a unique logical session ID with a series of operations.
* **Retryable Writes**: When a write fails due to a transient network issue or replica failover, the driver automatically retries the write with the same session ID. The server detects that the operation with that specific sequence number has already been applied, avoiding duplicate writes.

### Q43: How does mutual TLS (mTLS) work for MongoDB enterprise security?
* **mTLS**: Both the client and the server validate each other's digital certificates.
* **Configuration**:
  * The server is configured with a CA certificate file to validate incoming client certificates.
  * The client connects with its own certificate signed by the trusted CA.
  * The server matches the client's certificate Common Name (CN) or Subject Alternative Name (SAN) to map the client to a specific internal database user role.

---

### Q44: Explain online/live resharding (MongoDB 5.0+). How does it differ from the old dump-and-reload approach?
* Live resharding re-keys a collection's data across shards **while serving traffic** — no export/import window, no double-write application hacks.
* Mechanics: coordinator clones data applying an oplog-catching loop (clone phase → oplog apply phase → strict consistency barrier), then swaps routing metadata atomically in config servers; clients see a momentary stall at most.
* Constraints: new shard key must satisfy certain conditions (no unique index except _id-compatible ones), resharding consumes throughput budget (throttled), and max collection size guidance exists per version.
* Pre-5.0 alternatives worth contrasting: manual copy with dual-writes, or the "refactor-for-shardability" pattern (compliant keys designed upfront). Interviewers probe why choosing an immutable-ish shard key upfront still beats relying on resharding.

### Q45: How does MongoDB's query planner race candidate plans? What is plan cache pollution?
* For eligible queries the system generates multiple candidate plans (one per viable index) and races them in a trial period (up to ~101 results); the fastest becomes cached in the **plan cache** keyed by query shape.
* Cache entries carry work/eviction counters — after enough executions a plan graduates to pinned-in-memory status; cache clears on index builds/drops, replanning triggers, or explicit flushes.
* Pollution scenarios: skewed data making the raced winner wrong for other parameter values (parameter-sniffing analog), frequent cache invalidation storms causing planning CPU spikes, SBE/classic engine differences changing winners.
* Mitigations: index filters pinning choices, strategic `hint()`, keeping shapes normalized (avoid OR-explosions), monitoring `serverStatus.metrics.queryExecutor.scanned/scannedObjects` ratios.

### Q46: What are WiredTiger read/write tickets and how do they govern concurrency?
* WiredTiger gates concurrent work with a fixed pool of **read tickets** and **write tickets** (defaults scaled to cores, e.g., 128 each historically) — a semaphore model preventing context-switch thrash beyond optimal parallelism.
* Operations acquire tickets before executing; exhaustion queues requests, surfacing as rising `queuedLatency` and throughput ceiling even with idle CPU — the classic symptom is latency growth without CPU saturation.
* Long-running operations (big scans, huge aggregations) holding tickets starve OLTP traffic; `maxInternalConnections`... more precisely ticket tuning (`wiredTigerConcurrentReadTransactions`) is occasionally used, but the real fix is bounding operation cost (indexes, limits, allowDiskUse tradeoffs).
* Diagnostic chain: `serverStatus.wiredTiger.concurrentTransactions` → currentTicket utilization → correlate slow-op profiler entries.

### Q47: Describe the structure of oplog entries and why they must be idempotently applicable.
* Each oplog entry is a BSON doc: `ts` (timestamp, also the ordering key), `op` (i=insert/u=update/c=command/d=delete/n=noop), `ns` (namespace), `o` (the payload), `o2` (update selector), plus `wall` clock and statement metadata.
* Updates store **delta deltas** (`$v:2` diff format: i/u/d sub-documents for set/unset paths) rather than whole post-images — secondaries apply transformations, so entries must produce identical results regardless of prior local state (idempotency enables safe re-application after crashes/resume).
* Noops preserve oplog continuity across periods without writes (heartbeat effect for secondary chaining and oplog-window advancement).
* Consequences: idempotency forbids non-deterministic update expressions in replicated contexts ($where-style randomness constrained), and delta application explains some replication lag patterns for wide updates.

### Q48: What are change stream pre-images and post-images? How do you enable and cost them?
* By default change events carry the **post-change delta**; enabling `changeStreamPreAndPostImages` on a collection (and the client watch option `fullDocumentBeforeChange`/`fullDocument: 'whenAvailable'`) delivers full before/after snapshots in events.
* Uses: audit trails, cache invalidation needing old values, syncing search indexes that require deletes-with-content, downstream systems computing diffs.
* Cost mechanics: images stored in dedicated `config.system.preimages` collection governed by `expireAfterSeconds` — they inflate storage, add write amplification (extra capture on each modification), and increase oplog/replication load; unbounded retention is a classic outage story.
* Design guidance: enable surgically per-collection, cap retention aggressively, prefer post-image-only where possible, and validate downstream consumers tolerate image-unavailable cases.

### Q49: What are hedged reads? When do they help and when do they hurt?
* With `readPreference=nearest` + hedge enabled, MongoDB sends the same read to two members (primary-favored/secondary sets configurable): the slower reply is discarded — masking transient latency outliers on replicas with laggy disks or GC pauses.
* Benefit profile: tail-latency (p99) reduction for read-heavy services tolerant of slightly higher cluster load; especially valuable across availability zones with jittery links.
* Costs: doubled internal work for hedged requests, potential extra cache pressure, and misleading observability (underlying slowness hidden until both paths degrade).
* Requirements/guardrails: requires sharded clusters (mongos-level feature), works per-operation via read concern/preference config; disable for strongly consistent reads where duplicate execution semantics matter.

### Q50: What is SBE (Slot-Based Execution Engine)? How does it change aggregation performance?
* SBE (introduced progressively 4.4→6.0+) replaces the tree-walking DocumentSource pipeline interpreter for eligible queries with a volcano-style **slot machine executor**: operators exchange tuples in slots (columnar-ish vectors), compiled expression trees evaluate per-slot with far fewer virtual calls and materializations.
* Wins: group/lookup/project-heavy aggregations see large speedups; expressions compile once; memory accounting tighter; explain output switches to `explainVersion: 2` with SLOT_BASED stages visible.
* Eligibility rules decide SBE vs classic engine per query (certain stages/operators fall back); DBAdmins tune via `internalQueryFrameworkControl` (forceClassic/trySbeRestricted/trySbeFull).
* Interview angle: know that `explain` reports which engine ran, and that SBE + block processing complements (not replaces) good indexing — COLLSCAN under SBE is faster but still a scan.

---

## Coding & Implementation Challenges

### Q51: Implement an advanced multi-document transaction using the official Node.js driver, incorporating sessions, retryable writes, and custom read/write concerns.
```javascript
const { MongoClient } = require('mongodb');

async function executeTx() {
  const client = new MongoClient('mongodb://localhost:27017/?replicaSet=rs0&retryWrites=true');
  await client.connect();

  const session = client.startSession();
  
  // Define strict options for critical financial transactions
  const txOptions = {
    readPreference: 'primary',
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority', j: true }
  };

  try {
    await session.withTransaction(async () => {
      const db = client.db('banking');
      
      // Debit Account A
      const debitRes = await db.collection('accounts').updateOne(
        { accountId: 'ACC100', balance: { $gte: 500 } },
        { $inc: { balance: -500 } },
        { session }
      );
      if (debitRes.matchedCount === 0) throw new Error('Insufficient funds or account not found');

      // Credit Account B
      await db.collection('accounts').updateOne(
        { accountId: 'ACC200' },
        { $inc: { balance: 500 } },
        { session }
      );

      // Log transaction record
      await db.collection('audit_logs').insertOne(
        { from: 'ACC100', to: 'ACC200', amount: 500, timestamp: new Date() },
        { session }
      );
    }, txOptions);
    console.log('Transaction successfully committed!');
  } catch (err) {
    console.error('Transaction aborted due to error:', err);
  } finally {
    await session.endSession();
    await client.close();
  }
}
```

### Q52: Design and write a MongoDB schema validation script that enforces strict document structures for an e-commerce order collection.
```javascript
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["orderId", "customer", "items", "totalAmount", "status"],
      properties: {
        orderId: { bsonType: "string" },
        customer: {
          bsonType: "object",
          required: ["customerId", "email"],
          properties: {
            customerId: { bsonType: "objectId" },
            email: { bsonType: "string", pattern: "^.+@.+\\..+$" }
          }
        },
        items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["productId", "quantity", "price"],
            properties: {
              productId: { bsonType: "objectId" },
              quantity: { bsonType: "int", minimum: 1 },
              price: { bsonType: "double", minimum: 0.0 }
            }
          }
        },
        totalAmount: { bsonType: "double", minimum: 0.0 },
        status: { enum: ["pending", "processed", "shipped", "delivered", "cancelled"] }
      }
    }
  },
  validationAction: "error",
  validationLevel: "strict"
});
```

### Q53: Write a highly optimized aggregation pipeline that processes raw logs, grouping them into 1-hour intervals, calculating sliding window averages of request durations using `$setWindowFields`.
```javascript
db.system_logs.aggregate([
  // 1. Filter out documents from the last 24 hours
  {
    $match: {
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  },
  // 2. Compute 1-hour intervals dynamically
  {
    $project: {
      duration: 1,
      hourBucket: {
        $dateTrunc: { date: "$timestamp", unit: "hour" }
      }
    }
  },
  // 3. Compute sliding window averages: 3 hours moving average of durations
  {
    $setWindowFields: {
      partitionBy: null,
      sortBy: { hourBucket: 1 },
      output: {
        movingAvgDuration: {
          $avg: "$duration",
          window: {
            documents: [-2, 0] // Preceding 2 documents and current document (3 hours total)
          }
        }
      }
    }
  }
]);
```

### Q54: Write an aggregation pipeline implementing a complex `$lookup` with a custom inner pipeline that filters, sorts, and limits the joined documents.
```javascript
// Join users collection to active, high-priority orders, returning only the top 3 most expensive ones
db.users.aggregate([
  {
    $lookup: {
      from: "orders",
      let: { user_id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$userId", "$$user_id"] },
                { $eq: ["$status", "active"] },
                { $gt: ["$amount", 100.0] }
              ]
            }
          }
        },
        { $sort: { amount: -1 } },
        { $limit: 3 }
      ],
      as: "top_orders"
    }
  }
]);
```

### Q55: Implement an aggregation query using `$bucketAuto` to divide products into 5 distinct price categories, calculating the average rating and total stock for each bucket.
```javascript
db.products.aggregate([
  {
    $bucketAuto: {
      groupBy: "$price",
      buckets: 5,
      output: {
        count: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        totalStock: { $sum: "$inventoryCount" }
      }
    }
  }
]);
```

### Q56: Create a highly customized text-search index with custom weights and write a query that sorts the matching results based on their search relevancy score.
```javascript
// 1. Create text index with weights
db.articles.createIndex(
  { title: "text", body: "text" },
  {
    weights: { title: 10, body: 2 },
    name: "ArticleTextSearchIndex"
  }
);

// 2. Query text and project search score for sorting
db.articles.find(
  { $text: { $search: "kubernetes databases" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } });
```

### Q57: Write a Node.js script using bulk write operations to process an input array of customers with a throttle.
```javascript
const { MongoClient } = require('mongodb');

async function bulkUploadCustomers(customersArray) {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const collection = client.db('crm').collection('customers');
  
  const batchSize = 1000;
  let batch = [];

  for (let i = 0; i < customersArray.length; i++) {
    const customer = customersArray[i];
    batch.push({
      updateOne: {
        filter: { email: customer.email },
        update: { $set: customer },
        upsert: true
      }
    });

    if (batch.length === batchSize || i === customersArray.length - 1) {
      console.log(`Executing batch write of size ${batch.length}...`);
      await collection.bulkWrite(batch, { ordered: false });
      batch = []; // Clear array memory
    }
  }
  await client.close();
  console.log('Bulk upsert finished.');
}
```
