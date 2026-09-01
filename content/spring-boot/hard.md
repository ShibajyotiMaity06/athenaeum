# Spring Boot - Hard Interview Questions

## Theory Questions & Answers

### Q1: How does the Spring context startup actually sequence, and what breaks it?
* Scan/parse bean definitions → BeanFactoryPostProcessors (property placeholders, config class parsing - CGLIB enhancement of @Configuration enforcing proxyBeanMethods semantics) → instantiate non-lazy singletons in dependency order → BeanPostProcessors wrap proxies → SmartLifecycle.start().
* Breakers: circular deps (now fatal by default; allow-circular-references escape hatch), eager @PostConstruct doing IO, static initializers touching beans.
* Lazy init defers but shifts failures to request time - trade-off articulation expected.

---

### Q2: Explain @Configuration(proxyBeanMethods) semantics and the cglib interlude.
* Full mode (default): config class is CGLIB-subclassed so internal @Bean calls intercept, returning the SAME singleton instead of invoking method - preserves container semantics.
* lite mode (proxyBeanMethods=false / @Bean on non-@Configuration classes): methods execute literally → new instance per call; allowed when no intra-config references; faster startup, used heavily in native/AOT guidance.
Bug signature: two "singletons" unequal - explain mechanism to ace this.

---

### Q3: What is the transaction synchronization + JPA flush ordering dance in services?
* Within tx: Hibernate flushes BEFORE query execution touching affected tables (FlushMode.AUTO queries flush pending changes to keep results consistent), and always at commit.
* @TransactionalEventListener(AFTER_COMMIT) sees committed state but detached entities - must pass ids/data explicitly, not managed graphs.
* Pitfall: enqueueing message inside tx reading uncommitted rows elsewhere → phantom reads for consumer; design consumers idempotent or move reads post-commit.

---

### Q4: How does Hibernate batch writes and what settings unlock it?
* Requires: hibernate.jdbc.batch_size=50, ordered inserts (`order_inserts=true`), IDENTITY generation DISABLES batching for inserts (use SEQUENCE w/ pooled optimizer hi-lo style).
* Versioned data enables batched updates; statement rewrites via reWriteBatchedInserts=true (MySQL/pgjdbc) collapsing multi-values.
* Verify: datasource-proxy/sql statement count metrics before/after - prove the win numerically.

---

### Q5: What are the concurrency semantics of @Transactional across threads/reactive boundaries?
* Transaction bound to thread via ThreadLocal (DataSourceTransactionManager) - spawning threads inside a tx method runs code OUTSIDE it silently.
* Reactive: ReactiveTransactionManager propagates via Reactor context; mixing JDBC (blocking) inside reactive chains needs schedulers bounding blocking work.
* Async bridging patterns: pre-load ids inside tx, process outside, final update tx with optimistic checks.

---

### Q6: Explain how you'd implement multi-region read consistency with Spring Data.
* Read/write split via AbstractRoutingDataSource or separate EntityManagerFactory+tm for replicas keyed by ReadOnly flag/context.
* Causal reads: capture primary LSN on write; replica wait helper (`pg_wal_lsn_diff` poll) before serving dependent read; sticky-window fallback simpler.
* Micrometer tags distinguishing primary/replica queries expose lag-driven errors quickly.

---

### Q7: What does Boot's AOT processing transform, and how do you keep an app native-compatible?
* AOT generates bean definitions code (no runtime reflection scanning), proxy hints, property binding code at build time; native image then closes world.
* Compatibility rules: register reflection hints (@RegisterReflectionForBinding, RuntimeHints registrar) for serialization/domain types; avoid dynamic bean registration/classloading; prefer constructor injection; conditional evaluation resolved build-time.
* Test native profile in CI (slow builds - nightly), not just JVM tests.

---

### Q8: How do custom Actuator endpoints + HealthIndicators get built safely?
```java
@Endpoint(id="queue") @ReadOperation Map<String,Object> queue() {...}
```
* Security: restrict exposure (`management.endpoints.web.exposure.include`) + separate management port/network; sanitize returned data (no secrets).
* HealthIndicators returning Status.OUT disable readiness only when appropriate - distinguish liveness-affecting failures from degraded-but-serving states.

