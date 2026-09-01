# SQL - Hard Interview Questions

### Q1: Detail how Multi-Version Concurrency Control (MVCC) is implemented and how it avoids read-write blocking.
* **Mechanism:** Instead of direct in-place updates, `UPDATE` creates a new version of the row, and `DELETE` marks the existing row as deleted (using hidden system metadata columns like `xmin`, `xmax` in PostgreSQL, or rollback pointers and undo logs in MySQL InnoDB).
* **Isolation:** Transactions are assigned a monotonically increasing transaction ID (or logical timestamp). When reading, a transaction receives a snapshot of the database state consistent with its own start time, filtering out row versions created by uncommitted or newer transactions.
* **Benefits:** Readers never block writers, and writers never block readers, maximizing concurrency in high-throughput systems.

### Q2: What is Write-Ahead Logging (WAL) / Redo Logging, and how does it guarantee durability (D) in ACID?
* **Problem:** Writing modified data pages directly to random locations on disk for every transaction is extremely slow.
* **WAL Principle:** Before any data page is modified in-memory (buffer pool), the changes are written sequentially to an append-only transaction log on disk (Redo Log/WAL) and flushed during `COMMIT`.
* **Crash Recovery:** If a crash occurs, the database engine scans the WAL on startup. It performs a **REDO** phase to roll forward committed changes not yet flushed to data pages, followed by an **UNDO** phase to roll back transactions that were active but uncommitted during the crash.

### Q3: Contrast B-Tree, B+Tree, and LSM-Tree storage structures. When is each selected?
* **B-Tree:** Internal nodes store both search keys and data records. Good for single-key lookups.
* **B+Tree:** Internal nodes store only search keys; all data records reside in leaf nodes, which are linked in a sequential doubly-linked list. Excellent for range scans and sorting. (Selected by most traditional relational databases like MySQL InnoDB, PostgreSQL, SQL Server).
* **LSM-Tree (Log-Structured Merge-Tree):** Appends writes to an in-memory buffer (MemTable) and periodically flushes them to sequential disk files (SSTables) which are merged via compaction. Highly optimized for massive write rates. (Selected by NoSQL engines like Cassandra, RocksDB, and some hybrid systems).

### Q4: Detail Hash Joins, Merge Joins, and Nested Loop Joins. When does the optimizer choose each?
* **Nested Loop Join:** For each row in the outer table, scan the inner table. Chosen for very small datasets, or when the inner table has a highly efficient index on the join column.
* **Hash Join:** Builds an in-memory hash table of the join key from the smaller (build) table, then scans the larger (probe) table to match keys. Chosen for large, unsorted tables when join conditions are equalities (`=`).
* **Merge Join:** Sorts both tables by the join key (if not already sorted by an index) and scans them in parallel to merge matches. Chosen for very large tables when join keys are already sorted or when range conditions are used.

### Q5: How does a Cost-Based Optimizer (CBO) evaluate query execution plans?
* **Mechanism:** Parses the query and generates multiple logically equivalent algebraic execution trees.
* **Costing Model:** Estimates the execution "cost" (primarily physical disk I/O operations and CPU cycles) of each tree using database statistics (table row counts, page counts, index height, data distribution histograms). It selects the plan with the lowest overall estimated cost.

### Q6: What is index selectivity, and how do stale database statistics lead to bad query plans?
* **Index Selectivity:** The ratio of unique values to total rows ($\text{Distinct} / \text{Total}$). High selectivity (approaching 1.0) makes an index highly attractive.
* **Stale Statistics:** If major data distributions change but stats aren't updated, the CBO may calculate incorrect selectivity. It may mistakenly predict a scan will return 5 rows when it actually returns 5,000,000, causing it to incorrectly choose a slow Nested Loop join instead of a Hash Join.

### Q7: Explain the 2-Phase Commit (2PC) protocol and its primary failure modes.
* **Purpose:** Ensures atomic commits across multiple distributed database nodes.
* **Phase 1 (Prepare):** Coordinator node sends a query to all participant nodes, which execute the transaction locally up to the commit point, write to WAL, and vote "Agree" or "Abort."
* **Phase 2 (Commit):** If all vote "Agree," coordinator sends "Commit" to all nodes. Otherwise, coordinator sends "Rollback."
* **Failure Modes:** If the coordinator crashes mid-Phase 2, participants are left in an uncertain (blocking) state, holding locks indefinitely until the coordinator recovers to resolve the status.

