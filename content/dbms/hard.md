# DBMS - Hard Interview Questions

### Q1: Explain the ARIES recovery algorithm in detail.
* **ARIES (Algorithms for Recovery and Isolation Exploiting Semantics)**: A state-of-the-art database recovery framework.
* **Phase 1: Analysis Phase**:
  * Scans the transaction log forward from the last checkpoint.
  * Identifies all active transactions (dirty transactions) and dirty pages in memory at the time of the crash.
* **Phase 2: Redo Phase**:
  * Replays all logged operations forward from the oldest unwritten page (using `RecLSN` in the Dirty Page Table).
  * Restores the database state to the exact moment of the crash (repeating history, including aborted transactions).
* **Phase 3: Undo Phase**:
  * Scans the log backward, reversing the modifications of all transactions that were active or aborted but never committed prior to the crash. Writes Compensation Log Records (CLRs) for each reversed write to prevent duplicate undos during subsequent crashes.

### Q2: Detail the Transaction Table, Dirty Page Table, and the role of LSNs in ARIES.
* **Log Sequence Number (LSN)**: A unique, monotonically increasing integer assigned to every log record.
* **Transaction Table**: Maps active transactions to their `LastLSN` (the LSN of the most recent log record written by that transaction).
* **Dirty Page Table (DPT)**: Maps dirty in-memory pages to their `RecLSN` (the oldest LSN that made the page dirty since it was last flushed to disk).
* **PageLSN**: A metadata header field on *every physical page* on disk and in memory indicating the LSN of the most recent write applied to that page. During recovery, if `PageLSN >= LogRecordLSN`, the database engine skips the write (already applied).

### Q3: Explain Write-Ahead Logging (WAL) rules mathematically.
* **WAL Theorem**: A page modification cannot be written to disk before the log record describing the modification is flushed to non-volatile disk storage.
* **Mathematical rule**: Let `PageLSN` be the LSN of the most recent modification of page $P$, and let `FlushedLSN` be the highest LSN flushed to disk. The storage engine must guarantee: `PageLSN <= FlushedLSN` before writing page $P$ to disk.

### Q4: Detail the differences between strict 2PL, rigorous 2PL, and conservative 2PL.
* **Strict 2PL**: Follows 2PL, but forces transactions to hold all **Exclusive (write) locks** until commit/abort. Prevents cascading rollbacks.
* **Rigorous 2PL**: Forces transactions to hold **all locks** (both Shared and Exclusive) until commit/abort. Guarantees that the serialization order matches the commit order.
* **Conservative 2PL**: Forces the transaction to acquire **all required locks** up front before it begins execution. If any lock is unavailable, the transaction waits without holding any locks. Completely eliminates deadlocks, but drastically restricts concurrent throughput.

### Q5: Explain Multi-Version Two-Phase Locking (MV2PL) and how it achieves lock-free reads.
* **Mechanism**: Combines MVCC with 2PL.
* **Behavior**:
  * Writes create a new version of the document/row, acquiring exclusive locks *only* on the write version.
  * Readers access a stable, committed snapshot version corresponding to their transaction start timestamp.
* **Impact**: Readers never block writers, and writers never block readers, yielding massive concurrency gains in high-throughput transactional databases.

### Q6: Describe index-organized tables (IOTs) versus heap-organized tables.
* **Heap-Organized Table**: Rows are inserted in an unordered heap fashion wherever space is available on disk pages. Indexes store search keys and row pointers (RID/physical disk addresses).
* **Index-Organized Table (IOT)**: The physical table data is stored directly within the B+ Tree leaf nodes of the primary key.
* **Trade-off**: IOTs provide extremely fast primary key lookups (no second fetch stage required) and save storage space. However, secondary indexes on IOTs are slower because they must map to the primary key instead of a direct physical disk address.

### Q7: Compare LRU, Clock, and LRU-K buffer pool replacement algorithms.
* **LRU (Least Recently Used)**: Evicts the page that has not been accessed for the longest time. Susceptible to "sequential scan pollution" (a full table scan flushes the entire active cache).
* **Clock (Second Chance)**: Emulates LRU with a circular page array and a reference bit. Scans pages; if bit is 1, clears it and moves hand; if bit is 0, evicts the page. Low CPU overhead.
* **LRU-K**: Tracks the time of the last $K$ references to a page. The page with the longest backward distance to its $K$-th reference is evicted. Solves sequential scan pollution by prioritizing pages with sustained, high-frequency access histories.