---

### Q9: Compare resilience patterns implementation: circuit breaker vs rate limiter vs retry vs bulkhead - interactions and pitfalls.
Resilience4j specifics:
* Ordering matters: Retry wrapping CircuitBreaker skews failure-rate stats - put breaker OUTSIDE retry (or use CB metrics ignoring retries).
* Bulkhead = semaphore/threadpool isolation per downstream; RateLimiter protects upstream contracts (their limits).
* Fallbacks must be observable (metric tag fallback=true) else incidents hide behind happy-looking success rates.
Config-as-code reviewed like schema changes - thresholds encode SLOs.

---

### Q10: How would you implement tenant-aware caching invalidation in a Spring cluster?
Design:
* Cache keys prefixed `{tenant}:...`; versioned entity keys bumped on write (no scan deletes).
* Cross-node local caffeine invalidation via Redis pub/sub channel broadcasting evictions (listen + invalidate local).
* Serialization: GenericJackson2Json with tenant-aware typemap; security fuzz test asserting cross-tenant key access impossible even with forged ids.
Document key grammar as contract; lint helper for building keys prevents drift.

### Q11: What are the internals of Spring Security's filter chain customization and common ordering bugs?
* SecurityFilterChain bean defines ordered filters: CORS→CSRF→headers→auth mechanisms→authorization; custom filters inserted via addFilterBefore/After relative to known anchors (UsernamePasswordAuthenticationFilter etc.).
* Classic bugs: permitAll on error dispatches leaking state, CSRF disabled globally instead of per-safe-routes, session creation policy mismatched to JWT APIs (IF_REQUIRED creating sessions needlessly).
* Debug via security debugging flag logging each filter decision - teach it during onboarding.

---

### Q12: How does OAuth2 login + resource server coexist in one service, and what token flows result?
* Both configured: oauth2Login for browser users (authorization-code + PKCE against IdP), resource-server validating incoming Bearer tokens for API clients.
* Session vs stateless split by matcher patterns; authorities mapping unified post either path.
* Logout complexity: IdP session vs local session vs back-channel logout endpoints - enumerate all three or accept documented gaps.

---

### Q13: What does @Transactional(readOnly=true) actually change across layers?
* Hibernate: flush mode MANUAL, read-only entity snapshots (no dirty-check snapshots) → big memory savings on large reads.
* JDBC hints: PG driver sets readOnly connection → planner optimizations; routing datasources send to replicas.
* Misconception to correct: it does NOT enforce immutability - writes may still execute and fail only at DB level depending.

---

### Q14: How would you implement multi-datasource configuration cleanly?
Recipe:
* Two DataSource/EntityManagerFactory/TransactionManager beans with qualifiers (`ordersTm`, `crmTm`); repositories assigned via `@EnableJpaRepositories(...transactionManagerRef=..., entityManagerFactoryRef=...)` package splits.
* Cross-store consistency: no 2PC generally - design compensating flows/outbox per store.
* Actuator health per datasource registered manually.
Self-invocation & qualifier mistakes dominate review comments here.

---

### Q15: Explain Hibernate's persistence context pitfalls in batch services and the escape hatches.
* Long-lived contexts accumulate managed entities → memory bloat + dirty-check cost linear growth.
* Patterns: clear()/detach after flush per chunk; StatelessSession for pure ETL; JPQL bulk update bypassing L1 but ALSO bypassing version checks/listeners - document semantics.
* Flush-before-query surprises: auto-flush triggering on queries touching affected tables - scope queries to avoid unintended flush storms.

---

### Q16: How do you implement distributed tracing correlation into logs and async executors?
* Micrometer Tracing MDC propagation: traceId/spanId injected into log patterns automatically for request threads.
* @Async/executors must wrap tasks (`ContextSnapshotFactory`/TaskDecorator copying MDC+trace context) else logs lose correlation.
* Kafka headers propagate context across service hops; consumer container factory configured to restore.
Test: integration asserting log lines contain same traceId as inbound header.

---