### Q8: What is the difference between Serializability and Snapshot Isolation? Explain Write Skew.
* **Snapshot Isolation (SI):** Transactions read from a consistent snapshot. Prevents Dirty, Non-Repeatable, and Phantom Reads.
* **Serializability:** Guarantees execution is equivalent to some strictly serial execution.
* **Write Skew:** An anomaly occurring under SI but prevented by Serializability. Example: Table requires "at least one active doctor on call." Doctors A and B are on call. Simultaneously, A and B start transactions to check if active doctors $\ge 2$. Both see 2 active doctors, so both successfully submit requests to go off call. After commit, 0 doctors are on call, violating the application invariant.

### Q9: Detail PostgreSQL table bloat, its connection to MVCC, and how to resolve it.
* **Cause:** MVCC leaves dead tuples on disk after `UPDATE` or `DELETE` operations.
* **Bloat:** If the autovacuum daemon cannot keep up with high write rates, dead tuples accumulate, causing table files to grow unnecessarily on disk and degrading scan speeds.
* **Resolution:** Run standard `VACUUM` to mark dead tuple space as reusable for future inserts. To physically reclaim disk space and shrink the file, run `VACUUM FULL` or use `pg_repack` (which creates a new table copy in the background without holding an exclusive lock).

### Q10: Describe clustered index leaf pages versus non-clustered index leaf pages and key lookups.
* **Clustered Index Leaf Page:** Contains the actual, physical row data.
* **Non-Clustered Index Leaf Page:** Contains only the sorted index key columns plus a pointer (the Clustered Index Key or Row ID) to the actual row.
* **Key Lookup (RID Lookup):** Occurs when a non-clustered index is used to filter rows, but the query selects columns not present in that index. The engine must perform an extra, expensive random disk read for each matched row to fetch the missing columns from the clustered index leaf page.

### Q11: What is a covering index, and how do INCLUDE columns prevent key lookup overhead?
* **Covering Index:** An index that contains all columns requested in the query's `SELECT`, `WHERE`, `JOIN`, and `GROUP BY` clauses, allowing the engine to satisfy the query entirely from the index leaf nodes without accessing the base table.
* **INCLUDE Columns:** Adds non-key columns strictly to the leaf level of a non-clustered B-Tree index. This covers the query while avoiding the overhead of sorting those non-key columns within the upper branches of the B-Tree structure.

### Q12: Contrast partial/conditional indexes with functional/expression-based indexes.
* **Partial Index:** Index built only over a subset of rows matching a specific `WHERE` predicate (e.g., `CREATE INDEX idx on users(email) WHERE active = true;`). Saves disk space and speeds up targeted searches.
* **Functional Index:** Index built on the output of an expression or function applied to a column (e.g., `CREATE INDEX idx on users(LOWER(last_name));`). Speeds up queries that filter on computed columns.

### Q13: How do you identify and resolve index fragmentation?
* **Identification:** Query system views (e.g., `sys.dm_db_index_physical_stats` in SQL Server, or analyze `pgstattuple` in PostgreSQL) to check logical fragmentation percentage.
* **Resolution:**
  * **Reorganize (Defragment):** Reorders leaf pages sequentially. It is an online, low-resource operation. Use for low fragmentation (< 30%).
  * **Rebuild:** Drops and recreates the index from scratch. Reclaims maximum space and updates statistics. Typically offline unless database supports `ONLINE = ON`. Use for high fragmentation (> 30%).

### Q14: Explain lock escalation in relational database engines.
* **Definition:** The process of converting many fine-grained locks (such as row or page locks) into a single, coarser table-level lock.
* **Why:** Every lock consumes memory. When a single transaction acquires a massive number of row locks (typically > 5,000), the database engine escalates them to a table lock to prevent lock memory exhaustion, though this significantly reduces write concurrency.

### Q15: How does InnoDB handle phantom reads under Repeatable Read isolation?
* **Mechanism:** Unlike standard Repeatable Read, which allows phantom reads, MySQL InnoDB prevents them by employing **Next-Key Locks**.
* **Next-Key Locking:** Combines an index-record lock on the matched rows with **Gap Locks** on the empty ranges between and surrounding those index records, blocking other transactions from inserting new rows into the scanned intervals.

### Q16: What are GAP locks and Next-Key locks in MySQL?
* **Record Lock:** Locks a specific existing index record.
* **Gap Lock:** Locks the gap between index records, or the gap before the first or after the last index record, preventing inserts into those gaps.
* **Next-Key Lock:** A combination of a record lock on the index record and a gap lock on the gap preceding the index record.

