# DBMS - Medium Interview Questions

### Q1: Explain the different levels of Isolation in transaction management and the anomalies they prevent.
* **Read Uncommitted**: Lowest isolation. Allows dirty reads, non-repeatable reads, and phantom reads.
* **Read Committed**: Prevents **dirty reads** (reading uncommitted data). Still allows non-repeatable and phantom reads.
* **Repeatable Read**: Prevents **dirty reads** and **non-repeatable reads** (reading different values for the same row during a single transaction). Still allows phantom reads.
* **Serializable**: Highest isolation. Prevents all anomalies including **phantom reads** (new rows appearing in subsequent reads) by locking ranges of rows or using snapshot isolation.

### Q2: What is the difference between Optimistic and Pessimistic concurrency control?
* **Pessimistic Concurrency Control**:
  * Assumes conflicts are highly likely.
  * Locks resources immediately when accessed (e.g., acquiring X-locks during reads).
  * *Trade-off*: High locking overhead, potential deadlocks, and reduced concurrency.
* **Optimistic Concurrency Control (OCC)**:
  * Assumes conflicts are rare.
  * No locks are acquired during transaction execution. Instead, the transaction records changes to private workspace.
  * During the **validation phase**, the system checks if other transactions modified the same data. If yes, it aborts and rolls back.
  * *Trade-off*: Excellent throughput for read-heavy loads, high abort rates under heavy write-write contention.

### Q3: Detail the Two-Phase Commit (2PC) protocol used in distributed databases.
* **Purpose**: Enforces atomic transaction commits across multiple distributed database nodes.
* **Phase 1: Prepare Phase**:
  * The coordinator node sends a `PREPARE` message to all participant nodes.
  * Participants execute the transaction locally up to the commit point, write to log files, and reply with `VOTE_COMMIT` or `VOTE_ABORT`.
* **Phase 2: Commit Phase**:
  * If *all* participants voted to commit, the coordinator broadcasts a `GLOBAL_COMMIT` message, and participants write changes permanently.
  * If *any* participant voted to abort, the coordinator broadcasts `GLOBAL_ABORT`, forcing all participants to rollback.

### Q4: What is the difference between 3NF and BCNF? Explain with a scenario.
* **Definition**: Boyce-Codd Normal Form (BCNF) is a stricter version of 3NF.
* **Constraint**: In 3NF, for any dependency `X -> Y`, either `X` is a super key or `Y` is a prime attribute. In BCNF, `X` **must** be a super key.
* **Scenario**: Consider a table `Teaches` with fields `[Student, Subject, Teacher]`. Assume:
  * A teacher teaches only one subject (`Teacher -> Subject`).
  * For a given subject, a student has only one teacher (`{Student, Subject} -> Teacher`).
  * Here, Candidate Keys are `{Student, Subject}` and `{Student, Teacher}`.
  * The dependency `Teacher -> Subject` violates BCNF because `Teacher` is not a super key, even though it satisfies 3NF because `Subject` is a prime attribute.

### Q5: Explain 4th Normal Form (4NF) and Multi-valued Dependency.
* **Multi-valued Dependency (MVD)**: Occurs when the presence of one or more attributes in a table uniquely determines the presence of another set of independent attributes (`X ->> Y`).
* **4NF Rule**: A table is in 4NF if:
  * It is already in **BCNF**.
  * It contains **no multi-valued dependencies** (every MVD `X ->> Y` must have `X` as a super key).
* **Impact**: Prevents storing independent 1-to-many relationships in a single table, which leads to massive row duplication.

### Q6: Explain 5th Normal Form (5NF) and Join Dependency.
* **Join Dependency**: A table `R` has a join dependency if it can be decomposed into smaller tables `R1, R2, ..., Rn` such that joining them reconstructs the original table without introducing spurious rows.
* **5NF Rule**: A table is in 5NF (also called Project-Join Normal Form) if:
  * It is already in **4NF**.
  * Every join dependency in the table is implied by its candidate keys.
