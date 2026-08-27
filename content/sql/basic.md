# SQL - Basic Interview Questions

### Q1: What is SQL and how does it differ from NoSQL?
* **SQL (Structured Query Language):** Relational database management system (RDBMS) language. Uses **structured schemas**, tabular relations (tables/columns/rows), and enforces **ACID** properties.
* **NoSQL (Not Only SQL):** Non-relational database system. Uses **flexible schemas** (document, key-value, wide-column, graph), scales **horizontally**, and prioritizes **BASE** properties (Basically Available, Soft state, Eventual consistency).

### Q2: Categorize standard SQL commands into their sub-languages. What are DDL, DML, TCL, and DCL?
* **DDL (Data Definition Language):** Defines/modifies schema structures. Commands: `CREATE`, `ALTER`, `DROP`, `TRUNCATE`.
* **DML (Data Manipulation Language):** Manipulates and queries data. Commands: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
* **TCL (Transaction Control Language):** Manages database transactions. Commands: `COMMIT`, `ROLLBACK`, `SAVEPOINT`.
* **DCL (Data Control Language):** Manages access permissions. Commands: `GRANT`, `REVOKE`.

### Q3: What is a Primary Key and how does it differ from a Unique Key?
* **Primary Key (PK):** Uniquely identifies a record in a table. Does **not allow NULLs**. Only **one PK** allowed per table. Creates a **clustered index** by default.
* **Unique Key (UK):** Ensures all values in a column are distinct. Allows **NULL values** (single or multiple depending on SQL dialect). **Multiple UKs** allowed per table. Creates a **non-clustered index** by default.

### Q4: What is a Foreign Key, and how does it maintain referential integrity?
* **Foreign Key (FK):** A column or group of columns in one table that references the PK/UK of another table.
* **Referential Integrity:** Ensures relationships between tables remain consistent. Prevents orphaned rows by restricting invalid inserts, and handles deletes/updates via rules like `ON DELETE CASCADE` or `ON DELETE SET NULL`.

### Q5: What are the different types of Joins in SQL?
* **INNER JOIN:** Returns records with matching values in both tables.
* **LEFT (OUTER) JOIN:** Returns all records from the left table, and matching records from the right; unmatched right side returns `NULL`.
* **RIGHT (OUTER) JOIN:** Returns all records from the right table, and matching records from the left; unmatched left side returns `NULL`.
* **FULL (OUTER) JOIN:** Returns all records when there is a match in either left or right table; unmatched rows return `NULL`.
* **CROSS JOIN:** Returns the Cartesian product of both tables (every combination of rows).

### Q6: What is the difference between INNER JOIN and LEFT JOIN?
* **INNER JOIN:** Keeps only the intersection of both tables. Unmatched rows on either side are **discarded**.
* **LEFT JOIN:** Keeps **all rows** from the left table regardless of matches. Unmatched right-side rows are padded with `NULL`s.

### Q7: Explain the difference between WHERE and HAVING clauses.
* **WHERE:** Filters individual raw rows **before** any grouping or aggregation. Cannot contain aggregate functions (e.g., `WHERE SUM(x) > 10` is invalid).
* **HAVING:** Filters aggregated groups **after** the `GROUP BY` clause is executed. Designed specifically to work with aggregate functions (e.g., `HAVING SUM(x) > 10` is valid).

### Q8: What is the purpose of the GROUP BY clause?
* **Aggregation:** Groups rows with identical values in specified columns into summary rows.
* **Usage:** Must be paired with aggregate functions like `COUNT()`, `SUM()`, `AVG()`, `MIN()`, or `MAX()`. Non-aggregated columns in the `SELECT` list must be included in the `GROUP BY` clause.

### Q9: Explain the difference between DISTINCT and GROUP BY.
* **DISTINCT:** Used to filter out duplicate rows from the final result set. Evaluated after generation of the select list.
* **GROUP BY:** Groups rows for performing aggregate operations. Use `GROUP BY` when calculating summary statistics; use `DISTINCT` purely to de-duplicate unique values.

### Q10: What are aggregate functions? Name the common ones.
* **Definition:** Functions that perform calculations on a set of values and return a single summarizing value.
* **Common Functions:**
  * `COUNT()`: Returns the number of rows.
  * `SUM()`: Returns the total sum of a numeric column.
  * `AVG()`: Returns the average value.
  * `MIN()` / `MAX()`: Returns the minimum / maximum value.

### Q11: What is a NULL value? How is it different from zero or blank space?
* **NULL:** Represents **missing, unknown, or unassigned** data. It is not a value, but a state.
* **Comparison:** Unlike `0` (a numeric value) or a blank space `' '` (a string value), `NULL` cannot be compared using `=` or `<>`. Any arithmetic operation with `NULL` results in `NULL`.