### Q17: Explain CTE materialization and its optimization impact in modern engines.
* **Materialization:** Compiling a CTE's output once and saving it as an in-memory or on-disk temporary table.
* **Impact:** Prevents the optimizer from pushing filter predicates down into the CTE query, which can cause slow performance. Modern PostgreSQL (12+) default is non-materialized (inlined), but you can force materialization using the `MATERIALIZED` or `NOT MATERIALIZED` hints.

### Q18: What is partition pruning, and how can query design maximize its effectiveness?
* **Partition Pruning:** The process where the query optimizer excludes irrelevant physical partitions from the execution plan because they cannot contain data matching the query's `WHERE` clause.
* **Query Design:** Ensure filter columns exactly match the designated partition keys (e.g., filtering on `sales_date` for a table partitioned by date) and avoid wrapping partition keys in functions (which hides them from pruning logic).

### Q19: How do distributed databases maintain consistency and resolve split-brain scenarios?
* **Consensus Protocols:** Modern distributed databases (like CockroachDB, Google Spanner) utilize consensus algorithms like **Raft** or **Paxos**.
* **Split-Brain Resolution:** A write is only committed if a strict **quorum (majority)** of nodes acknowledge it. If a network partition occurs, the side with the minority cannot form a quorum and refuses writes, preventing conflicting updates.

### Q20: Explain the CAP Theorem in the context of Distributed Relational Databases.
* **CAP Theorem:** A distributed system can guarantee at most two of: Consistency (C), Availability (A), and Partition tolerance (P).
* **Distributed RDBMS:** Since network partitions (P) are inevitable, distributed relational databases choose **Consistency (C) over Availability (A)** (CP systems). If a partition occurs, they reject writes on unreachable nodes to maintain strict ACID consistency, sacrificing absolute availability.

### Q21: What are semi-joins and anti-joins, and how do they appear in query plans?
* **Semi-Join:** Returns a row from Table A if there is at least one match in Table B. Represented in plans as a `Hash Semi Join` or `Merge Semi Join`.
* **Anti-Join:** Returns a row from Table A only if there are zero matches in Table B. Represented in plans as a `Hash Anti Join` or `Nested Loops Anti Join`.

### Q22: Contrast ROWS, RANGE, and GROUPS frame specifications in window functions.
* **ROWS:** Evaluates the window frame based on physical row counts relative to the current row (e.g., `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`). Fast and memory-efficient.
* **RANGE:** Evaluates the frame based on value differences in the ordered column (e.g., `RANGE BETWEEN INTERVAL '1' DAY PRECEDING AND CURRENT ROW`). Can be slower as it must calculate value boundaries.
* **GROUPS:** Groups rows with identical values in the `ORDER BY` clause and calculates the window frame based on these groups.

### Q23: What is parameter sniffing, and how do you mitigate its performance risks?
* **Parameter Sniffing:** During compilation of a parameterized query or stored procedure, the engine inspects the first parameter values passed to generate an optimized execution plan.
* **Risk:** If the first values are highly unrepresentative (anomalous), the compiled plan may be highly inefficient for subsequent normal parameters.
* **Mitigation:** Use query hints to force re-compilation (`WITH RECOMPILE`), optimize for specific median values (`OPTIMIZE FOR`), or use local variables inside the procedure.

### Q24: What are the performance hazards of multi-statement Table-Valued Functions (TVFs)?
* **Pitfall:** Unlike inline TVFs (which are treated as views and merged into the main query plan), multi-statement TVFs declare a temporary table variable, populate it procedurally, and return it.
* **Cost:** The query optimizer cannot estimate rows or statistics for table variables, treating them as having 1 row (or a fixed low guess), which often leads to bad join selections (nested loops) and slow performance.

### Q25: List a step-by-step diagnostic workflow for troubleshooting 100% database CPU utilization.
1. **Identify the culprit:** Run `SHOW PROCESSLIST` or query active session views (`pg_stat_activity`, `sys.dm_exec_requests`) to find long-running or blocked queries.
2. **Inspect execution plans:** Use `EXPLAIN` or extract cache plans to locate tables undergoing full table scans (`ALL`) or missing indexes.
3. **Check lock contention:** Query lock tables to locate blocked transactions holding exclusive locks.
4. **Inspect hardware/system metrics:** Check if the buffer pool is too small (causing high swap disk wait times) or if garbage collection/vacuum threads are running intensively.

