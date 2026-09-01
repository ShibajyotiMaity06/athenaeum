# Spring Boot - Medium Interview Questions

## Theory Questions & Answers

### Q1: Explain bean lifecycle hooks you can use.
* Instantiation → populate properties → Aware interfaces (BeanNameAware...) → BeanPostProcessor.before → @PostConstruct/InitializingBean.afterPropertiesSet/initMethod → ready → @PreDestroy on shutdown.
* BeanPostProcessor power: proxies (transactions, async, caching) wrap here - explains annotation self-invocation failures.
Ordering knowledge separates debugging heroes from sufferers.

---

### Q2: How does proxy-based AOP work and what are its limits?
* JDK dynamic proxies (interfaces) or CGLIB subclassing weave advice around beans: `@Transactional`, `@Cacheable`, `@Async`, custom aspects.
* Limits: self-invocation bypasses proxy (internal call misses transaction); final methods/classes defeat CGLIB; private methods never advised.
Fixes: split beans, self-injection via ObjectProvider, or AspectJ weaving for exotic cases.

---

### Q3: Explain propagation behaviors with real scenarios.
Key ones:
* REQUIRED (default): join or create.
* REQUIRES_NEW: suspend outer, fresh tx - audit log must survive outer rollback.
* NESTED: savepoint inside outer - partial rollback possible.
* NOT_SUPPORTED/MANDATORY/NEVER: suspension/assertions for special flows.
Scenario drill: batch processing where per-row failure shouldn't sink whole batch → REQUIRES_NEW per row + collect errors.

---

### Q4: What isolation levels does Spring expose and which anomalies do they prevent?
* DEFAULT→DB; READ_UNCOMMITTED (dirty reads), READ_COMMITTED (default PG), REPEATABLE_READ (MySQL default), SERIALIZABLE.
* Anomalies ladder: dirty → non-repeatable → phantom; serialization prevents all incl. write-skew (PG SSI).
Practical guidance: raise level only for the critical section; pair with retries on serialization failures.

---

### Q5: How do JPA persistence contexts interact with transactions in services?
* One EntityManager per transaction via shared proxy; entities loaded become managed - changes auto-flushed at commit (dirty checking).
* Read-only hint (`@Transactional(readOnly=true)`) enables flush-mode manual/Hibernate optimizations + replica routing hints.
* Detached entity pitfalls: modifying after context close silently lost; merging copies state into new managed instance.

---

### Q6: What is the Open Session In View anti-pattern debate?
* OSIV keeps session open during view rendering allowing lazy loads in templates/controllers outside tx.
* Costs: connections held longer (pool pressure), hidden queries late in request, transactional boundaries blurred.
Boot default open-in-view=true with startup warning; disciplined teams disable it and fetch explicitly (DTO projections/eager graphs).

---

### Q7: How do you fix LazyInitializationException properly?
Root cause: accessing lazy association after EM closed.
Correct fixes ranked:
1. Fetch join exactly what the use-case needs (`@EntityGraph` / JPQL join fetch).
2. DTO projection query returning flat data (no entities past service layer).
3. EntityGraph combinations for dynamic depth.
Anti-fixes to call out: hibernate.enable_lazy_load_no_trans=true, OSIV re-enable.

---