### Q17: What is Spring Boot's property source precedence in practice, including k8s ConfigMaps?
Ladder (high→low): devtools → @TestPropertySource → CLI args → SPRING_APPLICATION_JSON → ServletConfig/Context params → JNDI → Java system props → OS env → RandomValue → profile-specific files (outside jar then inside) → application.yml → @PropertySource.
K8s: env from ConfigMap/Secret mounts map onto OS env tier; mounted-file overrides via spring.config.import optional: paths enabling hot reloads of config without image rebuild.

---

### Q18: How do you implement zero-downtime rolling deploys with DB migrations safely in Boot services?
Contract:
* Backward-compatible migration first (expand), deploy N+1 dual-writing, backfill, flip reads behind feature flag, contract phase later drops legacy.
* Boot boot-time Flyway gated OFF for web pods when using dedicated migration Job (k8s preSync) avoiding racing migrators; advisory-lock alternative if in-process.
* Readiness tied to migration-version match preventing mixed-schema serving.

---

### Q19: What is your methodology for diagnosing a production Boot memory/CPU incident?
Steps:
1. Actuator threaddump/heapdump endpoints (pre-enabled secure) capture live evidence.
2. Thread groups analysis: blocked threads clustering around lock (jstack pattern), executor saturation counts.
3. Heap: class-instance histogram diffing two dumps (jhat/mat) - growing HashMaps/caches named.
4. CPU: async-profiler flamegraph attach - JIT frames vs app packages split.
5. Correlate with deploy/metric annotations; fix + regression load-test proving plateau.

---

### Q20: How do you implement idempotent consumers exactly-once-ish with Spring Kafka?
Stack:
* Consumer dedup store (redis SETNX event-id TTL / unique constraint table insert within processing txn).
* Manual ACK mode: offset committed ONLY after side-effect txn commits - crash between yields redelivery handled by dedup.
* Outbox publishing for outbound messages keeps end-to-end exactly-once illusion; DLQ after bounded retries with alerting.
Interview framing: "exactly-once is an illusion assembled from at-least-once + dedup" wins points.

### Q21: How do you implement dynamic feature-conditional bean wiring without config sprawl?
Tools:
* `@ConditionalOnProperty` for env toggles; custom Condition classes evaluating combinations (flag + license + region).
* BeanFactoryPostProcessor registering alternate beans programmatically when logic exceeds annotation expressiveness.
* Plugin pattern: Map<String,Feature> injected collecting all implementations keyed by qualifier - strategy registry replaces if/else bean forests.
Guardrail: startup report listing active strategies (Actuator endpoint) making wiring visible.

---

### Q22: What is the correct handling of Timezone/Locale in a Boot service serving global users?
* Store UTC; accept client tz via header/profile; Jackson timezone configured per-request via ObjectMapper thread-local alternative - cleaner: serialize ISO8601 always, convert at CLIENT display layer.
* Locale resolution LocaleResolver (header/session) feeding MessageSource for error strings.
* Scheduled jobs pin explicit zone (cron TZ) avoiding DST surprises - document each cron's business-timezone contract.

---

### Q23: How do you implement API rate limiting per-user with distributed correctness?
* Bucket per user+route in Redis: token bucket Lua script (HMGET tokens/last_refill, compute refill by elapsed, decide, write back atomically).
* Filter/interceptor pre-handler returning 429 + Retry-After headers; bypass list for health checks.
* Fail-posture per route class documented; metrics on rejection rates feeding abuse dashboards.
Clock skew solved by Redis TIME server-authoritative inside script.

---

### Q24: What is the difference between classpath scanning vs @Import vs spring.factories auto-config you'd exploit for SDK design?
SDK patterns:
* Library ships @AutoConfiguration via META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports with @ConditionalOnMissingBean defaults - consumers override naturally.
* @Import for mandatory infrastructure the SDK requires regardless of user beans.
* Avoid component-scanning library packages (forces consumer scan base tweaks) - explicit imports are kinder contracts.
Versioning: BOM alignment + deprecation cycle across majors documented.

---

### Q25: How do you implement request-scoped multi-step wizard state across stateless pods?
Options:
* Opaque token → server-side store (redis JSON of draft, TTL, versioned schema) - resumable across pods/devices after auth.
* Signed encrypted cookie blob for small non-sensitive drafts - tamper-evident but size-limited (~4KB) and revocation impossible.
* Hybrid: server holds PII fields; cookie holds step pointer only.
Completion idempotency via unique intent-key constraint; expiry sweeper cleaning abandoned drafts.

