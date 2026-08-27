# MongoDB - Medium Interview Questions

### Q1: Explain the components of MongoDB aggregation framework ($match, $project, $group, $unwind, $lookup, $out).
* **`$match`**: Filters documents to pass only matching documents to the next stage (equivalent to SQL `WHERE`). Must be placed as early as possible to utilize indexes.
* **`$project`**: Reshapes documents by adding, renaming, or removing fields (equivalent to SQL `SELECT`).
* **`$group`**: Groups documents by a specified key and performs accumulative operations (like `$sum`, `$avg`, `$min`, `$max`) on the grouped data.
* **`$unwind`**: Deconstructs an array field from input documents to output a document for each element of the array.
* **`$lookup`**: Performs a left outer join to another collection in the same database to filter/add data.
* **`$out`**: Writes the resulting documents of the aggregation pipeline to a new or existing collection (must be the final stage).

### Q2: What is the difference between `$merge` and `$out` stages in aggregation?
* **`$out`**: 
  * Overwrites the entire output collection if it exists, or creates a new one.
  * Cannot write to a sharded collection.
  * Replaces the collection atomically upon pipeline completion.
* **`$merge`**: 
  * Introduces on-demand incremental updates. It can merge results (insert, update, discard, or fail on matches) into an existing target collection.
  * Can write to sharded or unsharded collections, even across different databases.

### Q3: How does `$lookup` perform a join? What are its performance characteristics and index requirements?
* **Mechanism**: Acts as a nested loop join. For each document in the source collection, it queries the target collection.
* **Performance**: Can be extremely slow if the target collection is large.
* **Index Requirements**: The joined foreign field on the target collection **must be indexed**. If not, MongoDB must perform a full collection scan on the target collection for *every single document* processed by `$lookup`.

### Q4: What is the difference between single-field indexing and compound indexing regarding query coverage?
* **Single-Field Index**: Indexes a single field (e.g., `{ a: 1 }`). Optimizes queries filtering or sorting on `a`.
* **Compound Index**: Indexes multiple fields (e.g., `{ a: 1, b: -1 }`). Optimizes queries filtering on `a`, or `a` and `b`.
* **Index Prefix Rule**: A compound index `{ a, b }` covers queries on `a` but *not* queries filtering only on `b`. To optimize queries on `b`, a separate single-field or compound index starting with `b` is required.

### Q5: Explain the performance implications of indexing array fields (multikey indexes).
* **Multikey Index**: Automatically created when an index is created on a field containing an array.
* **Under the Hood**: MongoDB creates separate index keys for *every single element* in the array.
* **Implications**: 
  * High write overhead: If a document has an array with 100 elements, inserting it creates 100 index entries.
  * Storage bloat: Multikey indexes occupy significantly more RAM and disk storage.
  * Limit: A compound multikey index cannot have more than one array field indexed in the index definition to prevent exponential explosion of index entries.

### Q6: What is a partial index and how does it differ from a sparse index?
* **Sparse Index**: Indexes only documents that contain the indexed field, regardless of its value.
* **Partial Index**: Indexes documents that meet a specified filter expression (e.g., `{ price: { $gt: 100 } }`).
* **Comparison**: Partial indexes are more powerful and flexible. Any sparse index can be represented as a partial index filtering for `{ field: { $exists: true } }`.

### Q7: Explain covered queries and how they improve performance.
* **Definition**: A query that is resolved entirely using the fields present in an index, without loading any documents from disk or memory.
* **Conditions**:
  * All fields in the query filter must be part of the index.
  * All fields returned in the projection must be part of the same index.
  * The `_id` field must be explicitly excluded in the projection unless it is part of the index.
* **Impact**: Eliminates document fetching stage (`FETCH`), leading to near-instantaneous execution times.