### Q12: How do you check for NULL values in a query?
* **Operators:** Use `IS NULL` or `IS NOT NULL`.
* **Example:** `SELECT * FROM employees WHERE manager_id IS NULL;`
* **Incorrect:** `WHERE manager_id = NULL` is invalid because `NULL = NULL` evaluates to `UNKNOWN` in SQL 3-valued logic.

### Q13: What is the difference between DELETE and TRUNCATE?
* **DELETE:** A **DML** command. Removes specific rows based on a `WHERE` clause. It is **slower** because it logs each row deletion. Activates **triggers**. Supports rollback within transactions.
* **TRUNCATE:** A **DDL** command. Deletes all rows in a table. It is **extremely fast** as it deallocates the data pages directly. Does not log individual row deletions, does **not fire triggers**, and resets identity columns.

### Q14: What is the difference between TRUNCATE and DROP?
* **TRUNCATE:** Empties the table of all data but **preserves the table structure**, columns, constraints, and indexes.
* **DROP:** Completely removes the table structure, its columns, data, constraints, and indexes from the database schema entirely.

### Q15: What are SQL constraints? Name five common constraints.
* **Definition:** Rules applied to table columns to limit the type of data that can go into them, ensuring data accuracy and reliability.
* **Common Constraints:**
  * `NOT NULL`: Prevents NULL values.
  * `UNIQUE`: Guarantees distinct values.
  * `PRIMARY KEY`: Combination of `NOT NULL` and `UNIQUE`.
  * `FOREIGN KEY`: Enforces referential integrity.
  * `CHECK`: Validates that values satisfy a specific boolean condition.
  * `DEFAULT`: Provides a default value if none is specified.

### Q16: What is a transaction, and what are its key properties (ACID)?
* **Transaction:** A logical unit of database work containing one or more SQL statements executed as a single block.
* **ACID Properties:**
  * **Atomicity:** All statements succeed, or the entire transaction fails and rolls back ("all or nothing").
  * **Consistency:** Ensures database transitions from one valid state to another, maintaining all schema constraints.
  * **Isolation:** Prevents concurrent transactions from interfering with each other.
  * **Durability:** Once committed, changes are permanently written to disk and survive system crashes.

### Q17: What is the difference between COMMIT and ROLLBACK?
* **COMMIT:** Saves all transaction modifications made since the transaction started permanently to disk. Ends the transaction.
* **ROLLBACK:** Reverts all modifications made during the active transaction back to the last committed state or `SAVEPOINT`. Ends the transaction.

### Q18: What is the purpose of the LIKE operator and what are its wildcards?
* **Purpose:** Performs pattern matching in string comparisons within a `WHERE` clause.
* **Wildcards:**
  * `%` (Percent): Represents zero, one, or multiple characters.
  * `_` (Underscore): Represents exactly one single character.

### Q19: What is the IN operator, and when should you use it?
* **Purpose:** Shorthand for multiple `OR` conditions. Checks if a value matches any value in a specified list or subquery.
* **Example:** `SELECT * FROM employees WHERE department_id IN (1, 2, 3);`

### Q20: Explain the BETWEEN operator. Is it inclusive or exclusive?
* **Purpose:** Filters a result set based on a range of values (numbers, text, or dates).
* **Inclusivity:** It is **inclusive**; it includes both the start and end values specified in the range.
* **Example:** `WHERE salary BETWEEN 50000 AND 80000;` matches both 50000 and 80000.

### Q21: What is the difference between UNION and UNION ALL?
* **UNION:** Combines the result sets of two or more `SELECT` statements and **removes duplicate rows**. Performs a costly sorting operation to de-duplicate.
* **UNION ALL:** Combines the result sets of two or more `SELECT` statements and **retains all duplicates**. It is much faster because no sorting/de-duplication is performed.

### Q22: What are the structural requirements for combining queries with UNION?
* **Rules:**
  1. Each `SELECT` statement must have the **same number of columns**.
  2. The columns must have **compatible data types** in the same order.
  3. The column names of the final result set are inherited from the first `SELECT` statement.

### Q23: What is an Alias in SQL and how do you use it?
* **Purpose:** Temporary name assigned to a table or column to make queries more readable or to handle calculated expressions.
* **Syntax:** Declared using the `AS` keyword (which is optional).
* **Example:** `SELECT emp_name AS name, salary * 12 AS annual_salary FROM employees;`