---

### Q26: What is Spring Authorization Server usage vs delegating to IdP, and integration gotchas?
* Delegate to Keycloak/Auth0 generally; embed Spring Authorization Server when product IS an IdP (multi-tenant SaaS issuing tokens).
* Gotchas: JWKS caching rotation on kid mismatch, audience validation strictness across services, scope-to-authority mapping conventions.
Token introspection vs local JWT verification trade-off: revocation immediacy vs latency/network cost.

---

### Q27: How would you implement blue/green DB-compatible deployments where two app versions coexist?
Checklist:
* Expand-first migrations; both versions tolerate extra columns (entities ignore unknown via @DynamicUpdate discipline? actually unknown columns fine - missing columns fatal, hence expand before deploy).
* Feature flags gating new code paths; message schemas versioned with converters on listeners bridging old producers/new consumers.
* Readiness gates on migration version; rollback plan honoring no-destructive-migrations-until-N+1-retired rule.

---

### Q28: What is your approach to load-shedding and priority lanes inside a Boot service?
* Middleware measuring event-loop... rather: tomcat executor queue depth / Hikari pool waiters; shed lowest-priority routes with 503 Retry-When once thresholds crossed.
* Priority classification annotation per endpoint (critical=payments, batch=exports); bulkhead executors isolating slow lanes from interactive.
* Load tests proving shed behavior protects p99 for critical class under 5× overload - evidence-based capacity docs.

---

### Q29: What subtle issues arise from @ConfigurationProperties relaxed binding and maps/lists?
* Relaxed binding quirks: kebab-case keys map to camelCase; LIST indices `app.items[0].name` from env vars need underscore escaping (`APP_ITEMS_0_NAME`); map keys preserve case only when bracketed `[KeyName]`.
* Duration/DataSize units parse friendly strings (30s, 10MB).
* Validation groups per profile possible; unknown-property failure modes differ (ignore-unknown-fields default hides typos - enable strict checking in CI via metadata annotations).

---

### Q30: How would you implement audit trails satisfying "who changed what when" with Envers vs hand-rolled vs CDC?
Comparison:
* Envers: entity-version tables automatic, queryable history via AuditReader; misses native SQL updates; schema weight grows.
* Hand-rolled audit service: full control/diff shaping; discipline burden on every writer.
* CDC (Debezium): captures EVERYTHING incl. manual DB ops - ops complexity, needs sink pipeline.
Choice by compliance strictness: light→Envers, strict-regulated→CDC into immutable log store with hash chaining.

### Q31: What does Spring's event type-safety look like and how do you avoid stringly-typed events?
* Typed event POJOs + `ApplicationEventPublisher.publishEvent(new OrderPlaced(id))`; listener `@EventListener` param type resolves - no string channels.
* Generics events (`EntityChanged<T>`) require ResolvableType tricks - prefer concrete records per domain.
* Transactional phases annotated explicitly; tests with `@RecordApplicationEvents` asserting published set - events become part of contract surface.

---

### Q32: How do you implement graceful degradation for read models when the primary DB fails?
Design:
* Local snapshot caches (caffeine) with stale-while-revalidate semantics serving last-good reads flagged `stale:true` in responses.
* Read-only replica promotion runbook automated (DNS/conn-string flip via config refresh).
* Circuit breaker on writes protecting queue accumulation; UX copy prepared for degraded mode.
Chaos drills prove each tier: kill primary → measure user-visible impact vs design promise.

---

### Q33: What is the correct way to expose SSE/WebFlux endpoints inside otherwise-MVC Boot apps?
* Mixing MVC + WebFlux starters is unsupported - choose one stack per service; MVC supports streaming via SseEmitter/ResponseBodyEmitter with async executors.
* SseEmitter lifecycle: complete on error/timeout callbacks, store in registry, cleanup on disconnect callbacks to prevent leaks.
* For heavy reactive needs: deploy separate reactive service behind gateway rather than hybrid dependency soup.

---

