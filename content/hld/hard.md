# High-Level Design (HLD) - Large-Scale System Design Problems (Part 2)

Welcome to the High-Level Design (HLD) Large-Scale System Problems Guide (Part 2). This codex covers detailed architectural breakdowns, capacity estimations, data models, and canonical walkthrough links for real-world planetary-scale systems (Problems 19 to 35) and deep-dive case studies.

---

## Theory Questions & Answers

### Q19: Design a Distributed File System like Google File System (GFS) / HDFS

**Answer:**
Design a distributed file system managing petabytes of data across thousands of commodity storage servers with high sequential read/write throughput.

*   **Original Research Paper:** [https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf](https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf)
*   **Key Design Decisions:**
    1.  *Architecture Topology:* Single Master / NameNode managing metadata in memory, paired with thousands of ChunkServers / DataNodes storing raw data chunks.
    2.  *Large Chunk Size (64MB):* Reduces metadata overhead and eliminates frequent master communication.
    3.  *Replication & Durability:* Chunks replicated $3\times$ across different racks with background heartbeat rebalancing.

---

### Q20: Design Dropbox / Google Drive (File Sync & Chunk Deduplication)

**Answer:**
Design a cloud storage and file synchronization platform supporting desktop/mobile sync, conflict resolution, bandwidth-efficient delta syncing, and offline edits.