* **Purpose**: Prevents anomalies that arise when reconstructing ternary (3-way) relationships from binary projections.

### Q7: What are the differences between B-Trees and B+ Trees? Why do databases prefer B+ Trees?
* **B-Trees**: Store both search keys and data records (or pointers to them) inside both internal and leaf nodes.
* **B+ Trees**: Store data records and pointers **only inside the leaf nodes**. Internal nodes store only search keys used for routing queries. Leaf nodes are also linked sequentially in a doubly-linked list.
* **Why Preferred**:
  * **Higher Fan-out**: Because internal nodes don't store data payloads, more keys fit into a single disk page, reducing tree height and disk I/O.
  * **Range Queries**: Sequential leaf links allow extremely fast range traversals without needing recursive tree walks.

### Q8: Explain the difference between Dense Indexes and Sparse Indexes.
* **Dense Index**: Contains an index record for **every single search key value** in the data file.
* **Sparse Index**: Contains index records for only **some** of the search keys (typically one per physical data block/page).
* **Comparison**: Sparse indexes require far less memory and storage, but dense indexes are faster because they can resolve query matches directly within the index structure before accessing disk pages.

### Q9: What is a Query Optimizer? Explain rule-based vs cost-based optimization.
* **Query Optimizer**: A component of the DBMS engine that analyzes a query and compiles the most efficient execution plan.
* **Rule-Based Optimizer (RBO)**: Uses hardcoded, predefined rules (heuristics) to execute queries (e.g., "always use an index if it exists"). It does not evaluate the actual volume of data.
* **Cost-Based Optimizer (CBO)**: Analyzes table statistics (cardinality, histogram distribution, page density) and evaluates the resource "cost" (CPU cycles and disk I/O pages) of multiple alternative execution plans, selecting the plan with the lowest calculated cost.

### Q10: Explain Join Algorithms: Nested Loop, Hash, and Sort-Merge.
* **Nested Loop Join**: For each row in the outer table, scans the entire inner table. Highly efficient for small tables or when the inner table has an index on the join field.
* **Hash Join**: Builds an in-memory hash table of the smaller join table, then scans the larger table to find matches. Excellent for large, unsorted datasets without index coverage.
* **Sort-Merge Join**: Sorts both tables on the join column, then traverses them in a single coordinated sweep. Best for queries that already require sorted outputs.

### Q11: What is a deadlock detection and recovery mechanism in DBMS? Wait-For Graph.
* **Detection**: The DBMS runs a background thread that periodically inspects active locks.
* **Wait-For Graph (WFG)**: Nodes represent active transactions, and directed edges represent dependencies (`T1 -> T2` means T1 is waiting for a lock held by T2). If the graph contains a **cycle**, a deadlock exists.
* **Recovery**: The DBMS selects a "victim" transaction, aborts it, rolls back its modifications to release locks, and restarts it.

### Q12: Explain Wait-Die and Wound-Wait schemes for deadlock prevention.
* **Timestamp-Based**: Transactions are assigned a unique timestamp based on start time (older transactions have smaller timestamps).
* **Wait-Die Scheme (Non-preemptive)**:
  * If older transaction requests resource held by younger, older is allowed to **wait**.
  * If younger transaction requests resource held by older, younger **dies** (aborts and restarts).
* **Wound-Wait Scheme (Preemptive)**:
  * If older requests younger's resource, older **wounds** (preempts/aborts) the younger and takes the resource.
  * If younger requests older's resource, younger is allowed to **wait**.

### Q13: What is the WAL (Write-Ahead Logging) protocol and why is it crucial?
* **Protocol**: Enforces that any database modification (insert, update, delete) must be written to a non-volatile, append-only log file on disk *before* the actual dirty data pages are modified in memory and flushed to disk.
* **Crucial for ACID**: Guarantees durability. If the system crashes, the recovery manager can replay committed changes (Redo) or reverse uncommitted actions (Undo) using only the log file.

