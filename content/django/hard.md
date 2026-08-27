# Django - Hard Interview Questions

## Theory Questions & Answers

### Q1: How does the ORM compose SQL internally, and where does abstraction leak?
* QuerySet builds a tree of compiler nodes (WhereNode/expressions), deferred until `get_compiler().as_sql()` runs against the vendor backend.
* Leaks interviewers expect: DISTINCT + order_by on joined models forces sorting columns into SELECT breaking distinctness (fix via `.order_by()` reset or subqueries); aggregates over joins multiply rows; `extra()` escapes the model entirely.
* Vendor variance: window functions, ON CONFLICT, index hints vary by backend — portability claim has edges.
Depth signal: mention sqlcompiler alias generation and how annotate aliases collide.

---

### Q2: Explain MVCC interactions with Django ORM patterns on Postgres.
* Readers see snapshot; writers create row versions — long transactions hold vacuum behind.
* ORM hazards: iterating huge querysets inside atomic() extends transaction lifetime → table bloat; fix via iterator chunks OUTSIDE atomic or keyed batch loops each committing.
* Hot updates churn index entries (HOT updates need no index-touching columns changed) — updating indexed status column frequently defeats HOT; design indexes accordingly.
* Serialization failures under REPEATABLE READ/SERIALIZABLE require retry wrappers around atomic blocks.

---

### Q3: Design a retry-safe transactional task pattern combining atomic + on_commit + idempotency keys.
Skeleton:
```py
def transfer(src, dst, amount, idem_key):
    if Transfer.objects.filter(idem_key=idem_key).exists(): return existing
    try:
        with transaction.atomic():
            t = Transfer.objects.create(..., status="pending", idem_key=idem_key)
            accounts locked via select_for_update; balances adjusted
            transaction.on_commit(lambda: queue.enqueue("settle", t.id))
    except IntegrityError: return existing  # concurrent duplicate
```
Points: unique idem_key arbitrates concurrency; on_commit guarantees enqueue only post-commit (avoid ghost jobs); worker itself idempotent re-checking state before applying external effects.

---

### Q4: What are the internals of select_related vs prefetch_related execution, including chained Prefetch limits?
* select_related: single SQL with LEFT JOINs per relation path; alias explosion on very deep chains; nullable handled automatically.
* prefetch_related: executes IN-query per relation binding ids in Python; chunking via queryset.iterator not applicable — memory proportional to fetched set.
* Nested Prefetch objects compose filtered child sets; cannot reference sibling prefetch results within same round-trip (second-level prefetches run sequentially).
Edge worth naming: reverse one-to-one uses select_related path efficiently; reverse FK always prefetch family.

---

### Q5: How would you implement row-level security (RLS) with Postgres + Django?
* Enable RLS policies on tenant tables (`USING (tenant_id = current_setting('app.tenant')::uuid)`).
* Middleware SETs `SET LOCAL app.tenant` inside atomic block per request (connection-scoped, pooling caveats with pgbouncer transaction mode → use SET SESSION on dedicated connections).
* Django layer: manager enforces tenant filter too (defense in depth), migrations disable RLS for superuser-owned migration role.
Pitfalls: connection reuse leaking settings; bulk updates crossing tenants silently failing under policy.

---

### Q6: Compare Celery vs Dramatiq vs RQ for Django workloads; what decides?
Axes: broker features, reliability guarantees, ecosystem.
* Celery: richest (routing, retries w/ backoff+jitter, chords/chains, beat), heavier ops surface.
* Dramatiq: simpler API, sane defaults, actor-based; fewer advanced routing primitives.
* RQ: minimal Redis jobs; great for small stacks.
Decision inputs: exactly-once needs (none give it — design idempotent tasks), scheduling complexity, team familiarity, broker choice (Redis vs RabbitMQ/SQS). Include monitoring story (flower/celery events vs dead-letter dashboards).

---

### Q7: How do you make Celery tasks reliable end-to-end?
Checklist:
* Idempotency first (dedup keys, upserts) since at-least-once delivery.
* acks_late + task_reject_on_worker_lost for crash redelivery; visibility timeout tuned > longest task.
* Bounded retries with exponential backoff + jitter; terminal failures route to DLQ/alerts.
* Time limits (soft→raises, hard→kills) preventing poison workers.
* Separate queues by priority/latency class; autoscale on queue depth.
* Tracing: propagate request-id into task logs.

---