### Q8: What is a Collation in MongoDB, and how is it used?
* **Definition**: Rules for string comparison, determining how strings are sorted and matched.
* **Configurable attributes**:
  * **locale**: Language-specific rules (e.g., German, French).
  * **strength**: Levels of comparison (1: base characters only, case-insensitive, accent-insensitive; 2: accent-sensitive; 3: case and accent-sensitive).
* **Application**: Can be applied at the collection level, index level, or on individual queries to support localized sorting.

### Q9: Why is the write concern `w: majority` and journaled `j: true` combination recommended for critical writes?
* **`w: majority`**: Guarantees that the write has been successfully committed to a physical majority of the replica set members, preventing the data from being rolled back if the primary node crashes.
* **`j: true`**: Guarantees the write is flushed to disk journals before acknowledging, protecting against sudden power loss.
* **Result**: Combining both provides the strongest durability guarantee in MongoDB, preventing both data loss and rollback issues during replica failover.

### Q10: Explain MongoDB's Read Preference modes.
* **`primary`**: Default. All reads go exclusively to the replica set primary.
* **`primaryPreferred`**: Reads go to primary; if unavailable, falls back to secondaries.
* **`secondary`**: Reads go exclusively to secondary members.
* **`secondaryPreferred`**: Reads go to secondaries; if none are available, falls back to the primary.
* **`nearest`**: Reads go to the node with the lowest network latency, regardless of whether it is primary or secondary.

### Q11: How does MongoDB elect a new Primary when the current one goes offline?
* **Heartbeats**: Replica set members exchange ping heartbeats every 2 seconds.
* **Failure Detection**: If a primary does not respond within 10 seconds, the secondaries detect the failure.
* **Election**: An eligible secondary (priority > 0) initiates an election. It must obtain a strict majority vote of all configured voting members of the replica set to become the new primary.
* **Consensus**: Factors like data freshness (most up-to-date oplog) determine eligibility.

### Q12: What is replication lag, how do you measure it, and how can you mitigate it?
* **Definition**: The delay in time between a write operation on the primary and its application on a secondary.
* **Measurement**: Using `rs.printSecondaryReplicationInfo()` or tracking the timestamp difference in `oplog.rs` between nodes.
* **Mitigation**:
  * Optimize secondary hardware (disk I/O and RAM matching primary).
  * Avoid heavy bulk writes on the primary that overwhelm secondary apply threads.
  * Use flow control settings to throttle primary write throughput if replication lag exceeds safe thresholds.

### Q13: How does sharding partition data? Range-based vs Hash-based.
* **Range-Based Sharding**: Partitions data based on ranges of the shard key values.
  * *Pros*: Efficient for range queries (queries targeting contiguous ranges go to a single shard).
  * *Cons*: Can lead to write hotspots if shard keys are monotonically increasing (e.g., auto-incrementing IDs or dates).
* **Hash-Based Sharding**: Computes an MD5 hash of the shard key value to partition data.
  * *Pros*: Guarantees highly uniform write distribution across all shards.
  * *Cons*: Highly inefficient for range queries, requiring expensive scatter-gather operations across all shards.

### Q14: What is the chunk split and migration process in a sharded cluster?
* **Chunk Split**: MongoDB partitions sharded data into "chunks" (default 64MB). When a chunk exceeds this limit, the query router (`mongos`) triggers a split, dividing it into two smaller chunks.
* **Migration**: If a shard holds significantly more chunks than others, the background **Balancer** process migrates chunks from the overloaded shard to underloaded ones.
* **Impact**: Performed asynchronously without interrupting client operations, though it can consume substantial disk and network bandwidth.

### Q15: Explain Jumbo Chunks in MongoDB sharding and how they are resolved.
* **Definition**: A chunk that has grown beyond the maximum chunk size but cannot be split because all documents in it share the exact same shard key value.
* **Issue**: The balancer cannot migrate a jumbo chunk to other shards, leading to data distribution imbalances.
* **Resolution**: 
  * Refine the shard key by adding a secondary suffix (creating a compound shard key) to introduce cardinality.
  * Manually force a split or write-distribute using MongoDB administrative tools.