*   **Solution Guide (Text):** [https://www.geeksforgeeks.org/system-design/design-dropbox-a-system-design-interview-question/](https://www.geeksforgeeks.org/system-design/design-dropbox-a-system-design-interview-question/)
*   **Deep-Dive Walkthrough (Video):** [https://www.youtube.com/watch?v=U0xTu6E2CT8](https://www.youtube.com/watch?v=U0xTu6E2CT8)
*   **Key Design Decisions:**
    1.  *Chunking & Content-Addressable Storage (CAS):* Split files into 4MB chunks and hash each chunk (SHA-256). Store chunks by their hash in S3 to achieve cross-user deduplication.
    2.  *Delta Sync:* When a 500MB file changes, calculate the binary delta (rsync algorithm) and upload only the modified 4MB chunks rather than re-uploading the entire file.
    3.  *Sync Engine:* Desktop client watches file system changes, maintains a local SQLite database, and pushes metadata events via WebSockets.

---

### Q21: Design a Distributed Web Crawler

**Answer:**
Design a distributed web crawler fetching billions of web pages monthly with strict politeness policies, duplicate detection, and robust error handling.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=BKZxZwUgL3Y](https://www.youtube.com/watch?v=BKZxZwUgL3Y)
*   **Key Design Decisions:**
    1.  *URL Frontier:* Priority queues for page importance + Politeness queues partitioned by host domain with rate-limiting delays.
    2.  *Duplicate URL & Content Detection:* Bloom Filter for visited URLs ($0.1\%$ false positive rate); 64-bit SimHash algorithm for duplicate HTML content detection.
    3.  *DNS Caching:* Custom in-memory DNS caching fleet to eliminate external DNS lookup latency.

---

### Q22: Design a Distributed Notification Service (APNS, FCM, Email, SMS)

**Answer:**
Design an omni-channel notification platform sending billions of transactional and marketing alerts across iOS (APNS), Android (FCM), SMS (Twilio), and Email (SendGrid).

*   **Solution Link:** [https://algomaster.io/learn/system-design-interviews/design-notification-service](https://algomaster.io/learn/system-design-interviews/design-notification-service)
*   **Key Design Decisions:**
    1.  *Priority Queues:* Separate Kafka topics for high-priority transactional alerts (OTP / Payment receipts) vs low-priority marketing blasts.
    2.  *Deduplication & Rate Limiting:* Deduplicate notifications within a 5-minute sliding window using Redis keys (`SETNX user:notif:template_id`) to prevent spamming users on network retries.
    3.  *Integration Adapters:* Decoupled vendor adapter microservices with circuit breakers and fallback providers.

---

### Q23: Design a Distributed Rate Limiter (HLD)

**Answer:**
Design a global distributed rate limiter protecting API backends at scale with sub-millisecond decision latency and atomic synchronization.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=mhUQe4BKZXs](https://www.youtube.com/watch?v=mhUQe4BKZXs)
*   **Algorithm Deep-Dive:** [https://blog.algomaster.io/p/rate-limiting-algorithms-explained-with-code](https://blog.algomaster.io/p/rate-limiting-algorithms-explained-with-code)
*   **Key Design Decisions:**
    1.  *Redis + Lua Scripts:* Execute token bucket evaluations inside atomic Redis Lua scripts to prevent read-modify-write race conditions.
    2.  *Sliding Window Counter:* Combine current and previous window weights to achieve $O(1)$ memory usage per user while smoothing boundary traffic bursts.
    3.  *Local Memory + Centralized Sync:* Maintain local in-memory token counters at each API Gateway, asynchronously batching sync deltas to Redis every 100ms.

---

### Q24: Design an API Gateway

**Answer:**
Design a high-performance reverse proxy gateway providing centralized routing, authentication, rate limiting, and telemetry for microservices.

*   **Solution Link:** [https://blog.algomaster.io/p/what-is-an-api-gateway](https://blog.algomaster.io/p/what-is-an-api-gateway)
*   **Key Design Decisions:**
    1.  *Non-Blocking I/O Architecture:* Built on Netty / Envoy / Go reverse proxy for massive asynchronous connection concurrency.
    2.  *Plugin Filter Pipeline:* Sequential filter chain: CORS $\to$ Rate Limiting $\to$ JWT Authentication $\to$ Request Transformation $\to$ Routing.
    3.  *BFF (Backend for Frontend):* Dedicated gateway configurations for Mobile (aggregating multiple REST responses into compact payloads) vs Web.

---

### Q25: Design BookMyShow / Ticketmaster (Seat Locking & Concurrency)

**Answer:**
Design an entertainment ticketing platform with theater seating layouts, temporary seat holds during checkout, and zero double-booking under extreme traffic spikes.

*   **Solution Guide (Text):** [https://www.geeksforgeeks.org/system-design/design-bookmyshow-a-system-design-interview-question/](https://www.geeksforgeeks.org/system-design/design-bookmyshow-a-system-design-interview-question/)
*   **Deep-Dive Walkthrough (Video):** [https://www.youtube.com/watch?v=lBAwJgoO3Ek](https://www.youtube.com/watch?v=lBAwJgoO3Ek)
*   **Key Design Decisions:**
    1.  *Temporary Distributed Seat Lock:* Use Redis `SET seat:show_id:seat_id user_id NX EX 600` (10-minute hold).
    2.  *Atomic State Transitions:* State Machine (`AVAILABLE` $\to$ `LOCKED` $\to$ `BOOKED`). When payment succeeds, transition in PostgreSQL using `UPDATE seats SET status = 'BOOKED' WHERE id = ? AND status = 'LOCKED'`.
    3.  *Virtual Waiting Queue:* For blockbuster sales, funnel users through a Kafka-based virtual waiting room to smooth traffic to checkout servers.

---

### Q26: Design a Flight Booking System (Airline Aggregator / GDS)

**Answer:**
Design a flight search and booking aggregator querying Global Distribution Systems (Amadeus, Sabre), managing multi-leg itineraries, and handling dynamic inventory.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=qsGcfVGvFSs](https://www.youtube.com/watch?v=qsGcfVGvFSs)
*   **Key Design Decisions:**
    1.  *Aggregator Search Cache:* Cache flight route availability in Redis with short TTL (2 mins) to reduce expensive downstream airline API calls.
    2.  *Distributed Booking SAGA:* Orchestrate multi-leg booking across independent airline APIs with automatic compensation rollbacks if a leg fails.
    3.  *Price Volatility Tracking:* Background workers poll airline APIs to notify users of price drops.

---

### Q27: Design Airbnb (Property Search, Calendar Availability & Booking)

**Answer:**
Design a vacation rental platform supporting full-text location search, interactive map bounding box filtering, and calendar availability reservations.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=YyOXt2MEkv4](https://www.youtube.com/watch?v=YyOXt2MEkv4)
*   **Key Design Decisions:**
    1.  *Search & Spatial Indexing:* Elasticsearch / OpenSearch cluster indexing property attributes, amenities, and geo-point coordinates.
    2.  *Calendar Availability Grid:* Store daily availability as bitmap arrays or interval sets for fast $O(1)$ multi-day overlap checks.
    3.  *Two-Way Messaging Sync:* Real-time guest-host communication via WebSocket gateways.

---

### Q28: Design a Location-Based Service like Yelp / Nearby Places

**Answer:**
Design a local business search platform resolving proximity queries ("Find coffee shops within 2km") with sub-50ms latency.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=M4lR_Va97cQ](https://www.youtube.com/watch?v=M4lR_Va97cQ)
*   **Key Design Decisions:**
    1.  *Geohash / Google S2 Spatial Indexing:* Convert latitude/longitude coordinates into 6-character Geohashes or S2 cells. Businesses in the same geographic region share identical prefix hashes.
    2.  *Spatial Queries:* Query candidate businesses by matching prefix strings (`WHERE geohash LIKE 'dr5r%'`) combined with exact mathematical Haversine distance filtering.
    3.  *Read-Heavy Caching:* Cache search results by Geohash in Redis.

---

### Q29: Design a Stock Exchange / Trading Platform (Matching Engine HLD)

**Answer:**
Design an electronic financial exchange processing hundreds of thousands of orders per second with deterministic price-time priority matching and sub-millisecond execution.

*   **LLD/HLD Base Guide:** [https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/online-stock-brokerage-system.md](https://github.com/ashishps1/awesome-low-level-design/blob/main/problems/online-stock-brokerage-system.md)
*   **Key Design Decisions:**
    1.  *Single-Threaded In-Memory Matching Engine:* Eliminate thread contention and locking overhead by pinning an in-memory Limit Order Book to a single CPU core per stock symbol (LMAX Disruptor ring buffer).
    2.  *Event Sourcing & Hardware WAL:* Every incoming order is written to an append-only transaction log (NVMe SSD / FPGA) before matching, guaranteeing zero state loss.
    3.  *Multicast UDP Market Feeds:* Broadcast real-time order book changes (Level 2/3 market data) over Multicast UDP with FIX/FAST protocol.

---

### Q30: Design a Distributed Job Scheduler (Quartz / Airflow at Scale)

**Answer:**
Design a distributed cron and task scheduling platform executing millions of recurring and one-shot tasks with fault tolerance and exactly-once execution.

*   **Solution Link:** [https://blog.algomaster.io/p/design-a-distributed-job-scheduler](https://blog.algomaster.io/p/design-a-distributed-job-scheduler)
*   **Key Design Decisions:**
    1.  *Time-Wheel / Delayed Queue:* Use a Hierarchical Timing Wheel or Redis Sorted Set (`ZSET` with score = `execution_timestamp`) to poll due jobs in $O(\log N)$ time.
    2.  *Distributed Worker Heartbeats:* Worker nodes register in ZooKeeper/Consul. Master uses Raft consensus for leader election and distributes tasks to available workers.
    3.  *Idempotent Execution:* Workers verify task execution locks in Redis before starting to prevent duplicate execution during network partitions.

---

### Q31: Design a News Feed Ranking System

**Answer:**
Design an AI-driven news feed ranking architecture sorting thousands of candidate posts per user into an engaging, personalized feed in under 100ms.

*   **Solution Guide:** [https://www.geeksforgeeks.org/interview-experiences/design-twitter-a-system-design-interview-question/](https://www.geeksforgeeks.org/interview-experiences/design-twitter-a-system-design-interview-question/)
*   **Key Design Decisions:**
    1.  *Two-Stage Retrieval & Ranking:*
        *   *Candidate Generation (Retrieval):* Fetch top 500 recent candidate posts from followed users and pages.
        *   *Scoring & Ranking:* Pass candidate features (affinity, post type, freshness, engagement probability) through an ML model to compute final feed scores.
    2.  *Nearline Feed Cache:* Pre-calculate the top 50 ranked posts and store them in Redis for instant mobile app loading.

---

### Q32: Design a Real-Time Gaming Leaderboard (Redis Sorted Sets)

**Answer:**
Design a real-time leaderboard platform managing millions of player scores, supporting real-time score updates, and retrieving top-N players and individual ranks in sub-5ms.

*   **Technical Reference:** [https://redis.com/blog/what-is-data-replication/](https://redis.com/blog/what-is-data-replication/) *(Search "design a leaderboard system redis sorted sets").*
*   **Key Design Decisions:**
    1.  *Redis Sorted Sets (ZSET):*
        *   Update Score: `ZADD leaderboard score user_id` ($O(\log N)$).
        *   Get Top 10: `ZREVRANGE leaderboard 0 9 WITHSCORES` ($O(\log N + M)$).
        *   Get Player Rank: `ZREVRANK leaderboard user_id` ($O(\log N)$).
    2.  *Sharding Massive Leaderboards:* For 100M+ players, partition by score ranges or use a composite leaderboard service.

---

### Q33: Design a Live Video Streaming & Real-Time Sports Score System

**Answer:**
Design an ultra-low latency live video and score distribution platform broadcasting live sports events to millions of concurrent viewers.

*   **Solution Guide:** [https://www.geeksforgeeks.org/system-design/system-design-netflix-a-complete-architecture/](https://www.geeksforgeeks.org/system-design/system-design-netflix-a-complete-architecture/)
*   **Key Design Decisions:**
    1.  *Low-Latency HLS (LL-HLS) / WebRTC:* Chunk size reduced to 500ms to achieve $<2\text{s}$ live glass-to-glass latency.
    2.  *Score Distribution via SSE / WebSockets:* Push real-time score updates via Server-Sent Events (SSE) fanned out through an edge Pub/Sub broker (Redis / NATS).

---

### Q34: Design a Web Analytics & Metrics Logging Platform (Google Analytics)

**Answer:**
Design a real-time event analytics platform ingesting 100 billion daily pageviews, user clickstreams, and computing interactive dashboard aggregates.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=kIcq1_pBQSY](https://www.youtube.com/watch?v=kIcq1_pBQSY)
*   **Key Design Decisions:**
    1.  *Ingestion Fleet:* Lightweight Golang pixel tracker collecting Beacon events into Apache Kafka.
    2.  *Columnar OLAP Storage:* Ingest streams into ClickHouse / Apache Pinot for ultra-fast sub-second SQL aggregate queries across billions of rows.
    3.  *Approximate Counting (HyperLogLog):* Calculate unique daily visitor counts with $0.81\%$ error using Redis HyperLogLog (`PFADD`, `PFCOUNT`) in $12\text{KB}$ of memory per site.

---

### Q35: Design a Multiplayer Online Game Backend (Zoom / Real-Time Physics Sync)

**Answer:**
Design a low-latency game server backend synchronizing player positions, inputs, and game state at 60 ticks per second.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=G32ThJakeHk](https://www.youtube.com/watch?v=G32ThJakeHk)
*   **Key Design Decisions:**
    1.  *Authoritative Game Server:* Clients send raw inputs (e.g., "move forward"); the authoritative server simulates physics and broadcasts authoritative state snapshots.
    2.  *UDP with Custom Reliability:* Use raw UDP for game state packets to prevent TCP Head-of-Line blocking.
    3.  *Client-Side Prediction & Reconciliation:* Client simulates movement locally immediately and reconciles position upon receiving the server's authoritative tick update.

---

### Master High-Level Design Reference Index

Bookmark the comprehensive community repository of solved System Design resources:
*   [Awesome System Design Resources GitHub Repository](https://github.com/ashishps1/awesome-system-design-resources)
