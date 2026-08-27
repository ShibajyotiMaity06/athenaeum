# SQL - Medium Interview Questions

### Q1: Explain database normalization and its key stages (1NF, 2NF, 3NF, BCNF).
* **Normalization:** Organizing data in a database to reduce redundancy and improve data integrity.
* **1NF (First Normal Form):** Atomic values only; no repeating groups or arrays. Columns must contain single values.
* **2NF (Second Normal Form):** Must be in 1NF, and all non-key columns must be **fully functionally dependent** on the primary key (no partial dependencies on composite keys).
* **3NF (Third Normal Form):** Must be in 2NF, and all non-key columns must have **no transitive dependencies** on the primary key (no non-key column can depend on another non-key column).
* **BCNF (Boyce-Codd Normal Form):** Stronger version of 3NF. For every functional dependency $X \rightarrow Y$, $X$ must be a super key.

### Q2: What is denormalization, and when is it preferred over normalization?
* **Denormalization:** The intentional introduction of redundancy by combining tables or adding redundant columns.
* **Purpose:** Boosts read performance in **OLAP (Analytical)** systems by eliminating complex, expensive multi-table joins.
* **Trade-off:** Speeds up reads but slows down writes (inserts/updates/deletes) and increases storage requirements and risk of anomalies.

### Q3: Explain the difference between clustered and non-clustered indexes.
* **Clustered Index:** Determines the physical sorting order of the actual table rows on disk. Only **one clustered index** can exist per table. Leaf nodes contain the actual data rows.
* **Non-Clustered Index:** Contains a sorted list of indexed key values alongside pointers (row locators or primary key values) to the actual physical rows. **Multiple non-clustered indexes** can exist. Leaf nodes contain pointers rather than raw table data.

### Q4: What is a composite index? Explain the leftmost prefix rule.
* **Composite Index:** An index constructed on two or more columns (e.g., `INDEX (col1, col2, col3)`).
* **Leftmost Prefix Rule:** The query optimizer will only utilize the composite index if the filter criteria include the columns from left to right without gaps. A filter on `col1` or `col1 AND col2` uses the index, but a filter on `col2` or `col2 AND col3` alone cannot use it.

### Q5: What is the overhead of indexes on write operations?
* **Overhead:** Every `INSERT`, `UPDATE`, or `DELETE` requires updating not only the base table but also all associated indexes to maintain sorted structures (B-Tree splits/re-balancing).
* **Mitigation:** Avoid over-indexing tables; index only columns that are frequently used in `WHERE`, `JOIN`, `ORDER BY`, or `GROUP BY` clauses.

### Q6: Explain transaction isolation levels and their corresponding read anomalies.
* **Read Anomalies:**
  * **Dirty Read:** Transaction reads uncommitted changes of another transaction.
  * **Non-Repeatable Read:** Re-reading the same row within a transaction returns different values because another transaction modified and committed it.
  * **Phantom Read:** Re-running a query returns new matching rows because another transaction inserted them.
* **Isolation Levels & Protections:**
  * **Read Uncommitted:** No protections; all anomalies possible.
  * **Read Committed:** Prevents Dirty Reads.
  * **Repeatable Read:** Prevents Dirty and Non-Repeatable Reads. (Default in MySQL InnoDB).
  * **Serializable:** Prevents all anomalies; uses strict locking or serialization checks.

### Q7: What is the difference between Stored Procedures and User-Defined Functions (UDFs)?
* **Stored Procedure:** Can perform transactional DML/DDL. Can return multiple datasets, output parameters, or nothing. Can use transactions (`COMMIT`/`ROLLBACK`). Executed using `CALL` or `EXEC`.
* **User-Defined Function:** Must return a single value (scalar) or a table. Cannot modify database state (DML/DDL are restricted). Cannot use transaction statements. Can be invoked directly inside `SELECT` or `WHERE` clauses.

### Q8: What is a database trigger? Mention different types and their use cases.
* **Trigger:** A named SQL block that executes automatically in response to specific events on a table.
* **Types:** `BEFORE` or `AFTER` execution of `INSERT`, `UPDATE`, or `DELETE`. Can be row-level (`FOR EACH ROW`) or statement-level.
* **Use Cases:** Automated data auditing, enforcing complex integrity rules, and synchronizing aggregate columns across tables.