### Q14: Explain the checkpointing process in transaction logging.
* **Problem**: Replaying a transaction log from the very beginning during recovery takes too long.
* **Checkpoint**: An administrative boundary operation.
* **Steps**:
  1. Flushes all dirty in-memory data buffers to disk.
  2. Writes a list of all active transactions to the log file.
  3. Appends a `[CHECKPOINT]` marker to the log and flushes the log to disk.
* **Benefit**: The recovery manager only needs to scan and replay transactions that were active *at* or *after* the last checkpoint.

### Q15: What is Cascading Rollback, and how does Strict 2PL prevent it?
* **Cascading Rollback**: Occurs when transaction `T1` aborts, forcing other dependent transactions (who read uncommitted data written by `T1`) to also roll back recursively, causing massive system overhead.
* **Strict Two-Phase Locking (Strict 2PL)**: Enforces standard 2PL rules, but adds a strict condition: all **Exclusive (write) locks** held by a transaction must be retained until the transaction completely commits or aborts.
* **Prevention**: By holding write locks until the very end, other transactions are blocked from reading uncommitted data, completely eliminating cascading rollbacks.

### Q16: Explain physical, logical, and conceptual data models.
* **Conceptual Model**: Highly abstract, business-focused design. Identifies entities and relationships (e.g., standard ER diagrams) without defining physical constraints or DBMS-specific engines.
* **Logical Model**: Deeper structure mapping conceptual data to relational models (defines table names, columns, primary/foreign keys, normalization). Independent of specific hardware.
* **Physical Model**: The actual implementation blueprint for a specific DBMS (defines column types, data partitioning, indexing, storage spaces, and database-specific tablespaces).

### Q17: What is dynamic SQL vs static SQL? Explain security implications.
* **Static SQL**: The SQL statement is compiled and hardcoded into the application during development. Highly secure and optimized.
* **Dynamic SQL**: The SQL query string is constructed dynamically at runtime using string concatenation.
* **Security Risk**: If user inputs are concatenated directly into the dynamic string, it allows **SQL Injection (SQLi)** attacks. Attackers append malicious SQL commands (e.g., `' OR '1'='1`) to bypass authentication or drop tables. Use parameterized queries/prepared statements to prevent SQLi.

### Q18: What are window functions in SQL?
* **Definition**: Functions that perform calculations across a set of table rows that are related to the current row, without collapsing them into a single row like `GROUP BY`.
* **Common Types**:
  * `ROW_NUMBER()`: Assigns a unique sequential integer to rows starting at 1.
  * `RANK()`: Assigns ranking values; duplicates get identical ranks, but it leaves gaps in the numbering.
  * `DENSE_RANK()`: Assigns ranks; duplicates get identical ranks, but leaves no gaps.
  * `LEAD()`/`LAG()`: Accesses data from preceding or succeeding rows relative to the current row.

### Q19: Explain the concept of partition pruning.
* **Concept**: A query optimization technique used on partitioned tables.
* **Mechanism**: If a table is partitioned by year (e.g., separate physical partitions for 2024, 2025), and a query filters for `WHERE sale_year = 2025`, the query planner bypasses scanning any other partitions entirely.
* **Impact**: Drastically reduces physical disk I/O, converting full table scans into small, targeted partition scans.

### Q20: What is a distributed database? Horizontal vs Vertical partitioning.
* **Distributed Database**: A database whose physical storage is spread across multiple geographically distributed physical locations but managed as a single logical database.
* **Horizontal Partitioning (Sharding)**: Splitting table rows across different nodes (e.g., storing customers A-M on Node 1, N-Z on Node 2).
* **Vertical Partitioning**: Splitting table columns across nodes (e.g., storing sensitive financial columns on a secure node, and public profile columns on another).

