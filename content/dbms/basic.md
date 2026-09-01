# DBMS - Basic Interview Questions

### Q1: What is a Database Management System (DBMS) and what are its main advantages?
* **Definition**: A software system designed to store, retrieve, manage, and run queries on databases. It acts as an interface between the database and end-users/applications.
* **Advantages**:
  * **Data Redundancy Control**: Minimizes duplicate data storage through normalization.
  * **Data Integrity**: Enforces business constraints and rules (e.g., unique email IDs).
  * **Concurrent Access**: Supports multiple users accessing the database simultaneously without conflicts.
  * **Security**: Restricts unauthorized user access via robust permission models.
  * **Backup & Recovery**: Provides mechanisms to recover data automatically after hardware or software failures.

### Q2: What are the main differences between a File System and a DBMS?
* **Data Redundancy**: File systems contain highly redundant data across files, whereas DBMS controls redundancy through data modeling.
* **Accessing Data**: File systems require complex custom code to query files. DBMS provides structured languages like SQL for declarative queries.
* **Concurrency**: File systems lack proper concurrent access control, leading to race conditions. DBMS uses locking mechanisms to support high concurrency.
* **Transaction Support**: File systems do not guarantee ACID compliance. DBMS provides complete transaction isolation and rollback guarantees.

### Q3: Explain the three-schema architecture of a DBMS.
* **Definition**: A design pattern that separates the user applications from the physical database to achieve data independence.
* **Levels**:
  * **External Level (View Schema)**: Describes the portion of the database that is visible to specific end-user groups.
  * **Conceptual Level (Logical Schema)**: Describes the structural layout of the entire database (entities, relationships, data types, constraints).
  * **Internal Level (Physical Schema)**: Describes how the database is physically stored on storage media (allocation, indexing structures, data compression).

### Q4: What is physical and logical data independence?
* **Physical Data Independence**: The ability to modify the physical schema (e.g., changing storage hardware, shifting from B-tree to hashing indexes) without affecting the logical schema or user applications.
* **Logical Data Independence**: The ability to modify the logical schema (e.g., adding a new attribute or changing relationships) without altering the external views or user applications.

### Q5: What are the primary responsibilities of a Database Administrator (DBA)?
* **Key Tasks**:
  * **Database Design**: Configuring the logical and physical layout.
  * **Performance Tuning**: Monitoring and optimizing queries, indexing, and memory allocation.
  * **Security & Access Control**: Provisioning user accounts and setting authorization privileges.
  * **Backup & Recovery**: Planning and executing robust backup policies to prevent data loss.
  * **System Upgrades**: Patching and upgrading DBMS software with zero downtime.

### Q6: What is a schema and what is an instance in DBMS?
* **Schema**: The skeleton structure or blueprint of the database. It is defined during database creation and rarely changes (e.g., table names, column data types).
* **Instance**: The actual data stored in the database at a specific moment in time. It changes constantly as records are inserted, updated, or deleted.

### Q7: What is a Data Dictionary (or Metadata) and why is it important?
* **Definition**: An internal repository within a DBMS that stores "data about data" (metadata).
* **Contents**: Table schemas, field descriptions, column data types, key constraints, index definitions, and user permissions.
* **Importance**: Helps the query compiler validate query syntax, authorizes user operations, and provides a reference map for developers.

### Q8: Explain the ACID properties in database transactions.
* **Atomicity**: "All or nothing". Either the entire transaction succeeds, or it is rolled back completely, leaving no partial state.
* **Consistency**: A transaction must transition the database from one valid state (respecting all schema constraints and triggers) to another.
* **Isolation**: The execution of concurrent transactions must yield the same database state as if they were executed sequentially.
* **Durability**: Once a transaction commits, its changes are permanently recorded in non-volatile storage and will survive subsequent system crashes.

### Q9: What is the entity-relationship (ER) model?
* **Concept**: A conceptual database design tool that represents data visually.
* **Components**:
  * **Entity**: A real-world object or concept (e.g., a Customer, a Car).
  * **Entity Set**: A collection of similar entities (e.g., all Customers).
  * **Attributes**: Properties or characteristics that describe an entity (e.g., `CustomerName`, `Age`).

### Q10: What are the different types of attributes in an ER model?
* **Simple Attribute**: Atomic value that cannot be divided further (e.g., `Age`).
* **Composite Attribute**: Can be subdivided into smaller components (e.g., `Name` into `FirstName` and `LastName`).
* **Single-valued Attribute**: Holds only one value for an entity (e.g., `SocialSecurityNumber`).
* **Multi-valued Attribute**: Can store multiple values for an entity (e.g., `PhoneNumbers`, represented with double ovals).
* **Derived Attribute**: Calculated dynamically from other attributes (e.g., calculating `Age` from `DateOfBirth`, represented with dashed ovals).