### Q9: Compare Common Table Expressions (CTEs), Subqueries, and Views.
* **CTE:** Temporary named result set valid only within the scope of a single statement. Improves readability and supports recursion.
* **Subquery:** Inline query nested within another. Can be difficult to read and optimize if heavily nested.
* **View:** Stored database schema definition query. Reusable across multiple transactions and connections.

### Q10: What are window functions and how do they differ from regular aggregations?
* **Window Functions:** Perform calculations across a set of table rows that are related to the current row.
* **Difference:** Unlike regular aggregates, which group rows and collapse them into a single summary row, window functions compute value transitions while **preserving individual row identities** and details.

### Q11: Explain the differences between ROW_NUMBER(), RANK(), and DENSE_RANK().
* **ROW_NUMBER():** Assigns a unique, sequential integer to each row in the partition, starting at 1. No duplicates.
* **RANK():** Assigns ranking numbers; identical values receive the same rank, but the next rank number is **skipped** (e.g., 1, 2, 2, 4).
* **DENSE_RANK():** Assigns ranking numbers; identical values receive the same rank, and the next rank number is **consecutive** (e.g., 1, 2, 2, 3).

### Q12: Explain LAG() and LEAD() window functions and their use cases.
* **LAG(col, offset):** Fetches the value of a column from a row $N$ steps **prior** to the current row within the partition.
* **LEAD(col, offset):** Fetches the value of a column from a row $N$ steps **ahead** of the current row.
* **Use Case:** Calculating period-over-period growth rates or detecting state transitions over time.

### Q13: What is the difference between a correlated subquery and a non-correlated subquery?
* **Non-Correlated:** Independent of the outer query. Evaluated once; results are fed to the outer query.
* **Correlated:** References outer query columns. Evaluated **once for every row** processed by the outer query, leading to severe performance overhead if tables are large.

### Q14: Explain the differences between EXISTS and IN operators. When is EXISTS faster?
* **IN:** Evaluates the subquery completely first and caches the result set, then searches it.
* **EXISTS:** Evaluates on a boolean basis; returns `TRUE` immediately upon finding the first match and stops searching.
* **Performance:** `EXISTS` is faster when the subquery filters on large tables because of its short-circuit evaluation logic.

### Q15: How do ANY (or SOME) and ALL operators work?
* **ANY:** Evaluates to `TRUE` if the comparison is true for **at least one** value in the list/subquery.
* **ALL:** Evaluates to `TRUE` if the comparison is true for **all** values in the list/subquery.

### Q16: How does EXPLAIN work and what should you look for in its output?
* **Purpose:** Displays the query execution plan generated by the optimizer.
* **Key Indicators to Inspect:**
  * **Scan Type:** Look for `ALL` (full table scan, highly inefficient) vs `index` or `range` scans.
  * **Key/Index Used:** Indicates if indexes are actually being utilized.
  * **Rows Checked:** Lower counts indicate a more efficient search trajectory.

### Q17: What is a deadlock and how does a DBMS resolve it?
* **Deadlock:** A state where two or more transactions are blocked because each holds a lock that the other needs to proceed, creating a cyclic dependency.
* **Resolution:** The DBMS deadlock detector actively scans the lock graph, identifies cycles, aborts/rolls back the transaction with the least work (the victim), and frees up its locks so others can proceed.

### Q18: What is the difference between optimistic and pessimistic locking?
* **Optimistic Locking:** Assumes conflict is rare. Checks if a record was modified (usually via a version/timestamp column) only at the moment of saving. If modified, the transaction is rejected. Good for high-read, low-write concurrency.
* **Pessimistic Locking:** Assumes conflict is frequent. Places explicit locks on rows (`SELECT ... FOR UPDATE`) upon retrieval to prevent other transactions from modifying them until current transaction commits. Good for high-write sensitivity.

### Q19: Explain horizontal vs vertical table partitioning.
* **Horizontal Partitioning (Sharding):** Splitting rows of a table across multiple distinct tables or physical databases (e.g., putting customers from East Region in one partition, West in another).
* **Vertical Partitioning:** Splitting columns of a table across multiple tables (e.g., placing large binary objects or rarely used columns in an auxiliary table to keep the main table narrow and cache-friendly).

### Q20: What is collation, and how does it affect comparisons?
* **Definition:** A set of rules determining how character strings are sorted and compared in character data types.
* **Impact:** Dictates whether comparisons are case-sensitive (`_CS` vs `_CI`) or accent-sensitive (`_AS` vs `_AI`). Mismatched collations in join operations trigger collation-conflict errors.

