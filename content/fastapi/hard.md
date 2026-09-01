# FastAPI - Hard Interview Questions

## Theory Questions & Answers

### Q1: How does FastAPI's dependency resolution graph execute internally, and what edge cases bite?
* Routes compile a dependency map at first request; solving walks sub-dependencies depth-first, honoring `use_cache` per node, injecting `request`-scoped values.
* Edge bites: same callable imported via two module paths = two identities → double resolution; class dependencies instantiate per resolution unless cached; generator dependencies nest - cleanup order is reverse-resolution.
* Security dependencies resolving BEFORE body validation: auth failures return 401 without parsing body (cheap reject path worth knowing).

---

### Q2: What does the event loop require from your handlers, and how do you prove compliance?
* Requirement: never block. Proving: loop-lag monitor (asyncio debug clock drift), otel span gaps, py-spy showing handlers inside blocking frames.
* Common offenders: requests/boto3/SQLAlchemy sync in async def, CPU-heavy JSON transforms, DNS via getaddrinfo.
* Remedies: async-native libs, `run_in_threadpool` explicit for unavoidable blocks, process pools for CPU.
CI guard: lint rules flagging known-blocking imports inside async functions.

---

### Q3: Explain contextvars propagation across tasks and middleware in FastAPI.
* Each task copies context; contextvars set in middleware ARE visible in handler because middleware awaits downstream within same context chain - but background tasks spawn AFTER response may or may not inherit depending on creation site.
* Starlette BaseHTTPMiddleware historically broke contextvar propagation into BackgroundTasks (new task context) - workarounds pass explicitly or use pure ASGI middleware.
* OTel relies on contextvars - broken propagation silently disconnects traces.

---