### Q21: Explain CAP Theorem and how it relates to RDBMS vs NoSQL.
* **CAP Theorem**: States that a distributed data system can simultaneously guarantee at most two of three properties: **Consistency**, **Availability**, and **Partition Tolerance**.
* **RDBMS**: Prioritize Consistency and Partition Tolerance (CP) or Consistency/Availability in non-partitioned environments. They enforce strict ACID transactions, blocking writes if a node goes out-of-sync.
* **NoSQL**: Prioritize Availability and Partition Tolerance (AP), adopting **BASE** consistency (Basically Available, Soft state, Eventual consistency) to maximize concurrent distributed throughput.

### Q22: What is a cursor in database programming? List its lifecycle.
* **Definition**: A database pointer structure pointing to the result set of a multi-row query, allowing developers to iterate and process records sequentially.
* **Lifecycle**:
  1. **DECLARE**: Defines the cursor name and its associated SQL select query.
  2. **OPEN**: Executes the query and instantiates the cursor result set in memory.
  3. **FETCH**: Retrieves the current row data into variables and increments the pointer.
  4. **CLOSE**: Releases the cursor memory and resources back to the database.

### Q23: Detail the difference between user-defined functions (UDFs) and Stored Procedures.
* **Stored Procedures**:
  * Can perform arbitrary DDL/DML operations.
  * Do not require returning values.
  * Can accept input, output (`OUT`), and in-out parameters.
  * Cannot be embedded inside a standard SQL query.
* **User-Defined Functions (UDFs)**:
  * Restricted to read-only operations (cannot execute DDL or modify tables).
  * Must return a value.
  * Can be called directly inside SQL SELECT statements (e.g., `SELECT format_name(name) FROM users`).

### Q24: What is the purpose of the `MERGE` statement in SQL?
* **Purpose**: Performs insert, update, or delete operations on a target table simultaneously based on the results of a join with a source table (often called an **upsert** operation).
* **Syntax structure**: Defines a join key. Then specifies `WHEN MATCHED THEN UPDATE...` and `WHEN NOT MATCHED THEN INSERT...`.

### Q25: Explain database replication topologies.
* **Master-Slave (Primary-Secondary)**: All writes go to the Master; reads are distributed among Slave nodes. Great for read-heavy loads.
* **Multi-Master (Active-Active)**: All nodes can accept writes, replicating conflicts back asynchronously. Highly resilient but complex to manage.
* **Peer-to-Peer**: Fully decentralized; nodes sync with each other using gossip protocols.

### Q26: What is a compound primary key versus a composite primary key?
* **Composite Primary Key**: A primary key made of two or more columns to ensure uniqueness across records (e.g., `{order_id, product_id}`).
* **Compound Primary Key**: A composite primary key where at least one of the constituent columns is also a foreign key referencing another table.

### Q27: Explain the concept of a natural key versus a surrogate key.
* **Natural Key**: A primary key made of attributes that naturally exist in the real world and are inherently unique (e.g., `SocialSecurityNumber`, `VehicleIdentificationNumber`).
* **Surrogate Key**: A completely artificial, system-generated primary key with no real-world business meaning (e.g., an auto-incremented integer `id` or a random `UUID`).
* **Trade-off**: Natural keys save column space but can change if business rules alter. Surrogate keys never change, but they require extra storage and indexing overhead.

### Q28: What is a Phantom Read? How does it differ from a Non-Repeatable Read?
* **Non-Repeatable Read**: Transaction `T1` reads a row. Transaction `T2` **updates** that same row and commits. `T1` reads the row again and finds the cell value has changed.
* **Phantom Read**: Transaction `T1` executes a query returning a range of rows. Transaction `T2` **inserts** a brand new row that fits that range criteria and commits. `T1` executes the query again and finds "phantom" new rows.