### Q21: What are database cursors? Why should they be avoided in OLTP?
* **Definition:** Database objects used to retrieve and process a result set row-by-row sequentially.
* **Avoidance:** They run procedural loop logic instead of set-based logic, consuming massive database memory and holding locks longer, which drastically degrades performance and concurrency.

### Q22: What is the difference between Materialized Views and Standard Views?
* **Standard View:** A virtual view. Executes its query definition on the fly every time the view is referenced. Consumes no physical disk space.
* **Materialized View:** Physically stores the query results on disk. Must be refreshed (manually, scheduled, or triggered) to pull updates from base tables. Ideal for heavy read queries over complex aggregations.

### Q23: What is a self-referential foreign key?
* **Definition:** A foreign key column in a table that references the primary key of the **same table**.
* **Use Case:** Storing organizational hierarchies, e.g., an `employee_id` table where the `manager_id` column points back to the `employee_id` in the same table.

### Q24: Explain the concept of an UPSERT operation.
* **Definition:** A merge operation that inserts a record if it does not exist, or updates the existing record if it already exists (identified by a primary key/unique key collision).
* **Syntax:** `MERGE` in SQL Server/Oracle, `INSERT ... ON DUPLICATE KEY UPDATE` in MySQL, `INSERT ... ON CONFLICT DO UPDATE` in PostgreSQL.

### Q25: Explain ON DELETE CASCADE, RESTRICT, and SET NULL referential actions.
* **CASCADE:** If a parent row is deleted, all corresponding child rows in the foreign key table are automatically deleted.
* **RESTRICT (or NO ACTION):** Prevents deletion of the parent row if any referencing child rows exist.
* **SET NULL:** If a parent row is deleted, the foreign key column in the referencing child rows is set to `NULL`.

### Q26: How do parameterized queries prevent SQL injection?
* **Mechanism:** Parameterized queries compile the SQL statement template first with placeholder values. When parameters are bound, the database treats them strictly as literal data values, never as executable code, completely neutralizing injection scripts.

### Q27: What is Multi-Version Concurrency Control (MVCC)?
* **Definition:** A concurrency control paradigm where the database maintains multiple physical versions of a row simultaneously.
* **Benefit:** Allows readers to access older, consistent snapshots of data without blocking writers, and writers to modify data without blocking readers (reads don't block writes, and writes don't block reads).

### Q28: Why do databases require vacuuming or compaction?
* **Reason:** In MVCC architectures (like PostgreSQL), modifying or deleting rows does not physically overwrite or erase data on disk. Instead, old rows are marked as "dead tuples."
* **Vacuuming:** Reclaims the disk space occupied by these dead tuples and updates database visibility maps to prevent table bloat and performance decay.

### Q29: What is the difference between sharding, partitioning, and replication?
* **Partitioning:** Splitting a large table into smaller physical files within the same database engine instance.
* **Sharding:** Distributing data across entirely separate, independent database servers/instances.
* **Replication:** Copying the entire database across multiple instances to guarantee high availability and scale reads.

### Q30: Compare synchronous and asynchronous database replication.
* **Synchronous:** Master writes and waits for confirmation from replicas before committing. Guarantees **zero data loss** but introduces write latency.
* **Asynchronous:** Master commits writes immediately and transmits updates to replicas in the background. High write speed, but risk of data loss if the master fails before updates are synced.

### Q31: What is database federation?
* **Definition:** A system architecture where multiple physical databases are linked together to act as a single logical database, allowing users to query multiple distinct sources via virtual schemas.

### Q32: What is the Information Schema?
* **Definition:** A standard set of read-only system views that contain metadata about all objects defined in the database, such as tables, columns, data types, indexes, and constraints.

### Q33: Contrast COALESCE and NULLIF.
* **COALESCE(val1, val2, ...):** Evaluates arguments in order and returns the **first non-null** value.
* **NULLIF(val1, val2):** Compares two values; returns **NULL if they are equal**, otherwise returns the first value.

### Q34: What is the GROUPING SETS operator?
* **Definition:** An extension of `GROUP BY` that allows defining multiple distinct grouping configurations within a single query. The database executes them in a single scan, which is more efficient than executing multiple `UNION` operations.

### Q35: Explain the CUBE and ROLLUP operators in GROUP BY.
* **ROLLUP:** Creates hierarchical subtotal combinations from left to right (e.g., `GROUP BY ROLLUP(a, b)` generates groupings for `(a, b)`, `(a)`, and `()`).
* **CUBE:** Creates all possible permutation groupings for the specified columns (e.g., `GROUP BY CUBE(a, b)` generates groupings for `(a, b)`, `(a)`, `(b)`, and `()`).