### Q26: Explain PostgreSQL Heap-Only Tuple (HOT) updates and why they matter.
* **Problem:** In Postgres, every `UPDATE` creates a new row version, which requires updating all indexes to point to the new row's physical address. This causes high write amplification.
* **HOT Update:** If the updated columns are not indexed, and the new row version can fit on the **same physical page** as the old row, Postgres links them with a pointer. Indexes continue pointing to the old row address, completely bypassing index update overhead.

### Q27: What is a Bloom Filter index and how does it optimize query execution?
* **Definition:** A space-efficient, probabilistic data structure used to test set membership.
* **Optimization:** Before executing expensive disk scans or join operations, the database queries a small in-memory Bloom filter. If it returns `FALSE`, the key is guaranteed not to exist, allowing the engine to skip scanning that data block entirely.

### Q28: Contrast row-oriented and column-oriented database storage for OLAP.
* **Row-Oriented (OLTP):** Stores entire rows consecutively on disk. Excellent for fast single-row reads and updates.
* **Column-Oriented (OLAP):** Stores values of a single column consecutively on disk. High compression ratios. Fast for aggregate queries over specific columns, as the engine only reads the columns needed, completely skipping irrelevant columns.

### Q29: Contrast Star Schema and Snowflake Schema in data warehousing.
* **Star Schema:** Denormalized. A central fact table is connected directly to flat, single-level dimension tables. Simplifies queries and speeds up joins.
* **Snowflake Schema:** Normalized. Dimension tables are split into sub-dimension tables (e.g., `Product` links to `Subcategory` which links to `Category`). Saves disk space but increases join complexity.

### Q30: Explain Slowly Changing Dimensions (SCD) Types 1, 2, and 3.
* **SCD Type 1:** Overwrites existing historical data with new data. No history is kept.
* **SCD Type 2:** Creates a new row with a unique surrogate key and active date range columns (`start_date`, `end_date`, `is_current` flag) to preserve complete historical tracks.
* **SCD Type 3:** Stores historical changes in auxiliary columns within the same row (e.g., `current_city` and `previous_city`). Tracks only the immediate last state.

### Q31: How do databases manage buffer pools and clean/dirty page flushing?
* **Buffer Pool:** An in-memory cache of disk data pages.
* **LRU/Clock Sweep:** Pages are loaded to buffer pool. When memory is full, least-recently-used pages are evicted.
* **Dirty Pages:** Pages modified in memory but not yet written to disk. The database background writer thread periodically flushes dirty pages to disk in sequential batches (checkpointing) to ensure WAL-to-disk synchronization and quick crash recovery.

### Q32: Explain how Distributed Transactions (XA Transactions) utilize 2PC.
* **Definition:** Transactions spanning multiple heterogeneous databases or resources.
* **XA Protocol:** Employs a global Transaction Manager (TM) and local Resource Managers (RMs). The TM coordinates the RMs using the 2-Phase Commit (2PC) protocol, ensuring that the distributed database commits or rolls back as a single atomic unit.

### Q33: What are the performance limits and risks of recursive CTEs?
* **Risks:** Infinite recursion loops if termination conditions are flawed, and high memory consumption if the recursion depth or intermediate result set is massive.
* **Mitigation:** Enforce recursion limits (e.g., `OPTION (MAXRECURSION N)` in SQL Server, or set `max_sp_recursion_depth` in MySQL) and write strict join/termination predicates.

### Q34: How does a database execute sorting when dataset size exceeds available RAM?
* **External Merge Sort:**
  1. **Run Generation:** Read chunks of data into RAM, sort them using standard quicksort, and write the sorted chunks to temporary disk files.
  2. **Merge Phase:** Read the sorted chunks back into RAM in small, buffered blocks and merge them sequentially into a single fully-sorted stream, writing the final result back to disk.

### Q35: Contrast Logical Replication and Physical (Binary) Replication.
* **Physical Replication:** Copies byte-for-byte changes of physical storage blocks. Simple, fast, and secure, but requires identical database versions and OS architectures on both master and replica.
* **Logical Replication:** Streams SQL-equivalent database modifications (inserts, updates, deletes) based on identity keys. Allows replicating across different database versions, operating systems, or replicating only specific tables.

### Q36: What is write amplification in databases, and how do SSD-optimized storage engines mitigate it?
* **Write Amplification:** The ratio of physical bytes written to solid-state storage relative to the logical bytes requested by the database.
* **Mitigation:** SSD-optimized engines group updates in memory and write them in large, sequential page blocks, aligning database write sizes with the physical SSD block erasure boundaries to prevent page fragmentation.