### Q29: Explain the difference between table scan, index scan, and index seek.
* **Table Scan**: The database engine reads every physical page of the table from disk to locate matches (slowest, `O(N)`).
* **Index Scan**: The engine reads and traverses the entire index tree structure (faster than a table scan, but still scans all index keys).
* **Index Seek**: The engine utilizes the index B+ Tree structure to navigate directly to the specific leaf page holding the matching key (fastest, logarithmic `O(log N)`).

### Q30: What is index fragmentation and how do you resolve it?
* **Fragmentation**: Occurs when frequent inserts/updates/deletes leave gaps in database pages or store index pages out of sequential order on disk.
* **Resolution**:
  * **Reorganize**: Cleans up index pages by reordering them sequentially in-place (low-overhead, non-blocking).
  * **Rebuild**: Drops the index entirely and recreates a fresh, highly packed B-Tree structure (resource-intensive, blocks modifications in some databases).

### Q31: What is the difference between candidate keys and super keys mathematically?
* **Super Key**: Any set of attributes $S$ such that $S \rightarrow R$ (uniquely identifies all table attributes).
* **Candidate Key**: A subset of a super key $K \subseteq S$ such that if any attribute is removed from $K$, it is no longer a super key. Thus, Candidate Keys are mathematically minimal super keys.

### Q32: Explain OLTP vs OLAP.
* **OLTP (Online Transaction Processing)**: Handles operational, high-frequency transactions (inserts/updates/deletes). Highly normalized, optimized for write speeds.
* **OLAP (Online Analytical Processing)**: Handles complex analytical queries (historical rollups, trends). Uses denormalized column-oriented warehouses, optimized for high-speed read operations.

### Q33: What is Star Schema vs Snowflake Schema in Data Warehousing?
* **Star Schema**: A central fact table surrounded by simplified, denormalized dimension tables. Fast querying speeds due to minimal join requirements.
* **Snowflake Schema**: A fact table surrounded by dimension tables that are further normalized into sub-dimensions. Saves storage space but increases join complexity.

### Q34: Explain weak entity sets vs strong entity sets.
* **Strong Entity Set**: Has a primary key and can exist independently of other entities.
* **Weak Entity Set**: Does not have a primary key and cannot exist without a parent identifying owner entity (e.g., `Dependent` belongs to `Employee`). Represented using double rectangles, and its unique discriminator is identified with a dashed underline.

### Q35: What is the purpose of SQL set operators?
* **`UNION`**: Combines results of two queries, removing duplicates.
* **`UNION ALL`**: Combines results of two queries, retaining duplicate rows (faster execution).
* **`INTERSECT`**: Returns only rows present in both query outputs.
* **`EXCEPT` (or `MINUS`)**: Returns rows present in the first query output but absent in the second.

### Q36: What are ON DELETE CASCADE, SET NULL, and SET DEFAULT?
* **`ON DELETE CASCADE`**: Automatically deletes child records when the referenced parent record is deleted.
* **`ON DELETE SET NULL`**: Sets the child foreign key column to NULL when the parent record is deleted.
* **`ON DELETE SET DEFAULT`**: Sets the child foreign key column to its configured default value when the parent record is deleted.

### Q37: How does column ordering in a composite index affect performance?
* **Rule**: Composite indexes are structured from left to right.
* **Leftmost Rule**: An index on `(A, B, C)` can resolve queries on `(A)`, `(A, B)`, and `(A, B, C)`. It cannot optimize queries on `(B)` or `(C)` without `A`.
* **Selection Best Practice**: Place the most selective, highly queried column as the first (leftmost) column in the composite definition.

### Q38: What is the purpose of `EXPLAIN PLAN` and how do you analyze it?
* **Purpose**: Displays the execution path selected by the query optimizer.
* **Metrics to Analyze**: Look for **Table Scans** (which should be optimized to Index Seeks), verify that the planned index matches expectations, and track estimated cost versus actual rows returned.