### Q4: Compare BaseHTTPMiddleware vs pure ASGI middleware deeply.
* BaseHTTPMiddleware wraps downstream as sub-task: enables easy request/response mutation but adds task overhead per request, historically breaks contextvars/background semantics and streaming backpressure.
* Pure ASGI `(scope, receive, send)` sees message-level events: zero overhead, full control (modify send's http.response.start headers), but more boilerplate.
Guidance: pure ASGI for hot-path cross-cutting (tracing, security headers); BaseHTTP acceptable for low-QPS conveniences.

---

### Q5: How would you implement distributed tracing end-to-end including async context?
* OpenTelemetry auto-instrumentation (fastapi/sqlalchemy/httpx) creates server span → child client spans; manual spans via tracer.start_as_current_span for service boundaries.
* Async correctness: context attached per task automatically by instrumentation; beware fire-and-forget tasks losing parent - inject context explicitly (`attach(detached_context)`).
* Sampling strategy: head probabilistic + tail keep-errors/slow at collector; propagate traceparent outbound so partner services join traces.

---

### Q6: What are the failure modes of running SQLAlchemy 2.0 async under load, and mitigations?
* MissingGreenlet on lazy loads inside loop - enforce eager loading strategy per query; repository tests assert no lazy IO.
* Pool exhaustion under bursts: queue_timeout raising TimeoutError vs unbounded wait; tune pool+overflow, add shed-load 503s.
* Transaction scope leaks: session-per-dependency with strict commit boundaries; unit-of-work wrapper for multi-repo flows.
* Connection resets post-db-failover: pre_ping + retry-once wrapper.

---

### Q7: Design multi-instance WebSocket fan-out with presence tracking.
Architecture:
* Sticky LB during handshake OR token-authenticated reconnect-anywhere design.
* Local ConnectionRegistry per pod; Redis pub/sub channel per conversation/presence-set; each pod subscribes topics its local sockets care about.
* Presence heartbeats written to redis TTL keys; offline detection via expiry rather than disconnect events alone.
* Delivery guarantees: at-most-once live + catch-up via last-event-id cursor pulling missed events from stream store.
Failure drills: kill pod mid-broadcast asserting clients reconnect + resume via cursor.

---

### Q8: How do you implement idempotent POST endpoints with exactly the Stripe-grade contract?
Components:
* Idempotency-Key header scoped by route+actor; storage table keyed (key) storing request_hash, status(mutable→settled), response snapshot, lock expiry.
* Concurrency: INSERT as arbiter (unique key); loser polls status endpoint or receives 409 Retry-After until settled; settled replays stored response byte-for-byte.
* Hash mismatch → 422 signaling misuse; TTL sweeper GCs; metrics on collision/replay rates feeding abuse detection.
Emphasize: response replay includes STATUS CODE, not just body.

---

### Q9: What strategies bound memory when streaming huge result sets to JSON?
* Serialize incrementally: generator yielding NDJSON lines or array chunks via StreamingResponse; ORM iterate with yield_per / async scalars streams.
* Pydantic serialization per-item (TypeAdapter.list only if bounded).
* Backpressure honored by ASGI send awaiting consumer; disable gzip buffering interplay carefully.
* Client contracts: pagination preferred when consumers can't stream - streaming is last resort due to retry impossibility.

---

### Q10: How does Pydantic v2's core differ architecturally and where do runtime behaviors surprise?
* Rust core compiles validators ("schema-first") - validation order/strictness differs from python loops: coercion tables stricter by default (str→int lax mode configurable).
* Surprises: custom types need __get_pydantic_core_schema__; validators returning None silently clearing fields (before-mode); serialization callbacks ordering vs v1; model_construct bypassing validation used in hot paths deliberately.
Debug tip: `model_config = ConfigDict(strict=True)` per-model tightening public boundaries while keeping lax internals.

### Q11: How would you design multi-tenancy with RLS in async SQLAlchemy + FastAPI?
* Tenant contextvar set by dependency; engine `do_connect`/checkout event issues `SET LOCAL app.tenant` inside transaction (pool reset on checkin clears).
* All queries flow through session bound to that connection - RLS enforces even forgotten WHEREs.
* Admin bypass via separate role/connection pool; migrations run with bypass role.
Test: adversarial suite crossing tenants concurrently asserting zero leakage + pool reuse counts stable.

---

### Q12: What is your strategy for schema evolution without breaking generated clients?
* OpenAPI diff gate in CI (oasdiff) failing breaking changes; version bump process for intentional breaks.
* Deprecation lifecycle: mark deprecated + Sunset header → telemetry per client-version → remove after usage floor.
* Compatibility kit: additive fields only; enums extend-only; error envelope frozen by contract tests.
Generated client regeneration PR automated - humans review diffs not schemas.

---

### Q13: How do you implement fine-grained authorization (ABAC) cleanly?
Pattern: policy module pure functions `(actor, resource, action, ctx) -> Decision`; dependencies compose policy checks with data loading.
Enforcement at TWO layers: route dependency (coarse) + repository query predicates (row filtering) preventing enumeration via 404s.
Testing: policy truth tables exhaustive; property tests asserting no combination leaks across tenants.
Anti-pattern: scattering if user.role == ... across handlers.

---

### Q14: What does graceful degradation look like for downstream failures in this stack?
Per-dependency circuit breaker (aiobreaker/purgatory): open state returns fallback/cached/default instantly; half-open probes recovery.
Bulkheads: separate httpx clients (pools) per downstream so one vendor's stall can't exhaust global sockets; timeouts distinct per class.
Response contracts: partial success shapes (`sections: {pricing: null, reason}`) documented so FE degrades gracefully too.

---

### Q15: Explain uvloop/asyncio internals relevant to performance tuning.
* uvloop replaces default selector loop with libuv - 2-4x throughput typical; watch feature parity edge cases historically.
* Tunables: loop exception handler policies, debug mode OFF in prod but ON staging catching slow callbacks (>100ms warnings), task factory for context propagation needs.
* GC interaction: high allocation rates trigger gen0 pauses visible as tail latency - reduce transient allocations (reuse buffers, orjson) and consider gc.freeze() post-warmup.

---

### Q16: How do you implement exactly-once side effects (emails/webhooks) from an API that is at-least-once?
* Outbox table committed atomically with business change; relay dispatches marking sent; consumers dedupe by event id.
* Webhook delivery: signed payloads (HMAC + timestamp window against replay), retry schedule with jitter, DLQ after threshold, manual replay admin endpoint.
* Idempotent receivers expected - document contract; monitor delivery p95 not just success rate.

---

### Q17: How do you structure configuration for multi-environment + secrets rotation?
* Settings singleton validated at import; environments layered (defaults<file<env<secrets dir).
* Rotation: DB creds via IAM-style short-lived tokens refreshed by background task rebuilding engine; JWT keys via JWKS fetch cached with kid pinning.
* Startup fails loudly listing ALL invalid fields simultaneously (not first-error) - ops friendliness detail worth mentioning.

---

### Q18: What are the pitfalls of BackgroundTasks vs arq/celery under failure, and the decision rubric?
BackgroundTasks: same-process, lost on crash/deploy, no retries, unbounded concurrency - acceptable only for discardable work.
Queues add durability/retry/rate-limiting but infra cost + serialization constraints.
Rubric: needs-to-happen (charge, email) → queue with outbox semantics; nice-to-have (cache warm) → background task. Also visibility: queues give dashboards, background tasks vanish silently - operational argument often decisive.

---

### Q19: How do you test concurrency-sensitive code (races, idempotency) deterministically?
Tools:
* anyio-based race harnesses spawning N concurrent calls against barrier-synchronized fixtures.
* Fake clocks advancing time explicitly for TTL/expiry logic.
* Testcontainers real Redis/PG exercising Lua/locks genuinely (mocked redis lies about atomicity).
* Property-based tests (hypothesis) generating op interleavings asserting invariants (no double-charge).
Determinism = controlled interleaving + controlled time + REAL backing stores for atomic primitives.

---

### Q20: How would you migrate a legacy sync Flask app onto FastAPI incrementally?
Strangler path:
1. Mount Flask WSGI app INSIDE ASGI via WSGIMiddleware - one domain, one deploy.
2. New endpoints native FastAPI behind /api/v2 router; shared auth bridge translating sessions→JWT claims.
3. Extract shared DB layer into async-capable services gradually; run both stacks off same DB with read consistency notes.
4. Traffic-shift routes per domain; delete flask when last route moves.
Rollback story per-step; contract tests pinning behavior during transition windows.

### Q21: What does the anyio task/thread model imply for your code, concretely?
* Async endpoints run as tasks on one loop; sync endpoints dispatched to worker threads (limiter-bounded).
* Mixing: calling threadpool functions from async code via run_in_threadpool returns awaitable - cancellation semantics differ (thread tasks aren't cancellable mid-run; shield accordingly).
* Task groups (anyio) give structured concurrency: child failure cancels siblings - adopt for parallel fan-outs instead of naked gather with return_exceptions masking failures.

---

### Q22: How would you build a multi-step saga endpoint (booking flow) with compensation?
Design:
* Steps modeled as list of (do, undo); execute sequentially persisting step state per completion (saga log row per step).
* Failure triggers reverse execution of completed steps' undo actions; partial-failure UX reports exact stage.
* Timeouts per step via asyncio.wait_for; external calls idempotent by saga-id keys.
* Recovery: crashed sagas resumed by scanner finding in-flight rows older than threshold - resume or compensate based on step semantics.
Interview depth: why compensation ≠ transaction rollback (side effects already left the building).

---

### Q23: How do you secure webhooks INBOUND to FastAPI (Stripe-style)?
* Raw body required for signature - read bytes before parsing (`await request.body()`), verify HMAC with provider secret + tolerance window on timestamp defeating replay.
* Route declared with custom dependency consuming Request directly bypassing pydantic pre-parse.
* Dedup by event id stored with TTL; fast 2xx ack then async processing queue - providers retry on non-2xx so never do heavy work inline.

---

### Q24: How does response caching at multiple layers coordinate (client/CDN/app)?
* Cache-Control/Vary discipline per endpoint class (public catalog long TTL + tag purge; personalized no-store).
* CDN integration: surrogate keys via extra headers; purger service invalidating on mutation events.
* App-layer memoization only for expensive pure computations with versioned keys.
Pitfall worth naming: authenticated responses cached at edge due to missing Vary - classic leak incident story.

---

### Q25: What memory growth patterns plague long-running FastAPI pods and how do you hunt them?
Patterns: unbounded module caches, contextvar leaks holding request refs via fire-and-forget tasks, httpx clients created per-request (sockets+buffers), logging handlers accumulating.
Hunting: memray live mode flamegraphs over soak window; tracemalloc top diffs; RSS-vs-heap delta indicating native leaks (uvloop/rust core rare).
Prevention: object-lifetime audits in review; max_requests-style worker recycling as band-aid with alert on recycle frequency.

---

### Q26: How would you implement server-sent events with replay support?
Design:
* Event store append-only stream (redis stream / PG logical slot / kafka) keyed per user/topic.
* SSE generator reads from stream after Last-Event-ID header cursor; heartbeats every N sec; disconnect-safe because cursor persists client-side.
* Auth re-checked per reconnect; backpressure via bounded read batches.
This converts flaky connections into resumable ones - the actual production requirement behind "SSE".

---

### Q27: What is your approach to zero-downtime schema changes feeding a FastAPI service?
Expand-contract with dual-write flags; async engine migrations executed by dedicated runner (not app boot) with advisory lock; CONCURRENTLY index builds tracked via state-only operations.
API compatibility enforced by schema-diff CI; old/new pods coexist during rollout so DB must serve both shapes.
Verification: shadow-read parity checks comparing old/new query outputs on sampled traffic before flip.

---

### Q28: How do you make OpenAPI a governed contract rather than generated afterthought?
* Schema reviewed in PRs (diff bot comments breaking changes); examples mandatory via shared factories; error envelope frozen via contract tests hitting real routes.
* Consumer-driven tests: FE team's generated client compiled against new schema in CI catching drift both directions.
* Deprecation metadata machine-readable enabling client tooling warnings automatically.
Governance turns docs into the product interface it actually is.

---

### Q29: How do you handle time/timezones/clocks correctly in a distributed FastAPI system?
Rules:
* Store UTC (timestamptz), convert at edges per user tz; never trust client clocks for ordering - use server monotonic + DB sequences for event ordering.
* Idempotency/TTL windows use authoritative source (redis TIME / DB now()) not pod clocks; NTP skew monitored.
* Deadline propagation for outbound calls honoring upstream budgets (httpx timeout composition).
Clock bugs are distributed-systems rite of passage - expect war stories here.

---

### Q30: What is the blast-radius-minimizing deployment topology for this stack?
Topology:
* Separate pools: interactive API vs streaming/websocket workers vs scheduled jobs - different sizing/failure domains.
* Per-tenant/partner canary routing at LB with automated SLO comparison; kill-switch flags per feature domain.
* Dependency bulkheads (pools per downstream) + global shed-load middleware protecting core paths.
Rehearsal: quarterly failover/fire drills with documented evidence - architecture claims verified, not assumed.

### Q31: What are the semantics of Starlette's Request.is_disconnected and reliable disconnect handling?
* is_disconnected performs a zero-timeout receive poll - racy alone; robust pattern: await receive() in parallel task and watch for http.disconnect message, or rely on cancellation of the handler task on client drop (ASGI servers cancel).
* Streaming generators get GeneratorExit/CancelledError - cleanup must be async-safe (no bare finally doing blocking IO).
* Fire-and-forget post-disconnect work must copy needed data BEFORE awaiting further - request object invalid afterwards.

---

### Q32: How would you implement a plugin system inside a FastAPI app safely?
Design:
* Plugins declare router + lifespan hooks + dependency providers via protocol; registration validates route-prefix uniqueness and DI name collisions at startup (fail-fast).
* Isolation: plugins run in same process - enforce resource budgets (db pool share, rate limits) via per-plugin dependencies; capability interfaces prevent reaching into core internals.
* Versioning: plugin API surface semver'd; host pins compatibility range.
Real-world analogies: FastAPI users' routers, VSCode extension model - cite one.

---

### Q33: How do you keep Pydantic validation from becoming your performance bottleneck?
* Profile first: TypeAdapter benchmark on representative payloads; hot endpoints often dominated by nested model construction.
* Mitigations: strict=True skipping coercion attempts, exclude defaults, reuse compiled TypeAdapters (never build models per-request), orjson-based serialization, defer heavy field validators to explicit service calls.
* For giant payloads consider streaming parse (pydantic partial iteration patterns) or raw dict passthrough with targeted checks.
Numbers habit: report µs/item before/after in review.

---

### Q34: What does production-grade logging look like for an async Python API?
* Structured JSON to stdout; contextvar-injected request_id/tenant/user-id fields; level policy per logger with dynamic override endpoint (staging).
* Async-safety: queuehandler offloading IO from loop; never log inside hot loops without sampling.
* Redaction middleware scrubbing known-sensitive keys before emission; stack traces deduplicated by fingerprint into error tracker.
Log-as-data mindset: dashboards built FROM logs replace "let me ssh and grep".

---

### Q35: How do you design health/readiness/liveness endpoints that don't lie?
* Liveness: process responsive only - no dependency checks (restart storms otherwise).
* Readiness: DB SELECT 1 with tight timeout, cache ping, migration-version match, flag-driven draining state; failing removes pod from LB gracefully.
* Startup probe gating slow warmups (pool pre-population) separate from readiness.
* Include version/build metadata endpoint for deploy verification - tiny addition, huge incident value.

---

### Q36: Explain cancellation semantics across await points and how to write cancellation-safe code.
* Cancellation = CancelledError raised at await points; must re-raise after cleanup (swallowing breaks structured concurrency).
* Cleanup: try/finally with async-safe releases; shield critical writes (`asyncio.shield`) when partial completion unacceptable - but shielded regions still need own timeout.
* Fire-and-forget tasks: hold references, attach done-callbacks logging exceptions; cancel on shutdown via task group lifespans.
Interview scenario: client disconnects mid-payment - walk exactly what cancels, what completes, what compensates.

---

### Q37: How do you implement multi-region active-active read paths while keeping writes single-region?
* Writes pinned home-region (latency cost accepted); reads served nearest replica with staleness budget per endpoint class; causal tokens (LSN/version) elevate specific follow-up reads home when consistency required.
* FastAPI layer: region-aware routing table injected via settings; health probes per region dependency.
* Conflict domains documented (which entities may never multi-master).
This question tests distributed vocabulary more than framework trivia.

---

### Q38: What is the correct way to do bulk endpoints (batch create/update) with partial success?
Contract: accept array (size-capped), process within transaction per item savepoint; response returns per-item results [{index,status,error?}] with 207-style semantics.
Concurrency: bounded parallelism for external calls; ordering guarantees documented where sequences matter.
Idempotency: batch-level key plus item-stable identifiers enabling safe retries of partial failures.

---

### Q39: How do you protect against ReDoS/parser bombs at the edge of a typed framework?
* Regex audit tooling in CI (safe-regex equivalents); input length caps enforced BEFORE regex-heavy paths (pydantic max_length first).
* Content-type strictness avoiding parser confusion; depth-limited JSON parsing config; multipart limits per file/count.
* Fuzzing scheduled against public routes; anomaly alerts on 422 spikes (probing signal).
Typed validation gives structure but not algorithmic-complexity safety - say that explicitly.

---

### Q40: Describe implementing tenant-aware caching keys and purge orchestration.
* Key grammar: `{env}:{tenant}:{entity}:{id}:{version}` - version from entity row (write bumps), avoiding scan deletes.
* Purge bus: mutation publishes invalidation events; each pod local cache subscribes (if any in-proc layers exist).
* Isolation proof: cache fuzz tests asserting cross-tenant reads impossible even with crafted ids.
Cache leaks = security incidents here, not just perf bugs.

### Q41: How do you approach capacity planning for an async API before launch?
Model inputs: expected RPS mix per endpoint, per-endpoint latency budget, payload sizes, downstream call fan-out.
Derive: worker count (loop saturation math + CPU cores), DB pool sizing (workers × concurrent db ops), threadpool tokens (sync share), redis/queue throughputs.
Validate: staged load tests at 2× projected peak watching p99 + loop lag + pool waits; document knee points and alert thresholds.
Revisit trigger calendar tied to growth metrics - capacity is a process, not a doc.

---

### Q42: What is the interplay between Pydantic settings immutability and test isolation?
* Settings instantiated at import → tests monkeypatching attributes leak across tests; fixes: factory `get_settings.cache_clear()` pattern with lru_cache, or dependency-inject Settings via Depends for overridable seams.
* Frozen models prevent accidental mutation catching config drift mid-process.
* Secrets masking in repr/serialization enforced via SecretStr - logs never leak creds even in debug dumps.

---

### Q43: How would you implement a proxy/gateway concern layer (auth forwarding) in front of many internal FastAPI services?
Gateway owns: TLS, JWT verification, request-id injection, coarse rate limits, canary routing. Services trust gateway via network policy/mTLS + re-verify minimal claims.
FastAPI side: dependency reading forwarded identity headers into typed principal object - single seam, easily overridden in tests.
Failure modes documented: gateway bypass routes blocked at network layer; header spoofing tests in CI.

---

### Q44: What is your strategy for testing time-dependent logic across the service?
* Clock abstraction injected (dependency or contextvar) - production uses real clock; tests advance virtual clock deterministically.
* TTL/expiry/scheduling tests assert behavior AT boundaries (−1ms/+1ms).
* Freezing vs advancing: freezing catches "uses now() directly" via CI check banning datetime.now outside clock module.
Time discipline prevents the classic "works until month-end billing bug".

---

### Q45: Describe a chaos-engineering experiment suite tailored to this stack.
Experiments:
* Kill pod mid-SSE stream → clients resume via cursors.
* Inject 500ms+ latency on payment downstream → breaker opens, fallback serves, alerts fire.
* Redis failover → rate limiter fail-posture verified, cache stampede protections hold.
* Deploy during load → zero-downtime assertions on drain curves.
Each experiment has hypothesis, blast-radius doc, automated evidence collection, and a resulting hardening ticket - chaos without follow-through is theater.

---

### Q46: How do you manage long-lived feature branches' integration risk in fast-moving API teams?
Practices:
* Trunk-based with flags instead of long branches; flag-scoped routers enable dark-launching endpoints (schema shipped, gated behavior).
* Contract tests run against main continuously so drift surfaces immediately.
* Migration scripts versioned alongside code enabling any-commit deployability.
Interview framing: branch longevity is an architecture smell - fix pipeline ergonomics rather than demanding discipline.

---

### Q47: How do you decide between pushing complexity into middleware vs libraries vs services?
Decision axes: reuse breadth, runtime coupling, team ownership.
* Cross-cutting EVERY request + infra-nature (tracing) → middleware.
* Domain-reusable logic needed by multiple routes/services → internal library package (versioned, tested independently).
* Stateful/independently-scalable domain capability → separate service with API contract.
Anti-pattern watchlist: business rules creeping into middleware; libraries reaching into host app state.

---

### Q48: What does observability-driven development look like day-to-day in this codebase?
Habits:
* Every new endpoint PR includes span names, metric counters (business events), log lines with stable fields - template enforces.
* Dashboards-as-code updated in same PR; alerts derived from SLO burn rates wired before launch.
* Local dev runs otel collector container so traces visible immediately - feedback loop closes early.
Result: incidents answered by querying, not by adding instrumentation during firefighting.

---

### Q49: How would you evaluate FastAPI vs Django-vs-Go choice for a NEW high-throughput service?
Evaluation frame:
* Team fluency weight first - unfamiliar speed loses to practiced correctness.
* Workload shape: IO-bound JSON APIs → FastAPI sweet spot; CPU-heavy transforms → Go/Rust advantage real; full-stack batteries needs → Django.
* Ecosystem pulls: existing SQLAlchemy/Django ORM assets tip scales.
Deliverable style answer: benchmark spike (1 week) + risk register + reversible seam design, then commit. Avoid framework-religion answers.

---

### Q50: What closing principles summarize senior-grade FastAPI engineering?
Synthesis:
* Types as contracts; schemas as products under governance.
* Event-loop hygiene treated like memory safety - continuously verified.
* DI seams everywhere: every external touch swappable, every flow testable deterministically.
* Distributed honesty: idempotency, outboxes, causal consistency named explicitly, never implied.
* Observability shipped WITH features, not after incidents.
End on reversibility: architectures valued by how cheaply they admit being wrong.





