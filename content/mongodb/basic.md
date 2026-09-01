# MongoDB - Basic Interview Questions

### Q1: What is MongoDB and how does it differ from traditional RDBMS?
* **Definition**: MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like documents (BSON format).
* **Schema Difference**: Traditional RDBMS uses a rigid schema with tables, rows, and columns. MongoDB uses a schema-less structure with collections and documents, allowing varying structures within the same collection.
* **Relationships**: RDBMS relies heavily on normalized tables and relations via **foreign keys** and **joins**. MongoDB relies on denormalized embedded documents or manual references, optimizing for read-heavy operations.
* **Scalability**: RDBMS typically scales vertically (adding hardware power), while MongoDB scales horizontally (sharding across multiple servers).

### Q2: What is BSON and how is it different from JSON?
* **Definition**: BSON stands for **Binary JSON**. It is a binary-serialized representation of JSON-like documents.
* **Size & Efficiency**: BSON is designed for high speed and space efficiency. It is faster to parse and traverse compared to JSON.
* **Data Types**: BSON extends JSON by supporting additional data types such as `Date`, `ObjectId`, `BinData` (binary data), `Double`, and `32-bit/64-bit integers`. JSON only natively supports strings, numbers, booleans, null, arrays, and objects.

### Q3: Explain the structure of a MongoDB ObjectId.
* **Definition**: A unique 12-byte identifier automatically generated as the primary key (`_id`) for each document.
* **Byte Breakdown**:
  * **First 4 bytes**: Unix timestamp (seconds since epoch) representing the creation time.
  * **Next 5 bytes**: Random value unique to the machine and process (ensures uniqueness across distributed systems).
  * **Last 3 bytes**: An incrementing counter, initialized with a random value.
* **Implication**: ObjectIds are naturally ordered by creation time, allowing sorting by `_id` to act as a chronological sort.

### Q4: What is a dynamic schema and what are its advantages?
* **Concept**: MongoDB collections do not enforce document structure. Documents in the same collection can have different fields, types, and nested nesting.
* **Advantages**:
  * **Agility**: Rapid development cycles since database migrations or schema alterations (`ALTER TABLE`) are not required.
  * **Polymorphism**: Ability to represent diverse entities or semi-structured data without complex join tables.
  * **No Null Fields**: Eliminates the need to store null values for optional attributes, saving storage space.

### Q5: What are collections and documents in MongoDB?
* **Collection**: Equivalent to an RDBMS table. It is a grouping of MongoDB documents. Collections do not enforce schemas but can have schema validation rules if configured.
* **Document**: Equivalent to an RDBMS row. It is the basic unit of data in MongoDB, composed of key-value pairs stored in BSON format.

### Q6: What is a Capped Collection and when should you use it?
* **Concept**: Fixed-size collections that maintain insertion order. Once a capped collection reaches its allocated maximum size, it overwrites the oldest entries (first-in, first-out behavior).
* **Key Characteristics**: High-throughput inserts, automatic space management, and cannot be sharded.
* **Use Cases**: System logs, real-time message queues, cache stores, and event streams.

### Q7: How does MongoDB handle transactions and ACID compliance?
* **Single-Document ACID**: MongoDB has always guaranteed complete ACID transactions at the single-document level (all updates to nested fields or arrays are atomic).
* **Multi-Document ACID**: Starting from version 4.0 (for replica sets) and 4.2 (for sharded clusters), MongoDB supports multi-document ACID transactions.
* **Implementation**: Uses **WiredTiger** storage engine's snapshot isolation to perform multi-statement operations safely across multiple collections and databases.

### Q8: What is the purpose of the `_id` field in MongoDB documents?
* **Primary Key**: Every document in a collection must have a unique `_id` field.
* **Auto-generation**: If not provided during insertion, MongoDB drivers or the server automatically inject a 12-byte `ObjectId` into this field.
* **Immutable**: Once written, the value of the `_id` field cannot be modified.