### Q8: What happens during Django's schema editor operations on Postgres, and which ALTERs are safe?
* Safe/instant: ADD COLUMN nullable (no default rewrite in modern PG), DROP COLUMN (metadata + background), RENAME, ADD CHECK NOT VALID then VALIDATE.
* Blocking hazards: ADD COLUMN volatile DEFAULT (pre-11 rewrite; PG11+ fast-path), ALTER TYPE requiring rewrite (int→text), adding NOT NULL without validation strategy, CREATE INDEX without CONCURRENTLY.
Django specifics: AddIndexConcurrently / RemoveIndexConcurrently operations (postgres backend), SeparateDatabaseAndState for manual DDL pairing with state sync.

---

### Q9: How would you debug replication lag affecting user experience in a read-replica setup?
Symptoms: stale reads right after writes ("my change vanished").
Mitigations stack:
1. Session stickiness: route reads to primary for N seconds after any write by that user (cookie/timestamp watermark).
2. LSN/GTID wait: before serving dependent read, call pg_wal_lsn_diff wait helper (pg_last_wal_replay_lsn ≥ written lsn).
3. Causal tokens in APIs (return lsn with mutation responses).
Ops: monitor replay lag metric; alert thresholds; cap heavy reporting queries to dedicated replicas with statement_timeout.

---

### Q10: Explain how you'd implement multi-tenancy: shared schema vs schema-per-tenant vs DB-per-tenant.
Trade-off matrix:
* Shared schema + tenant_id: cheapest ops, noisy-neighbor risk, RLS enforcement mandatory, index every hot query with tenant prefix.
* Schema-per-tenant: strong isolation, migrations × N cost (parallelize, track versions per tenant), connection bloat via search_path switching.
* DB-per-tenant: enterprise compliance wins, worst operational overhead (backups/monitoring fleets).
Migration tooling answers expected: per-tenant migration runner with fan-out/fail-fast reporting; tenant-aware caches keys everywhere.

### Q11: What does ASGI change for Django, and how do channels/websockets integrate?
* ASGI = async request/response + lifespan + long-lived protocol support; Django views may be sync (thread-pooled via ASGI wrapper) or async def natively.
* Mixing: calling blocking ORM inside async view blocks event loop — use `sync_to_async` (or database_sync_to_async) with careful thread-sensitivity settings.
* Channels adds consumers/routing over websocket frames + channel layers (Redis) for group fan-out and cross-process messaging.
Deployment nuance: daphne/uvicorn workers scale differently than gunicorn sync — sizing math changes.

---

### Q12: How do you safely run async code paths in an otherwise-sync Django codebase?
Rules:
* ORM is sync-only historically → wrap in `sync_to_async`; each call hops threads unless `ThreadSensitiveContext` groups them (default thread-sensitive ties to same thread per request).
* Reverse: async libraries called from sync views need `async_to_sync` managing event loop per call.
* Avoid nested event loops (async_to_sync inside running loop raises) — structure boundaries at the edges.
* Connection pools: DB connections are thread-local; async concurrency multiplies demand — pool sizing revisited.

---

### Q13: What cache invalidation strategies exist beyond delete-on-write, and their trade-offs?
* TTL-only: simple, staleness window accepted.
* Generation/version keys: bump namespace on write; old entries expire lazily — no scans, slight read amplification on bump.
* Event-driven precise deletes via signals/listeners: exact but coupling-heavy.
* Cache-aside with stale-while-revalidate serving old value while refreshing (dogpile protection via locks/single-flight).
Choose per key class: hot reads favor SWR; correctness-critical favor generation bumps.

---

### Q14: How would you implement a rate limiter in Django that works across multiple app servers?
* Shared store required: Redis INCR with EXPIRE (fixed window), or sliding-window ZSET trim+count Lua script atomicity.
* Layer at middleware keyed by user/IP + scope; DRF throttle classes already do this given redis cache backend.
* Correctness notes: clock skew avoided using Redis TIME inside Lua; burst vs sustained via token bucket hash.
* Fail posture decision documented: fail-open for catalog endpoints, fail-closed for auth.

---

### Q15: What is the N+1 writes problem in Django and how do bulk operations interact with signals?
* Loops calling save() per row: N UPDATE round trips + N signal dispatches + full validation each time.
* Fixes: queryset.update() (single SQL, skips signals/auto_now), bulk_create/bulk_update batches.
* When signals must fire: batch then manually enqueue aggregate side-effect task once (not per-row) — redesign handlers to accept collections where possible.

---