### Q36: Why should Natural Joins be avoided in production environments?
* **Natural Join:** Joins tables implicitly based on columns sharing identical names in both tables.
* **Risk:** Extremely fragile. Adding a new column with a generic name (like `created_at` or `status`) to either table will silently break the join conditions without warning.

### Q37: What is CTE materialization?
* **Definition:** An optimization phase where the database decides whether to compile the CTE's output once and store it in memory as a temporary table (materialized) or to inline the query directly into the parent query plan.

### Q38: What is bulk loading, and why is it preferred over raw INSERT statements?
* **Definition:** Loading massive datasets using dedicated utility statements (e.g., `COPY` in PostgreSQL, `LOAD DATA INFILE` in MySQL).
* **Why:** Bypasses SQL parsing, transaction logging overhead, trigger checks, and index updates for each individual row, executing up to 10-100x faster.

### Q39: Explain semi-joins and anti-joins.
* **Semi-Join:** Returns rows from the first table where one or more matches are found in the second table (usually generated via `EXISTS` or `IN`).
* **Anti-Join:** Returns rows from the first table where *no* matches exist in the second table (usually generated via `NOT EXISTS` or `NOT IN`).

### Q40: What is index selectivity and how does it affect query optimizer choices?
* **Selectivity:** The ratio of unique values in a column to the total number of records ($\text{Selectivity} = \text{Distinct Count} / \text{Total Rows}$).
* **Impact:** Columns with high selectivity (close to 1, like unique user IDs) are highly index-friendly. Columns with low selectivity (close to 0, like boolean flags or gender) are ignored by the optimizer in favor of a full table scan.

### Q41: Explain how stale database statistics degrade query performance.
* **Problem:** The query optimizer uses cached statistics (histograms of column distributions) to plan paths.
* **Stale Stats:** If major data changes occur but statistics are stale, the optimizer may assume a table is small or a column is highly selective, choosing slow plans (like nested loops over hash joins) and degrading performance.

### Q42: What is the difference between CROSS APPLY and OUTER APPLY?
* **CROSS APPLY:** Similar to an `INNER JOIN` but joins a table to a table-valued function or correlated subquery. Returns rows from the left table only if the right table-valued expression yields rows.
* **OUTER APPLY:** Similar to a `LEFT JOIN`. Returns all rows from the left table even if the right-side table-valued expression returns nothing.

### Q43: What is connection pooling and why is it used?
* **Definition:** A cache of active database connections maintained by an application server.
* **Purpose:** Creating and tearing down TCP database connections is extremely CPU and memory intensive. Reusing connections reduces latency and prevents resource exhaustion.

---

### Q44: What are generated (computed) columns and how are they used?
* Columns defined by expressions over other columns: virtual (computed at read) or stored/materialized (computed at write, indexable).
```sql
ALTER TABLE orders ADD COLUMN total DECIMAL(10,2)
  GENERATED ALWAYS AS (quantity * unit_price) STORED;
CREATE INDEX ix_orders_total ON orders(total);
```
* Uses: derived values kept consistent automatically (totals, normalized names), indexing expression results, simplifying BI queries without triggers.
* Constraints: expressions must be deterministic (no NOW()/random), no cross-table references, some DDL restrictions altering dependent columns. Compare with views (virtual, global) and triggers (imperative, error-prone).

### Q45: How do you store and index JSON in relational databases?
* Native types: PostgreSQL `json` (text-preserving) vs `jsonb` (parsed binary, indexable, deduplicated); MySQL `JSON` type with inline binary format; SQL Server NVARCHAR + `JSON_VALUE/OPENJSON` functions.
* Indexing: GIN indexes over jsonb (`CREATE INDEX ON docs USING gin(payload jsonb_path_ops)`) accelerate containment queries (`payload @> '{"status":"active"}'`); expression indexes pin specific paths (`((payload->>'city'))`).
* When appropriate: truly variable attributes, external-system payloads, config blobs. Anti-pattern: relational data hidden in JSON losing constraints/joins/stats — model stable relationships as columns/tables.
* Interview follow-ups: partial updates (jsonb_set rewrite cost = whole document), statistics blindness leading to bad plans, and schema-validation via CHECK + JSON Schema.