### Q8: Explain the sliding window frame architecture of database storage pages.
* **Sliding Slot Directory**:
  * **Page Header**: Stores page metadata and a directory slot array growing *downwards* from the top.
  * **Data Tuples**: Physical rows inserted growing *upwards* from the bottom of the page.
  * **Slot Pointers**: Each slot in the header directory holds a physical offset pointer to the start of its corresponding tuple in the page.
* **Fragmentation**: Deleting tuples leaves empty space in the middle. The storage engine defragmentizes the page dynamically by shifting tuples together and updating slot offset pointers.

### Q9: What is the difference between physical logging, logical logging, and physiological logging?
* **Physical Logging**: Records the exact byte-level changes made to specific disk pages (e.g., "On page 5, change bytes 10-14 to 0x01"). Very large log size, but extremely fast to replay during recovery.
* **Logical Logging**: Records the abstract high-level operations executed (e.g., "Insert employee ID 10 into table employees"). Compact log size, but highly complex to safely undo/redo after a crash.
* **Physiological Logging**: A hybrid approach used by modern databases. Records logical operations targeted to specific physical pages (e.g., "On page 5, insert row with values X, Y, Z"). Highly efficient, safe, and compact.

### Q10: Explain multi-dimensional database indexing structures like R-Trees.
* **R-Trees**: Indexes multi-dimensional spatial data (e.g., GPS coordinates, polygons) by grouping objects into nested **Minimum Bounding Boxes (MBRs)**.
* **Mechanism**: To search a point, the engine traverses the tree from parent MBRs to nested leaf MBRs, discarding non-overlapping regions immediately.
* **Grid Files**: Space is divided into a grid of predetermined dimensions. Grid files map multi-dimensional coordinates directly to bucket addresses using index arrays.

### Q11: Detail the performance cost of page splits in B+ Trees.
* **Page Split**: Occurs when an insert targets a B+ Tree leaf page that is physically full.
* **Cost**: The engine must allocate a new page, move 50% of the keys to the new page, and insert a routing key into the parent internal page. If the parent page is also full, the split propagates up the tree, which can bubble up to splitting the root page, causing a massive write latency spike.
* **Optimization**: Databases configure index **Fill Factors** (e.g., 80%), leaving 20% empty space in pages during index creation to accommodate future inserts without triggering splits.

### Q12: Describe how query parsing, semantic analysis, and logical query plan generation work.
* **Parser**: Tokenizes the SQL string and checks syntax rules to construct an **Abstract Syntax Tree (AST)**.
* **Semantic Analyzer**: Accesses the database catalog to verify table and column names, checks user permissions, and validates data types, outputting a annotated AST.
* **Logical Query Plan**: Translates the AST into an algebraic expression of relational operators (Project, Select, Join) representing the logical sequence of data transformations.

### Q13: How do cost-based query optimizers estimate plan costs using system catalogs?
* **Statistics**: Catalogs store table cardinality $N$, page counts, and column statistics.
* **Histograms**:
  * **Equi-Width**: Divides the column range into equal-sized value intervals. Poor accuracy for highly skewed data.
  * **Equi-Depth**: Divides the range into intervals containing an equal number of records, providing superior estimation accuracy for skewed distributions.
* **MCVs (Most Frequent Values)**: Stores the exact frequencies of the top $N$ most common values in a column to refine selectivity estimates for equality filters.

### Q14: Detail the System R query optimization algorithm.
* **Concept**: Uses a **Dynamic Programming** approach to find the most efficient join order.
* **Algorithm**:
  1. Evaluates all single-table access paths (scans vs indexes) and saves the best plan for each table.
  2. Evaluates joins of size 2 (pairs of tables) using the saved single-table plans, discarding sub-optimal configurations.
  3. Recursively evaluates joins of size $N$ by combining optimal size $N-1$ plans with remaining tables.
* **Heuristic**: Restricts the search space to **left-deep trees** (where the right input of every join is a base table) to leverage pipeline-based join executions and index seeks.

### Q15: Explain Volcano and Cascade extensible query optimizer frameworks.
* **Volcano**: Uses a top-down, goal-directed search engine based on logical-to-physical transformation rules. Uses memoization tables to cache equivalent plans, but separates logical plan generation from physical optimization.
* **Cascades**: An improvement over Volcano. It integrates logical transformation rules and physical implementation rules into a single unified search engine, optimizing dynamically while reducing search space overhead.