### Q24: What are views, and why are they used?
* **View:** A virtual table based on the result-set of an active SQL query. Contains no physical data itself.
* **Benefits:**
  * **Security:** Restricts direct table access by exposing only permitted columns.
  * **Simplicity:** Encapsulates complex joins and calculations into a simple pseudo-table.
  * **Consistency:** Centralizes business logic so that updates to queries instantly apply to all view users.

### Q25: Can you update a view? If so, under what conditions?
* **Updatability:** Yes, a view can be updated (`INSERT`, `UPDATE`, `DELETE`) if it is a **simple view**.
* **Conditions:** It must reference only **one base table**, contain **no aggregations** (`SUM`, `AVG`, `COUNT`), have **no GROUP BY**, **no DISTINCT**, and must not contain window functions or set operators.

### Q26: What is a subquery? What are the main types?
* **Definition:** A query nested inside another SQL statement (inside `SELECT`, `WHERE`, `FROM`, or `HAVING`).
* **Main Types:**
  * **Single-row subquery:** Returns exactly one row and one column (uses `=`, `<`, `>`).
  * **Multi-row subquery:** Returns multiple rows (uses `IN`, `ANY`, `ALL`).
  * **Correlated subquery:** References columns from the outer query; executes repeatedly once for each candidate row in the outer query.

### Q27: What is the difference between a subquery and a join?
* **Subquery:** Nested. Easier to write and read for complex logical filters. Can suffer from execution overhead if correlated.
* **Join:** Joins retrieve combined columns from multiple tables. Query optimizers are highly optimized for joins, which generally execute faster than correlated subqueries.

### Q28: What is a self-join, and when is it useful?
* **Definition:** A regular join in which a table is joined with itself.
* **Requirement:** Must use **table aliases** to distinguish the left copy of the table from the right copy.
* **Use Case:** Querying hierarchical data, such as finding employees and their matching manager names within the same `employees` table.

### Q29: What is the purpose of the ORDER BY clause? What is its default order?
* **Purpose:** Sorts the final result set by one or more columns.
* **Default Order:** Sorts in **ascending order (ASC)**. To sort in reverse, specify `DESC` (descending).

### Q30: Explain the difference between CHAR and VARCHAR data types.
* **CHAR(N):** Fixed-length string. Pads short values with spaces to fit size `N`. Faster to process because size is static. Use for fixed-length data (e.g., ISO codes, UUIDs).
* **VARCHAR(N):** Variable-length string. Stores only the characters provided plus 1-2 bytes for length prefix. Saves disk space for variable-length text.

### Q31: What is the difference between DATETIME and TIMESTAMP?
* **DATETIME:** Stores raw date and time values. Range: `1000-01-01` to `9999-12-31`. **TimeZone agnostic** (returns exactly what was saved).
* **TIMESTAMP:** Stores UTC seconds since Unix epoch. Range: `1970-01-01` to `2038-01-19`. **TimeZone aware** (converts input to UTC, and outputs converted to local database timezone).

### Q32: What is a database schema?
* **Definition:** The logical container or structure that defines the organization of data within a database. It contains tables, views, stored procedures, indexes, constraints, and relationships.

### Q33: Explain the difference between NVL(), IFNULL(), and COALESCE() functions.
* **NVL()**: Oracle specific. Takes two arguments; returns the second if the first is NULL.
* **IFNULL()**: MySQL specific. Takes two arguments; returns the second if the first is NULL.
* **COALESCE()**: ANSI SQL standard. Takes **arbitrary number of arguments**; returns the first non-NULL value in the list from left to right.

### Q34: What is the Cartesian Product (CROSS JOIN) in SQL?
* **Definition:** A join operation that returns every possible combination of rows from the participating tables.
* **Size:** If Table A has $M$ rows and Table B has $N$ rows, the CROSS JOIN yields $M \times N$ rows.

### Q35: How do you eliminate duplicate rows in SQL SELECT queries?
* **Method:** Use the `DISTINCT` keyword immediately following `SELECT`.
* **Example:** `SELECT DISTINCT job_title FROM employees;`

### Q36: What does the ISNULL() function do?
* **SQL Server:** Evaluates if an expression is NULL and replaces it with a specified value.
* **MySQL:** Returns `1` if the expression is NULL, otherwise `0`.

### Q37: Explain the concept of referential integrity.
* **Definition:** A set of database constraints ensuring that relationships between tables remain intact. It guarantees that any foreign key value must have a matching primary key value in the parent table.

### Q38: What is the purpose of the AS keyword?
* **Purpose:** Creates aliases for columns or tables. Increases query readability and renames expressions for programmatic extraction.