### Q11: Explain the concept of Keys in DBMS: Super, Candidate, Primary, and Foreign.
* **Super Key**: A set of one or more attributes whose values uniquely identify a record in a table.
* **Candidate Key**: A minimal Super Key containing no redundant attributes.
* **Primary Key**: The specific Candidate Key chosen by the database designer to uniquely identify each row in the table (must be unique and non-null).
* **Foreign Key**: An attribute in a table that references the Primary Key of another table, establishing a relationship between them.

### Q12: What is the difference between a Candidate Key and a Primary Key?
* **Candidate Key**: Any key that has the potential to become the unique identifier of the table. A table can have multiple candidate keys.
* **Primary Key**: The single candidate key selected by the database designer to act as the primary unique identifier. A table can have only **one** primary key.

### Q13: What is Referential Integrity and how is it enforced?
* **Definition**: A state where every foreign key value in a child table correctly maps to an existing primary key value in the parent table.
* **Enforcement**: Enforced by the DBMS using foreign key constraints. The system blocks operations that would violate integrity, such as inserting a child record with a non-existent parent ID, or deleting a parent record while child records still reference it (unless configured with cascade deletions).

### Q14: Explain the difference between `DELETE`, `TRUNCATE`, and `DROP` commands in SQL.
* **`DELETE`**: A DML command that deletes specific rows based on a `WHERE` condition. It can be rolled back and triggers database triggers.
* **`TRUNCATE`**: A DDL command that removes all rows from a table, reclaiming the storage space. It is faster than `DELETE` because it bypasses triggers and does not log individual row deletions. It cannot be easily rolled back in some databases.
* **`DROP`**: A DDL command that removes the entire table structure, including metadata, indexes, and permissions from the database. It cannot be rolled back.