### Q39: Explain the constraints on updatable views.
* **Constraints**: A database view is updatable (supports direct `INSERT`/`UPDATE` modifications) only if:
  * The view is defined on a **single** base table.
  * It does not contain aggregate functions, `GROUP BY`, `HAVING`, `DISTINCT`, or set operators.
  * It contains all non-null columns of the base table in its projection.

### Q40: What is log-based recovery? Deferred vs Immediate Update.
* **Deferred Update**: Transaction updates are recorded *only* in the log file during execution. Changes are written to the database on disk *only* after commit. (No Undo required during recovery, only Redo).
* **Immediate Update**: Updates are applied to the database on disk dynamically during transaction execution. (Both Undo and Redo are required during recovery).

### Q41: What is a database connection leak and how can it be prevented?
* **Leak**: Occurs when applications open database connections from a pool but fail to close them in a `finally` block or context manager after execution.
* **Consequence**: The connection pool becomes exhausted, causing subsequent application requests to stall or fail. Prevent by using auto-close try-with-resources blocks.

### Q42: What are the differences between B+ Tree indexes and Hash indexes?
* **B+ Tree**: Supports equality matches, range queries (`ORDER BY`, `BETWEEN`), and prefix searches. Time complexity `O(log N)`.
* **Hash Index**: Supports **only** direct equality matches (`=`, `IN`). Does not support sorting or range searches. Time complexity $O(1)$.

### Q43: Explain Sharding Key selection and the re-sharding problem.
* **Selection**: Requires high cardinality and even write distribution to avoid hot-spotting shards.
* **Re-Sharding**: If a shard key is poorly selected, some shards will fill up, requiring the database to modify the shard key layout, which requires massive, expensive physical redistribution of terabytes of data across the network.

---

### Q44: What is a covering index? What do INCLUDE columns add?
* A **covering index** contains every column a query needs, so the engine answers it purely from the index without touching the base table (an *index-only scan* / *covered query*).
* **Key columns** (leftmost prefix) serve seeks and ordering; **INCLUDE columns** are stored only at leaf level - they extend coverage without bloating the seek structure or participating in sorting:
```sql
CREATE INDEX ix_orders_cust ON orders (customer_id, order_date)
INCLUDE (total_amount, status);
-- Query served entirely from the index:
SELECT order_date, total_amount FROM orders WHERE customer_id = 42;
```
* Benefits: fewer random I/O reads against the heap/table. Costs: wider leaf pages → more memory/I/O per index page, slower writes. Avoid including large VARCHAR/BLOB columns.

### Q45: How does Snapshot Isolation differ from SERIALIZABLE?
* **Snapshot Isolation (SI)**: each transaction reads a consistent point-in-time snapshot taken at `BEGIN`; readers never block writers and vice versa (MVCC). It prevents dirty/non-repeatable reads but still permits **write skew** (two transactions read overlapping data and write disjoint rows, violating a business invariant).
* **SERIALIZABLE**: guarantees executions are equivalent to some serial order - prevents write skew too, either via locking ranges (SQL Server serializable, next-key locks in MySQL) or via SSI (PostgreSQL).
* SI is dramatically more concurrent and usually sufficient; choose true serializable when invariants span multiple rows read then written independently (e.g., on-call doctor scheduling, balance-vs-overdraft checks).

### Q46: Explain vertical vs horizontal scaling of databases.
* **Vertical scaling (scale-up)**: move to a bigger machine - more CPU/RAM/NVMe. Pros: no application change, keeps a single copy (no consistency issues). Cons: hardware ceilings, cost grows non-linearly, single point of failure, maintenance windows.
* **Horizontal scaling (scale-out)**: add more nodes - replication for read scaling, sharding/partitioning for write+data scaling. Pros: near-linear capacity, fault isolation, elastic growth. Cons: cross-shard joins/transactions become hard, resharding pain, operational complexity (routing layers, rebalancing, monitoring).
* Typical progression: tune/index → read replicas + cache → vertical bump → shard by tenant/key. Interviewers expect you to justify *when* to switch rather than just defining terms.