### Q8: Compare DTO vs entity exposure at API boundaries.
Exposing entities leaks internals (lazy bombs, fields you didn't intend, coupling schema↔API), blocks independent evolution.
DTO pattern: records mapping via MapStruct/manual; validation annotations on DTOs; mappers unit-tested.
Nuance: simple internal CRUD may pragmatically expose entities with careful @JsonIgnore - know when you're taking the shortcut.

---

### Q9: How does Spring Data JPA generate derived queries and where are its limits?
* Parser walks method name → criteria; supports And/Or/Between/IgnoreCase/OrderBy chains, first/topN.
* Limits: complex dynamic conditions unreadable as names; property collisions; runtime failure at bootstrap if path invalid (good!).
Escape hatch: @Query JPQL/native with named params + SpEL refinements; Specification API for composable dynamic filters.

---

### Q10: Explain Specifications and Criteria usage for dynamic search.
```java
Specification<Book> spec = BookSpecs.titleContains(q).and(BookSpecs.inYear(y));
repo.findAll(spec, pageable);
```
* Type-safe predicate composition reusable across endpoints; pairs with pagination seamlessly.
Meta-model (`@StaticMetamodel`) avoids string column typos.
Interview probe: how to prevent empty-predicate full-table scans - require at least one criterion.

---

### Q11: How do pessimistic and optimistic locking map onto JPA?
* Optimistic: `@Version` column; update checks version match → OptimisticLockException → retry business flow. Best low-contention.
* Pessimistic: `@Lock(LockModeType.PESSIMISTIC_WRITE)` issuing FOR UPDATE; queue patterns add skip_locked via hints on Postgres/Hibernate 6.
Decision framing: contention profile decides; mixing both on same rows needs care.

---

### Q12: What is Flyway/Liquibase integration and migration discipline?
* Flyway: versioned SQL files applied at boot (or CI step) recorded in flyway_schema_history; checksum guards drift.
* Discipline: forward-only, reviewed migrations, CONCURRENTLY indexes handled via non-transactional config on PG, baseline strategy adopting legacy DBs.
Testcontainers running migrations against real engine catches dialect bugs pre-prod.

---

### Q13: How do you test slices? (@DataJpaTest/@WebMvcTest/@SpringBootTest)
* @WebMvcTest loads MVC slice + mocked services via @MockBean - fast controller contract tests.
* @DataJpaTest swaps datasource to embedded unless overridden + rolls back per test; Testcontainers override for dialect fidelity.
* @SpringBootTest full context for integration; cache contexts across tests (context caching keys!) to keep suite fast.

---

### Q14: How do you externalize and validate configuration robustly?
* `@ConfigurationProperties(prefix="app")` typed beans > scattered @Value strings; JSR-303 validation on properties fails boot early with clear messages.
* Profiles compose defaults+overrides; secrets via vault/env; relaxed binding rules worth reciting.
Immutable `@ConstructorBinding` records preferred in modern Boot.

---

### Q15: Explain Actuator health groups and readiness/liveness for k8s.
* `management.endpoint.health.probes.enabled=true` exposes `/health/liveness` & `/health/readiness`.
* Groups compose indicators: readiness = db+redis+kafka reachable AND migrations current; liveness = JVM alive only.
* Graceful shutdown interplay: readiness flips false on SIGTERM start draining LB before context closes.

---

### Q16: How does Spring Security handle JWT resource-server configuration?
```java
http.oauth2ResourceServer(o -> o.jwt(j -> j.decoder(jwtDecoder())))
```
* Nimbus decoder validates signature/issuer/audience; authorities mapper converts claims → GrantedAuthority.
* Clock skew leeway, kid rotation via JWKS cache refresh-on-unknown-kid.
Custom claim → role prefix conventions documented to avoid silent authority mismatches.

---

### Q17: What is method security and how do you express rules?
* `@EnableMethodSecurity` enabling `@PreAuthorize("hasRole('ADMIN') or #id == principal.id")` SpEL.
* Return-value filtering `@PostFilter` (careful performance) / `@PostAuthorize`.
Object identity checks belong in query predicates too (defense in depth) - annotation alone doesn't filter collections efficiently.

---

### Q18: What is Micrometer and how do metrics reach Prometheus?
* Facade abstracting registries; actuator auto-binds JVM/HTTP metrics; custom via MeterRegistry.counter/timer.
* Naming convention dots converted per backend; tags cardinality discipline (no raw ids!).
* Exposed at /actuator/prometheus scrape endpoint; histogram buckets configured per SLI for p99 math.

---

### Q19: How do you implement distributed tracing integration?
* Micrometer Tracing (replacing Sleuth) auto-propagates W3C traceparent through filters/clients; export OTLP to collector.
* Manual spans for service boundaries/business steps; baggage propagation for tenant ids.
Sampling: head-based probabilistic + tail-based keep-errors policy at collector.

---

### Q20: What is the RestTemplate vs WebClient vs RestClient decision?
* RestTemplate: legacy sync, maintenance mode.
* WebClient: reactive fluent, also usable blocking; streaming support strong.
* RestClient (Boot 3.2+): fluent SYNC client modernizing RestTemplate without reactive deps.
Default recommendation today: RestClient for simple sync calls; WebClient when streaming/reactive pipelines exist. All support interceptors/retry/backoff customization.

### Q21: How do you implement global exception handling consistently?
* `@RestControllerAdvice` + `@ExceptionHandler(MethodArgumentNotValidException.class)` etc., returning ProblemDetail (RFC 7807, Boot 3 support built-in).
* Hierarchy: domain exceptions → advice mapping to status+type URI; fallback handler catches Throwable logging with trace id, generic body outward.
Consistency rule: ONE envelope everywhere; contract tests pin it.

---

### Q22: What is ProblemDetail and why adopt it?
* RFC 9457 standardized error JSON: type/title/status/detail/instance + extensions - clients parse generically; docs align.
* Spring auto-applies for known exceptions when `spring.mvc.problemdetails.enabled=true`.
Extensions carry field validation arrays; correlation id injected via advice for support flows.

---

### Q23: How do you handle pagination + sorting safely in controllers?
* Accept Pageable resolved from query params (`page,size,sort`); clamp size max via `spring.data.web.pageable.max-page-size`.
* Sort allowlisting preventing injection into dynamic sort columns (property reference errors or SQL issues in native queries).
Response: Page<T> serialized - beware unstable PageImpl JSON across versions; map to stable DTO envelope.

---

### Q24: What is @Async and what infrastructure does it need?
* Enables method execution on executor thread pool; requires `@EnableAsync`; default SimpleAsyncTaskExecutor unbounded → configure ThreadPoolTaskExecutor with queue caps + rejection policy.
* Return types void/Future/CompletableFuture; exception handling via AsyncUncaughtExceptionHandler.
Same self-invocation proxy caveat as transactions.

---

### Q25: How do caching abstractions work? (@Cacheable/@CacheEvict)
```java
@Cacheable(cacheNames="books", key="#id")
public Book get(Long id)
```
* CacheManager backends: caffeine (local TTL/max), redis (shared). SpEL keys; unless/until conditions; sync=true prevents dogpile per key.
* Multi-instance consistency: local caffeine needs invalidation bus or short TTLs; redis shared avoids drift at network cost.

---

### Q26: How do you implement scheduled jobs correctly in a cluster?
Problem: every instance fires.
Solutions ladder:
* ShedLock library - JDBC/redis lock rows ensuring single execution with lock-at-most-for safety.
* Quartz clustered JDBC jobstore - full misfire/recovery semantics.
* External schedulers (k8s CronJob calling an endpoint) moving concern out of app entirely.
Choose by recovery requirements, not habit.

---

### Q27: What is the difference between @MockBean and plain Mockito in Boot tests?
* @MockBean replaces/replaces-in-context bean so AUTOWIRED collaborators receive the mock - required because manual mocks don't reach the container wiring.
* Cost: context cache key changes → new context spin-up (slow suites); prefer constructor-injection unit tests without spring where possible.
Boot 3.4 splits @MockitoBean/@MockitoBean naming evolution worth mentioning as modernization note.

---

### Q28: How do you write integration tests with Testcontainers?
```java
@Testcontainers PostgreSQLContainer pg = new PostgreSQLContainer("postgres:16");
@TestConfiguration static DataSourceCfg... // wire container datasource
```
* Real engine fidelity (dialects, extensions); reuse singleton containers across classes for speed; migrations run via Flyway inside test proving schema health.
Cleans up the "works on H2 fails on PG" class of bugs permanently.

---

### Q29: What is context caching in @SpringBootTest and how do you keep suites fast?
* Contexts cached by configuration signature (annotations/properties/classes) - identical keys reuse context.
* Speed killers: random property injections differing, @DirtiesContext overuse, profile mismatches.
Audit via `spring.test.context.cache=...` statistics; consolidate test configs deliberately.

---

### Q30: What is graceful shutdown configuration?
```properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s
```
* Web server stops accepting, completes inflight within timeout before context close (beans destroyed reverse order).
Pairs with readiness probe flip + k8s preStop sleep; verify by kill-under-load drill asserting zero errors.

### Q31: How do you consume external REST services resiliently?
* RestClient/WebClient + Resilience4j annotations (`@CircuitBreaker(name="pricing", fallbackMethod=...)`, RateLimiter, Retry with exponential backoff+jitter, TimeLimiter).
* Timeouts set at THREE layers: connect, response, and overall SLA; per-downstream pools preventing cross-vendor exhaustion.
* Fallback semantics documented (cached value? default? hard fail) - silent fallbacks hide incidents.

---

### Q32: What is Spring Kafka's consumer concurrency/rebalance story?
* `ConcurrentKafkaListenerContainerFactory` concurrency = partitions parallelism ceiling; rebalances pause consumers - handle via `ConsumerRebalanceListener` committing offsets appropriately.
* Delivery: default at-least-once (offsets after processing); manual ack modes for precise control; idempotent consumers by event-id.
* Error handling: DefaultErrorHandler with backoff then DeadLetterPublishingRecoverer to DLT topic.

---

### Q33: How do you implement outbox pattern with Spring + JPA + Kafka?
* Business txn writes aggregate + Outbox row atomically.
* Publisher polls unsent rows (or Debezium CDC reads WAL) publishing to Kafka then marks sent - dual-write inconsistency eliminated.
* Ordering per aggregate key partition; cleanup job prunes published rows; monitoring lag between insert→publish as SLO.

---

### Q34: What is Spring Session and when do you need it?
* Replaces container HttpSession with external store (Redis/JDBC) via filter - enables multi-instance stateless-ish scaling, session expiry customization, header/token mode for APIs.
* `@EnableRedisHttpSession` minimal setup; index config for session lookups by principal.
Alternative honesty: JWT-only architectures may not need sessions at all.

---

### Q35: What is the difference between filters, interceptors, and AOP aspects?
* Filters: servlet-level, before DispatcherServlet - raw request/response, auth/encoding.
* Interceptors (HandlerInterceptor): around handler execution - pre/post/completion, access to handler metadata (audit, timing).
* Aspects: bean-method level - business-layer cross-cutting (metrics on service methods).
Choose by LAYER; auth in interceptor while needing filter-order guarantees is classic confusion.

---

### Q36: How do you implement multi-tenancy options in Spring Boot?
Three models:
* Column-based: tenant_id filter via Hibernate @TenantId + hibernate.filters or AbstractRoutingDataSource-free approach; RLS pairing on PG.
* Schema-per-tenant: MultiTenantConnectionProvider + CurrentTenantIdentifierResolver setting search_path on connection checkout.
* DB-per-tenant: routing datasource map + tenant resolver.
Session/connection hygiene under pooling is THE pitfall across all three.

---

### Q37: What is Spring Data Redis usage beyond caching?
* RedisTemplate ops (value/hash/set/zset) for rate limiters, distributed locks (via Redisson/Lettuce lock extensions), leaderboard zsets, pub/sub listeners via MessageListenerAdapter.
* Serialization strategy explicit (Jackson2JsonRedisSerializer) avoiding JDK serialization pitfalls.
Atomic operations via execute(RedisScript) Lua - INCR+EXPIRE race-free.

---

### Q38: How do you implement API versioning strategies in Spring?
Options:
* URI (/v1/) - simplest, cache-friendly.
* Header/Accept media-type params (`application/vnd.app.v2+json`) via content negotiation config.
* Query param (discouraged).
Implementation: versioned controllers packages sharing services; deprecation headers on old versions; contract tests pinning both.

---

### Q39: What is the startup performance toolbox for Boot apps?
* Lazy init flag (`spring.main.lazy-initialization=true`) trade-off: faster boot, deferred failures.
* CDS/AOT (GraalVM native images or Boot 3 AOT processing) cutting start to tens of ms - closed-world constraints apply (reflection config).
* Reduce classpath scanning (trim auto-configs), JVM flags (-XX:TieredStopAtLevel=1 in dev).
Serverless/cron contexts benefit most.

---

### Q40: What is GraalVM native image support in Boot 3 and its constraints?
* `mvn -Pnative package` produces standalone binary - instant startup, tiny footprint.
* Constraints: reflection/JNI/dynamic proxies need reachability metadata (hints), dynamic classloading banned, some libs incompatible; build time/memory heavy.
Fit: serverless scale-to-zero, CLI tools. Not automatic wins for long-running high-throughput services (JIT parity debates).

### Q41: How do you implement file upload/download endpoints securely?
Uploads: multipart size caps (`spring.servlet.multipart`), validate extension+content sniffing, stream to object storage (never local disk in k8s), regenerate names.
Downloads: streaming via Resource/ResourceRegion honoring Range; signed URL offload to storage preferred at scale; nosniff + attachment headers for untrusted types.

---

### Q42: What is the difference between @RequestParam, @PathVariable, @RequestHeader and matrix variables?
* PathVariable from URI template segments; RequestParam query params (defaults/required); headers via @RequestHeader.
* Matrix variables (`;k=v` inside segments) require removeSemicolonContent config - niche but asked.
Record-style @ModelAttribute binding aggregates many params with validation.

---

### Q43: How do you implement content negotiation?
* Configure favored media types + parameter strategy; produce per-endpoint `produces={MediaType...}`; custom HttpMessageConverters registered for vendor formats (vnd.acme+json).
* 406 responses on mismatch; versioning-by-media-type rides this mechanism.
Jackson customization via builders (modules, naming strategies) applied globally or per-converter.

---

### Q44: What is Springdoc OpenAPI integration?
* springdoc-openapi starter auto-generates /v3/api-docs + swagger-ui from code; group configs splitting docs per API area.
* Annotations (@Operation/@Parameter/@ApiResponse) enrich; schema naming conventions configured.
Contract governance: openapi-diff CI gate like any serious team runs.

---

### Q45: How do you handle async request processing (DeferredResult/CompletableFuture)?
* Controller returning CompletableFuture/DeferredResult frees servlet thread; container completes when future resolves - timeouts configurable via interceptor.
* Reactive return types (Mono/Flux) route through WebMvc's reactive bridge similarly.
Use case: long downstream calls where holding servlet threads starves capacity.

---

### Q46: What is the difference between spring-boot-devtools restart vs full restart vs live reload?
* Devtools restarts only application context with restarted classloader (fast); static resources served live w/o context restart; LiveReload pushes browser refresh.
* Production jars exclude devtools automatically.
JRebel comparison optional flavor - devtools covers most inner-loop needs free.

---

### Q47: What are the common Boot migration pains 2→3?
* javax.*→jakarta.* namespace sweep across dependencies; Spring Security lambda-only DSL enforced; Hibernate 5→6 SQL/dialect behavior changes (criteria changes, ID generator defaults); properties renamed (spring.redis→spring.data.redis).
Tooling: OpenRewrite recipes automating most mechanical churn - mention it and sound senior.

---

### Q48: What is the difference between classpath vs jar boot behavior you must respect?
* Nested-jar loading means: File-based resource access breaks (use ClassPathResource/streams), templates/static resolution via abstraction not java.io.File, devtools excluded, profile-specific file watching absent.
* Native images stricter still. Code review checklist item for portability.

---

### Q49: How do you implement audit fields (created_by/at) automatically?
* Auditing via `@EnableJpaAuditing` + `@CreatedDate/@CreatedBy/@LastModified*` with AuditorAware reading SecurityContext.
* Envers alternative for full change history (audit tables per entity, queries via AuditReader).
DB-level defaults as belt-and-braces; tests assert auditor wiring under anonymous/system contexts.

---

### Q50: What is your go-to checklist reviewing a new Spring Boot service PR?
Ordered scan:
1. Config externalized + validated (no secrets).
2. Layering clean (controller thin, txns in services, no field injection).
3. Migrations reviewed for locking risk; indexes match queries.
4. Security: authz annotations + query scoping both present; input validation on DTOs.
5. Observability: metrics/tags, logs structured w/ trace ids, health groups wired.
6. Tests: slices + one Testcontainers integration; resilience annotations on outbound calls.
Checklist-as-code (PR template) keeps reviews fast AND thorough.