### Q46: Explain the anatomy of a recursive CTE.
* Two mandatory parts united by UNION ALL (or UNION to dedupe):
```sql
WITH RECURSIVE tree AS (
  SELECT id, parent_id, 1 AS depth          -- anchor member
  FROM nodes WHERE parent_id IS NULL
  UNION ALL
  SELECT n.id, n.parent_id, t.depth + 1     -- recursive member
  FROM nodes n JOIN tree t ON n.parent_id = t.id
)
SELECT * FROM tree;
```
* Execution: anchor evaluates once producing a working set; the recursive member re-evaluates against the working set repeatedly until it returns zero rows; results accumulate.
* Requirements: exactly one recursive reference; termination relies on data eventually yielding empty sets — infinite loops need depth guards/cycle detection.
* Typical uses: org charts, bill-of-materials, graph reachability, category trees. (Depth/performance hazards covered separately at hard level.)

### Q47: What is read/write splitting with replicas, and what consistency traps arise?
* Pattern: writes go to the primary; reads fan out to synchronous/asynchronous replicas — scaling read throughput cheaply and isolating analytics from OLTP.
* Trap 1 — **replication lag**: write-then-immediate-read hits a stale replica ("I updated my email but it shows old"). Mitigations: sticky routing after writes (session reads primary briefly), read-your-writes tokens (LSN/GTID wait), causal consistency libraries.
* Trap 2 — failover semantics: promoting a lagging replica can lose acknowledged transactions (RPO>0); semi-sync replication trades latency for safety.
* Operational notes: connection routing layers (ProxySQL/pgbouncer-style), monitoring replica lag as an SLO, and keeping heavy reports on dedicated replicas to protect primary latency.

### Q48: What is the soft-delete pattern and how must unique constraints adapt?
* Design: never physically delete; mark `deleted_at TIMESTAMP NULL` preserving history/undo and FK-safe archives.
* Unique-constraint conflict: plain `UNIQUE(email)` blocks re-registering a deleted user's email. Solutions:
  1. Partial index: `CREATE UNIQUE INDEX ON users(email) WHERE deleted_at IS NULL` (Postgres).
  2. Computed trick: unique on `(email, COALESCE(deleted_at,'2100-01-01'))` allowing multiple tombstones.
  3. Move tombstones to archive tables.
* Costs infect everything: every query needs `WHERE deleted_at IS NULL` (views/policies centralize this), unique checks, FK references to deleted rows, and analytics miscounts if filters slip. Some teams prefer status columns + audit trails instead.

### Q49: How do you delete/archive millions of rows safely?
* One giant DELETE takes the longest lock, bloats WAL/replication lag, explodes index maintenance, and can starve OLTP — sometimes worse via MVCC dead tuples (Postgres bloat).
* Batching recipe: loop deleting `LIMIT/BATCH` rows (5–50k) selected by PK ranges, commit each batch, sleep/throttle between batches, monitor replica lag and lock waits, stop on threshold breach.
* Alternatives: partition-drop (TRUNCATE/DROP oldest partitions instantly, zero row-level work — design tables partitioned by date from day one), `DELETE ... LIMIT` native support, CTAS keep-and-swap (copy survivors to new table, rename swap), or `pg_repack`-style online rebuild tools.
* Always pair with vacuum/analyze scheduling afterwards and verify FK/cascade interactions before running in prod.

### Q50: CHECK constraint vs lookup table vs ENUM — how do you choose?
* **CHECK**: zero-join validation, instant ALTER, ideal for stable math/domain rules (`price >= 0`, `status IN ('new','paid')` when the set rarely evolves). Weakness: adding values requires DDL on possibly huge tables (fast metadata-only in modern PG/SQL Server, still ops overhead).
* **Lookup table**: values as data — add rows anytime, attach extra attributes (labels, sort order, i18n names), FK-enforced integrity; cost is join overhead and seeding discipline across environments.
* **ENUM type** (PG/MySQL): compact storage + type safety, but painful value additions (ALTER TYPE), poor cross-db portability, and tooling quirks.
* Rule of thumb: closed mathematical domains → CHECK; evolving business categories needing metadata → lookup table; tiny fixed UI-ish sets → enum acceptable. Consistency across environments matters more than the specific choice.

---

## Coding & Implementation Challenges