### Q47: What are computed/generated columns?
* Columns whose value is derived from other columns via an expression; the engine maintains them automatically.
* **Virtual**: evaluated at read time (no storage). **Stored**: materialized on write (costly writes, cheap reads, indexable):
```sql
ALTER TABLE orders ADD COLUMN total_with_tax DECIMAL(10,2)
  GENERATED ALWAYS AS (amount * 1.18) STORED;
CREATE INDEX ix_total ON orders(total_with_tax);
```
* Uses: normalized derivations (full names, totals), deterministic JSON field extraction, indexing expression results that plain indexes cannot target.
* Constraint: expressions must be deterministic (no NOW(), no subqueries) so results stay reproducible.

### Q48: What are system-versioned (temporal) tables?
* Tables where the engine automatically keeps full row history: updates/deletes move prior versions into a history table, timestamped with period columns (`VALID_FROM`, `VALID_TO`).
* Query modes: current data normally, or time travel - `FOR SYSTEM_TIME AS OF '2026-01-01'` (SQL Server) / range queries - to reconstruct any past state.
* **Use cases**: audits and regulatory compliance, slowly-changing-dimension style analytics, debugging "what did the record look like when the bug hit", forensic correction of bad batch jobs.
* Costs: storage growth (mitigate with retention policies), no direct history-table writes, some DDL restrictions. Replaces hand-rolled trigger-based audit tables.

### Q49: What is a full-text search index and how does it differ from LIKE?
* An **inverted index** mapping tokens → rows: text is split by tokenizer, normalized (lowercase, stop-word removal, stemming), and each term stores the list of documents containing it plus positions.
* `WHERE note LIKE '%error%'` forces a full scan and cannot use normal B-tree indexes for leading wildcards; relevance ranking, prefix/fuzzy matching and phrase proximity are impossible.
* Full-text engines support: `MATCH ... AGAINST` (MySQL), `tsvector/tsquery` + GIN indexes (PostgreSQL), CONTAINS/FREETEXT (SQL Server), with ranking functions (BM25-style scoring).
* For heavy relevance search (facets, typo tolerance, synonyms), dedicated engines (Elasticsearch/OpenSearch) sit beside the RDBMS, kept in sync via CDC or dual writes.

### Q50: What is the query plan cache? Explain simple vs forced parameterization.
* Engines compile SQL into execution plans; caching lets repeated statements skip parsing/optimization. Cache is keyed by statement hash, so literal differences (`id = 5` vs `id = 6`) normally produce distinct entries - cache pollution and compilation storms under load.
* **Simple parameterization**: the engine auto-replaces trivial literals with parameters for simple queries.
* **Forced parameterization**: instructs the optimizer to parameterize almost all literals, maximizing reuse.
* Trade-off - **parameter sniffing**: a plan compiled for the first parameter value may be terrible for skewed distributions of later values. Mitigations: `OPTION(RECOMPILE)`, local variables, plan guides, OPTIMIZE FOR UNKNOWN, statistics hygiene.

---

## Coding & Implementation Challenges

### Q51: Write SQL queries utilizing window functions `RANK()`, `DENSE_RANK()`, and `ROW_NUMBER()`.
```sql
-- Compare ranking functions within each region ordered by sales amount descending
SELECT 
    sales_rep_id,
    region,
    sales_amount,
    ROW_NUMBER() OVER (PARTITION BY region ORDER BY sales_amount DESC) AS row_num,
    RANK() OVER (PARTITION BY region ORDER BY sales_amount DESC) AS sales_rank,
    DENSE_RANK() OVER (PARTITION BY region ORDER BY sales_amount DESC) AS sales_dense_rank
FROM sales;
```