### Q16: How does MongoDB handle data validation? Explain JSON Schema validation.
* **Schema Validation**: Configured on a collection to enforce structural rules on write operations.
* **JSON Schema**: Utilizes `$jsonSchema` draft-4 syntax inside the collection options.
* **Action Levels**:
  * `error` (default): Rejects any write that violates the validation rules.
  * `warn`: Allows invalid writes but logs a validation warning to the server logs.

### Q17: What are Change Streams, and how do they work?
* **Definition**: A real-time stream of data changes occurring on a collection, database, or entire cluster.
* **Mechanism**: Built on top of the replication `oplog.rs`.
* **Resiliency**: They use resume tokens (`_id` of the change event) which allow applications to reconnect and resume streaming without missing events after a network partition.

### Q18: Explain the difference between `$facet` and other aggregation stages.
* **`$facet` Stage**: Allows multi-faceted classification. It processes multiple aggregation pipelines in parallel on the same set of input documents within a single stage.
* **Constraint**: Output from `$facet` is returned as a single document containing arrays of results, meaning the cumulative output must fit within the 16MB document limit.

### Q19: How do you identify slow queries in MongoDB?
* **Database Profiler**: Built-in tool that records database operations.
* **Profiler Levels**:
  * `0`: Profiler off.
  * `1`: Records operations that exceed the threshold specified by `slowms` (default 100ms).
  * `2`: Records all operations.
* **Log Files**: Slow queries are also automatically printed to standard MongoDB logs with their execution metrics (like `docsExamined` vs `nreturned`).

### Q20: What is the in-memory sort limit, and how can you allow sorting in aggregation for larger datasets?
* **Limit**: If MongoDB cannot use an index for sorting, it performs an in-memory sort. This sort is capped at **32MB**. If exceeded, the query returns an error.
* **Aggregation Workaround**: Pass `{ allowDiskUse: true }` to the `aggregate()` options. This allows MongoDB to write temporary sorting data to disk files in the `_tmp` directory, bypassing the 32MB RAM threshold.

### Q21: Explain how MongoDB handles locking levels.
* **Granularity**: Uses multi-granularity locking allowing locks at global, database, collection, and document levels.
* **WiredTiger Engine**: Operates primarily at the **document level** for write operations, maximizing concurrent throughput.
* **Lock Modes**: Uses shared (S), exclusive (X), intent shared (IS), and intent exclusive (IX) locks to coordinate access.

### Q22: What is the oplog (`oplog.rs`), and what happens if its size is too small?
* **Oplog**: A capped collection on primary and secondary nodes that stores a rolling history of all database modifications.
* **Too Small Oplog**: If the write volume is high and the oplog size is too small, old entries are overwritten too quickly. 
* **Consequence**: Secondaries that go offline briefly or experience replication lag will find their required sync point has been overwritten, causing them to fall out-of-sync and require a complete, expensive **Initial Sync** (re-cloning the entire database).

### Q23: What are GridFS metadata and chunk collections, and how are files indexed?
* **`fs.files`**: Stores metadata about uploaded files. Indexed on `{ filename: 1, uploadDate: 1 }`.
* **`fs.chunks`**: Stores binary data chunks of the files. Indexed on `{ files_id: 1, n: 1 }` (compound index ensuring chunks are retrieved in correct order `n` for file `files_id`).

### Q24: Explain standard indexes vs TTL indexes. Can you update a TTL index's expiry time?
* **TTL Index**: A special index type containing an `expireAfterSeconds` parameter.
* **Modification**: You *cannot* directly modify `expireAfterSeconds` of an existing TTL index by running `createIndex` again. You must either drop the index and recreate it, or use the database command `collMod` to alter the `expireAfterSeconds` value dynamically without rebuilding.