### Q9: What are the main read and write concerns in MongoDB?
* **Write Concern**: Defines the level of acknowledgment requested from MongoDB for write operations.
  * `w: 1` (default): Acknowledgment from primary only.
  * `w: majority`: Acknowledgment from a majority of replica set members.
  * `j: true`: Request acknowledgment after writing to the journal file on disk.
* **Read Concern**: Determines the consistency and isolation properties of the read data.
  * `local`/`available`: Returns the node's current state (fastest, potential dirty reads).
  * `majority`: Returns data committed by a majority of nodes (prevents dirty reads).
  * `linearizable`: Guarantees the primary has not been superseded prior to completing the read.

### Q10: What is a projection in MongoDB and how does it work?
* **Definition**: A mechanism to limit the fields returned to the client in a query response, reducing network and memory overhead.
* **Syntax**: Syntax takes the form `{ field: 1 }` to include a field, or `{ field: 0 }` to exclude it.
* **Rule**: You cannot mix inclusion and exclusion specs in a single projection, except for the `_id` field (which is included by default unless explicitly excluded with `{ _id: 0 }`).

### Q11: Explain the difference between embedded documents and references.
* **Embedded Documents (Denormalization)**:
  * Stores related data directly inside a single document.
  * Optimized for read performance as it retrieves all related data in a single I/O operation.
  * Subject to the **16MB BSON document limit**.
* **References (Normalization)**:
  * Stores links (IDs) referencing documents in other collections.
  * Prevents data duplication and accommodates unbounded 1-to-many growth.
  * Requires client-side joins or `$lookup` aggregation stages, which increases query latency.

### Q12: What is the primary purpose of indexing in MongoDB?
* **Query Optimization**: Indexes store a small portion of the collection's data set in an easy-to-traverse B-tree format.
* **Avoid Collection Scans**: Without indexes, MongoDB must perform a collection scan (`COLLSCAN`), inspecting every document to find matches.
* **Efficiency**: Indexes allow the query engine to quickly narrow down search space (`IXSCAN`), yielding massive read performance gains.

### Q13: How does the `upsert` option work in MongoDB update operations?
* **Concept**: A boolean parameter (default is `false`) passed to update commands.
* **Behavior**:
  * If a document matches the query filter, MongoDB updates the existing document.
  * If no document matches the query filter, MongoDB inserts a new document combining the query criteria and update operators.

### Q14: What is the difference between `find()` and `findOne()`?
* **`find()`**: Returns a query cursor to the matching documents. It does not fetch all documents immediately; instead, it fetches them in batches as the cursor is iterated.
* **`findOne()`**: Returns the actual first matching document directly (not a cursor) and immediately terminates. Equivalent to `find().limit(1)`.

### Q15: How can you limit and skip documents in a query result?
* **`limit(n)`**: Caps the maximum number of documents returned by the cursor to `n`.
* **`skip(n)`**: Directs the cursor to skip the first `n` matching documents before starting to return results.
* **Paging Caveat**: Large `skip()` values are highly inefficient because MongoDB still must read and discard the skipped documents sequentially from disk.

### Q16: What is the purpose of `$slice` operator?
* **Projection Usage**: Limits the number of elements returned from an array field inside a document.
* **Syntax**: `{ comments: { $slice: 5 } }` (returns first 5 comments) or `{ comments: { $slice: -5 } }` (returns last 5 comments).
* **Update Usage**: Modifies arrays during updates to keep only a specific size (used with `$push` and `$sort`).

### Q17: Explain the utility of the `$exists` operator.
* **Use Case**: Matches documents that contain or do not contain a specific field, regardless of its value.
* **Syntax**: `{ email: { $exists: true } }` matches documents with an email field. `{ phone: { $exists: false } }` matches documents missing the phone field entirely.

### Q18: What are the `$type` and `$regex` operators?
* **`$type`**: Filters documents based on the BSON data type of a field (e.g., `{ age: { $type: "number" } }`).
* **`$regex`**: Provides regular expression capabilities for pattern-matching string fields in queries (e.g., `{ username: { $regex: "^admin", $options: "i" } }`).

