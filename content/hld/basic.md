# High-Level Design (HLD) - Core Concepts & Distributed System Foundations

Welcome to the High-Level Design (HLD) Core Concepts Guide. This codex covers 52 foundational high-level design questions, architectural trade-offs, networking protocols, database scaling strategies, and distributed systems consensus mechanisms.

---

## Theory Questions & Answers

### Q1: What are the key components of High-Level Design (HLD)?

**Answer:**
High-Level Design (HLD) defines the overall macroscopic architecture of a software system - outlining the major service boundaries, communication protocols, data persistence layers, caching strategies, and infrastructure components before writing code.
*   **Key Components:** Client applications (Web/Mobile), API Gateways, Load Balancers, Application Microservices, Distributed Caches (Redis), Message Queues (Kafka), Primary/Replica Databases, and Object Storage (S3).
*   **Real-World Example:** In an e-commerce platform, HLD models how the `User Service`, `Product Catalog Service`, and `Payment Gateway` interact via asynchronous message queues rather than defining specific class methods.

---

### Q2: Monolith vs. Microservices - How do you decide which architecture to use?

**Answer:**
*   **Monolithic Architecture:** A single unified codebase and database.
    *   *When to choose:* Early-stage startups (0 to 1 product-market fit), small teams (<15 engineers), low domain complexity, and workflows requiring strict ACID cross-table joins.