### Q25: What are the best practices for choosing a shard key?
* **High Cardinality**: Choose fields that have many unique values (e.g., `userId` or `deviceId`, not `gender` or `status`).
* **Low Frequency**: Avoid fields where a single value appears in a majority of documents.
* **Even Distribution**: Use keys that distribute writes evenly across shards (such as hashed keys or combined compound keys).
* **Query Alignment**: The shard key should align with the fields most frequently queried by the application to avoid scatter-gather queries.

### Q26: Explain the `$expr` operator and when it is necessary.
* **Concept**: Allows using aggregation expressions within the query language (`db.collection.find`).
* **Necessity**: Standard find queries cannot compare two fields within the same document (e.g., finding documents where `currentPrice < originalPrice`). `$expr` makes this possible: `{ $expr: { $lt: ["$currentPrice", "$originalPrice"] } }`.

### Q27: How does MongoDB handle decimal precision?
* **Issue**: Standard double-precision floating-point numbers can cause rounding errors (highly problematic for financial transactions).
* **Solution**: BSON supports the `Decimal128` data type (128-bit IEEE 754 decimal floating-point), which can represent exact decimal values up to 34 significant digits.
* **Usage**: Stored using the `NumberDecimal("100.50")` wrapper.

### Q28: Explain the `$slice` operator inside `$project` versus updates.
* **Inside Projection**: `{ $project: { firstThree: { $slice: ["$myArray", 3] } } }`. It is a read-only filter that limits what is returned in the response payload.
* **Inside Updates**: Used in conjunction with `$push` to limit the actual size of the array saved in the document: `{ $push: { logs: { $each: [newLog], $slice: -100 } } }`. This modifies the array, ensuring it never grows beyond 100 elements on disk.

### Q29: What is the purpose of `$concatArrays` and `$mergeObjects` in aggregations?
* **`$concatArrays`**: Concatenates multiple arrays together into a single flat array.
* **`$mergeObjects`**: Merges multiple documents/objects into a single document. If keys collide, the value of the last merged object overwrites previous values.

### Q30: Explain how `$map` and `$filter` operators work inside aggregation expressions.
* **`$map`**: Iterates over an array, applies an expression to each item, and returns the modified array.
* **`$filter`**: Evaluates each element in an array against a boolean condition, returning a new array containing only elements that evaluated to `true`.

### Q31: What is the difference between `$push` with `$each` and a simple `$push`?
* **Simple `$push`**: If you pass an array as the value, it pushes the entire array as a single nested array element (e.g., pushing `[1, 2]` to `[0]` results in `[0, [1, 2]]`).
* **`$push` with `$each`**: Appends each individual element of the input array separately (e.g., pushing `[1, 2]` using `$each` results in `[0, 1, 2]`).

### Q32: What are index filters and plan caches in MongoDB?
* **Plan Cache**: When a query executes, the optimizer evaluates multiple execution plans and caches the most efficient one.
* **Index Filters**: Admin-configured settings that restrict which indexes the optimizer can evaluate for a specific query shape, overriding default optimizer logic.

### Q33: How does the WiredTiger storage engine perform compression?
* **Block Compression**: Compresses collections on disk. Supports **Snappy** (default, low CPU overhead) and **zlib** (higher compression ratio, higher CPU overhead).
* **Index Prefix Compression**: Compresses indexes in memory and on disk by storing common prefixes of index keys, saving significant RAM.

### Q34: What is a read-only view in MongoDB, and what are its limitations?
* **View**: A read-only queryable object defined by an aggregation pipeline on a source collection.
* **Limitations**:
  * Cannot write to views (no inserts/updates/deletes).
  * Cannot create indexes directly on the view (it inherits underlying indexes).
  * Cannot perform map-reduce operations or text search.

### Q35: Explain `$lookup` with a single join condition vs pipeline/variables (`let`).
* **Single Condition**: Uses `localField` and `foreignField`. Simple left outer join matching direct equality.
* **Pipeline Join**: Uses `let` to define variables from the source document, and a `pipeline` block to execute arbitrary aggregation stages on the target collection, allowing complex non-equality joins and pre-filtering on the target.