### Q37: Why are random UUIDv4 values problematic as primary keys in high-write tables?
* **Problem:** Clustered indexes require physical data sorting.
* **Issue:** Because UUIDv4 is completely random, inserting new rows requires writing to random pages throughout the B-Tree index on disk. This causes frequent **page splits**, high disk I/O, and severe index fragmentation, degrading insert performance. Use sequential UUIDs (like UUIDv7) instead.

### Q38: When are index hints appropriate in production, and what are their dangers?
* **Appropriateness:** When a query plan is highly inefficient because of poor statistical estimation and a temporary fix is needed immediately.
* **Dangers:** Hardcoded hints bypass the query optimizer entirely. If the data distribution or index structures change in the future, the hardcoded hint remains, which can lead to catastrophic performance degradation.

### Q39: What is connection pool starvation, and how do you diagnose it?
* **Starvation:** Occurs when all connections in a pool are active and blocked, causing incoming requests to wait indefinitely and eventually time out.
* **Diagnosis:** Monitor connection pool metrics (active vs. idle connections, wait queues, checkout latency) and inspect the database for slow queries or lock contention blocking active connections.

### Q40: How does a database recovery manager execute REDO and UNDO phases during startup?
* **REDO (Roll-Forward):** Scans the WAL from the last checkpoint forward and reapplies all committed changes to the data pages to restore the database to its pre-crash state.
* **UNDO (Roll-Back):** Scans active transaction records backward and uses Undo/Rollback logs to revert changes made by transactions that were active but uncommitted during the crash, restoring data consistency.

### Q41: Explain deterministic versus non-deterministic functions and query compilation.
* **Deterministic:** Returns the same output given the same input parameters (e.g., `ABS(x)`). Safe for query caching and index compilation.
* **Non-Deterministic:** Returns different outputs for identical inputs (e.g., `NOW()`, `RAND()`). Prevents the engine from caching the query plan or utilizing pre-compiled indexes.

### Q42: Compare Range, Hash, and Directory sharding methods.
* **Range Sharding:** Shards data based on ordered value ranges of a key (e.g., ID 1-10000 on Shard A, 10001-20000 on Shard B). Simple but can cause write hot spots.
* **Hash Sharding:** Applies a hash function to the sharding key to distribute rows uniformly ($\text{Shard} = \text{Hash}(\text{Key}) \pmod N$). Prevents hot spots but makes range queries slow.
* **Directory Sharding:** Uses a central lookup directory table to map keys to shards. Highly flexible but introduces a single point of failure and lookup latency.

### Q43: How does parallel query execution operate, and what are its limits?
* **Operation:** Splits a single query's workload among multiple CPU threads, executing scans and joins in parallel before merging the results.
* **Limits:** Parallel processing can saturate server CPU capacity, and the overhead of thread creation, synchronization, and data exchange can make parallel execution slower than sequential execution for small queries.

---

### Q44: What are advisory locks and where do they beat row locking?
* Application-defined locks keyed by arbitrary integers/strings (`pg_advisory_lock(42)`, `pg_try_advisory_xact_lock(key)`) held independent of rows - coordination primitives exposed by the engine itself.
* Killer use cases: singleton cron-job mutual exclusion across app instances (try-lock, skip run if held), serializing cache-rebuild stampedes, guarding multi-row business operations where SELECT ... FOR UPDATE spans too much, resource leasing.
* Variants: session-level (explicit unlock, survives commits) vs transaction-level (auto-release at COMMIT/ROLLBACK - safer); blocking vs try variants; shared mode for reader fleets.
* Hazards: deadlock potential like any lock ordering issue, forgotten session locks lingering after crashes (monitor `pg_locks` mode='advisory'), and key-collision discipline across teams/modules.

### Q45: How does PostgreSQL Serializable Snapshot Isolation detect anomalies without read locks?
* Builds on snapshot isolation plus **predicate-lock tracking (SIREAD)**: readers record coarse-grained "read this range/page/table" entries instead of blocking writers; writers check conflicts against concurrent readers' SIREADs.
* The engine watches for **dangerous structures** - rw-antidependency chains that could complete a serialization cycle (T1 read→T2 wrote; T2 read→T3 wrote; T3 wrote→T1 read). Detecting two-in-a-row pivots triggers abort of one transaction with serialization_failure.
* Result: true serializability with optimistic concurrency - no gap/next-key locking, high parallelism for short transactions, false-positive aborts possible so apps must retry with backoff.
* Contrast points interviewers expect: SQL Server achieves serializable via range key-locking (blocking-based); Postgres chose abort-based SSI trading retries for throughput; both prevent write-skew which plain REPEATABLE READ misses.