### Q16: How do databases execute parallel query plans?
* **Intra-Query Parallelism**: Executing a single query using multiple threads concurrently.
* **Inter-Query Parallelism**: Executing multiple distinct queries from different clients simultaneously.
* **Exchange Operators**: Interjected into parallel plans to manage data flow between threads:
  * **Gather**: Combines streams from multiple worker threads into a single stream.
  * **Repartition**: Re-hashes data keys to distribute rows evenly across worker threads.
  * **Distribute**: Splits a single stream into multiple streams.

### Q17: Detail Grace Hash Join and Hybrid Hash Join algorithms.
* **Grace Hash Join**: Used when both join tables exceed physical RAM.
  * **Partitioning**: Uses a hash function to partition both tables into matching bucket files on disk.
  * **Joining**: Loads one pair of matching bucket files into RAM at a time, builds an in-memory hash table for the left bucket, and probes it using the right bucket.
* **Hybrid Hash Join**: An optimization of Grace. It retains the first partition of the build table entirely in RAM during partitioning, executing joins on that partition immediately while streaming remaining partitions to disk, avoiding costly I/O cycles.

### Q18: Compare write amplification in B+ Trees versus LSM-Trees.
* **B+ Trees**: Direct update-in-place engine. Modifying a single 100-byte record forces flushing the entire 8KB/16KB page to disk, resulting in extremely high write amplification (often > 100x).
* **LSM-Trees (Log-Structured Merge-Trees)**: Append-only engine. Writes are buffered in memory (**MemTable**) and written sequentially to disk as sorted files (**SSTables**). No update-in-place occurs.
* **Compaction**: To reclaim space, a background thread merges and deduplicates SSTables, which also causes write amplification, but LSM write performance remains orders of magnitude higher than B+ Trees for write-heavy workloads.

### Q19: Explain LSM-Tree compaction strategies.
* **Size-Tiered Compaction**: Merges SSTables of similar sizes. Excellent for write throughput, but causes massive disk space spikes (space amplification) because duplicates are retained for longer periods.
* **Leveled Compaction**: Divides disk storage into levels (L1, L2, etc.) where each level contains non-overlapping keys. Merging an SSTable from L1 to L2 requires reading and rewriting overlapping SSTables in L2. Extremely low space amplification, but high CPU and write amplification overhead.