### Q36: Explain the usage of `$redact` stage in the aggregation pipeline.
* **Purpose**: Restricts content within a document based on metadata information stored in the document itself (useful for role-based security/access levels).
* **Action**: Evaluates conditions and returns `$KEEP`, `$PRUNE`, or `$DESCEND` to control what nested fields are visible to the user.

### Q37: How does read concern `majority` prevent dirty reads in a replica set?
* **Dirty Read**: Reading data that was written to a primary but gets rolled back if that primary crashes before replicating the write.
* **Prevention**: `majority` read concern reads only from a snapshot of data that has already been acknowledged by a majority of nodes, guaranteeing that the read data is durable and can never be rolled back.

### Q38: How does MongoDB support spatial queries? 2d vs 2dsphere.
* **2d Index**: Used for flat Cartesian coordinates (2D plane). Optimizes queries on flat grid maps.
* **2dsphere Index**: Used for spherical Earth-like geometries (WGS84 coordinate system). Supports GeoJSON objects (Points, Polygons, LineStrings) and spherical geometry operations.

### Q39: What is a text index, and what are its limitations?
* **Text Index**: Analyzes string fields, tokenizes words, strips stop words, and performs stemming for search capability.
* **Limitations**:
  * A collection can have at most **one** text index (though it can cover multiple fields).
  * Write-intensive collections experience significant degradation due to text tokenization overhead during inserts/updates.

### Q40: Explain how `$merge` supports incremental updates.
* **Concept**: Instead of outputting a whole new collection, `$merge` allows comparing incoming pipeline documents with target collection documents using a unique field (like `_id`).
* **Options**: You can configure actions like: when matched, merge fields; when not matched, insert document. This is highly useful for on-demand caching of daily rollups.

### Q41: How do you perform database backups in MongoDB?
* **`mongodump` & `mongorestore`**: Logical backup tools. They read documents via queries and write them to BSON files. Good for small databases; slow for multi-terabyte setups.
* **Physical Snapshots**: Taking atomic underlying filesystem snapshots (e.g., LVM or AWS EBS volume snapshots) while locking the database briefly (`db.fsyncLock()`). Fast and preferred for large production environments.

### Q42: What is the difference between client-side field-level encryption (CSFLE) and encryption-at-rest?
* **Encryption-at-Rest**: Encrypts actual database files on the storage media. If someone steals the hard drive, they cannot read the files. However, the database server itself has decrypted access.
* **CSFLE**: The driver encrypts sensitive fields (e.g., credit card numbers) *before* sending them over the network to the database. The database server only sees ciphertext, meaning even a compromised database administrator cannot read the raw data.

### Q43: How does the `$graphLookup` stage work, and when should you use it?
* **Concept**: Performs recursive search across collections to trace graph relationships.
* **Parameters**: `startWith` (anchor node), `connectFromField` (relationship link on source), `connectToField` (target mapping field), and `maxDepth`.
* **Use Case**: Modeling and querying tree hierarchies, social network connections, or bill-of-materials structures.

---

### Q44: Explain the ESR rule for designing compound indexes.
* Order compound index keys by: **E**quality fields first (most selective equality matches), then **S**ort fields (matching sort order/directions), then **R**ange fields last.
* Rationale: equality predicates pin contiguous index prefixes; placing sort keys next lets the walker return rows already ordered (no blocking SORT stage); range keys after sort still allow scanning within each sorted group.
* Counter-example that interviewers love: `{status: 1, created_at: -1}` vs `{created_at: -1, status: 1}` for `find({status:'open'}).sort({created_at:-1})` — only ESR ordering avoids in-memory sort.
* When both a range and a sort exist and both can't be served perfectly, measure: sometimes favoring sort avoids the 100MB sort-limit crash; sometimes favoring selectivity wins overall. Use explain to verify IXSCAN + no SORT.