### Q15: What is DDL, DML, DCL, and TCL in SQL? Give examples of each.
* **DDL (Data Definition Language)**: Defines/alters database structures. E.g., `CREATE`, `ALTER`, `DROP`, `TRUNCATE`.
* **DML (Data Manipulation Language)**: Manages and queries data. E.g., `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
* **DCL (Data Control Language)**: Controls user permissions. E.g., `GRANT`, `REVOKE`.
* **TCL (Transaction Control Language)**: Manages transactions. E.g., `COMMIT`, `ROLLBACK`, `SAVEPOINT`.

### Q16: What is the difference between `WHERE` and `HAVING` clauses?
* **`WHERE`**: Filters records *before* aggregate functions are calculated. It applies to individual rows.
* **`HAVING`**: Filters groups *after* aggregation and the `GROUP BY` clause have been evaluated. It applies to grouped results.

### Q17: What is a NULL value? How is it treated in comparison operations?
* **NULL**: Represents missing, unknown, or inapplicable data. It is not equivalent to zero or an empty string.
* **Comparison**: Any direct comparison with NULL (e.g., `= NULL`, `<> NULL`) evaluates to **UNKNOWN** in SQL's three-valued logic. To check for NULL, you must use special operators `IS NULL` or `IS NOT NULL`.

### Q18: Explain the difference between JOIN types.
* **`INNER JOIN`**: Returns records that have matching values in both tables.
* **`LEFT JOIN` (Outer)**: Returns all records from the left table, and matching records from the right table. Non-matching right rows return NULL.
* **`RIGHT JOIN` (Outer)**: Returns all records from the right table, and matching records from the left table. Non-matching left rows return NULL.
* **`FULL OUTER JOIN`**: Returns all records when there is a match in either left or right table. Unmatched fields are populated with NULL.

### Q19: What is a Self Join and when is it useful?
* **Definition**: A regular join in which a table is joined with itself.
* **Alias Required**: The table must be assigned at least two distinct aliases in the SQL query to distinguish the two instances.
* **Use Case**: Querying hierarchical relationship data stored in a single table, such as matching employees to their managers (`ManagerID` referencing `EmployeeID`).

### Q20: What are aggregate functions in SQL? List the common ones.
* **Definition**: Functions that perform mathematical calculations on a set of values in a column and return a single summarizing value.
* **Common Functions**: `SUM()`, `AVG()`, `COUNT()`, `MAX()`, `MIN()`.

### Q21: Explain specialization, generalization, and aggregation in ER modeling.
* **Specialization**: A top-down design process where an entity is divided into sub-entities based on unique characteristics (e.g., `Employee` specialized into `Developer` and `Manager`).
* **Generalization**: A bottom-up design process where common properties of multiple sub-entities are combined to form a higher-level super-entity (e.g., `Car` and `Truck` generalized into `Vehicle`).
* **Aggregation**: An abstraction process where relationships between two entities are treated as a single higher-level entity, allowing relationships to have their own relationships.

### Q22: What is normalization and why is it necessary?
* **Definition**: The systematic process of structuring a relational database schema to reduce redundancy and improve data integrity.
* **Necessity**: Eliminates update anomalies, optimizes index lookups, and reduces storage waste.

### Q23: Explain 1st Normal Form (1NF) with an example.
* **Rule**: A table is in 1NF if:
  * Each cell contains only **atomic (indivisible) values**.
  * There are no repeating groups or arrays.
  * Every record is uniquely identifiable (has a primary key).
* **Example**: A column named `Phone` containing `"555-0192, 555-0193"` violates 1NF. It must be split into separate rows or columns.

### Q24: Explain 2nd Normal Form (2NF).
* **Rules**: 
  * The table must already be in **1NF**.
  * It must have **no partial dependencies** (every non-prime attribute must be fully functionally dependent on the entire primary key, not just a subset of a composite primary key).

### Q25: Explain 3rd Normal Form (3NF).
* **Rules**:
  * The table must already be in **2NF**.
  * It must have **no transitive dependencies** (non-prime attributes must not depend on other non-prime attributes). Every non-prime attribute must depend *only* on the primary key.

### Q26: What is BCNF (Boyce-Codd Normal Form) and how does it differ from 3NF?
* **BCNF Definition**: A stronger version of 3NF.
* **Rule**: For every functional dependency `X -> Y`, `X` must be a **super key** of the table.
* **Difference**: BCNF eliminates anomalies that 3NF allows in tables where multiple overlapping candidate keys exist.

### Q27: What are insert, update, and delete anomalies?
* **Insert Anomaly**: The inability to insert certain data without the presence of other unrelated data (e.g., cannot insert details of a new course unless at least one student registers for it).
* **Update Anomaly**: Redundancy forces updating the same data in multiple rows. If one row is missed, it leads to data inconsistency.
* **Delete Anomaly**: Deleting a record unintentionally deletes unrelated crucial information (e.g., deleting the last student enrolled in a course deletes the course curriculum details).

### Q28: Explain functional dependency and its importance.
* **Definition**: A constraint between two sets of attributes. Written as `X -> Y`, meaning the value of attribute set `X` uniquely determines the value of attribute set `Y`.
* **Importance**: Forms the mathematical foundation for database normalization, helping engineers detect and remove redundancies.

### Q29: What is a transaction? List its states.
* **Definition**: A logical unit of work containing a sequence of database operations.
* **States**:
  * **Active**: Initial state; transaction is executing operations.
  * **Partially Committed**: Executes the final operation, but changes are not flushed to disk yet.
  * **Committed**: Changes are written to non-volatile storage; transaction completes.
  * **Failed**: Discovery that normal execution can no longer proceed.
  * **Aborted**: Transaction is rolled back, restoring the database to pre-transaction state.

### Q30: What is a lock? Explain Shared and Exclusive locks.
* **Lock**: A mechanism used to manage concurrent access to database data.
* **Shared Lock (S-Lock)**: Acquired for read operations. Multiple transactions can hold shared locks on the same resource simultaneously.
* **Exclusive Lock (X-Lock)**: Acquired for write operations (inserts/updates/deletes). Only one transaction can hold an exclusive lock, blocking all other reads and writes.

### Q31: What is a deadlock and what are the conditions for it to occur?
* **Definition**: A situation where two or more transactions are permanently blocked, each waiting for locks held by the other.
* **Conditions (Coffman)**: Mutual exclusion, Hold and wait, No preemption, and Circular wait.

### Q32: Explain the two-phase locking (2PL) protocol at a basic level.
* **Rule**: Guarantees serializability by dividing lock operations into two distinct phases:
  * **Growing Phase**: Transactions can acquire locks but cannot release any.
  * **Shrinking Phase**: Transactions can release locks but cannot acquire new ones.

### Q33: What is the difference between a Database Schema and a Database Catalog?
* **Database Schema**: The description of a single database layout.
* **Database Catalog**: A global directory containing metadata for multiple databases, system-wide configurations, physical file maps, and global security policies managed by the DBMS.

### Q34: What is a View in SQL? What are its benefits?
* **Definition**: A virtual table defined by an SQL query. It does not store data physically on disk.
* **Benefits**:
  * **Security**: Restricts direct user access to underlying tables by projecting only permitted columns.
  * **Simplicity**: Simplifies complex query syntax by hiding multi-table joins behind a clean view interface.

### Q35: What is a Materialized View and how does it differ from a standard View?
* **Standard View**: Executes its underlying SQL query dynamically *every single time* the view is referenced.
* **Materialized View**: Computes and physically stores the query results on disk. It must be refreshed periodically to reflect data modifications. Excellent for complex, read-heavy analytical reports.

### Q36: What is a Index in database and how does it speed up queries?
* **Definition**: A data structure (typically a B+ Tree) that stores pointer addresses pointing to rows in a table.
* **Mechanism**: Bypasses costly sequential table scans by traversing the tree to retrieve matching records in logarithmic time `O(log N)`.

### Q37: What is a Clustered Index versus a Non-Clustered Index?
* **Clustered Index**: Determines the physical storage order of rows in the table. A table can have only **one** clustered index because data can be sorted physically in only one way.
* **Non-Clustered Index**: Stored in a separate structure containing indexed keys and pointers to the physical rows. A table can have **multiple** non-clustered indexes.

### Q38: What is the purpose of the `GROUP BY` clause?
* **Purpose**: Collects data across multiple records and groups the results by one or more columns, allowing aggregate functions to calculate summaries for each distinct group.

### Q39: Explain relation cardinalities.
* **One-to-One (1:1)**: A record in Table A relates to at most one record in Table B (e.g., `User` and `UserProfile`).
* **One-to-Many (1:N)**: A record in Table A relates to multiple records in Table B (e.g., `Customer` and `Orders`).
* **Many-to-Many (M:N)**: A record in Table A relates to multiple records in Table B, and vice-versa (e.g., `Students` and `Courses`, implemented via a middle join table).

### Q40: What is a subquery? Correlated vs Non-Correlated.
* **Subquery**: A query nested inside another SQL statement.
* **Non-Correlated**: Evaluates independently of the outer query once and passes the static results to the outer query.
* **Correlated**: References columns from the outer query. It evaluates repeatedly, once for every single candidate row processed by the outer query (slower execution).

### Q41: What is a trigger in a database and what is it used for?
* **Definition**: A named SQL block that automatically fires (executes) when a specific event (such as `INSERT`, `UPDATE`, or `DELETE`) occurs on a table.
* **Use Cases**: Auditing modifications, automatically calculating derived values, and maintaining complex referential business constraints.

### Q42: Explain transaction rollback and commit.
* **Commit**: Saves all transaction changes permanently to the database, making them visible to all other transactions and flushing the operations to disk journals.
* **Rollback**: Aborts the active transaction, reversing all changes made during the session and restoring the database to its pre-transaction state.

### Q43: What is the difference between relational and non-relational databases?
* **Relational**: Rigid schema, stores data in tables (rows/columns), enforces normalization, strict ACID compliance, scale vertically.
* **Non-Relational**: Dynamic schema, stores data in documents, key-values, columns, or graphs, focuses on denormalization, BASE consistency, scale horizontally (sharding).

---

### Q44: Define relation, tuple, attribute, degree, and cardinality.
* **Relation**: A table with rows and columns; formally a set of tuples sharing the same attributes.
* **Tuple**: A single row of a relation representing one record (e.g., one employee).
* **Attribute**: A named column of the relation holding values from a domain (data type).
* **Degree**: The number of attributes (columns) in the relation.
* **Cardinality**: The number of tuples (rows) in the relation. Cardinality changes constantly with inserts/deletes, while degree changes only via schema changes.

### Q45: What is a composite key? How does it differ from a simple key?
* A **simple key** consists of exactly one column (e.g., `emp_id`).
* A **composite key** is a key made up of two or more columns that *together* uniquely identify a row - individually none of them is unique. Example: `(student_id, course_id)` uniquely identifies an enrollment row.
* Composite keys are common in junction/bridge tables implementing many-to-many relationships.
* Trade-offs: indexes on wide composite keys are larger and slower; column order in the index matters for filter/sort usage.

### Q46: List the standard SQL constraints and what each enforces.
* **NOT NULL**: Column must always hold a value.
* **UNIQUE**: No duplicate values within the column (allows multiple NULLs in most engines).
* **PRIMARY KEY**: Combines NOT NULL + UNIQUE; one per table; creates a clustered index by default in SQL Server/MySQL InnoDB.
* **FOREIGN KEY**: Value must match a referenced primary/unique key or be NULL; enables referential actions like `ON DELETE CASCADE`.
* **CHECK**: Boolean predicate every row must satisfy (e.g., `salary >= 0`).
* **DEFAULT**: Fills a value when the insert omits the column.

### Q47: What is denormalization? When would you deliberately use it?
* **Denormalization** reintroduces controlled redundancy (duplicated columns, precomputed aggregates) after normalization, to reduce expensive joins at read time.
* **Use cases**: reporting dashboards, read-heavy APIs, caching aggregate counters (`order_count`, `total_amount` on customer), analytics marts.
* **Costs**: extra storage, and write amplification - every write must now update multiple copies, typically via triggers, application logic, or CDC sync.
* **Rule of thumb**: normalize first for correctness; denormalize selectively where measured read latency demands it, and document who owns keeping copies consistent.

### Q48: What are auto-increment / identity / sequence columns?
* Columns whose value the engine generates automatically, incrementing monotonically per insert.
* Syntax varies: `AUTO_INCREMENT` (MySQL), `IDENTITY(1,1)` or `GENERATED ... AS IDENTITY` (SQL Server), `SERIAL`/`GENERATED ALWAYS AS IDENTITY`/sequences (PostgreSQL).
* Typically used for surrogate primary keys so application code never invents IDs.
* Caveats: gaps occur after rollbacks/restarts (normal, not a bug); sequences are a contention point in ultra-high-insert workloads (some engines offer caching or `INSERT ... SET` alternatives like UUIDs, trading size/ordering for distribution safety).

### Q49: What is data redundancy? What problems does it cause?
* **Data redundancy** means the same fact is stored in more than one place (e.g., customer address copied into every order row).
* **Problems**:
  * **Update anomalies**: changing the address requires touching many rows; missing one corrupts data.
  * **Insert anomalies**: you cannot record a new customer without an order if both live in one table.
  * **Delete anomalies**: deleting the last order silently destroys the customer record.
  * **Storage waste** and inconsistent-query results when copies drift apart.
* Normalization (1NF–3NF/BCNF) is the systematic cure; redundancy should only exist deliberately (denormalized caches).

### Q50: What are the main advantages and disadvantages of indexes?
* **Advantages**:
  * Dramatically faster `SELECT`s with WHERE/JOIN/ORDER BY predicates (seek instead of scan).
  * Enforce uniqueness; can cover queries entirely (index-only access).
* **Disadvantages**:
  * Every INSERT/UPDATE/DELETE must also maintain each index → slower writes.
  * Consume disk space and buffer-pool memory.
  * Too many indexes confuse the optimizer and increase planning time.
* Best practice: index for your actual query workload (measure with execution plans), drop unused indexes, prefer selective columns as leading keys.

---

## Coding & Implementation Challenges

### Q51: Write an SQL query to find the second highest salary from an `employees` table.
```sql
SELECT MAX(salary) AS SecondHighestSalary
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
```

### Q52: Create tables `departments` and `employees` with a foreign key constraint cascading deletions.
```sql
-- Create Parent Table
CREATE TABLE departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL
);