### Q51: Write a query to find the N-th highest salary from an employees table using window functions.
* **Implementation:** Employs the `DENSE_RANK()` function within a Common Table Expression to properly handle duplicate salaries.
```sql
WITH RankedSalaries AS (
    SELECT 
        employee_id,
        employee_name,
        salary,
        DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank
    FROM employees
)
SELECT employee_id, employee_name, salary
FROM RankedSalaries
WHERE salary_rank = :N; -- replace :N with the target rank value (e.g., 3)
```

### Q52: Write a query to calculate a rolling 3-day moving average of daily sales.
* **Implementation:** Uses window function range frames to partition and extract the preceding two intervals relative to the current record.
```sql
SELECT 
    sales_date,
    daily_amount,
    AVG(daily_amount) OVER (
        ORDER BY sales_date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_3_day
FROM daily_sales;
```

### Q53: Identify overlapping user sessions within a user logins table.
* **Implementation:** Employs a self-join to identify session records for the same user where start and end boundaries overlap.
```sql
SELECT 
    s1.user_id,
    s1.session_id AS session_1_id,
    s2.session_id AS session_2_id,
    s1.login_time AS s1_start,
    s1.logout_time AS s1_end,
    s2.login_time AS s2_start,
    s2.logout_time AS s2_end
FROM user_sessions s1
INNER JOIN user_sessions s2 ON s1.user_id = s2.user_id 
    AND s1.session_id < s2.session_id
WHERE s1.login_time < s2.logout_time 
  AND s1.logout_time > s2.login_time;
```

### Q54: Write a query to pivot dynamic quarterly sales data from rows to columns.
* **Implementation:** Employs conditional `CASE WHEN` aggregation paired with `SUM` to transpose rows into distinct columns.
```sql
SELECT 
    sales_year,
    SUM(CASE WHEN quarter = 'Q1' THEN sales_amount ELSE 0 END) AS Q1_Sales,
    SUM(CASE WHEN quarter = 'Q2' THEN sales_amount ELSE 0 END) AS Q2_Sales,
    SUM(CASE WHEN quarter = 'Q3' THEN sales_amount ELSE 0 END) AS Q3_Sales,
    SUM(CASE WHEN quarter = 'Q4' THEN sales_amount ELSE 0 END) AS Q4_Sales,
    SUM(sales_amount) AS Total_Annual_Sales
FROM sales_records
GROUP BY sales_year;
```

### Q55: Create a stored procedure that handles money transfers between two accounts safely with transaction rollback.
* **Implementation:** Uses transactional control boundaries and exception handlers to ensure ACID updates.
```sql
CREATE PROCEDURE TransferFunds(
    IN sender_id INT,
    IN receiver_id INT,
    IN amount DECIMAL(10,2)
)
BEGIN
    DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
        -- Rollback the transaction on any database error
        ROLLBACK;
    END;

    START TRANSACTION;
        -- Deduct from sender
        UPDATE accounts 
        SET balance = balance - amount 
        WHERE account_id = sender_id AND balance >= amount;
        
        -- Check if debit occurred (ensure row was updated)
        IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient funds or invalid sender';
        END IF;

        -- Add to receiver
        UPDATE accounts 
        SET balance = balance + amount 
        WHERE account_id = receiver_id;

    COMMIT;
END;
```

### Q56: Create an AFTER INSERT trigger that automatically updates an inventory stock table when a sales transaction occurs.
* **Implementation:** Listens to rows inserted into `sales_transactions` and executes a corresponding stock subtraction on the `products` table.
```sql
CREATE TRIGGER after_sale_insert
AFTER INSERT ON sales_transactions
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity_sold
    WHERE product_id = NEW.product_id;
END;
```

### Q57: Write a recursive CTE to traverse and reconstruct an organizational reporting chain.
* **Implementation:** Uses recursion to traverse hierarchically from top-level executives down to subordinate employee paths.
```sql
WITH RECURSIVE OrgHierarchy AS (
    -- Anchor member: Select the top manager (has no manager)
    SELECT 
        employee_id,
        employee_name,
        manager_id,
        1 AS org_level,
        CAST(employee_name AS CHAR(255)) AS reporting_path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive member: Join the table back to find subordinates
    SELECT 
        e.employee_id,
        e.employee_name,
        e.manager_id,
        oh.org_level + 1 AS org_level,
        CONCAT(oh.reporting_path, ' -> ', e.employee_name) AS reporting_path
    FROM employees e
    INNER JOIN OrgHierarchy oh ON e.manager_id = oh.employee_id
)
SELECT employee_id, employee_name, org_level, reporting_path
FROM OrgHierarchy
ORDER BY org_level, employee_id;
```