### Q19: How do you perform logical AND and OR operations in MongoDB queries?
* **Implicit AND**: Specifying comma-separated fields: `{ status: "active", age: { $gt: 18 } }`.
* **Explicit AND**: Using `$and` when targeting the same field multiple times: `{ $and: [ { age: { $gt: 18 } }, { age: { $lt: 30 } } ] }`.
* **Logical OR**: Using `$or` to find documents matching any filter in an array: `{ $or: [ { status: "pending" }, { priority: "high" } ] }`.

### Q20: What is the `$in` operator and how is it different from `$or`?
* **`$in`**: Checks if a single field matches any value in a specified array (e.g., `{ status: { $in: ["A", "B", "C"] } }`).
* **Comparison**: `$in` is simpler and more readable than `$or` for single-field checks, and the query optimizer evaluates it more efficiently. Use `$or` only when dealing with conditions across multiple fields.

### Q21: How does MongoDB perform sorting on query results?
* **Cursor Method**: `db.collection.find().sort({ fieldName: 1 })` (1 for ascending, -1 for descending).
* **Execution**: If an index exists on the sorting field, MongoDB uses the sorted index order (highly efficient). Without an index, MongoDB performs an in-memory sort which fails if it exceeds the **32MB limit**.

### Q22: What is the difference between `$set` and `$unset` operators?
* **`$set`**: Adds a field with a specified value if it doesn't exist, or updates the existing value of the field.
* **`$unset`**: Deletes a specified field from a document completely (e.g., `{ $unset: { tempToken: "" } }`).

### Q23: How do `$push` and `$addToSet` operators differ?
* **`$push`**: Appends a specified value to an array, allowing duplicates (e.g., pushes a new history log).
* **`$addToSet`**: Appends a value to an array only if that value does not already exist in the array, maintaining unique elements (sets behavior).

### Q24: What is the function of the `$pull` and `$pop` operators?
* **`$pull`**: Removes all instances of a value or matching sub-condition from an array field (e.g., `{ $pull: { tags: "expired" } }`).
* **`$pop`**: Removes the first or last element of an array. `{ arrayField: 1 }` removes the last element, while `{ arrayField: -1 }` removes the first.

### Q25: Explain the concept of write acknowledgment in MongoDB.
* **Concept**: The feedback mechanism from the database indicating whether a write operation succeeded.
* **Mechanism**: Determined by the write concern. A write can be completely unacknowledged (fire-and-forget, deprecated), acknowledged by a single master node, or acknowledged by multiple nodes after persisting to disk/journal.

### Q26: What is the role of the Primary node in a replica set?
* **Role**: The single primary node receives all write operations from applications.
* **Oplog generation**: It records all changes to its datasets in a special capped collection called the replication oplog (`oplog.rs`), which secondary nodes read to replicate changes.

### Q27: What is the role of Secondary nodes in a replica set?
* **Replication**: Secondary nodes replicate the primary's oplog and apply the operations to their data sets asynchronously.
* **Read Distribution**: Can handle read operations if the application configure read preferences to direct reads away from the primary.
* **Failover**: Participate in elections to vote for a new primary if the active primary fails.

### Q28: What is an Arbiter node in a MongoDB replica set?
* **Definition**: A lightweight node that participates in primary elections but does *not* maintain a copy of the dataset.
* **Purpose**: Used to provide a tie-breaking vote to establish a majority in replica sets with an even number of data-bearing members.
* **Advantage**: Saves hardware resources because it does not require significant storage or RAM.

### Q29: Explain the concept of sharding at a high level.
* **Definition**: A method for distributing data across multiple physical machines to support horizontal scaling.
* **Architecture**: Consists of:
  * **Shard nodes**: Individual servers (often replica sets) containing subsets of partitioned data.
  * **Query Routers (`mongos`)**: Intermediary nodes that route client requests to correct shard(s).
  * **Config Servers**: Metadata stores holding the partition mapping schema of the cluster.