-- Create Child Table with Cascade Delete Constraint
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2),
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);
```

### Q53: Implement an SQL query that uses `GROUP BY` and `HAVING` to find all departments with more than 5 employees.
```sql
SELECT dept_id, COUNT(emp_id) AS EmployeeCount
FROM employees
GROUP BY dept_id
HAVING COUNT(emp_id) > 5;
```

### Q54: Write a database transaction in SQL that transfers $100 from Account A to Account B.
```sql
BEGIN TRANSACTION;

BEGIN TRY
    -- 1. Debit Account A
    UPDATE accounts 
    SET balance = balance - 100.00 
    WHERE account_id = 'ACC_A' AND balance >= 100.00;

    -- Verify Debit succeeded
    IF @@ROWCOUNT = 0
        THROW 50001, 'Insufficient balance or Account A not found', 1;

    -- 2. Credit Account B
    UPDATE accounts 
    SET balance = balance + 100.00 
    WHERE account_id = 'ACC_B';

    IF @@ROWCOUNT = 0
        THROW 50002, 'Account B not found', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;
```

### Q55: Create a non-clustered index on the `email` field of a `users` table and write a query utilizing it.
```sql
-- 1. Index Creation
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 2. Index-Optimized Query
SELECT user_id, username, status 
FROM users 
WHERE email = 'alex@example.com';
```

### Q56: Write a trigger definition in SQL that updates a `last_modified` timestamp field upon updates.
```sql
-- PostgreSQL implementation
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_last_modified
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();
```

### Q57: Write an SQL query to select all employees who earn more than the average salary of their respective departments.
```sql
-- Correlated subquery checks average salary inside employee's department
SELECT e1.emp_id, e1.emp_name, e1.salary, e1.dept_id
FROM employees e1
WHERE e1.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.dept_id = e1.dept_id
);
```