### Q20: What is a Bloom Filter, and how is it utilized in database query engines?
* **Definition**: A highly space-efficient, probabilistic data structure used to test whether an element is a member of a set. It can return false positives (indicating an item is in the set when it isn't), but never false negatives.
* **LSM-Tree Usage**: Placed in front of SSTable files on disk. Before reading an SSTable from disk, the engine queries the Bloom Filter in memory. If it returns false, the database skips accessing that SSTable entirely.
* **Hash Join Usage**: Built on the join keys of the smaller table to pre-filter rows of the larger table before initiating costly hash join executions.

### Q21: Detail the Phantom problem and how Next-Key Locking prevents it.
* **Phantom Problem**: Occurs when a transaction executes a range query (e.g., `WHERE age > 30`) and another transaction inserts a new row (e.g., `age = 35`) within that range, causing the first transaction to see a "phantom" row upon re-execution.
* **Next-Key Locking**: Used in InnoDB (MySQL) under Serializable isolation.
* **Mechanism**: Locks both the index record *and* the "gap" (empty space) preceding and succeeding the index record. Any attempt by a concurrent transaction to insert a row into a locked gap is physically blocked, preventing phantoms.

### Q22: Explain the lock escalation process in enterprise databases.
* **Process**: The database engine automatically converts multiple fine-grained locks (e.g., 5,000 individual row locks) on a table into a single, coarse-grained lock (e.g., a table lock).
* **Why**: Each lock consumes memory. When the number of active locks exceeds memory thresholds, the engine escalates locks to reclaim RAM.
* **Trade-off**: Prevents database out-of-memory crashes, but severely degrades concurrency because a table-wide exclusive lock blocks all other transactions from modifying any row in that table.

### Q23: How does the recovery manager handle partial page writes (torn pages)?
* **Torn Page**: Occurs when a system crash or power loss happens midway through writing an 8KB database page to disk, leaving the page corrupted (e.g., only 4KB written).
* **MySQL Doublewrite Buffer**: Before writing a page directly to the data files, MySQL writes it to a contiguous, sequential disk area called the doublewrite buffer. If a crash occurs during the data file write, the engine restores the uncorrupted page template from the doublewrite buffer and reapplies the transaction log.
* **Postgres Full Page Writes**: Writes a copy of the entire physical page to the WAL log file the first time that page is modified after a checkpoint, allowing full reconstruction of corrupted pages.

### Q24: What is the "Lost Update" anomaly and how do databases prevent it?
* **Lost Update**: Transaction `T1` reads a row, and transaction `T2` reads the same row. `T1` modifies the row and commits. `T2` modifies the row using its stale read data and commits, silently overwriting `T1`'s changes.
* **Pessimistic Prevention**: `T1` reads the row using `SELECT ... FOR UPDATE`, which acquires an exclusive lock, blocking `T2` from reading the row until `T1` commits.
* **Optimistic Prevention**: Utilizing a version counter column. The update statement checks: `UPDATE table SET val = X, version = version + 1 WHERE id = Y AND version = current_version`. If another update happened, the version check fails.

### Q25: Explain how PostgreSQL implements MVCC using system columns and Vacuum.
* **System Columns**:
  * `xmin`: The transaction ID that inserted the row version.
  * `xmax`: The transaction ID that deleted or updated the row version (initially 0).
* **Updates**: PostgreSQL does not perform in-place updates. Instead, an update is executed as a physical delete (setting `xmax` of the old row to the current transaction ID) and an insert of a new row version (setting its `xmin` to the current transaction ID).
* **Vacuum**: Old row versions whose `xmax` is older than the oldest active transaction are designated as "dead tuples." The `VACUUM` process scans tables, reclaims the physical space of dead tuples, and makes it available for subsequent inserts.

### Q26: What is the transaction ID wraparound problem in PostgreSQL?
* **Problem**: PostgreSQL uses a 32-bit integer to store transaction IDs (TXIDs), supporting approximately 4 billion transactions. When this limit is reached, TXIDs "wrap around" to 3, making past transactions appear as future transactions (violating MVCC visibility rules and corrupting data access).
* **Autovacuum Mitigation**: The autovacuum daemon runs a "freeze" process. It marks older transactions in page headers as "frozen" (representing an infinitely old transaction ID). This resets the TXID counter, preventing wraparound.

### Q27: Detail statement-based replication (SBR) versus row-based replication (RBR).
* **Statement-Based Replication (SBR)**: Replicates the raw SQL statement strings from primary to secondaries.
  * *Pros*: Extremely small log size and network bandwidth.
  * *Cons*: Unsafe for non-deterministic functions (e.g., `NOW()`, `RAND()`, or statements utilizing auto-increment IDs).
* **Row-Based Replication (RBR)**: Replicates the exact physical byte changes made to individual rows.
  * *Pros*: Completely deterministic, safe, and robust.
  * *Cons*: High network bandwidth and massive log file growth under heavy bulk-update workloads.

### Q28: Explain distributed lock management topologies.
* **Centralized DLM**: A single designated node manages all locks for the entire cluster. Simple to implement, but the central node acts as a single point of failure and a massive performance bottleneck.
* **Primary Copy DLM**: Specific nodes manage locks for specific partitions/shards.
* **Distributed DLM**: Nodes coordinate lock ownership using decentralized lock-agreement protocols, providing high availability but introducing complex multi-node consensus latency.

### Q29: Explain Paxos and Raft consensus algorithms at a high level.
* **Concept**: State-machine replication protocols designed to manage consistent states across distributed clusters.
* **Mechanism**:
  * Elect a single stable leader.
  * The leader receives all state updates, logs them locally, and broadcasts them to all replica follower nodes.
  * Once a strict majority of followers acknowledge writing the log, the leader commits the state update permanently and replies to the client.
* **Durability**: Can survive up to $F$ node failures in a cluster of $2F + 1$ nodes.

### Q30: What is Google's TrueTime API, and how does Spanner use it?
* **TrueTime API**: A highly specialized API backed by physical GPS receivers and atomic clocks located in each data center. It returns a bounded time interval $[t_{earliest}, t_{latest}]$ representing absolute time with a strict error bound $\epsilon$ (typically $< 7$ ms).
* **Spanner Usage**: To achieve globally consistent snapshot isolation without locks, Spanner wait-stalls transactions until the absolute real time has passed the upper bound of the transaction's commit timestamp (`Commit Wait`). This guarantees that transaction commit orders match real-world physical time order.

### Q31: Detail the differences between database federations, replication, and data warehousing.
* **Database Federations**: Virtual aggregation of multiple autonomous databases. Queries are compiled centrally and dispatched to physical databases dynamically (on-the-fly data integration, no data duplication).
* **Database Replication**: Copying the exact same database structure and data across multiple physical machines to ensure high availability and read scalability.
* **Data Warehousing**: Consolidating historical, cleaned data from multiple heterogeneous operational databases into a central repository optimized for high-speed analytical calculations (ETL/ELT).

### Q32: Explain the "N+1 Query Problem" in ORM frameworks and its resolution.
* **Problem**: Occurs when an ORM loads a parent entity (e.g., 50 orders) and subsequently executes a separate SQL query to load child entities (e.g., products) for *each* parent, resulting in 1 initial query + 50 separate queries (51 total queries).
* **Resolution**: Use **Eager Loading** (e.g., `JOIN FETCH` or `include` clauses) to instruct the database to retrieve both parent and child entities in a single SQL query using an outer join.

### Q33: What is "Schema drift" and how is it managed?
* **Schema Drift**: The gradual misalignment between the database schema defined in source code repository migrations and the actual schema layout running in production environments.
* **Management**: Managed using declarative migration tools (e.g., Liquibase, Flyway) that enforce version-controlled migration scripts applied automatically during CI/CD pipeline deployments.

### Q34: How do database engines implement index-only scans?
* **Index-Only Scan**: Resolving a query entirely within the index B+ Tree without reading the base table pages.
* **Visibility Map (PostgreSQL)**: In MVCC databases, index leaf nodes do not store transaction visibility markers (`xmin`/`xmax`). To perform an index-only scan safely without fetching base pages to check visibility, PG checks a bitmap called the **Visibility Map**. If the target page is flagged as "fully visible" (containing no active transactions), the engine skips the base table lookup entirely.

### Q35: Explain database compression algorithms in columnar databases.
* **Run-Length Encoding (RLE)**: Replaces repeating values with a tuple `{value, count}` (highly effective for sorted columns).
* **Dictionary Encoding**: Replaces long string values with small integer keys, storing a unique key-to-string dictionary in the block header.
* **Bit-Packing**: Restricts integer storage sizes to the exact minimum number of bits required to store the maximum value in the column block.

### Q36: What is a partial transaction rollback (Savepoints), and how is it implemented?
* **Savepoints**: Markers established within an active transaction session.
* **Log Implementation**: When a transaction defines a savepoint, the engine writes a `[SAVEPOINT_MARKER]` record containing a unique ID to the transaction's active log sequence. If the transaction executes `ROLLBACK TO SAVEPOINT`, the engine reads the log backward to that marker, reverses only the modifications written *after* the marker, and resumes execution.

### Q37: Detail how spatial indexes (like R-Trees) partition spatial geometries.
* **Partitioning**: R-Trees use hierarchical bounding boxes. Instead of dividing space into disjoint grid sectors, R-Trees partition objects into overlapping MBRs.
* **Splitting**: When an MBR page is full, it splits using heuristics (such as Quadratic Split or Linear Split) designed to minimize both the total area of the split MBRs and the degree of overlap between them, ensuring high search selectivity.

### Q38: Explain shared-disk versus shared-nothing database architectures.
* **Shared-Disk**: All database processing nodes (CPUs/RAM) share access to a single, centralized storage network (SAN/NAS). Scalability limit is capped by the storage network's backplane bandwidth bottleneck.
* **Shared-Nothing**: Each node has its own private CPU, RAM, and physical storage. Nodes coordinate data sharing solely over a high-speed network. Scales to thousands of nodes but requires complex partitioning and distributed transactions.

### Q39: What is "Write-skew" anomaly? Why does snapshot isolation fail to prevent it?
* **Write Skew**: A race condition where two concurrent transactions read the same data, evaluate a shared constraint, perform updates that modify *different* records, and commit. Separately, both writes are valid, but combined they violate the constraint.
* **Example**: A doctor on-call constraint: at least one doctor must be active. Doctor A and Doctor B both try to log off. Both transactions read the active count (2), find it satisfies the constraint (> 1), and both log off, leaving 0 doctors active.
* **Snapshot Isolation Failure**: Snapshot isolation only detects write-write conflicts on the *same* physical rows. Because Doctor A and Doctor B modified different rows, snapshot isolation approves both commits. Prevent using Serializable Isolation or pessimistic locking.

### Q40: Explain the significance of the "Fill Factor" parameter.
* **Fill Factor**: A configuration value (percent, e.g., 70%) applied when building B+ Tree indexes.
* **Impact**: Determines how much data is packed into each leaf page during index construction. A lower fill factor leaves empty slots in pages to accommodate subsequent insertions without causing page splits. For static, read-only tables, set to 100% to maximize cache density. For write-heavy tables, set to 70-80%.

### Q41: Describe how a connection pool determines if a connection has gone stale.
* **Heartbeat Verification**: The connection pool manager periodically executes a lightweight "keep-alive" query (e.g., `SELECT 1` or `SELECT 1 FROM DUAL` in Oracle) on idle connections in the pool.
* **Cleanup**: If a connection fails to respond within a timeout threshold, the pool manager terminates the socket, purges the stale connection from the pool, and instantiates a new one.

### Q42: What is "Hotspotting" in distributed tables, and how do you prevent it?
* **Hotspotting**: A condition where a single partition/shard handles a majority of the read/write operations, leaving other nodes idle.
* **Prevention**:
  * Avoid monotonically increasing keys (like Timestamps or auto-increment IDs) as shard keys.
  * **Key Salting**: Prepends a random hash suffix or prefix (e.g., appending a number between 1 and 10) to the shard key to distribute sequential writes uniformly across multiple physical partition nodes.

### Q43: Explain how database storage engines handle Large Objects (LOBs).
* **TOAST (PostgreSQL)**: The Oversized-Attribute Storage Technique.
* **Mechanism**: PostgreSQL has an 8KB page size. If a column value (e.g., a large text document or PDF) exceeds the toast threshold (typically 2KB), the engine automatically compresses the value. If it still exceeds the page limit, the engine moves the value out-of-row to a separate, physical TOAST table, storing only a small 24-byte pointer reference in the original base table page.

---

### Q44: Contrast copy-on-write vs delta/update-in-place page storage organizations.
* **Update-in-place (heap/B+ tree)**: modifications rewrite pages in place; the WAL log protects durability, and old versions vanish immediately (MVCC needs separate version store or undo logs).
* **Copy-on-write (CoW)**: writers clone the affected page, modify the copy, and publish it by updating a pointer (e.g., LMDB, Bw-tree style CAS on page mappings, ZFS blocks). Readers traverse immutable snapshots lock-free.
* **Append-only / LSM flavor**: writes go to new files/memtables; compaction merges later - great write throughput, read amplification from merging levels.
* **Trade-off matrix**: CoW = cheap snapshots, crash-consistent atomically, but amplifies small random writes (whole-page churn + GC of stale pages); in-place = compact stable storage, but contended latches and torn-page recovery complexity.

### Q45: How does PostgreSQL Serializable Snapshot Isolation (SSI) detect conflicts at runtime?
* SSI (PostgreSQL ≥ 9.1) achieves true serializability on top of MVCC *without* read locks, by detecting **dangerous structures**: two consecutive rw-antidependencies forming a cycle (T1 reads what T2 wrote, T2 reads what T3 wrote, T3 writes what T1 read ⇒ potential pivot cycle).
* Mechanics: readers take **SIREAD locks** (predicate-level, coarse granularity - page/table level, not row-exact) recording "I read this data". Writers check whether any concurrent transaction holds SIREAD on rows they modify.
* On detection, the engine **aborts one participant** with serialization failure (`could not serialize access`) - the application must retry. False positives are possible (conservative), which is the price for optimistic serializability.
* Interview angle: contrast with SQL Server's range-locking serializable - SSI trades aborts for concurrency; long read-only transactions increase conflict surface.

### Q46: Explain vectorized (batch-wise) execution and late materialization in columnar engines.
* **Vectorized execution**: operators process a *vector* (e.g., 1024 values) per invocation instead of one tuple at a time (classic Volcano iterator). Benefits: amortizes virtual-call overhead, keeps values in CPU caches, enables SIMD (AVX) filters/aggregates - often 10x+ analytic speedups (DuckDB, ClickHouse, SQL Server batch mode).
* **Late materialization**: in column stores, selection/projection operate on compact column slices returning row IDs; the wide row is assembled from individual columns *only at the end*, and only for surviving rows. Early filters therefore avoid stitching entire rows that get discarded.
* Together they explain why analytical engines outperform row-store OLTP engines on scans even with identical I/O: less interpretation overhead + minimal tuple construction.

### Q47: Explain the Saga pattern and compensating transactions for distributed database workflows.
* A **saga** decomposes a distributed business transaction into a sequence of local ACID transactions across services, each publishing its completion; failures trigger **compensating transactions** that semantically undo earlier steps (refund payment, release seat, restore stock).
* **Choreography**: services react to each other's events (loose coupling, flow hidden). **Orchestration**: a central coordinator drives steps explicitly (visible flow, central failure domain).
* Guarantees differ from 2PC: sagas are *eventually consistent* and expose intermediate states to concurrent readers - design compensations to be idempotent and retry-safe.
* Pitfalls: compensation itself failing (needs retry queues/dead-letter handling), lost-update between saga steps requiring semantic locks (pending/reserved status columns), and ordering constraints (cannot ship before payment confirmed).

### Q48: Explain quorum-based consistency in replicated databases (R+W>N).
* With replication factor N, require **R** successful acknowledgements for reads and **W** for writes. If **R + W > N**, read and write sets must intersect in at least one up-to-date replica, giving strong-ish consistency without synchronizing all replicas (Dynamo-style systems; Cassandra tunable consistency).
* Classic configs: N=3, R=W=2 (balanced); R=1,W=N (fast read, slow write); R=N,W=1 (fast durable write, possibly stale read).
* Residual hazards: sloppy quorums during node failures can break intersection (stale reads); last-write-wins resolution needs timestamps/vector clocks; monotonic-read guarantees need sticky routing to one replica.
* Complementary mechanisms: **read repair** (fix divergent replicas observed by a read), **anti-entropy/hinted handoff** (background reconciliation), and leaderless multi-version concurrency.

### Q49: What is Change Data Capture (CDC)? Compare log-based vs trigger/query-based capture.
* **CDC** streams every committed row mutation as an event, letting downstream systems (caches, search indexes, warehouses, sagas) mirror state asynchronously with low latency.
* **Log-based (preferred)**: tail the engine's redo/binlog/WAL (Debezium + Kafka, Oracle GoldenGate). Near-zero production impact, ordered, transactionally accurate, includes DDL metadata. Requires log retention and format/tooling expertise.
* **Trigger-based**: audit tables filled by triggers - easy but doubles write cost and adds latency inside transactions.
* **Query/timestamp-based**: poll `updated_at` columns - simplest, but misses deletes, has polling latency, and needs reliable clocks/indexes.
* Hard parts: schema evolution mid-stream, exactly-once delivery into sinks (at-least-once + idempotent upserts), initial snapshot coordination, and PII scrubbing before events leave the trust boundary.

### Q50: Describe the expand-contract pattern for zero-downtime schema migrations.
* **Expand**: deploy additive, backward-compatible changes - add nullable column/new table/backfill in batches, dual-write old+new fields, ship code that reads old and optionally writes new.
* **Migrate**: backfill historical rows online (batched updates respecting lock budgets), verify parity with checksums, cut reads over behind a feature flag once confident.
* **Contract**: after all instances run the new code path (watch metrics/logs for stragglers), remove legacy writes, then finally drop old columns/constraints in a separate deployment.
* Rules: never combine expand+contract in one release; every step must be rollback-friendly; keep both write paths idempotent during overlap. This is how large teams evolve schemas under continuous traffic without maintenance windows (complements online DDL tools like gh-ost/pg-rollback-less approaches).

---

## Coding & Implementation Challenges

### Q51: Implement an advanced SQL query to identify and resolve "Write Skew" anomalies using pessimistic concurrency control.
```sql
-- Transaction Session 1: Doctor A attempting to log off safely
BEGIN TRANSACTION;

-- 1. Lock the active doctors rows using SELECT FOR UPDATE to prevent concurrent status modifications
SELECT COUNT(*) AS ActiveDoctors 
FROM doctor_schedule WITH (UPDLOCK, HOLDLOCK) -- SQL Server syntax for row-level update locking
WHERE status = 'ON_CALL';

-- 2. Evaluate constraint inside application logic
-- If ActiveDoctors > 1, proceed with status modification:
UPDATE doctor_schedule 
SET status = 'OFFLINE' 
WHERE doctor_id = 'DOC_A' AND status = 'ON_CALL';

COMMIT TRANSACTION;
```

### Q52: Write an SQL query using window functions and CTEs to detect "sessions" of user activity defined by inactivity gaps of > 30 mins.
```sql
WITH LaggedLogs AS (
    -- 1. Retrieve preceding timestamp for each click log
    SELECT 
        user_id,
        click_time,
        LAG(click_time) OVER (PARTITION BY user_id ORDER BY click_time) AS prev_click_time
    FROM user_clicks
),
SessionIndicators AS (
    -- 2. If the gap is > 30 minutes, flag it as a new session start (1), else (0)
    SELECT 
        user_id,
        click_time,
        CASE 
            WHEN prev_click_time IS NULL THEN 1
            WHEN click_time > prev_click_time + INTERVAL '30' MINUTE THEN 1
            ELSE 0
        END AS is_new_session
    FROM LaggedLogs
),
SessionIDs AS (
    -- 3. Calculate running sum of indicators to generate unique sequential Session IDs
    SELECT 
        user_id,
        click_time,
        SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY click_time) AS session_id
    FROM SessionIndicators
)
SELECT user_id, session_id, MIN(click_time) AS session_start, MAX(click_time) AS session_end, COUNT(*) AS click_count
FROM SessionIDs
GROUP BY user_id, session_id;
```

### Q53: Write SQL commands to create a partitioned table based on range intervals and show how to manage partition ranges.
```sql
-- 1. Create Partitioned Table (PostgreSQL syntax)
CREATE TABLE sales_data (
    sale_id INT,
    sale_date DATE NOT NULL,
    amount DECIMAL(10, 2)
) PARTITION BY RANGE (sale_date);

-- 2. Create physical range partition tables
CREATE TABLE sales_2026_m08 PARTITION OF sales_data
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE sales_2026_m09 PARTITION OF sales_data
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

-- 3. Detach a partition range for archival archiving
ALTER TABLE sales_data DETACH PARTITION sales_2026_m08;

-- 4. Drop partition directly to reclaim space instantly
DROP TABLE sales_2026_m08;
```

### Q54: Write a database migration script in SQL that safely adds a column to a 100-million-row table without locking the table.
```sql
-- Optimized online migration strategy (PostgreSQL)
-- 1. Add column ALLOWING NULL instantly (metadata-only operation, no table lock)
ALTER TABLE transactions ADD COLUMN loyalty_points INT DEFAULT NULL;

-- 2. Batch update existing records progressively to avoid long locks and journal exhaustion
-- (Executed in a loop script inside application or stored procedure)
UPDATE transactions 
SET loyalty_points = 0 
WHERE loyalty_points IS NULL AND sale_id IN (
    SELECT sale_id FROM transactions WHERE loyalty_points IS NULL LIMIT 5000
);

-- 3. Add a default constraint for future inserts
ALTER TABLE transactions ALTER COLUMN loyalty_points SET DEFAULT 0;
```

### Q55: Implement a query that performs a complex hierarchical organizational traversal, calculating the total salary rollup.
```sql
WITH RECURSIVE Hierarchy AS (
    -- Select baseline employee
    SELECT employee_id, salary, employee_id AS top_manager_id
    FROM employees
    
    UNION ALL
    
    -- Join child records recursively
    SELECT e.employee_id, e.salary, h.top_manager_id
    FROM employees e
    INNER JOIN Hierarchy h ON e.manager_id = h.employee_id
)
-- Aggregate recursive salaries grouped by the anchor manager IDs
SELECT top_manager_id AS manager_id, SUM(salary) AS total_salary_rollup
FROM Hierarchy
GROUP BY top_manager_id;
```

### Q56: Create an index-only scan optimized layout including index creation with `INCLUDE`.
```sql
-- 1. Create Index with INCLUDED non-key columns (stored only in leaf pages)
CREATE INDEX idx_transactions_customer_status_date_include
ON transactions (customer_id, status)
INCLUDE (transaction_date, amount);

-- 2. Index-Only Query: Database engine reads ONLY the index pages, bypassing heap fetch
SELECT transaction_date, amount 
FROM transactions
WHERE customer_id = 44021 AND status = 'SETTLED';
```

### Q57: Write an SQL query that diagnoses active locks and output blocking and blocked transactions.
```sql
-- T-SQL implementation (SQL Server) to diagnose locking hierarchies
SELECT 
    blocking.session_id AS blocking_session_id,
    blocked.session_id AS blocked_session_id,
    blocked_req.wait_time AS wait_time_ms,
    blocked_req.wait_type AS wait_resource_type,
    dest.text AS blocked_sql_text
FROM sys.dm_exec_requests blocked_req
INNER JOIN sys.dm_os_waiting_tasks wait_tasks ON blocked_req.session_id = wait_tasks.waiting_task_address
INNER JOIN sys.dm_exec_connections blocked ON wait_tasks.session_id = blocked.session_id
INNER JOIN sys.dm_exec_connections blocking ON wait_tasks.blocking_session_id = blocking.session_id
CROSS APPLY sys.dm_exec_sql_text(blocked_req.sql_handle) dest;
```