### Q30: What is a shard key and why is its selection important?
* **Shard Key**: A field or combination of fields used to partition data across shard nodes.
* **Importance**: Determines the distribution of writes and reads. A bad shard key leads to "hotspots" (where one shard handles all traffic) or inefficient query scatter-gather routing across all shards.

### Q31: What is GridFS and when should it be used?
* **Definition**: A specification for storing and retrieving files that exceed the BSON-document size limit of 16MB.
* **Mechanism**: Splits a file into chunks (typically 255KB each) and stores them across two collections: `fs.files` (metadata) and `fs.chunks` (binary payload).
* **Use Case**: Media storage (images, video, audio) directly within MongoDB without managing an external filesystem.

### Q32: Explain the difference between `save()` and `insert()` (or `insertOne()`).
* **`insertOne()`**: Exclusively inserts a new document. If a document with the same `_id` exists, it fails with a duplicate key error.
* **`save()` (Deprecated)**: Acted as an upsert wrapper. If the document contained an `_id` field, it performed an update (replacing the document); if no `_id` existed, it performed an insert.

### Q33: How does MongoDB handle data types and type conversion?
* **Strict Typing**: MongoDB respects types during query matching (e.g., querying integer `5` does not match string `"5"`).
* **`$convert` Operator**: Used inside aggregation pipelines to explicitly cast types (e.g., string to double or date).

### Q34: What is the purpose of the `explain()` method in MongoDB?
* **Query Analysis**: Provides query execution plans and execution statistics (e.g., indexes scanned, documents examined, execution time in ms).
* **Modes**:
  * `queryPlanner` (default): Details index selection and plan logic.
  * `executionStats`: Shows actual execution metrics.
  * `allPlansExecution`: Analyzes alternative query plans evaluated by the optimizer.

### Q35: What are the different types of indexes supported by MongoDB?
* **Single Field Index**: B-tree index on a single key.
* **Compound Index**: Index on multiple fields.
* **Multikey Index**: Index created on array fields (index entries created for every array element).
* **Geospatial Index**: Optimizes 2D and 2D sphere coordinate queries.
* **Text Index**: Supports searching for string words inside text fields.
* **Hashed Index**: Hashes field values to distribute write keys evenly, used for hash-based sharding.

### Q36: What is a compound index and how does index prefixing work?
* **Compound Index**: Index on multiple fields (e.g., `{ lastName: 1, firstName: 1 }`).
* **Index Prefixing**: Queries can use a compound index if they query on the prefix fields in order. An index on `{ a: 1, b: 1, c: 1 }` can optimize queries filtering on `{ a }` and `{ a, b }`, but cannot optimize queries filtering only on `{ b }` or `{ c }` or `{ b, c }`.

### Q37: Explain what a sparse index is.
* **Concept**: An index that only contains entries for documents that actually have the indexed field.
* **Benefit**: Saves substantial index storage space and write overhead when the indexed field is missing from a high percentage of documents.

### Q38: What is a TTL (Time-To-Live) index?
* **Concept**: A single-field index on a Date field that automatically deletes documents after a specified number of seconds or at a specific time.
* **Mechanism**: A background thread runs every 60 seconds to purge expired documents.
* **Limitation**: Cannot be compound indexes, and does not work on capped collections.

### Q39: How do you view existing indexes on a collection?
* **Command**: Use the `getIndexes()` helper.
* **Example**: `db.users.getIndexes()` returns an array of documents detailing index names, key structures, version, and options for all indexes on the `users` collection.

### Q40: What is the difference between internal and external authentication in MongoDB?
* **Internal Authentication**: Validating replica set or sharded cluster members to each other, typically using keyfiles or x.509 certificates.
* **External Authentication**: Validating clients and users connecting to the database (e.g., via SCRAM-SHA-256, LDAP, Kerberos, or Active Directory).