### Q45: What is index intersection? Why can't MongoDB combine arbitrary indexes?
* The planner can sometimes intersect multiple single-field indexes (AND of their key sets) using AND_SORTED/AND_HASH stages, or union them for $or.
* Limitations: intersection cannot leverage sort orders, usually loses against one good compound index, and often costs more than COLLSCAN — the planner treats it as fallback, not strategy.
* Unlike SQL Server-style engines, MongoDB won't merge arbitrary multi-key plans dynamically; the practical guidance is: design purpose-built compound indexes (ESR) instead of hoping intersections save you.
* Diagnose via explain: seeing `IXSCAN` repeated inside an `AND_SORTED` stage signals your schema lacks the right composite index.

### Q46: What does hint() do and when should you force an index?
* `hint()` overrides planner choice, forcing a named/partial index spec or `$natural` (collection order).
* Legit uses: emergency mitigation during a planner regression while the real fix ships; benchmarking alternatives deterministically; exploiting tiny hot indexes where the planner's stats misjudge; stable plans for latency-critical endpoints.
* Dangers: hard-coding hints freezes schema evolution (index renames break prod), blocks future better plans, and hides statistics problems — treat hints as tactical medicine with an expiry note in the code review.
* Related: `planCacheClear` to flush bad cached plans after stats/index changes.

### Q47: What are wildcard indexes? Where do they shine and fail?
* `createIndex({ "$**": 1 })` (or subdocument paths like `attributes.$**`) automatically indexes every scalar field under the target path, including keys inside dynamic subdocuments and array elements (multikey semantics apply).
* Perfect for truly schemaless payloads: product attributes, CMS metadata, form-builder answers — queries like `{'attributes.color': 'red'}` get IXSCAN without pre-declaring hundreds of indexes.
* Costs & gaps: not usable as the sole support for sorts (except limited cases), cannot be unique/sparse/TTL in full generality, larger index footprint than targeted indexes, and equality-only strength — heavy analytical paths still deserve real compound indexes.
* Wildcard projections let you restrict coverage to specific subtree paths to control bloat.

### Q48: Ordered vs unordered bulkWrite — how do they differ under errors?
* **Ordered** executes sequentially, stopping at the first error (default). Guarantees order-dependent semantics like upsert-then-update chains; a duplicate-key at item 5 leaves items 6+ unexecuted.
* **Unordered** parallelizes/dispatches freely and attempts everything, collecting all errors into a `BulkWriteError` summary — dramatically faster for independent ops (initial loads) and resilient to individual duplicates.
* Both remain atomic per-operation only — there's no cross-operation transaction unless wrapped explicitly in a session transaction.
* Interview nuance: uniqueness violations during unordered initial sync are typical (idempotent re-runs), so pair unordered bulk with upserts for replayable migrations.

### Q49: Explain the schema versioning pattern for zero-downtime document migration.
* Add a `schema_version` field to documents; readers branch on version to normalize old shapes on the fly; writers emit the newest version.
* Backfill migrates old documents lazily (on write/read) or via throttled background jobs — avoiding giant rewrite waves, index churn, and lock pressure.
* Combined with dual-read logic this enables rolling deploys: old code reads v1 fine, new code tolerates both, and cleanup drops v1 branches after telemetry shows zero old-version traffic.
* Contrast with relational expand-contract: Mongo's flexible schema makes the "expand" phase free, so the discipline moves into application-layer compatibility code and observability of version mix.