### Q16: How do you implement optimistic UI locking (version columns) with the ORM?
```py
class Doc(models.Model): version = models.IntegerField(default=1)

updated = Doc.objects.filter(pk=pk, version=old.version)\
           .update(content=new, version=old.version + 1)
if updated == 0: raise ConcurrentModification
```
* Conditional UPDATE returns rowcount — zero rows means someone else advanced version → surface merge/reload UX.
* Pairs with select_for_update pessimistic alternative; choose by contention profile (low contention → optimistic wins).

---

### Q17: How do you test transactions/locks/concurrency deterministically?
Tools:
* Two-thread race harness with barrier events + TransactionTestCase.
* `CaptureOnCommitCallbacks` asserting deferred side effects fire post-commit.
* Simulated failures: patch cursor.execute raising at Nth call verifying rollback paths.
* Postgres-level: inject lock waits via pg_sleep in SQL comment hooks; assert skip_locked behavior under parallel claimants.
Determinism comes from controlling TIME and INTERLEAVING explicitly.

---

### Q18: What observability belongs in a production Django service?
* APM/tracing (OpenTelemetry middleware emitting spans per view/query/template), structured logs w/ request-id propagated from edge headers, metrics: query durations histogram, cache hit ratio, queue depths, per-endpoint RED.
* Slow-query log integration routing into issue tracker automatically.
* Health checks distinguishing liveness (process up) vs readiness (DB/cache reachable + migrations current check via django-migration-checker style).
Alerting on burn-rate SLOs rather than static thresholds.

---

### Q19: How would you design multi-step wizard state across requests securely?
Options:
* Server-side draft model keyed by opaque token stored in session; steps validate incrementally; final commit transactional.
* Encrypted client-side state (signed blob) for stateless scale — size limits + tamper policy considerations.
* Hybrid: server holds sensitive fields; client holds non-sensitive step index.
Guards: expiry sweeps, resumability across devices only after auth binding, idempotent completion against double-submit (unique constraint on intent key).

---