### Q46: How do columnstore segment elimination and rowgroup quality affect analytics performance?
* Column stores compress data into segments/rowgroups (~1M rows) per column, storing min/max metadata - queries pruning segments via predicate pushdown read only qualifying chunks (**segment elimination**).
* **Rowgroup quality**: rows deleted/updated leave holes; fragmented rowgroups (<threshold rows) or wide value ranges inside one segment kill both compression ratios and pruning selectivity. Delta stores/b-trees absorb trickle inserts until compaction tuples-mover rebuilds clean rowgroups.
* Practical levers: ordered/clustered ingestion by dominant filter key (sort key), periodic OPTIMIZE/vacuum/rebuild, avoiding tiny frequent loads (micro-batching anti-pattern), zone maps/clustering keys tuned per workload.
* Diagnostics: EXPLAIN showing segments total vs scanned, system views exposing rowgroup density (SQL Server DMVs, Snowflake clustering depth, ClickHouse marks) - quantifying elimination ratio is the senior move.

### Q47: Explain full_page_writes, WAL checksums, and torn-page protection.
* A disk-sector tear mid-page-write leaves a half-old/half-new page - unrecoverable corruption unless guarded. **full_page_writes (FPW)**: after each checkpoint, the first modification of every page logs the *entire page image* into WAL; crash recovery restores pages wholesale from WAL before applying deltas, guaranteeing atomicity regardless of tearing.
* Cost: checkpoint-following write bursts double WAL volume - tunings include spreading checkpoints (checkpoint_completion_target), wal_compression (zstd/lz4 shrinking FPW records), and understanding SSD atomic-write guarantees that motivated discussions of disabling FPW (risky, vendor-specific).
* **Checksums** (`data_checksums` initdb option / SQL Server page verification): detect silent corruption from storage bitrot - verified on every page read; failures raise hard errors rather than returning poisoned data.
* Ops maturity signals: monitoring WAL generation rate, alerting on checksum failures (restore-from-backup events!), aligning FS/raid stripe sizes, testing restore drills - recovery guarantees live only as good as rehearsed restores.

### Q48: How do logical replication slots power CDC, and what operational hazards exist?
* Logical decoding streams row-level change events decoded from WAL (`pgoutput` protocol consumed by Debezium etc.), filtered by publication definitions (tables/row filters/column lists).
* **Replication slot** anchors the consumer position: the server retains WAL needed by every active slot - the hazard being an offline/stuck consumer causing unbounded WAL retention until disk exhaustion takes the primary down.
* Guardrails: alarm on `pg_replication_slots` restart_lsn lag bytes, cap via `max_slot_wal_keep_size` (slots become invalid beyond limit - consumer must resnapshot), heartbeat tables keeping idle-period slots advancing.
* Schema-change choreography: additive-first migrations keep old consumers decoding; breaking column drops require coordinated consumer upgrades. Compare with trigger-based CDC (in-transaction cost) and query-based (misses deletes/truncates).

### Q49: Describe distributed-SQL architecture (CockroachDB/Spanner style).
* Data splits into **ranges/tablets** (contiguous key space chunks, default ~512MB–2GB) replicated via **Raft groups** (typically 3–5 voters) - every range is its own consensus group; thousands coexist per node.
* Routing: stateless gateways map key→leaseholder via meta ranges/locations caches; requests to leaseholder replicas execute locally with quorum commits (Paxos/Raft log), giving serializable transactions via timestamp ordering + intent/resolve mechanisms (percolator lineage).
* Clocks: Spanner couples TrueTime GPS/atomic-clock bounds with commit-wait for external consistency; CockroachDB uses hybrid-logical clocks with uncertainty windows restarting transactions on skew risk.
* Rebalancing = moving ranges (raft members) between stores based on load/disk; schema changes via online distributed protocols. Interview framing: it's sharding + per-shard consensus + distributed MVCC - know which failure modes remain (cross-region latency, hotspot ranges, clock assumptions).