### Q52: Write a recursive SQL CTE to traverse and output a complete employee organization chart.
```sql
WITH RECURSIVE OrgChart AS (
    -- Anchor Member: Find top-level managers (no manager)
    SELECT employee_id, name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive Member: Join remaining employees to their managers
    SELECT e.employee_id, e.name, e.manager_id, o.level + 1
    FROM employees e
    INNER JOIN OrgChart o ON e.manager_id = o.employee_id
)
SELECT employee_id, name, manager_id, level 
FROM OrgChart
ORDER BY level, manager_id;
```

### Q53: Write SQL commands to configure a transaction isolation level to `SERIALIZABLE` and execute a transaction.
```sql
-- Configure Isolation Level
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

BEGIN TRANSACTION;

-- Execute range check that acquires range locks to prevent phantom inserts
SELECT SUM(quantity) AS TotalStock 
FROM inventory 
WHERE category = 'Electronics';

-- Perform insert under range lock protection
INSERT INTO inventory (item_name, category, quantity)
VALUES ('Smartwatch', 'Electronics', 150);

COMMIT TRANSACTION;
```

### Q54: Implement a complex SQL query that performs a Pivot operation, converting rows of monthly sales data into columns.
```sql
-- Using conditional aggregation to pivot monthly sales data
SELECT 
    sales_year,
    SUM(CASE WHEN sales_month = 'Jan' THEN sales_amount ELSE 0 END) AS Jan_Sales,
    SUM(CASE WHEN sales_month = 'Feb' THEN sales_amount ELSE 0 END) AS Feb_Sales,
    SUM(CASE WHEN sales_month = 'Mar' THEN sales_amount ELSE 0 END) AS Mar_Sales
FROM monthly_sales
GROUP BY sales_year;
```

### Q55: Write a PL/SQL stored procedure that processes a payroll increase using an explicit cursor.
```sql
CREATE OR REPLACE PROCEDURE adjust_department_payroll(p_dept_id INT, p_increase_percent DECIMAL) AS
    -- 1. Declare explicit cursor
    CURSOR emp_cursor IS
        SELECT emp_id, salary 
        FROM employees 
        WHERE dept_id = p_dept_id;
        
    v_emp_id employees.emp_id%TYPE;
    v_salary employees.salary%TYPE;
BEGIN
    -- 2. Open Cursor
    OPEN emp_cursor;
    LOOP
        -- 3. Fetch Data
        FETCH emp_cursor INTO v_emp_id, v_salary;
        EXIT WHEN emp_cursor%NOTFOUND;
        
        -- 4. Process individual updates
        UPDATE employees 
        SET salary = v_salary * (1 + p_increase_percent / 100)
        WHERE emp_id = v_emp_id;
    END LOOP;
    
    -- 5. Close Cursor
    CLOSE emp_cursor;
    COMMIT;
END;
/
```

### Q56: Create a composite index on `orders` optimized for filtering on `customer_id` and `status` and sorting by `order_date` descending.
```sql
-- 1. Create highly optimized composite index (Equality columns first, then Sort column)
CREATE INDEX idx_orders_customer_status_date 
ON orders (customer_id, status, order_date DESC);

-- 2. Optimized SQL Query matching index layout
SELECT order_id, customer_id, status, order_date, total_price
FROM orders
WHERE customer_id = 99201 AND status = 'COMPLETED'
ORDER BY order_date DESC;
```

### Q57: Write an SQL query using `EXISTS` and `NOT EXISTS` to find customers who have purchased all products from a specific category.
```sql
-- Find customers where there DOES NOT EXIST a product in Category 10 that they have NOT purchased
SELECT c.customer_id, c.customer_name
FROM customers c
WHERE NOT EXISTS (
    SELECT p.product_id 
    FROM products p
    WHERE p.category_id = 10
    AND NOT EXISTS (
        SELECT o.order_id 
        FROM orders o
        JOIN order_items oi ON o.order_id = o.order_id
        WHERE o.customer_id = c.customer_id
        AND oi.product_id = p.product_id
    )
);
```