### Q41: What is the `journal` in MongoDB and what is its purpose?
* **Journal**: A write-ahead log file stored on disk.
* **Purpose**: Ensures crash resiliency. MongoDB writes modifications to the journal before applying them to the data files on disk. If the server crashes, the journal is replayed during recovery to restore state.

### Q42: How does MongoDB handle concurrency control?
* **Multi-Version Concurrency Control (MVCC)**: WiredTiger uses document-level locking and optimistic concurrency control.
* **Read-Write Conflict Resolution**: Allows multiple readers to read simultaneously while writes are executed concurrently by resolving conflicts at the transaction level, preventing system-wide blocks.

### Q43: What is a bulk write operation and why is it useful?
* **Concept**: Combining multiple write operations (inserts, updates, deletes) into a single batch request sent to the server.
* **Execution Options**:
  * **Ordered**: Executes operations sequentially; halts at the first error.
  * **Unordered**: Executes all operations in parallel; continues even if individual operations fail.
* **Benefit**: Massively reduces network round trips, speeding up mass ingestion.

---

### Q44: What is a namespace in MongoDB?
* A **namespace** is the full name of a collection: `<database>.<collection>` - e.g., `shop.orders`. Indexes get their own namespaces suffixed internally (`db.$ix` structures managed by the engine).
* Naming rules: database names are case-sensitive on case-sensitive filesystems (avoid mixed case for portability), collection names may not contain `$` or null, cannot start with `system.` (reserved).
* Length limits existed historically (~255 bytes total); very long namespaces hurt readability and tooling.
* Interview angle: since WiredTiger, collections map to table files internally and the old "namespace hash in mmapv1" trivia is obsolete - but the naming discipline still matters.

### Q45: deleteOne/deleteMany vs drop() vs remove - what is the difference?
* `deleteOne(filter)` / `deleteMany(filter)` remove matching documents but keep the collection, its indexes, and its settings; deletions generate oplog entries and go through replication.
* `drop()` removes the entire collection *including indexes*, collection options (validator, capped), and is effectively instant metadata surgery rather than per-document work.
* Deleting a whole collection's contents via `deleteMany({})` is O(documents), writes a huge oplog trail, and fires every index maintenance + change stream event; `drop()` is preferred when nothing needs to be preserved. (Legacy `remove()` is deprecated/removed from drivers.)

### Q46: What is a cursor in MongoDB? How does batching work?
* `find()` does not return documents directly - it returns a **cursor**, a handle over a server-side result set fetched in batches as you iterate.
* First batch (default 101 docs or up to 16MB) arrives with the initial reply; subsequent batches flow via `getMore` commands as the client exhausts each batch. `batchSize()` tunes this.
* Server-side cursors have a lifetime: idle cursors are reaped after ~10 minutes (`cursorTimeoutMillis`) unless `noCursorTimeout` is set; closing early via `.close()` frees resources.
* Consequences worth mentioning: modifying a collection mid-iteration has undefined inclusion semantics; huge sorts must fit memory limits or be indexed.

### Q47: countDocuments() vs estimatedDocumentCount() vs legacy count - compare.
* `countDocuments(filter)` runs an aggregation `$match+$group` over the actual filter → accurate but scans matching entries (uses indexes well).
* `estimatedDocumentCount()` reads collection metadata (WiredTiger statistics) → instant approximate count, ignores filters, no shard-filtering subtleties.
* Legacy `count()` command mixes both behaviors with surprising accuracy/performance tradeoffs and is deprecated in drivers.
* Rule: exact counts with predicates → countDocuments; dashboard totals on huge collections → estimatedDocumentCount; never build pagination off counts on hot paths - use cursor-based pagination instead.