### Q50: How does FOR UPDATE SKIP LOCKED enable job queues, and how do you fix hot rows generally?
```sql
UPDATE jobs SET status='processing', worker=$1
WHERE id = (
  SELECT id FROM jobs WHERE status='pending'
  ORDER BY priority, created_at
  FOR UPDATE SKIP LOCKED LIMIT 1
) RETURNING *;
```
* `SKIP LOCKED` lets N workers each claim disjoint rows concurrently without blocking or failing - the standard Postgres/MySQL pattern for DB-backed work queues (visibility-timeout via claimed_at sweeps for crashed workers).
* General **hot-row contention** playbook: shard logical counters into K buckets summed on read; buffer/coalesce increments in memory flushing periodically; move queues to specialized systems at scale; shorten transaction scope religiously (no external calls inside txns); order multi-row updates consistently; use optimistic retry loops for low-contention entities.
* Diagnosis path: lock waits (`pg_locks`/innodb status), xact duration histograms, deadlock logs - distinguishing lock waits from IO/CPU saturation before tuning anything.

---

## Coding & Implementation Challenges

### Q51: Write a recursive CTE representing a complex graph traversal to find the shortest path between two nodes in a transportation network.
* **Implementation:** Employs a recursive CTE that tracks the visited path to prevent cycles, accumulating total distance to find the shortest path.
```sql
WITH RECURSIVE NetworkPaths AS (
    -- Anchor Member: Find direct paths starting from origin node 'A'
    SELECT 
        origin, 
        destination, 
        distance,
        1 AS depth,
        CAST('A' AS CHAR(1000)) AS full_path
    FROM routes
    WHERE origin = 'A'
    
    UNION ALL
    
    -- Recursive Member: Join to find sequential hops, preventing cycles
    SELECT 
        r.origin, 
        r.destination, 
        np.distance + r.distance AS distance,
        np.depth + 1 AS depth,
        CONCAT(np.full_path, ' -> ', r.destination) AS full_path
    FROM routes r
    INNER JOIN NetworkPaths np ON r.origin = np.destination
    -- Prevent infinite cycles by checking if destination has already been visited
    WHERE POSITION(r.destination IN np.full_path) = 0
)
SELECT full_path, distance
FROM NetworkPaths
WHERE destination = 'Z' -- Target destination
ORDER BY distance ASC
LIMIT 1; -- Extracts the absolute shortest path by distance
```

### Q52: Solve the Gaps & Islands problem to find contiguous consecutive days of user activity.
* **Implementation:** Uses dual `ROW_NUMBER()` calculations. The difference between the date sequence and the row sequence remains constant for contiguous intervals, defining unique island identifiers.
```sql
WITH RowGroupings AS (
    SELECT 
        user_id,
        activity_date,
        -- Subtract sequential row index from activity date to group contiguous days
        activity_date - INTERVAL '1' DAY * ROW_NUMBER() OVER (
            PARTITION BY user_id 
            ORDER BY activity_date
        ) AS island_group
    FROM user_activities
)
SELECT 
    user_id,
    MIN(activity_date) AS island_start,
    MAX(activity_date) AS island_end,
    COUNT(*) AS consecutive_days
FROM RowGroupings
GROUP BY user_id, island_group
HAVING COUNT(*) >= 3 -- Filter to identify islands of 3 or more consecutive days
ORDER BY user_id, island_start;
```

### Q53: Write a dynamic SQL stored procedure to pivot arbitrary column values without hardcoding the pivot list.
* **Implementation:** Queries metadata tables to construct a dynamic string of aggregate `CASE WHEN` statements, executing the constructed query dynamically via prepared statement handlers.
```sql
CREATE PROCEDURE DynamicPivotQuarterlySales(
    IN target_year INT
)
BEGIN
    -- Declare variable to store dynamically constructed CASE SQL list
    DECLARE dynamic_sql TEXT;
    DECLARE select_list TEXT;

    -- Concatenate CASE statements dynamically from unique values in quarters table
    SELECT GROUP_CONCAT(DISTINCT 
        CONCAT('SUM(CASE WHEN quarter = ''', quarter, ''' THEN sales_amount ELSE 0 END) AS ', quarter, '_Sales')
    ) INTO select_list
    FROM sales_records
    WHERE sales_year = target_year;

    -- Construct the complete dynamic SQL string
    SET dynamic_sql = CONCAT(
        'SELECT sales_year, ', select_list, 
        ' FROM sales_records WHERE sales_year = ', target_year,
        ' GROUP BY sales_year'
    );

    -- Prepare and execute the dynamic SQL
    PREPARE stmt FROM dynamic_sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END;
```