*   **Microservices Architecture:** Decomposed autonomous services owning independent databases.
    *   *When to choose:* Large engineering organizations requiring independent team deployment velocity (Conway's Law), services with drastically different scaling requirements (e.g., 100,000 read QPS vs 10 write QPS), and polyglot technology needs.
*   **Rule of Thumb:** Start with a clean, modular monolith; extract microservices only when team scale and database scaling bottlenecks demand it.

---

### Q3: What are the trade-offs between Relational (SQL) and NoSQL Databases?

**Answer:**
*   **Relational Databases (Postgres, MySQL):**
    *   *Strengths:* Strict ACID transaction guarantees, structured schemas with foreign key integrity, powerful multi-table `JOIN` queries.
    *   *Weaknesses:* Horizontal write scaling requires complex sharding; fixed schemas slow down rapid iterations. Best for financial ledgers, billing, and core business transactions.
*   **NoSQL Databases (MongoDB, Cassandra, DynamoDB):**
    *   *Strengths:* Dynamic schemas, native horizontal sharding out of the box, massive write throughput, low-latency key-value lookups.
    *   *Weaknesses:* Lacks multi-row ACID guarantees (BASE model), eventual consistency anomalies, no native foreign key joins. Best for real-time analytics, user sessions, chat feeds, and time-series data.

---

### Q4: How do you ensure High Availability in distributed systems?

**Answer:**
High Availability (HA) ensures a system remains accessible and operational without downtime, typically measured in "nines" (99.999% = $<5.26$ minutes downtime/year).
*   **Core Strategies:**
    1.  **Redundancy:** Deploy at least $N+1$ active instances across multiple availability zones (AZs) with no Single Point of Failure (SPOF).
    2.  **Load Balancing & Health Checks:** Route traffic away from degraded nodes automatically.
    3.  **Database Replication & Auto-Failover:** Use multi-AZ primary-replica replication with automated consensus failover (e.g., AWS Aurora, Patroni for Postgres).

---

### Q5: What is Load Balancing and how does it work?

**Answer:**
A **Load Balancer (LB)** sits between clients and backend server clusters, distributing incoming network requests evenly across healthy instances to optimize resource utilization and prevent server saturation.
*   **Layers:** Operates at **Layer 4** (Transport Layer: TCP/UDP routing based on IP/Port, e.g., AWS NLB, HAProxy) or **Layer 7** (Application Layer: HTTP header, cookie, and path-based routing, e.g., AWS ALB, NGINX).
*   **Algorithms:** Round Robin, Weighted Round Robin, Least Connections, and IP Hash (for session stickiness).

---

### Q6: How do you design a system for massive horizontal scalability?

**Answer:**
1.  **Stateless Application Tier:** Keep web and app servers completely stateless so any server can handle any request; offload user session data to distributed caches (Redis).
2.  **Database Partitioning (Sharding):** Horizontally split large database tables across multiple physical database nodes using a consistent hash of the Shard Key.
3.  **Asynchronous Decoupling:** Offload heavy background workloads (image resizing, email sending, payment receipts) to distributed message queues (Kafka / RabbitMQ / AWS SQS).
4.  **Edge Caching (CDN):** Serve static assets and public API responses directly from edge Points of Presence (Cloudflare, CloudFront).

---

### Q7: How do you implement end-to-end Security in High-Level Design?

**Answer:**
*   **Edge & Transport:** Enforce TLS 1.3 / HTTPS everywhere; terminate SSL at the Load Balancer/CDN and use mutual TLS (mTLS) for zero-trust internal microservice communication.
*   **Identity & Access:** Authenticate via OAuth 2.0 / OIDC; authorize via fine-grained Role-Based Access Control (RBAC) at the API Gateway.
*   **Data Protection:** Encrypt data at rest using AES-256 (KMS keys) and in transit; hash all passwords using bcrypt or Argon2 with unique per-user salts.
*   **Perimeter Defense:** Deploy Web Application Firewalls (WAF) for DDoS protection, SQL Injection, and XSS filtering.

---

### Q8: What is Database Indexing and what are its performance trade-offs?

**Answer:**
A database index is a data structure (predominantly a **B+ Tree**) maintained alongside a table to speed up row retrieval without scanning the entire disk table.
*   **Trade-offs:** Drastically speeds up `SELECT`, `WHERE`, `JOIN`, and `ORDER BY` operations from $O(N)$ to $O(\log N)$. However, it introduces write amplification: every `INSERT`, `UPDATE`, and `DELETE` must synchronously update the B+ Tree on disk, increasing write latency and storage footprint.

---

### Q9: What are the key steps in designing a production-grade REST API?

**Answer:**
1.  **Resource-Oriented URIs:** Use clean, predictable noun endpoints (`POST /api/v1/orders`, `GET /api/v1/orders/{id}`).
2.  **Standard HTTP Status Codes:** `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`, `500 Server Error`.
3.  **Idempotency & Pagination:** Require `Idempotency-Key` headers on payment POSTs; implement cursor-based pagination (`?cursor=xyz&limit=20`) to prevent deep offset degradation.
4.  **Security & Rate Limiting:** Enforce JWT token verification and token bucket rate limits per client.

---

### Q10: How do you ensure Data Consistency across distributed microservices?

**Answer:**
Because distributed transactions (Two-Phase Commit - 2PC) lock resources and reduce availability, modern microservices achieve eventual consistency using the **SAGA Pattern**:
*   *Choreography-based:* Services publish domain events (Kafka) and react asynchronously.
*   *Orchestration-based:* A central Saga Orchestrator coordinates transaction steps. If a downstream step fails (e.g., Payment Declined), the orchestrator executes **Compensating Transactions** in reverse order (e.g., Unreserve Inventory).

---

### Q11: What is the role of Fault Tolerance in system architecture?

**Answer:**
Fault tolerance is the property that enables a system to continue operating properly in the event of failure (component crashes, network partitions, disk errors) of one or more of its subcomponents.
*   **Mechanisms:** Failure isolation (bulkheads), automated retries with exponential backoff and jitter, circuit breaking (Hystrix / Resilience4j), and graceful degradation (e.g., serving cached movie recommendations when the ML engine is down).

---

### Q12: How do you design for Disaster Recovery (RPO and RTO)?

**Answer:**
*   **RPO (Recovery Point Objective):** The maximum acceptable data loss time window (e.g., RPO = 5 mins means we can lose at most 5 minutes of data).
*   **RTO (Recovery Time Objective):** The maximum acceptable duration of system downtime to restore operations (e.g., RTO = 30 mins).
*   **Implementation:** Automated multi-region database replication (Active-Passive or Active-Active), continuous automated backups to immutable S3 buckets, and Infrastructure-as-Code (Terraform) scripts for automated disaster recovery rebuilds.

---

### Q13: What is Event-Driven Architecture (EDA) and what are its advantages?

**Answer:**
In an **Event-Driven Architecture**, services communicate asynchronously by producing and consuming immutable state events through an event broker (Apache Kafka / RabbitMQ) rather than making direct synchronous HTTP/gRPC calls.
*   **Advantages:** Complete temporal decoupling (Service A doesn't care if Service B is temporarily offline), natural traffic spike buffering, and effortless integration of new subscriber microservices without modifying upstream publisher code.

---

### Q14: How does a cache determine when it is full and what happens on eviction?

**Answer:**
Caches maintain a configured memory limit (e.g., `maxmemory 16gb` in Redis). When an insertion pushes memory over the threshold, the cache triggers an **Eviction Policy**:
*   *LRU (Least Recently Used):* Evicts keys that have not been accessed for the longest time (most common).
*   *LFU (Least Frequently Used):* Evicts keys with the lowest access counter.
*   *Volatile-TTL:* Evicts keys with the shortest remaining Time-To-Live first.

---

### Q15: How is Concurrency Control handled in High-Level System Design?

**Answer:**
1.  **Pessimistic Concurrency Control:** Uses database row-level exclusive locks (`SELECT ... FOR UPDATE`). Blocks other transactions until the current transaction completes. Best for high-contention bank balances.
2.  **Optimistic Concurrency Control (OCC):** Verifies a `version` column before writing (`UPDATE ... SET version = version + 1 WHERE id = 1 AND version = 5`). If updated rows $= 0$, retries or aborts. Best for low-contention high-throughput applications.
3.  **Distributed Locks:** Uses Redis Redlock or ZooKeeper ephemeral nodes to serialize operations across multi-server microservices.

---

### Q16: What are the core architectural constraints of REST?

**Answer:**
1.  **Client-Server:** Decouples user interface concerns from data persistence.
2.  **Stateless:** Every request from client to server must contain all information needed to understand and process the request (no server session state).
3.  **Cacheable:** Responses must implicitly or explicitly define themselves as cacheable or non-cacheable (`Cache-Control: max-age=3600`).
4.  **Uniform Interface:** Resource identification in requests, resource manipulation through representations, and self-descriptive messages.
5.  **Layered System:** The client cannot tell whether it is connected directly to the end server or an intermediate proxy/load balancer.

---

### Q17: What is the role of a Message Broker in distributed systems?

**Answer:**
A **Message Broker** acts as an intermediary message transport pipeline that buffers, routes, and guarantees delivery of messages between decoupled software services.
*   **Core Responsibilities:** Absorbing sudden traffic bursts (load leveling), enabling asynchronous pub/sub broadcast to multiple consumers, providing message durability, and decoupling producer write latency from consumer processing latency.

---

### Q18: Explain Database Replication and its primary topologies.

**Answer:**
Replication maintains copies of database data across multiple physical machines to ensure high availability and read scalability.
*   **Primary-Replica (Master-Slave):** All write operations execute on 1 Primary node; read operations are distributed across multiple read-only Replicas.
*   **Multi-Primary (Master-Master):** Writes can occur on multiple primary nodes across regions (requires write conflict resolution).
*   **Leaderless (Quorum-based):** Clients write to and read from multiple nodes directly using $W + R > N$ quorums (Apache Cassandra, Amazon DynamoDB).

---

### Q19: How do you build a Fault-Tolerant Network Infrastructure?

**Answer:**
1.  **Redundant Network Links:** Dual Tier-1 ISP uplinks with automated BGP failover.
2.  **Anycast IP Routing:** Announces the same IP address from multiple geographic edge data centers; if one router drops, traffic automatically converges to the nearest healthy PoP.
3.  **Redundant Load Balancers:** Active-Passive HAProxy/ALB pairs using VRRP (Virtual Router Redundancy Protocol) for instant IP takeover.

---

### Q20: What is the role of Containerization (Docker) and Orchestration (Kubernetes)?

**Answer:**
*   **Containerization (Docker):** Packages application code along with its runtime, system libraries, and dependencies into a lightweight, immutable container image that runs identically on development laptops and production clusters.
*   **Orchestration (Kubernetes):** Automates container deployment, horizontal pod autoscaling (HPA), rolling zero-downtime updates, service discovery, self-healing container restarts, and load balancing across worker nodes.

---

### Q21: How do you design systems for Data Privacy and Regulatory Compliance (GDPR/HIPAA)?

**Answer:**
1.  **Data Isolation & Encryption:** Field-level encryption for Personally Identifiable Information (PII) using dedicated KMS encryption keys.
2.  **Right to be Forgotten (GDPR Erasure):** Implement soft-delete and automated asynchronous hard-delete pipelines that cascade through databases, replicas, data lakes, and backups.
3.  **Immutable Audit Logs:** Log all accesses to medical/financial records in write-once append-only audit stores.
4.  **Data Residency:** Geoshard databases so EU citizen data is stored strictly within EU data centers.

---

### Q22: What is a Distributed Cache (Redis Cluster) and what are its advantages?

**Answer:**
A **Distributed Cache** pools the RAM of multiple servers into a unified in-memory storage layer partitioned across 16,384 hash slots.
*   **Advantages:** Sub-millisecond read/write latency ($<1\text{ms}$), handles millions of operations per second, prevents relational database CPU exhaustion, and provides high availability via master-replica automatic failover.

---

### Q23: How do you ensure Data Integrity in mission-critical applications?

**Answer:**
1.  **Relational Database Constraints:** Unique constraints, foreign keys, `NOT NULL`, and check constraints.
2.  **ACID Transactions:** Enforce strict serializable or snapshot isolation on multi-step financial transfers.
3.  **Cryptographic Checksums:** Store SHA-256 file hashes in object stores to verify data has not suffered bitrot corruption.

---

### Q24: How does the CAP Theorem guide distributed database choices?

**Answer:**
In any distributed network prone to network partitions (**P**), you must trade off between:
*   **CP (Consistency over Availability):** If a network split occurs, reject writes or wait for consensus to ensure all nodes have identical data (e.g., HBase, MongoDB primary reads, CockroachDB). Best for banking.
*   **AP (Availability over Consistency):** If a network split occurs, all nodes accept writes and return responses, but data may be temporarily out of sync until eventual consistency convergence (e.g., Cassandra, DynamoDB, CouchDB). Best for social feeds.

---

### Q25: What is the difference between Horizontal and Vertical Scaling?

**Answer:**
*   **Vertical Scaling (Scale-Up):** Upgrading a single server with more CPU cores, RAM, and PCIe SSDs. Simple (no distributed complexity), but bounded by hardware limits and acts as a Single Point of Failure.
*   **Horizontal Scaling (Scale-Out):** Adding more commodity compute instances to a cluster pool behind a Load Balancer. Practically unlimited capacity, high fault tolerance, but requires stateless code and distributed data management.

---

### Q26: What is Rate Limiting and what are its primary algorithms?

**Answer:**
Rate Limiting restricts the number of requests a client can execute within a specified time window to prevent brute force attacks, resource starvation, and cascading outages.
*   **Core Algorithms:** **Token Bucket** (allows traffic bursts up to bucket capacity), **Leaky Bucket** (smooths traffic to a constant rate), and **Sliding Window Counter** (memory-efficient burst-proof counter in Redis).

---

### Q27: Define Latency, Throughput, and Availability with real-world analogies.

**Answer:**
*   **Latency:** The duration required for a single request to travel round-trip (e.g., 25ms to load a user profile). *Analogy:* The speed of a single delivery van.
*   **Throughput:** The volume of work or requests completed per unit of time (e.g., 50,000 queries per second - QPS). *Analogy:* The width of a highway and number of vans passing per minute.
*   **Availability:** The percentage of time a system is fully operational and accepting traffic (e.g., 99.99% uptime). *Analogy:* The percentage of days the highway is open without roadwork closures.

---

### Q28: What is the difference between Database Sharding and Partitioning?

**Answer:**
*   **Partitioning (Table Partitioning):** Dividing a large table into smaller physical files **within a single database instance** (e.g., PostgreSQL range partitioning by month `orders_2026_01`).
*   **Sharding:** Horizontally distributing table partitions across **multiple independent physical database servers**, requiring a Shard Router to direct queries based on the Shard Key.

---

### Q29: What are the primary Cache Update Strategies and when should you use each?

**Answer:**
1.  **Cache-Aside (Lazy Loading):** Application reads cache; on miss, reads DB, writes to cache. Best for general read-heavy workloads.
2.  **Write-Through:** Application writes to cache; cache synchronously writes to DB before returning. Guarantees consistency at higher write latency.
3.  **Write-Back (Write-Behind):** Application writes to cache; cache asynchronously batches updates to DB. Extreme write performance, but risk of data loss on cache crash.
4.  **Write-Around:** Writes go straight to DB, bypassing cache. Prevents cache pollution for write-heavy data that is rarely read.

---

### Q30: What is a Content Delivery Network (CDN) and how does it optimize web delivery?

**Answer:**
A **CDN** is a globally distributed network of Edge Point of Presence (PoP) proxy servers caching assets in geographic proximity to end users. It reduces latency by using **Anycast DNS** to serve static files (images, JS bundles, videos) from the nearest edge cache and accelerates dynamic API traffic via persistent pre-warmed TCP/TLS connections to the origin server.

---

### Q31: How does Leader Election work in distributed consensus (Raft / Paxos)?

**Answer:**
When a distributed cluster starts or detects that the current leader has crashed (heartbeat timeout), candidate nodes trigger an election. Candidates increment the election `term` and request votes from peers. A candidate becomes the new leader upon receiving votes from a **strict majority (quorum $= \lfloor N/2 \rfloor + 1$)** of nodes, preventing split-brain scenarios.

---

### Q32: How do Apache Kafka and RabbitMQ improve overall system design?

**Answer:**
They decouple services by converting synchronous blocking RPCs into asynchronous event streams. They absorb high-throughput traffic spikes, enable non-intrusive broadcast to multiple independent downstream consumers, and guarantee message persistence and replayability.

---

### Q33: Contrast Synchronous and Asynchronous Communication in microservices.

**Answer:**
*   **Synchronous (HTTP REST, gRPC):** Caller blocks and waits for immediate response. Simple to reason about, but creates tight temporal coupling and cascading latency failures.
*   **Asynchronous (Kafka, SQS, RabbitMQ):** Caller publishes message and resumes execution immediately. Resilient against downstream outages and buffers bursts, but introduces eventual consistency and complex error handling.

---

### Q34: What is an API Gateway and what core responsibilities does it handle?

**Answer:**
An **API Gateway** serves as the single reverse proxy entry point for all client applications into a microservice backend.
*   **Core Responsibilities:** Request routing, SSL/TLS termination, centralized Authentication & JWT validation, Rate Limiting, CORS handling, Request/Response payload transformation, and Telemetry logging.

---

### Q35: How does the Circuit Breaker Pattern prevent cascading outages?

**Answer:**
When an upstream service notices that calls to a downstream dependency are failing repeatedly (e.g., $>50\%$ error rate in 10s), the Circuit Breaker trips from **Closed** to **Open**. While Open, all subsequent requests fail fast immediately or return a fallback response without making network calls, allowing the failing service time to recover. After a sleep window, it enters **Half-Open** to test recovery.

---

### Q36: What is Consistent Hashing and why is it essential in distributed caching?

**Answer:**
Consistent Hashing maps both servers and data keys to positions on a $360^\circ$ circular hash ring ($0$ to $2^{32}-1$). Keys are assigned to the first server encountered moving clockwise. When a server is added or removed, only $K/N$ keys need to be remapped (compared to nearly $100\%$ in modulo hashing), eliminating cache wipeouts. Virtual nodes ensure uniform load distribution.

---

### Q37: How does Service Discovery work in dynamic cloud environments?

**Answer:**
In dynamic container environments (Kubernetes, AWS ECS), instances spin up and down with changing IP addresses. **Service Discovery** maintains a real-time registry (Consul, Eureka, Kubernetes CoreDNS) of active healthy IP addresses. Services query the registry to route RPC traffic without hardcoding hostnames.

---

### Q38: What is a Reverse Proxy and what advantages does it offer?

**Answer:**
A **Reverse Proxy** sits in front of internal web servers and intercepts incoming client requests.
*   **Advantages:** Load balances traffic across backend nodes, offloads SSL/TLS encryption/decryption, caches static and dynamic responses, compresses payloads (Gzip/Brotli), and shields internal server network topology from public exposure.

---

### Q39: What is the difference between ACID and BASE properties?

**Answer:**
*   **ACID (Atomicity, Consistency, Isolation, Durability):** Prioritizes immediate correctness, strict transactional boundaries, and linearizability. Standard in relational SQL databases.
*   **BASE (Basically Available, Soft state, Eventual consistency):** Prioritizes 100% availability, horizontal scalability, and low latency by tolerating temporary data staleness while nodes converge. Standard in distributed NoSQL databases.

---

### Q40: What is the fundamental difference between HLD and LLD?

**Answer:**
*   **High-Level Design (HLD):** Architectural macro view - system context, microservices, databases, load balancers, caching layers, message streams, data flow, and capacity planning.
*   **Low-Level Design (LLD):** Implementation micro view - class diagrams, object-oriented design patterns, method signatures, database table column schemas, and algorithm logic.

---

### Q41: Contrast Stateful and Stateless server architectures.

**Answer:**
*   **Stateful:** Servers retain client session data (e.g., shopping cart) in local memory. Requires sticky sessions; server crashes lose active sessions; horizontal autoscaling is cumbersome.
*   **Stateless:** Servers hold zero local session state; every request contains full authentication credentials (JWT), and transient state lives in shared Redis clusters. Instances can be added or destroyed instantly to handle traffic surges.

---

### Q42: Explain the 7 Layers of the OSI Model from top to bottom.

**Answer:**
1.  **Layer 7 - Application:** HTTP, HTTPS, WebSockets, DNS, SMTP, SSH (User application interfaces).
2.  **Layer 6 - Presentation:** Data encryption, compression, SSL/TLS, serialization (JSON, Protobuf).
3.  **Layer 5 - Session:** Manages sessions and connection dialogs.
4.  **Layer 4 - Transport:** TCP (reliable, ordered), UDP (fast, connectionless), port numbers.
5.  **Layer 3 - Network:** IP addressing, routers, packet routing across WAN/LAN.
6.  **Layer 2 - Data Link:** MAC addresses, Ethernet switches, frames.
7.  **Layer 1 - Physical:** Physical cables, optical fiber, radio frequencies, raw bit streams.

---

### Q43: Explain the 4 Layers of the TCP/IP Networking Model.

**Answer:**
1.  **Application Layer:** Combines OSI Layers 5, 6, and 7 (HTTP, DNS, TLS, SSH).
2.  **Transport Layer:** Host-to-host communication and reliability (TCP, UDP).
3.  **Internet Layer:** Inter-network packet routing and logical addressing (IPv4, IPv6, ICMP).
4.  **Network Access (Link) Layer:** Physical network hardware and MAC framing (Ethernet, Wi-Fi).

---

### Q44: What is the difference between HTTP and HTTPS?

**Answer:**
*   **HTTP (Port 80):** Transmits data in unencrypted plaintext over TCP. Vulnerable to packet sniffing, Man-in-the-Middle (MITM) attacks, and payload tampering.
*   **HTTPS (Port 443):** Encapsulates HTTP inside a **TLS (Transport Layer Security)** session. Authenticates server identity via X.509 SSL certificates and encrypts all headers, URLs, and payloads with symmetric keys negotiated via asymmetric public-key cryptography (ECDHE).

---

### Q45: What is the difference between TCP and UDP?

**Answer:**
*   **TCP:** Connection-oriented (3-way handshake: SYN $\to$ SYN-ACK $\to$ ACK), guarantees ordered and error-checked delivery via packet sequence numbers and retransmissions, includes flow and congestion control. Best for web, databases, and file transfers.
*   **UDP:** Connectionless, lightweight (8-byte header), sends datagrams without handshakes or retransmissions, ultra-low latency. Best for live video streaming, online multiplayer gaming, VoIP, DNS, and HTTP/3 (QUIC).

---

### Q46: What is DNS and how does Domain Name Resolution work?

**Answer:**
**DNS (Domain Name System)** is the internet's hierarchical distributed phonebook translating human-readable names (`devprep.online`) to IP addresses (`104.21.48.1`).
*   **Resolution Flow:** Browser Cache $\to$ OS Resolver $\to$ Local DNS Recursive Resolver (ISP / 8.8.8.8) $\to$ Root Nameserver (`.`) $\to$ TLD Nameserver (`.online`) $\to$ Authoritative Nameserver (Cloudflare) $\to$ returns A/AAAA record with TTL.

---

### Q47: What happens during a Cache Miss in a production system?

**Answer:**
When requested data is not found in cache (Cache Miss):
1.  Application falls back to querying the primary relational or NoSQL database.
2.  Database processes query and returns row data.
3.  Application writes the fetched data into the cache with a specified TTL.
4.  Application delivers the response to the user. Subsequent requests hit cache instantly ($0\text{ms}$).

---

### Q48: What is Cache Invalidation and why is it considered a hard problem?

**Answer:**
"There are only two hard things in Computer Science: cache invalidation and naming things" (Phil Karlton).
*   **Cache Invalidation** ensures stale cached entries are updated or evicted when the underlying database is modified.
*   *Mechanisms:* Short TTL expiration, explicit Write-Through invalidation (`DEL cache:user:123`), or Change-Data-Capture (CDC) via database transaction logs (Debezium $\to$ Kafka $\to$ Cache Invalidator).

---

### Q49: What happens when a Leader Node fails in a distributed cluster?

**Answer:**
1.  Follower nodes stop receiving heartbeat messages and their election timers expire.
2.  Followers transition to Candidate state and trigger a new leader election (Raft/Paxos).
3.  The candidate receiving a majority quorum vote becomes the new Leader.
4.  The new leader updates the cluster metadata epoch/term number and begins accepting writes. Any uncommitted writes from the dead leader are discarded.

---

### Q50: How does Cloud Auto-Scaling work?

**Answer:**
Cloud Auto-Scaling monitors operational metrics (CPU utilization $>70\%$, Request Count per Target, Memory pressure, SQS Queue Depth) over an evaluation period (e.g., 3 consecutive minutes). When thresholds are breached, the Auto-Scaling Group triggers scaling policies to provision additional container tasks or EC2 virtual machines behind the Load Balancer, scaling down gracefully during off-peak hours to minimize cloud cost.

---

### Q51: What are Sticky Sessions and what are their architectural drawbacks?

**Answer:**
**Sticky Sessions (Session Affinity)** configure the Load Balancer to route all requests from a specific user to the same physical backend server instance using an HTTP cookie or client IP hash.
*   *Drawbacks:* Impedes uniform load balancing (creates hot servers), prevents autoscaling from cleanly terminating idle instances, and loses the user's active session if that specific server crashes. Modern systems replace sticky sessions with stateless JWTs and distributed Redis stores.

---

### Q52: How does a Load Balancer detect server failure?

**Answer:**
Load Balancers execute continuous periodic **Health Checks** (e.g., sending `GET /healthz` every 5 seconds). If a server returns an HTTP 5xx status code or fails to respond within a timeout window (e.g., 2 consecutive timeouts), the load balancer marks the instance as **Unhealthy** and immediately removes it from the active routing pool until it passes consecutive health checks.

---

### Source & References
*   [GeeksforGeeks Top System Design Interview Questions](https://www.geeksforgeeks.org/system-design/top-10-system-design-interview-questions-and-answers/)