### Q50: Name common MongoDB schema design patterns and what problems they solve.
* **Subset pattern**: keep hot recent comments embedded, archive the tail in a side collection — bounded document size with fast reads.
* **Extended Reference**: duplicate a few frequently joined fields (author name) into child docs to skip $lookup, accepting controlled staleness.
* **Computed pattern**: persist derived values (order totals, counters) updated on write — trades write cost for read speed.
* **Bucket pattern**: time-series/IoT readings grouped per hour/day into one document — fewer documents, smaller indexes.
* **Outlier pattern**: flag pathological entities (celebrity followers) for special handling instead of letting them distort average access patterns.
* **Polymorphic pattern**: one collection, discriminated shapes via `type` field — leverages Mongo's flexible schema deliberately.
* Expect follow-up: each pattern trades normalization purity for measured access-path efficiency — name the workload that motivates it.

---

## Coding & Implementation Challenges

### Q51: Implement an aggregation pipeline that performs a left outer join using `$lookup` between `orders` and `inventory` collections on `item_id`.
```javascript
// Joins orders and inventory on item_id and stores matching elements in inventory_details array
db.orders.aggregate([
  {
    $lookup: {
      from: "inventory",
      localField: "item_id",
      foreignField: "item_id",
      as: "inventory_details"
    }
  }
]);
```

### Q52: Create a collection with schema validation enforcing that an `employee` document must contain `name` (string), `age` (integer between 18 and 65), and `email` (valid format).
```javascript
// Create collection with JSON schema validation
db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "age", "email"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        age: {
          bsonType: "int",
          minimum: 18,
          maximum: 65,
          description: "must be an integer in [18, 65] and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "must be a valid email string and is required"
        }
      }
    }
  },
  validationAction: "error"
});
```

### Q53: Implement an aggregation query that uses `$unwind` on a `tags` array, groups by tag, calculates average rating of posts, and outputs only tags with average rating > 4.0.
```javascript
// Unwind array, calculate averages, and filter using match on grouped field
db.posts.aggregate([
  { $unwind: "$tags" },
  {
    $group: {
      _id: "$tags",
      avgRating: { $avg: "$rating" }
    }
  },
  {
    $match: { avgRating: { $gt: 4.0 } }
  }
]);
```

### Q54: Write a change stream implementation template in Node.js to listen for updates on a `products` collection where the price is updated to be greater than 1000.
```javascript
const { MongoClient } = require('mongodb');

async function watchProducts() {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('store');
  const collection = db.collection('products');

  const pipeline = [
    {
      $match: {
        'operationType': 'update',
        'updateDescription.updatedFields.price': { $gt: 1000 }
      }
    }
  ];

  const changeStream = collection.watch(pipeline);
  changeStream.on('change', (next) => {
    console.log('Detected product price change above 1000:', next);
  });
}
watchProducts().catch(console.error);
```

### Q55: Write an aggregation query utilizing `$facet` to categorize products by price ranges and concurrently group them by manufacturer.
```javascript
// Run two separate analytical flows concurrently on products dataset
db.products.aggregate([
  {
    $facet: {
      "byPriceRange": [
        {
          $bucket: {
            groupBy: "$price",
            boundaries: [0, 50, 200, 1000],
            default: "Premium",
            output: { count: { $sum: 1 } }
          }
        }
      ],
      "byManufacturer": [
        {
          $group: {
            _id: "$brand",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]
    }
  }
]);
```

### Q56: Create a partial index that only indexes `email` for active users (where `status: "active"`), and write a query that is guaranteed to use this index.
```javascript
// 1. Create partial index
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { status: "active" } }
);

// 2. Query matching the exact filter conditions to guarantee index scan
db.users.find({
  email: "john@example.com",
  status: "active"
});
```

### Q57: Write a recursive aggregation query using `$graphLookup` to find all reporting managers of an employee in a corporate hierarchy collection.
```javascript
// Traverse the hierarchy upwards matching reportsTo to _id recursively
db.employees.aggregate([
  { $match: { name: "Alice Smith" } },
  {
    $graphLookup: {
      from: "employees",
      startWith: "$reportsTo",
      connectFromField: "reportsTo",
      connectToField: "_id",
      as: "managementChain"
    }
  }
]);
```