### Q48: What is a replica set at a high level and why use one?
* A **replica set** is a group of mongod processes holding the same data: one Primary accepting writes, plus Secondaries replicating its oplog asynchronously.
* **Purposes**: high availability (automatic failover election if primary dies), read scaling (secondaries can serve reads via read preference), disaster recovery through delayed hidden members, geographic distribution.
* Typical production shape: 3 data-bearing nodes across failure domains; arbiters add votes without data (rarely recommended now).
* Foundation question - expect follow-ups on elections, write concern majority, and rollback behavior.

### Q49: What is the difference between mongod, mongos, and the shell/drivers?
* **mongod**: core database server daemon storing data and serving queries (replica set member or standalone).
* **mongos**: stateless query router in sharded clusters - receives client operations, consults config servers about data placement, fans out to shards, merges results.
* **mongosh / drivers**: clients. The shell is a JS environment for admin/scripting; drivers (Node, Python, Java...) implement the wire protocol, connection pooling, retryable writes, and sessions applications actually use.
* Architecture recall: app → driver → [mongos if sharded] → replica set members.

### Q50: What happens if you omit `_id`, and what causes a duplicate key error?
* Omitting `_id`: the server auto-generates an ObjectId client-side (drivers do it first, so the id is known before insert round-trip). Embedded documents don't require `_id`.
* The `_id` field carries a **unique index** by definition - inserting a second document with the same value fails with `E11000 duplicate key error`; the insert aborts (in ordered bulk writes, everything after it aborts too).
* Custom _id values are encouraged when a natural unique key exists (email, SKU): saves a lookup index and makes APIs self-describing - but beware mutable natural keys and size limits (ObjectId keeps index compact).

---

## Coding & Implementation Challenges

### Q51: Implement a basic query with projection to find active users and return only their names and emails.
```javascript
// Query to find active users and exclude '_id' from the returned document
db.users.find(
  { status: "active" },
  { name: 1, email: 1, _id: 0 }
);
```

### Q52: Write a query to update a user's status to "inactive" and push a login timestamp to an array.
```javascript
// Atomically update status and push current date into loginHistory array
db.users.updateOne(
  { _id: ObjectId("60d5ec49f323e51a6c8b4567") },
  {
    $set: { status: "inactive" },
    $push: { loginHistory: new Date() }
  }
);
```

### Q53: Build a MongoDB aggregation pipeline to count the number of users in each city.
```javascript
// Group by city and count occurrences, sorted by count descending
db.users.aggregate([
  {
    $group: {
      _id: "$address.city",
      userCount: { $sum: 1 }
    }
  },
  {
    $sort: { userCount: -1 }
  }
]);
```

### Q54: Write a command to create a capped collection named `system_logs` with a max size of 10MB and max 5000 documents.
```javascript
// Create capped collection with strict size boundaries
db.createCollection("system_logs", {
  capped: true,
  size: 10485760, // 10MB in bytes
  max: 5000       // Max number of documents allowed
});
```

### Q55: Implement a query that uses `$elemMatch` to find posts with at least one comment having an author named "Alice" and score > 8.
```javascript
// Ensures the conditions are met by the SAME nested comment object in the array
db.posts.find({
  comments: {
    $elemMatch: {
      author: "Alice",
      score: { $gt: 8 }
    }
  }
});
```

### Q56: Write a bulk write operation that inserts a document, updates another, and deletes a third.
```javascript
// Execute multi-type writes in a single unordered database call
db.users.bulkWrite([
  {
    insertOne: {
      document: { name: "Bob", email: "bob@example.com", status: "active" }
    }
  },
  {
    updateOne: {
      filter: { email: "alice@example.com" },
      update: { $set: { status: "suspended" } }
    }
  },
  {
    deleteOne: {
      filter: { email: "test-user@example.com" }
    }
  }
], { ordered: false });
```

### Q57: Create a compound index on `category` (ascending) and `price` (descending) and write an optimized query utilizing it.
```javascript
// 1. Create the compound index
db.products.createIndex({ category: 1, price: -1 });

// 2. Query that uses index prefix and matching sort direction
db.products.find({ category: "Electronics" })
           .sort({ price: -1 })
           .limit(10);
```