### Q39: What are SQL operators? Categorize them briefly.
* **Arithmetic:** `+`, `-`, `*`, `/`, `%`
* **Comparison:** `=`, `<>`, `!=`, `>`, `<`, `>=`, `<=`
* **Logical:** `AND`, `OR`, `NOT`, `IN`, `BETWEEN`, `LIKE`, `EXISTS`

### Q40: What is a composite primary key?
* **Definition:** A primary key consisting of **two or more columns** that together uniquely identify a row. Individually, these columns may contain duplicates, but combined, they must be unique and non-null.

### Q41: What is the default port of MySQL and PostgreSQL?
* **MySQL:** Default port `3306`.
* **PostgreSQL:** Default port `5432`.

### Q42: What is SQL injection and how can it be prevented at a basic level?
* **Definition:** A security vulnerability where malicious SQL code is injected into database input fields to run unauthorized commands.
* **Prevention:** Use **parameterized queries** (prepared statements) instead of dynamic string concatenation, and sanitize inputs.

### Q43: What is the difference between a database and a DBMS?
* **Database:** A structured collection of raw data stored electronically.
* **DBMS (Database Management System):** Software (e.g., MySQL, Oracle, PostgreSQL) that interacts with users and applications to retrieve, secure, and manage that database.

---

### Q44: What is the logical processing order of a SELECT statement?
* Although written SELECT-first, engines evaluate clauses logically as:
`FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT (aliases born here) → DISTINCT → ORDER BY → LIMIT/OFFSET`.
* Consequences interviewers probe: **WHERE cannot see SELECT aliases** (they don't exist yet), but **ORDER BY can** (it runs after SELECT); HAVING sees grouped aggregates while WHERE filters raw rows pre-grouping.
* Explains why filtering early in WHERE beats filtering in HAVING for performance, and why window functions (evaluated after GROUP BY/HAVING) can't appear in WHERE — only in outer queries or QUALIFY (engine-dependent).

### Q45: Compare COUNT(*), COUNT(column), and COUNT(DISTINCT column).
* `COUNT(*)`: counts **rows**, including those with NULLs everywhere — fastest (engines optimize to smallest index/scan).
* `COUNT(col)`: counts rows where `col IS NOT NULL` — silently changes semantics when the column is nullable.
* `COUNT(DISTINCT col)`: counts unique non-null values; memory/sort heavy on big sets — approximate counters (HyperLogLog in warehouses) exist for scale.
* Classic bug: expecting `COUNT(col)` = row count on nullable columns; also `COUNT(1)` vs `COUNT(*)` is a myth — identical performance in modern optimizers.

### Q46: Which string functions appear most often in interviews?
* Case/format: `UPPER`, `LOWER`, `INITCAP`, `TRIM/LTRIM/RTRIM`.
* Extraction/stitching: `SUBSTRING/SUBSTR(col, start, len)`, `CONCAT`/`||`, `REPLACE`, `POSITION/CHARINDEX`, `LENGTH/LEN` (byte vs char length differences matter for unicode).
* Splitting/merging: `STRING_AGG/GROUP_CONCAT` (rows→string), `STRING_SPLIT/unnest` (string→rows).
* Interview traps: 1-based vs 0-based substring indexes across engines; trailing spaces in CHAR comparisons; collation affecting case-insensitive equality.

### Q47: How do LIMIT/OFFSET work and why is deep pagination slow?
* `LIMIT n OFFSET m` skips m rows then returns n — engines must still *produce* the first m sorted rows, so cost grows linearly with page depth (page 10,000 scans ~100k rows).
* Better pattern — **keyset (cursor) pagination**: remember last seen sort key and filter `WHERE (created_at, id) < (:last_ts, :last_id) ORDER BY created_at DESC, id DESC LIMIT n`; each page costs the same regardless of depth, using the matching composite index.
* Trade-offs: keyset can't jump to arbitrary pages and needs a deterministic tie-breaker column (id) to stay stable amid inserts.

### Q48: What are temporary tables and when are they useful?
* Session/connection-scoped tables (`CREATE TEMP TABLE`, or `#temp` in SQL Server) living in tempdb-like storage, auto-dropped at session end.
* Use cases: staging intermediate multi-step results inside procedures/reports, breaking giant queries into debuggable passes, batching ETL workloads.
* Versus CTEs: CTEs are named query scopes (possibly inlined), temp tables are physical with stats/indexes — engines may choose differently; complex reuse or indexed staging favors temp tables.
* Watch-outs: tempdb contention under heavy temp usage, forgetting indexes on large temp sets, and temp-table caching behaviors differing across engines.

### Q49: How do auto-increment primary keys work across databases?
* MySQL: `AUTO_INCREMENT` column attribute; PostgreSQL: `SERIAL` (legacy) or `GENERATED ALWAYS AS IDENTITY` (SQL-standard, preferred); SQL Server: `IDENTITY(1,1)`; Oracle: sequence-based identity.
* Sequences are non-transactional — rolled-back inserts leave **gaps** (by design, for concurrency); applications must not assume contiguity.
* Concurrent-insert behavior: monotonic keys serialize at the index's rightmost leaf (hot-spot discussion appears again at hard level re: UUIDs).
* Getting the new id back: `RETURNING id` (PG), `LAST_INSERT_ID()` (MySQL), `SCOPE_IDENTITY()`/OUTPUT (SQL Server) — never rely on MAX(id).

### Q50: Why does ORDER BY 1 work, and why avoid positional/alias pitfalls?
* `ORDER BY 1` sorts by the first output column — legal shorthand, but breaks silently when the SELECT list is reordered during maintenance.
* Ordering by SELECT alias works because ORDER BY runs after SELECT; ordering by an aliased aggregate expression is fine, but referencing a *column not in the SELECT list* alongside DISTINCT fails (DISTINCT collapses rows first).
* Best practice: order by real column names/expressions in production code; reserve positional ordering for ad-hoc analysis. Deterministic sorting additionally requires a unique tie-breaker column.

---

## Coding & Implementation Challenges

### Q51: Write a query to find the second highest salary from an employees table.
* **Implementation:** Uses a subquery with `MAX()` to filter out the absolute highest salary, or `LIMIT`/`OFFSET` for direct extraction.
```sql
-- ANSI Standard Subquery Approach
SELECT MAX(salary) AS SecondHighestSalary
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- MySQL/PostgreSQL Specific Limit-Offset Approach
SELECT DISTINCT salary
FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 1;
```

### Q52: Write a query to find duplicate emails in a users table.
* **Implementation:** Groups by the email column and filters out groups with a count greater than 1 using the `HAVING` clause.
```sql
SELECT email, COUNT(email) AS occurrence_count
FROM users
GROUP BY email
HAVING COUNT(email) > 1;
```

### Q53: Write a query to list all employees who earn more than their direct managers.
* **Implementation:** Self-joins the `employees` table on the manager relationship to compare employee and manager salary columns.
```sql
SELECT 
    e.employee_name AS Employee,
    e.salary AS EmployeeSalary,
    m.employee_name AS Manager,
    m.salary AS ManagerSalary
FROM employees e
INNER JOIN employees m ON e.manager_id = m.employee_id
WHERE e.salary > m.salary;
```

### Q54: Write a query to find all departments with more than 5 active employees.
* **Implementation:** Joins `departments` and `employees`, groups by department properties, and applies a aggregate threshold check in `HAVING`.
```sql
SELECT d.department_id, d.department_name, COUNT(e.employee_id) AS employee_count
FROM departments d
INNER JOIN employees e ON d.department_id = e.department_id
WHERE e.status = 'Active'
GROUP BY d.department_id, d.department_name
HAVING COUNT(e.employee_id) > 5;
```

### Q55: Write a query to get the current date and extract the year, month, and day.
* **Implementation:** Uses built-in date functions tailored to MySQL and PostgreSQL syntax.
```sql
-- PostgreSQL Syntax
SELECT 
    CURRENT_DATE AS raw_date,
    EXTRACT(YEAR FROM CURRENT_DATE) AS current_year,
    EXTRACT(MONTH FROM CURRENT_DATE) AS current_month,
    EXTRACT(DAY FROM CURRENT_DATE) AS current_day;

-- MySQL Syntax
SELECT 
    CURDATE() AS raw_date,
    YEAR(CURDATE()) AS current_year,
    MONTH(CURDATE()) AS current_month,
    DAY(CURDATE()) AS current_day;
```

### Q56: Write an update statement to increase employee salaries by 10% specifically for the 'Sales' department.
* **Implementation:** Uses a subquery inside the `WHERE` clause or an implicit join to filter target employees.
```sql
UPDATE employees
SET salary = salary * 1.10
WHERE department_id = (
    SELECT department_id 
    FROM departments 
    WHERE department_name = 'Sales'
);
```

### Q57: Write a query to delete all duplicate records from a table keeping only the unique record with the lowest ID.
* **Implementation:** Joins the table with itself to locate and delete matching duplicates that possess larger primary key values.
```sql
-- MySQL / PostgreSQL compliant delete via Self-Join
DELETE t1 
FROM contacts t1
INNER JOIN contacts t2 ON t1.email = t2.email
WHERE t1.contact_id > t2.contact_id;
```