### Q54: Calculate a sliding 30-day rolling sum of transaction amounts for every customer.
* **Implementation:** Uses a window function with a `RANGE` frame specification to dynamically filter preceding 30-day calendar ranges based on unix timestamp intervals.
```sql
SELECT 
    customer_id,
    transaction_date,
    transaction_amount,
    -- Calculate rolling sum over 30 days preceding current transaction date
    SUM(transaction_amount) OVER (
        PARTITION BY customer_id
        ORDER BY transaction_date
        RANGE BETWEEN INTERVAL '30' DAY PRECEDING AND CURRENT ROW
    ) AS rolling_30_day_total
FROM customer_transactions;
```

### Q55: Implement a transactional transfer stored procedure with custom rollback logging to track transfer failures.
* **Implementation:** Captures SQL exceptions, rolls back the transaction, and logs the details to an audit table before exiting.
```sql
CREATE PROCEDURE SafeTransferWithAudit(
    IN source_acc INT,
    IN dest_acc INT,
    IN transfer_val DECIMAL(15,2)
)
BEGIN
    -- Exception handlers to manage transaction states and log errors
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Roll back active updates
        ROLLBACK;
        -- Log failure event to the audit ledger
        INSERT INTO transfer_failures_log (source_account, destination_account, amount, failure_timestamp)
        VALUES (source_acc, dest_acc, transfer_val, CURRENT_TIMESTAMP);
    END;

    START TRANSACTION;
        -- Verify source account has sufficient balance
        IF (SELECT balance FROM bank_accounts WHERE account_id = source_acc) < transfer_val THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient transfer balance';
        END IF;

        -- Perform decrement
        UPDATE bank_accounts 
        SET balance = balance - transfer_val 
        WHERE account_id = source_acc;

        -- Perform increment
        UPDATE bank_accounts 
        SET balance = balance + transfer_val 
        WHERE account_id = dest_acc;

    COMMIT;
END;
```

### Q56: Optimize a correlated subquery query by replacing it with a window function anti-join to eliminate performance bottlenecks.
* **Implementation:** Rewrites a slow, nested `NOT EXISTS` correlated subquery into a highly efficient window-based partition filter.
```sql
-- SLOW ORIGINAL CORRELATED SUBQUERY:
-- SELECT e.* FROM employees e WHERE NOT EXISTS (
--     SELECT 1 FROM salaries s WHERE s.emp_id = e.emp_id AND s.amount > e.salary
-- );

-- FAST OPTIMIZED QUERY (Using Window Partitioning & Outer Join/Filter):
WITH MaxSalaryPerEmployee AS (
    SELECT 
        emp_id,
        MAX(amount) OVER (PARTITION BY emp_id) AS max_logged_salary
    FROM salaries
)
SELECT e.emp_id, e.employee_name, e.salary
FROM employees e
LEFT JOIN MaxSalaryPerEmployee ms ON e.emp_id = ms.emp_id 
    AND ms.max_logged_salary > e.salary
WHERE ms.emp_id IS NULL; -- Selects only rows where no salary record exceeded their current salary
```

### Q57: Write a PostgreSQL trigger that dynamically logs column-level changes to a JSONB historical delta audit table.
* **Implementation:** Uses PL/pgSQL utility loops and Postgres row-to-json castings to build a dynamic key-value delta representation of changed columns.
```sql
CREATE OR REPLACE FUNCTION audit_column_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_row_json jsonb;
    new_row_json jsonb;
    key_name text;
    old_value text;
    new_value text;
    delta_log jsonb := '{}'::jsonb;
BEGIN
    -- Cast records to JSONB for dynamic key-value iteration
    old_row_json := to_jsonb(OLD);
    new_row_json := to_jsonb(NEW);

    -- Loop through keys in the new row JSONB map
    FOR key_name IN SELECT jsonb_object_keys(new_row_json)
    LOOP
        old_value := old_row_json ->> key_name;
        new_value := new_row_json ->> key_name;

        -- If values differ, record the column change delta
        IF old_value IS DISTINCT FROM new_value THEN
            delta_log := delta_log || jsonb_build_object(
                key_name, 
                jsonb_build_object('old', old_value, 'new', new_value)
            );
        END IF;
    END LOOP;

    -- Write to audit table if changes were captured
    IF delta_log != '{}'::jsonb THEN
        INSERT INTO audit_logs (table_name, record_id, changed_fields, change_timestamp)
        VALUES (TG_TABLE_NAME, OLD.id, delta_log, CURRENT_TIMESTAMP);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger Association Definition
-- CREATE TRIGGER trg_employee_audit
-- AFTER UPDATE ON employees
-- FOR EACH ROW EXECUTE FUNCTION audit_column_changes();
```