### Q34: How do you implement tenant-scoped Hibernate filters correctly with pooling pitfalls?
* @FilterDef/@Filter on entities enabled per session after tenant resolution; MUST re-enable per NEW session (filters don't persist across EMs) - central interceptor doing it prevents misses.
* Connection-provider alternative: search_path schema switching per checkout with reset on return.
* Verification: integration matrix crossing tenants × cached sessions asserting isolation; leak detector logging missing filter enables.

---

### Q35: How do you approach JVM tuning specifically for Boot microservices under k8s?
* Container-aware defaults (UseContainerSupport, MaxRAMPercentage=75) instead of fixed Xmx; G1 default, ZGC for latency-critical large heaps.
* Tiered compilation thresholds lowered for fast warmup in frequently-scaling pods; AppCDS/AOT cache improving cold starts.
* GC logs + JFR continuous recording (JDK flight recorder low overhead) feeding incident forensics.

---

### Q36: What is the difference between spring.factories legacy and new AutoConfiguration.imports file?
* Boot 2.7+ prefers META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports listing @AutoConfiguration classes; spring.factories auto-config support removed in 3.0 (still used for other listeners).
* Migration tooling flags old entries; ordering annotations (@AutoConfigureBefore/After) preserved.
SDK authors must ship BOTH formats during cross-version support windows.

---

### Q37: How would you implement a resilient scheduled batch processing framework inside Boot?
Framework pieces:
* Partitioned work discovery (range queries by pk windows), worker claim rows with skip_locked, heartbeat leases expiring dead workers, resumable checkpoints persisted per partition.
* Metrics: throughput/min, failure counts per chunk, lag behind source; DLQ for poison partitions.
* Idempotent upserts make reruns safe; end-of-run reconciliation report emitted as event.
This generalizes to migrations/backfills/syncs - one engine, many jobs.

---

### Q38: What is the correct handling of Jackson polymorphism for API payloads?
* @JsonTypeInfo(+@JsonSubTypes) or property-based discriminator (`@JsonTypeInfo(use=EXISTING_PROPERTY, property="kind")`) preventing arbitrary class instantiation from wire data.
* Unknown-subtype policy: fail vs coerce-to-unknown wrapper - forward-compat decision documented per API version.
* Security note: default typing enablement historically RCE vector - never enable globally.

---

### Q39: How do you implement request hedging/speculative execution for critical downstream reads?
Pattern:
* Fire primary; if p95 timer elapses without response, fire hedge to second instance/pool; first-winner cancels loser (careful: cancel may not stop server-side effects - hedge only idempotent reads).
* Metrics: hedge-trigger rate indicating primary flakiness; cap hedges per window preventing storm amplification.
Resilience4j lacks native hedging - hand-roll with CompletableFuture.anyOf + timeouts or use Envoy retries at mesh layer instead.

---

### Q40: What is your strategy for testing time-travel scenarios (expiry, billing cycles) in Boot tests?
* Abstract Clock bean injected everywhere; tests install MutableClock advancing explicitly - production wiring uses systemUTC.
* Scheduled tasks refactored to accept clock; integration tests trigger scheduler manually with advanced time rather than sleeping.
* Property-based generation of date ranges around DST/month boundaries catching calendar math bugs.
Ban direct Instant.now() via ArchUnit rule - enforcement makes the strategy real.

### Q41: How do you implement contract-first APIs with OpenAPI generator in a Spring team?
Flow:
* Spec authored/reviewed FIRST (oasdiff governance); generator produces interfaces + DTOs (spring generator) - controllers implement interface ensuring signature parity.
* Server validation from spec via atlassian-openapi-request-validation or generated annotations; client SDKs published per language from same source.
* Breaking-change CI gate blocks merges; versioned spec artifacts archived immutably per release.
Trade-off honesty: codegen friction vs drift elimination - teams choose per API stability class.

---

### Q42: What is the correct way to run schema-per-tenant Flyway migrations?
Mechanics:
* Custom Flyway configuration loop: for each tenant schema set search_path then migrate with tenant-tagged locations/history table (`flyway_schema_history_tenant`).
* Parallel execution bounded by pool; failure report aggregating per-tenant status with retry of failed subset only.
* New tenant provisioning template runs baseline + seed atomically; drift detection job comparing applied versions across tenants alerting skew.

---

### Q43: How do you implement virtual threads (Loom) adoption in Boot 3.2+ and what changes?
* `spring.threads.virtual.enabled=true` switches Tomcat executors/scheduling to virtual threads - blocking code scales without reactive rewrites.
* Caveats: pinning on synchronized blocks/JNI (avoid in hot paths; JFR PinningEvents monitor), thread-local heavy libraries cost memory at scale, pooled resources sized for massive concurrency now.
* Load tests recalibrated: throughput ceilings shift dramatically; capacity docs rewritten.

---

### Q44: What is your approach to securing actuator/metrics against cardinality and info leaks?
* Exposure allowlists minimal (`health,info,metrics,prometheus`); management port separate network; security per-endpoint roles.
* Metric tags audited: deny user ids/urls (http server metrics URI tag pattern-normalized); custom MeterFilter denying high-cardinality meters at registration.
* /env sanitized (show-values=never default), loggers endpoint restricted to ops role - runtime level changes audited.

---

### Q45: How would you implement an internal shared library strategy (spring-boot-starter-acme) that teams actually adopt?
Design:
* Auto-configuration providing sane defaults (observability, error envelope, security headers) with @ConditionalOnMissingBean escape hatches.
* BOM versioning aligned with Boot releases; deprecation cycle documented; example app as living documentation tested against each supported Boot minor.
* Adoption levers: golden-path template referencing starter, migration codemods, office-hours support - governance plus empathy.

---

### Q46: What is the difference between @TransactionalEventListener phases and their failure semantics?
Phases AFTER_COMMIT (default), AFTER_ROLLBACK, BEFORE_COMMIT, AFTER_COMPLETION.
* AFTER_COMMIT failures CANNOT roll back business txn - side effects must be resilient (retry/outbox) or accept loss explicitly.
* BEFORE_COMMIT can veto (throwing rolls back) but sees uncommitted data within same tx - use sparingly (validation).
* conditional `@ConditionalOn(...)` expression filtering events; multiple listeners ordering via @Order documented.

---

### Q47: How do you implement zero-trust service-to-service auth inside the cluster?
Stack:
* mTLS mesh identity (SPIFFE/SAN) proving caller pod; JWT service tokens carrying delegated user context separately.
* Spring Security oauth2ResourceServer validating audience=service-name strictly; scopes per operation.
* NetworkPolicies deny-by-default; secrets via projected volumes rotated; audit log pairs both identities per request.
Trust boundaries drawn explicitly in architecture diagrams reviewed quarterly.

---

### Q48: What is your methodology for keeping 40+ microservice dependency graphs healthy?
Program:
* Dependency dashboard (OpenAPI consumers registry, kafka topic ownership map) - visibility first.
* Contract test meshes (pact-style) gating providers on consumer expectations; deprecation windows enforced by usage telemetry floors.
* Quarterly "dependency days" batching upgrades fleet-wide with shared runbooks; canary rings by criticality tier.
Culture: upgrades are routine maintenance, not projects - budgeted continuously.

---

### Q49: How do you implement chaos experiments specifically targeting Spring resilience annotations?
Experiments wired to Resilience4j:
* Fault injection via test controller toggling downstream latency/errors per instance → assert breaker transitions (closed→open→half-open) and fallback metrics.
* Bulkhead saturation experiment verifying isolation (interactive lane unaffected while batch lane starved).
* Retry storm check: downstream outage + retries OFF vs ON comparing upstream amplification factor.
Evidence stored per experiment; unmet hypotheses create hardening tickets with owners.

---

### Q50: Deliver a closing synthesis: what makes a Spring Boot platform senior-grade?
Synthesis pillars:
* Convention WITH visibility: autoconfig magic documented via startup reports and ADRs so magic never becomes mystery.
* Data integrity owned end-to-end: migrations disciplined, transactions explicit, consistency models named.
* Operability as feature: health truthfulness, tracing completeness, capacity math written down.
* Reversibility engineered: flags, expand-contract, facade seams - decisions priced by exit cost.
* Platform empathy: golden paths maintained with the same rigor as product code, because developer velocity IS system velocity.