### Q20: Explain contenttypes + generic relations pitfalls you've encountered operationally.
* Orphaned generic targets after deletions (no FK cascade) → periodic integrity sweeps needed.
* Query performance: filtering across generic relations requires UNION-ish patterns or denormalized indexes (target_type,target_id composite index mandatory).
* Migrations renaming target models break stored content_type references (contenttypes migration handles rename if same app detected — cross-app moves don't).
Verdict pattern: acceptable for peripheral features (flags/notes); core domain keeps explicit FKs.

### Q21: How do you implement full-text search in Postgres via Django and when do you escalate to external engines?
* Stack: SearchVectorField maintained by trigger or on_save update; queries combine SearchVector + SearchQuery + SearchRank, GIN index on vector column; trigram similarity for fuzzy titles.
* Django API: `SearchVector("title", weight="A") + SearchVector("body", weight="B")`, `SearchRank`, headroom via SearchHeadline snippet output.
Escalate to Elasticsearch/Typesense when: faceting complexity, typo-tolerance at scale, multi-tenant index isolation costs, or sync latency budgets tighten. Sync via CDC/outbox pattern.

---

### Q22: What is the difference between DEFERRABLE constraints usage and application-level checks?
* Postgres UNIQUE/FK can be DEFERRABLE INITIALLY DEFERRED — enforced at COMMIT enabling intra-transaction reordering (swap unique values between rows without intermediate violation).
* Django: UniqueConstraint(deferrable=Deferrable.DEFERRED); FKs need raw SQL migration for deferral.
Use cases: circular references seeded after both rows exist; renumbering sort orders.
Trade-off: errors surface later (at commit) with less precise context.

---

### Q23: How would you implement audit logging that captures WHO changed WHAT efficiently?
Design:
* Append-only audit table (entity_type, entity_id, actor_id, action, diff JSONB, at) written via overridden save/delete OR DB triggers (catches non-Django writes — often mandatory).
* Diff generation: django-diffy style field compare pre/post using from_db snapshot; store only changed fields.
* Volume control: partition by month, async write via on_commit queue, PII scrubbing policy applied before persist.
Read path: query per entity ordered desc; integrity via hash chaining if tamper-evidence required.

---

### Q24: How does connection lifecycle work under gunicorn workers and what breaks with forked connections?
* Workers fork after settings import; any DB connection created pre-fork shares socket → corruption. Django connects lazily post-fork (old-style preload apps caution).
* CONN_MAX_AGE persists connections between requests within worker; stale broken connections raise InterfaceError — close_old_connections middleware/task hooks handle.
* pgbouncer transaction mode forbids session state (SET, prepared statements) — adjust ORM features accordingly.
Interview probe: why does celery worker crash with "connection already closed" at 3am? Answer: max_age expiry mid-task → close_old_connections at task start.

---

### Q25: What strategies exist for zero-downtime renames of frequently used columns?
Expand-contract specifics:
1. Add new column; dual-write via save override or trigger.
2. Backfill batches; add indexes CONCURRENTLY.
3. Flip reads behind flag; verify parity checksums.
4. Remove old writes; final drop.
Django mechanics: SeparateDatabaseAndState pairing manual SQL with model state changes; avoid rename in single deploy since mixed-version workers break. Feature-flag read switch gives instant rollback lever.

---

### Q26: How do you prevent and diagnose template rendering performance issues?
Causes: O(n²) loops calling methods triggering queries inside templates (hidden N+1), giant context serialization, inclusion_tag storms.
Diagnosis: debug-toolbar panel profiling per-template render time; silk timeline; instrument custom templatetags.
Fixes: computed values passed from view, cached_fragment wrappers around expensive widgets, prefetch data upstream, replace DTL heavy logic with prebuilt JSON + client rendering when appropriate.

---

### Q27: What is the correct way to serve large exports (CSV/Excel) from Django views?
StreamingHttpResponse with generator yielding rows in chunks; iterator() on queryset with chunk_size; disable query caching per chunk; set content-disposition + nosniff.
For expensive transforms: pre-generate into object storage asynchronously returning job status URL (polling/websocket) — avoids request-lifetime coupling.
Memory math interview: "1M rows × 200B = 200MB — never buffer; stream or stage."

---

### Q28: How do you implement idempotency keys for payment-ish POST endpoints in DRF?
Flow:
1. Client sends Idempotency-Key header; middleware/controller looks up key scope (user+route).
2. Miss: create processing record (unique constraint arbitrates concurrent first arrivals — losers get 409/retry-until-resolved), execute business txn, store response snapshot, mark completed.
3. Hit completed: replay stored response verbatim; hit processing: return 409 Retry-After.
TTL sweep expires stale processing entries; hash request body mismatch → 422 client bug signal.

---

### Q29: Compare JWT vs session auth for a Django SPA + mobile audience.
Sessions: instant revocation, HttpOnly safety, server lookup cost; sticky-free scaling needs shared store (redis sessions).
JWT: stateless verification great for APIs/mobile; revocation pain solved via short access TTL + refresh rotation w/ reuse detection; storage on web must be httpOnly cookies anyway.
Hybrid standard answer: cookie sessions for web, JWT refresh flow for mobile, both backed by same user model + audit events.

---

### Q30: How would you implement feature flags with percentage rollout safely in Django?
Components: flag service (env/db-backed) evaluated per request with stable bucketing (hash(user_id) % 100 < rollout); cached resolution (short TTL) avoiding per-request hits.
Safety: kill switches defaulting off; dependency flags coordinating FE+BE; expiry reminders preventing zombie flags.
Observability: per-cohort error/latency SLO comparison automating promotion; rollback = flag flip not redeploy.
Anti-pattern naming: boolean env soup — flags need ownership metadata like real config.

### Q31: What does `python manage.py test` execution order guarantee, and why does it matter?
* Tests run grouped by class within apps alphabetically; TransactionTestCase TRUNCATES tables and resets sequences — running BEFORE TestCases poisons their assumptions (sequence drift breaks pk assertions).
* Django reorders known-safe groupings automatically; explicit ordering via test utilities (pytest-django handles isolation better).
Lesson: unexplained "works alone fails in suite" usually traces here — explain the mechanism, not just the fix.

---

### Q32: How do you implement per-tenant database routing with zero cross-tenant leakage under connection pooling?
Stack:
* Middleware resolves tenant → thread-local/contextvar.
* Router db_for_read/model returns tenant alias; connections maintained per alias in CONN settings or dynamic alias creation (`connections.databases[alias] = {...}` cached).
* Pooling: pgbouncer per-tenant pools or direct connections sized carefully; SET search_path alternative on single DB with schema-per-tenant.
Verification: adversarial test suite issuing concurrent mixed-tenant requests asserting strict separation + connection reuse counts.

---

### Q33: Explain how you'd build an outbox pattern to publish domain events reliably from Django.
Flow: business txn inserts into `outbox` table (same atomic commit) → relay worker polls/ LISTENs NOTIFY → publishes to broker marking sent with retry/backoff → consumers idempotent by event id.
Why: avoids dual-write inconsistency (DB committed but broker down).
Django specifics: on_commit NOT enough for broker durability guarantees here; outbox row IS the durability. Cleanup partitioned by created_at; monitoring lag between insert and publish.

---

### Q34: How do you handle long-running requests (reports) without tying up web workers?
Pattern ladder:
1. Async job + status endpoint (poll) or SSE/websocket completion push; store result artifact in object storage with signed URL.
2. Chunked streaming for genuinely inline generation (covered earlier) when latency bounded (<~30s).
3. Dedicated export workers queue separated from interactive traffic; concurrency caps per user preventing abuse.
UX contract: progress percentages require task-level checkpoints persisted (rows processed counter).

---

### Q35: What is your approach to dependency upgrades across a fleet of Django services?
Program:
* Central compatibility matrix (Django LTS cadence alignment); deprecation-warning CI gate (`-W error::DeprecationWarning`) forcing early fixes.
* Staging soak with production-shaped traffic replay; feature-flagged risky library swaps.
* Rollout waves by service criticality with SLO watch; documented rollback pins.
Cultural note: upgrade debt treated as capacity planning item, not heroics — quarterly allocation.

---

### Q36: How do you secure against SSRF in Django features fetching user URLs?
Controls: scheme allowlist (https), DNS resolve then validate ALL resolved IPs against blocklists (loopback/link-local/private/metadata 169.254.169.254), disable redirects or re-validate each hop, response size cap + timeout via streaming reads, egress proxy/network policy as belt-and-braces.
Historical hook: image optimizer CVEs — keep dependencies patched; log attempted violations as security signals.

---

### Q37: What does `manage.py migrate` do under concurrency of multiple deploy pods racing?
Racing pods may apply same migration simultaneously → duplicate rows in django_migrations or deadlocks on advisory-less DDL.
Mitigations: single migration runner step in pipeline before rollout; Postgres advisory lock wrapper around migrate command (django-migration-lock style); k8s initContainer/hook pattern ensuring one-time application.
Interview depth: describe django_migrations table role and idempotency semantics per backend.

---

### Q38: How would you design a permission system supporting roles + object-level sharing (like Google Docs)?
Modeling:
* Roles via groups for global capabilities; per-object ACL table (user/group × object × level) for sharing.
* Query enforcement: queryset filtering via EXISTS subquery joining ACL (custom manager `.visible_to(user)`), not post-fetch filtering.
* Caching: permission resolution cached per user+object version; invalidation hooks on ACL writes.
DRF integration: custom permission classes reading enforced querysets — authorization expressed once at data layer.

---

### Q39: What runtime self-protection measures make sense inside Django specifically?
* Strict validation boundaries (serializer parse-or-reject), parameterized queries enforced by ORM discipline + lint banning raw f-string SQL, admin URL hardening (IP allowlists, separate listener), dependency CVE gating with severity thresholds.
* Runtime: request size caps, slow-request shedding middleware, stack-trace scrubbing, security-event stream (auth failures spikes, CSRF failures clusters) into SIEM.
Positioning: layered defense assuming each layer fails independently.

---

### Q40: Walk through implementing graceful shutdown for gunicorn + celery in a Django deployment.
Web: SIGTERM → stop accepting (gunicorn master closes listeners) → drain inflight with timeout → close_old_connections → exit. preStop sleep bridges LB propagation.
Celery: warm shutdown finishes current tasks (ack_late redelivers unfinished), cold kills after hard limit; revoke queued-but-unstarted safely since tasks idempotent.
Verification: kill -9 chaos drills under load asserting zero user-visible errors — the acceptance bar.

### Q41: How does Django's password hashing stack work and how do you upgrade it live?
* PASSWORD_HASHERS ordered list; first entry = default for new hashes; login verifies against stored hasher then REHASHES transparently to preferred (upgrader pattern).
* Argon2id recommended (memory-hard) via argon2-cffi; iterations/time cost tunable per hardware.
* Migration: append new hasher on top, roll out, monitor rehash coverage metric, prune legacy hashers once zero remain.
Explains why changing order alone upgrades every user silently — elegant design worth articulating.

---

### Q42: What is the correct way to implement "email verification + invite" flows securely?
Tokens: signed timestamps (itsdangerous/TimestampSigner or Django signer) binding user+purpose+expiry; single-use enforced by storing consumed token hash (not raw) with TTL sweep.
Flows: register → unverified state gated from login; verify link sets verified; invites create inactive users accepting via token setting password (rotation on reuse detected).
Delivery resilience: async send with retry; enumeration defenses — identical responses whether email exists or not.

---

### Q43: How would you diagnose a memory leak in a long-running gunicorn worker?
Method:
1. Confirm RSS slope across requests excluding GC noise; correlate with endpoint classes.
2. Heap snapshots (memray flamegraphs / objgraph growth) diffing retained objects — chase growing type counts (querysets cached on module globals, middleware closures holding request).
3. Common Django culprits: module-level caches unbounded, logging handlers accumulating, C-extension leaks surfaced via tracemalloc absence in heap but RSS growth.
4. Fix + soak regression test asserting plateau.
Memray specifically deserves naming — it revolutionized Python leak hunting.

---

### Q44: How do you make Django templates safe against XSS while allowing rich content?
Defaults: autoescape ON everywhere; `|safe`/mark_safe only for sanitized HTML — sanitize via bleach allowlist at INGESTION (stored clean), never at render ad hoc.
Rich text pipeline: restricted editor schema → server-side sanitizer → versioned renderer; CSP nonce integration with `{% script_nonce %}`-style helpers for inline bootstrap JSON (use |escapejs for embedded data).
Audit habit: grep CI banning new `|safe` without accompanying sanitizer import.

---

### Q45: Compare caching strategies for authenticated pages where personalization blocks full-page caching.
Composition:
* ESI-style fragments (rarely available) vs client-side hydration of personalized widgets atop shared cached shell (Varnish surrogate keys invalidation per entity).
* Django-native: cache expensive shared computations low-level keyed by entity versions; render personalization server-side each time (fast enough when queries tuned).
* Edge personalization via cookie-aware CDN rules (Vary discipline!) — document Vary: Authorization pitfalls.
Decision driven by personalization surface size: small widgets → edge composition; large → accept server render cost.

---

### Q46: What is your incident response playbook specific to a Django outage?
Triage tree: error-rate spike → recent deploy/migration correlation → rollback lever (previous image + compatible migrations constraint honored); DB saturation → slow query kill procedure, pgbouncer stats, replica promotion criteria; queue backlog explosion → scale workers, shed non-critical schedules.
Comms cadence template; postmortem doc referencing timeline auto-built from traces/logs; action items tracked with owners/dates — reviewed next incident for completion.
Maturity marker: runbooks updated AFTER every incident with what was actually needed.

---

### Q47: How do you keep 200 developer-hours/year of boilerplate out of a multi-service Django org?
Leverage points:
* Service template repo (cookiecutter) shipping auth wiring, observability, health checks, Dockerfile, CI — golden path default.
* Shared internal packages: base models (UUID pk, timestamps), pagination envelope, permission primitives, testing utilities.
* Lint/config distribution (pre-commit hooks central config); ADR culture documenting deviations.
Measure adoption: % services on golden path; drift alerts via scheduled scans.

---

### Q48: When would you choose NOT to use the ORM for a feature, and what do you lose/gain?
Go raw/SQL-first when: window-function-heavy analytics, bulk ETL transforms, vendor-specific performance features (materialized CTEs), OR when DBA-owned SQL must be reused verbatim.
Gain: exact plan control, less abstraction fighting. Lose: portability, automatic field tracking, signal lifecycle, type-safety unless paired with mypy-sql/dataclasses mapping layer.
Containment rule: repository modules own raw SQL with tests pinning plans; business code stays ORM-shaped.

---

### Q49: How do you design for GDPR-ish data lifecycle (export + erase) across a Django monolith?
Inventory: PII field registry annotated on models (Meta.pii = [...]) powering tooling.
Export: per-user assembly job walking registered relations producing portable archive (JSON + files bundle) with signed download.
Erase: anonymization strategy over hard delete where FKs demand retention (replace fields with tombstone markers); cascade map tested; third-party processors notified via events.
Proof: audit trail of erasure completions; restore drills verifying backups honor deletion requests (often forgotten!).

---

### Q50: What final architectural principles would you preach for scaling Django teams and systems?
Synthesis:
* Boring core (Django+Postgres+Redis+Celery) until measured otherwise; complexity budget spent on product differentiators.
* Data integrity at DB layer (constraints, RLS, transactions) since apps evolve faster than schemas.
* Observability as first-class deliverable of every PR, not afterthought.
* Reversibility engineered via facades/flags — decisions cheap to change are cheap to make.
* Golden paths + registries scale humans; documentation-as-code scales knowledge.
Close with: frameworks age; these principles carried across three framework generations of experience.





