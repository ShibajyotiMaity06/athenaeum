# High-Level Design (HLD) - Large-Scale System Design Problems (Part 1)

Welcome to the High-Level Design (HLD) Large-Scale System Problems Guide (Part 1). This codex covers detailed architectural breakdowns, capacity estimations, data models, and canonical walkthrough links for real-world planetary-scale systems (Problems 1 to 18).

---

## Theory Questions & Answers

### Q1: Design a URL Shortener like Bitly / TinyURL

**Answer:**
Design a global high-throughput URL shortening service supporting 100M new URLs/month and 10B clicks/month with sub-10ms redirection latency.

*   **Solution Link:** [https://algomaster.io/learn/system-design-interviews/design-url-shortener](https://algomaster.io/learn/system-design-interviews/design-url-shortener)
*   **Key Design Decisions:**
    1.  *Base62 Encoding:* Convert a unique 64-bit auto-incrementing ID or Snowflake ID into a 7-character Base62 string (`[a-zA-Z0-9]`), supporting $62^7 \approx 3.52 \text{ Trillion}$ unique URLs.
    2.  *Key Generation Service (KGS):* Pre-generate random 7-character keys and store them in an active key table to eliminate collision checking at write time.
    3.  *HTTP 301 vs. 302:* Use 302 Found (or 307 Temporary Redirect) to ensure every click passes through backend servers for accurate geographic and referrer analytics tracking.
    4.  *Caching Layer:* Cache the top $20\%$ of hot URLs in Redis with LRU eviction to serve $80\%$ of redirect requests directly from in-memory cache.

---

### Q2: Design Twitter / X (Timeline, Tweet Ingestion & Celebrity Fanout)

**Answer:**
Design a real-time social broadcasting platform handling 500 million daily tweets, user follow graphs, and instant timeline rendering.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=wYk0xPP_P_8](https://www.youtube.com/watch?v=wYk0xPP_P_8)
*   **Solution Guide (Text):** [https://www.geeksforgeeks.org/interview-experiences/design-twitter-a-system-design-interview-question/](https://www.geeksforgeeks.org/interview-experiences/design-twitter-a-system-design-interview-question/)
*   **Key Design Decisions:**
    1.  *Hybrid Fanout Engine:* Use **Fanout-on-Write** for regular users (pushing tweet IDs to followers' Redis timeline lists) and **Fanout-on-Read** for celebrity accounts with millions of followers (merging celebrity tweets dynamically at query time).
    2.  *Snowflake ID Generation:* 64-bit integer IDs generated with 41-bit timestamp, 10-bit machine/datacenter ID, and 12-bit sequence number to guarantee chronological sorting without centralized database locks.

---

### Q3: Design Instagram (Photo Sharing, Feed Generation & Graph Storage)

**Answer:**
Design a photo and video sharing platform supporting media uploads, social follow graphs, news feed generation, and high-speed image delivery.

*   **Solution Link:** [https://algomaster.io/learn/system-design-interviews/design-instagram](https://algomaster.io/learn/system-design-interviews/design-instagram)
*   **Key Design Decisions:**
    1.  *Object Storage & CDN:* Images and videos are stored in Amazon S3 / Google Cloud Storage and distributed globally across Cloudflare / CloudFront CDN edge caches.
    2.  *Metadata Sharding:* Shard user metadata, posts, and like counters across PostgreSQL clusters using `user_id` as the shard key.
    3.  *Feed Ranking:* Asynchronous feed generation workers pre-compute ranking feeds combining chronological post streams with ML engagement scoring models.

---

### Q4: Design Facebook / Facebook Messenger

**Answer:**
Design a real-time 1-on-1 and group messaging platform supporting billions of messages daily, read receipts, typing indicators, and media attachments.

*   **Solution Link:** [https://www.geeksforgeeks.org/system-design/desiging-facebook-messenger-system-design-interview/](https://www.geeksforgeeks.org/system-design/desiging-facebook-messenger-system-design-interview/)
*   **Key Design Decisions:**
    1.  *Persistent WebSockets:* Maintain millions of persistent full-duplex WebSocket connections terminated at an edge Gateway fleet.
    2.  *Message Routing:* An in-memory Message Sync Broker maps active user connections to gateway servers.
    3.  *Storage Architecture:* Use distributed wide-column NoSQL databases (Apache Cassandra / HBase) partitioned by `conversation_id` and sorted by message timestamp for fast pagination.

---

### Q5: Design WhatsApp (End-to-End Encrypted Real-Time Messaging)

**Answer:**
Design an ultra-lightweight, end-to-end encrypted messaging service prioritizing zero server storage retention, instant delivery, and offline message buffering.

*   **Solution Link:** [https://algomaster.io/learn/system-design-interviews/design-whatsapp](https://algomaster.io/learn/system-design-interviews/design-whatsapp)
*   **Key Design Decisions:**
    1.  *Erlang / Elixir Actor Model:* High-concurrency lightweight processes running on ejabberd / custom Erlang gateways to handle 2M concurrent connections per physical server.
    2.  *End-to-End Encryption (Signal Protocol):* Public key exchange via server; message payloads are encrypted with Double Ratchet on client devices.
    3.  *Ephemeral Storage:* Server holds messages in memory/queue only until the recipient device acknowledges delivery (`ACK`), after which messages are deleted permanently from servers.

---

### Q6: Design Reddit (Nested Comment Trees, Real-Time Voting & Score Decay)

**Answer:**
Design a social news aggregation and discussion platform supporting massive tree-structured comment threads, voting pipelines, and subreddits.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=KYExYE_9nIY](https://www.youtube.com/watch?v=KYExYE_9nIY)
*   **Key Design Decisions:**
    1.  *Comment Tree Storage:* Store nested comments using **Materialized Path** indexing (`path: "001.004.012"`) allowing single-query subtree retrieval.
    2.  *Vote Aggregation:* Queue upvotes/downvotes in Redis in-memory pipelines (`HINCRBY`) and flush batched deltas to Cassandra/Postgres asynchronously to prevent disk write saturation.
    3.  *Hot Score Decay:* Score computed as $\log_{10}(\text{Votes}) + t_{\text{post}} / 45000$ to ensure old popular posts decay continuously.

---

### Q7: Design YouTube (Video Ingestion, Transcoding & Global Streaming)

**Answer:**
Design a global video streaming platform supporting 500 hours of video uploaded every minute and billions of daily video streams.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=jPKTo1iGQiE](https://www.youtube.com/watch?v=jPKTo1iGQiE)
*   **Key Design Decisions:**
    1.  *Asynchronous Transcoding Pipeline:* Video uploads chunked into S3 trigger a Kafka event. Distributed worker clusters transcode the video into multiple resolutions (1080p, 720p, 480p) and adaptive streaming formats (HLS / DASH).
    2.  *Database Sharding via Vitess:* Scale MySQL horizontally across thousands of shards using Vitess query proxies.
    3.  *Edge CDN Caching:* Cache the first 10 seconds of popular videos at Edge PoPs for instant playback start with zero buffering.

---

### Q8: Design Netflix (Global Content Delivery & Recommendation Platform)

**Answer:**
Design a subscription video on-demand platform delivering ultra-high-definition streaming across global ISPs and personalized recommendation feeds.

*   **Solution Link:** [https://www.geeksforgeeks.org/system-design/system-design-netflix-a-complete-architecture/](https://www.geeksforgeeks.org/system-design/system-design-netflix-a-complete-architecture/)
*   **Key Design Decisions:**
    1.  *Open Connect Appliance (OCA):* Custom hardware cache servers deployed directly inside ISP data centers globally to stream video traffic locally.
    2.  *Microservices & Chaos Engineering:* 1,000+ microservices on AWS orchestrated with Spinnaker and tested for resiliency using Chaos Monkey.
    3.  *Recommendation Pipeline:* Offline batch processing (Apache Spark) combined with nearline streaming algorithms for real-time personalized carousel generation.

---

### Q9: Design Spotify (Audio Streaming, Playlist Sync & Distributed Player State)

**Answer:**
Design a digital music streaming platform supporting 100M+ tracks, instant playback, playlist collaboration, and Spotify Connect multi-device state sync.

*   **Solution Link:** [https://algomaster.io/learn/system-design-interviews/design-spotify](https://algomaster.io/learn/system-design-interviews/design-spotify)
*   **Key Design Decisions:**
    1.  *Track Storage & Delivery:* Pre-encode tracks in Ogg Vorbis/AAC across multiple bitrates (96k, 160k, 320k) stored in S3 and cached via CDNs and local client disk caches.
    2.  *Spotify Connect State Engine:* WebSocket connections synchronized via central Raft-based state managers to allow phone-to-speaker remote control with sub-50ms latency.
    3.  *Metadata Layer:* Apache Cassandra distributed cluster for fast playlist reads and listening history.

---

### Q10: Design TikTok (Short-Form Video & Real-Time ML Recommendation Feed)

**Answer:**
Design a viral short-form video platform processing millions of video uploads, real-time engagement loops, and real-time AI recommendation feeds.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=Z-0g_aJL5Fw](https://www.youtube.com/watch?v=Z-0g_aJL5Fw)
*   **Key Design Decisions:**
    1.  *Real-Time ML Feature Store:* Streams user watch time, completion rates, and swipe speed into Flink and Redis to update user embedding vectors in real time.
    2.  *Video Pre-Fetching:* Client app aggressively pre-buffers the next 3 video chunks in background memory to guarantee instant scroll transitions.
    3.  *Decoupled Transcoding:* Edge video encoding pipelines optimizing for extreme mobile data compression.

---

### Q11: Design Uber / Ride-Booking System (Geospatial Dispatch & Tracking)

**Answer:**
Design a real-time ride-hailing and dispatch system managing millions of active drivers, GPS tracking updates every 4 seconds, and dynamic surge pricing.

*   **Solution Guide (Text):** [https://www.geeksforgeeks.org/system-design/system-design-of-uber-app-uber-system-architecture/](https://www.geeksforgeeks.org/system-design/system-design-of-uber-app-uber-system-architecture/)
*   **Deep-Dive Walkthrough (Video):** [https://www.youtube.com/watch?v=umWABit-wbk](https://www.youtube.com/watch?v=umWABit-wbk)
*   **Key Design Decisions:**
    1.  *Uber H3 Hexagonal Spatial Indexing:* Earth partitioned into hierarchical hexagonal cells (Resolution 8); driver lookups query the rider's cell plus 6 immediate neighbors in-memory.
    2.  *In-Memory Geosharded Dispatcher (DISCO):* Driver locations held in an in-memory hash ring sharded by Cell ID using Ringpop gossip protocol.
    3.  *Surge Pricing Engine:* Real-time supply-vs-demand calculation computed per H3 hexagon using Apache Flink stream aggregations.

---

### Q12: Design Google Maps (Routing, Spatial Tiles & ETA Computation)

**Answer:**
Design a global mapping and turn-by-turn navigation platform supporting map tile rendering, Dijkstra/A* routing algorithms, and real-time traffic ETAs.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=jk3yvVfNvds](https://www.youtube.com/watch?v=jk3yvVfNvds)
*   **Key Design Decisions:**
    1.  *Vector Map Tiles:* Earth mapped onto QuadTrees; vector road and building geometry rendered as 256x256 pixel vector tiles at various zoom levels.
    2.  *Graph Partitioning & Routing:* Road network modeled as a directed weighted graph partitioned into geographic subgraphs; routes calculated using Contraction Hierarchies and A* search.
    3.  *Real-Time Traffic Engine:* Live GPS pings from Android devices aggregated to update road segment speed weights dynamically.

---

### Q13: Design Autocomplete / Typeahead for Search Engines

**Answer:**
Design a search typeahead engine delivering the top 5 query suggestions with sub-30ms latency for hundreds of thousands of queries per second.

*   **Solution Link:** [https://algomaster.io/learn/system-design-interviews/design-instagram](https://algomaster.io/learn/system-design-interviews/design-instagram) *(Search "algomaster design autocomplete" for the complete dedicated write-up).*
*   **Key Design Decisions:**
    1.  *In-Memory Trie Data Structure:* Build a prefix Trie where each node stores the top 5 most frequent search queries for its prefix.
    2.  *Offline Trie Build & MapReduce:* Aggregate search logs weekly via Spark/MapReduce to recalculate query frequencies and deploy immutable Trie snapshots to read-only memory caches.
    3.  *Browser Caching:* Client caches recent query results in an in-memory LRU cache to eliminate duplicate network calls.

---

### Q14: Design Google Search (Web Crawling, Inverted Index & PageRank)

**Answer:**
Design a web search engine crawling billions of web pages, constructing an inverted index, and ranking search results in under 100 milliseconds.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=CeGtqouT8eA](https://www.youtube.com/watch?v=CeGtqouT8eA)
*   **Key Design Decisions:**
    1.  *Distributed Web Crawler:* Politeness-enforcing crawler fleet with URL frontier queues, DNS resolvers, and duplicate content detectors (SimHash).
    2.  *Inverted Index:* Sharded inverted index mapping `term -> List<[document_id, frequency, positions]>`.
    3.  *PageRank & ML Scoring:* Offline graph computation of link authority combined with real-time semantic embedding ranking.

---

### Q15: Design Amazon / E-Commerce Platform (Inventory, Cart & Order Processing)

**Answer:**
Design an e-commerce platform managing millions of product listings, distributed inventory reservation, shopping carts, and flash sale checkout spikes.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=EpASu_1dUdE](https://www.youtube.com/watch?v=EpASu_1dUdE)
*   **Key Design Decisions:**
    1.  *Inventory Reservation (Two-Phase Hold):* Redis distributed lock holds inventory for 15 minutes during checkout; background reaper releases expired locks if payment is not completed.
    2.  *Database Separation:* Product Catalog in NoSQL Document DB (MongoDB/DynamoDB); Orders and Financial Ledgers in strictly ACID Relational PostgreSQL.
    3.  *Asynchronous Order Pipeline:* SAGA pattern orchestrating Payment $\to$ Inventory Deduction $\to$ Fulfillment Warehouse dispatch.

---

### Q16: Design a Payment Gateway / Payment System (Stripe Architecture)

**Answer:**
Design a highly secure, distributed payment processing engine guaranteeing exactly-once charge semantics, idempotency, and reconciliation with zero double-charging.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=olfaBgJrUBI](https://www.youtube.com/watch?v=olfaBgJrUBI)
*   **Key Design Decisions:**
    1.  *Idempotency Engine:* Every payment request requires an `Idempotency-Key` header. The gateway records the key in Redis/DB within an atomic transaction. Repeated calls return the original cached response.
    2.  *Double-Entry Ledger:* Financial transactions modeled as immutable pairs of Debits and Credits where $\sum \text{Debits} == \sum \text{Credits}$ at all times.
    3.  *Reconciliation Pipeline:* Nightly automated settlement batch jobs comparing internal ledger records with bank settlement clearing files.

---

### Q17: Design a Distributed Message Queue like Apache Kafka

**Answer:**
Design a high-throughput, horizontally partitioned, durable append-only commit log streaming platform.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=iJLL-KPqBpM](https://www.youtube.com/watch?v=iJLL-KPqBpM)
*   **Original Paper:** [https://notes.stephenholiday.com/Kafka.pdf](https://notes.stephenholiday.com/Kafka.pdf)
*   **Key Design Decisions:**
    1.  *Zero-Copy I/O:* Use Linux `sendfile()` to transfer bytes directly from OS Page Cache to the NIC buffer without JVM user-space memory copies.
    2.  *Sequential Append-Only Log:* Messages written sequentially to segment files on disk with an in-memory index mapping message offsets to physical file positions.
    3.  *Consumer Group Rebalancing:* Pull-based consumption where consumers track their own offsets in a special `__consumer_offsets` topic.

---

### Q18: Design a Distributed Key-Value Store like Amazon DynamoDB / Redis

**Answer:**
Design a fault-tolerant, horizontally partitioned distributed key-value store guaranteeing tunable consistency, sub-10ms latency, and high availability.

*   **Solution Walkthrough (Video):** [https://www.youtube.com/watch?v=rnZmdmlR-2M](https://www.youtube.com/watch?v=rnZmdmlR-2M)
*   **Foundational Paper:** [https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
*   **Key Design Decisions:**
    1.  *Consistent Hashing with Virtual Nodes:* Partitions data keys uniformly across cluster nodes while minimizing data rebalancing on node join/leave.
    2.  *Sloppy Quorums & Hinted Handoff:* Allows writes even when preferred nodes are partitioned, storing temporary replicas to be handed off when nodes recover.
    3.  *SSTables & LSM-Trees:* In-memory MemTable backed by WAL on disk, periodically flushed to immutable Sorted String Tables (SSTables) with Bloom filters.
