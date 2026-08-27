# FastAPI - Medium Interview Questions

## Theory Questions & Answers

### Q1: Explain the ASGI lifecycle and how FastAPI fits into it.
* ASGI defines a single callable `async def app(scope, receive, send)` handling HTTP/WebSocket/lifespan messages.
* Lifespan events (`@app.on_event("startup")` legacy / lifespan context manager modern) initialize pools (DB, Redis, httpx clients) once per process — dependencies then reuse them.
* Uvicorn manages the event loop; multiple worker processes each run the full lifespan.
Interview depth: explain why per-request engine creation is an anti-pattern vs lifespan-held pools.

---

### Q2: How does the dependency injection cache work and when do you bust it?
* Within ONE request, identical dependency (by callable identity + params) resolves once — `Depends(get_db)` in handler + sub-dependency shares the session.
* Bust via `use_cache=False` on Depends when you genuinely need fresh resolution (per-item security checks in loops).
* Global scope alternative: module-level singletons for cross-request sharing (connection pools) — DI is for per-request composition.

---

### Q3: Compare yield-dependencies with try/finally and their cleanup timing.
```py
async def get_db():
    async with async_session() as s:
        yield s
```
* Code before yield runs pre-handler; after-yield executes AFTER response completes (exit of context), enabling commit/rollback decisions based on exceptions propagated from handlers.
* Caveat: background tasks using that dependency may outlive — FastAPI handles ordering but long tasks should open own sessions.
Exception injection: raising inside post-yield wraps handler errors — understand interplay with custom exception middleware.

---

### Q4: How do class-based dependencies and security scopes work?
```py
class RoleChecker:
    def __init__(self, *roles): self.roles = set(roles)
    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.roles: raise HTTPException(403)

@router.post("/admin", dependencies=[Depends(RoleChecker("admin"))])
```
* Callable instances become parameterized dependencies — reusable guards.
* OAuth2 scopes: `Security(get_current_user, scopes=["items:write"])`; token contains scopes; `SecurityScopes` dependency verifies hierarchy — maps to OpenAPI security UI.

---

### Q5: What are Pydantic validators v2 and how do model_validator modes differ?
```py
@field_validator("email")
@classmethod
def normalize(cls, v): return v.lower()

@model_validator(mode="after")
def check_dates(self):
    if self.end < self.start: raise ValueError(...)
```
* field_validator runs per-field pre/post coercion (mode="before" sees raw input).
* model_validator "before" receives raw dict (cross-field normalization), "after" receives constructed model instance.
Return values replace data — forgetting to return in before-validators silently drops fields (classic bug).

---

### Q6: How do computed_field, aliases and population_by_name shape APIs?
* `@computed_field` exposes derived read-only properties in serialization/schema (full_name from parts).
* Alias support: external camelCase ↔ internal snake_case via `Field(alias="firstName")` + `populate_by_name=True` allowing both; serialization_alias controls output naming.
* Alias generator (`AliasGenerator(CamelCase...)`) standardizes whole-model conventions without per-field noise.
These knobs define your public contract ergonomics — interviews probe exact mechanics.

---

### Q7: What is BaseSettings and how do you structure configuration layers?
```py
class Settings(BaseSettings):
    database_url: PostgresDsn
    debug: bool = False
    model_config = SettingsConfigDict(env_file=".env", env_nested_delimiter="__")
```
* Validates env at startup — missing/mistyped config fails fast instead of 3am surprises.
* Layering: defaults ← .env ← real environment; secrets via `_secret` files or vault SDKs injected as env.
Anti-pattern caught: importing settings lazily everywhere — instantiate once, depend-inject where testable.

---

### Q8: How does response_model filtering interact with ORMs and lazy attributes?
* Handler returns ORM object; response_model serializes declared fields — accessing relationship attributes triggers lazy loading (sync ORM blocks loop inside async def!).
Solutions: eager-load via selectinload in query; or convert to Pydantic from_orm BEFORE returning within sync context; or use `model_validate(orm_obj, from_attributes=True)`.
Gotcha worth stating: serialization happens INSIDE event loop — any IO there stalls everyone.

---

### Q9: How do you implement pagination + filtering cleanly at scale?
Pattern:
* Common dependency `PaginationParams` yielding limit/offset with max clamps.
* Filter models: `BookFilter(BaseModel)` + manual predicate builder (or fastapi-filter lib) mapping query → SQLAlchemy where clauses safely.
* Response envelope `{items, total}` — total via count over same filters (window function COUNT(*) OVER() single-trip optimization on PG).
Cursor pagination for infinite feeds: opaque token encoding sort keys.

---

### Q10: What strategies handle long-running requests in FastAPI?
Ladder:
1. Offload CPU-bound to threadpool automatically (def endpoints) — bounded by anyio threadpool tokens (tune via `RunVar`/limiter) preventing thread exhaustion.
2. Process-pool for heavy compute (run_in_executor with ProcessPool) avoiding GIL contention.
3. Durable queues (arq/celery/dramatiq) for jobs needing retry/persistence; endpoint returns job id; status endpoint polls.
Rule: never let request lifetime exceed proxy timeouts by accident.

### Q11: How does FastAPI's OpenAPI generation customize for real-world docs?
Knobs: tags metadata (descriptions/order), operation summaries+descriptions from docstrings, `openapi_extra` merging vendor extensions, examples via `json_schema_extra` on models/params, deprecated flags, security schemes auto-included from dependencies.
Versioning strategy: separate routers per version or headers — schema documents both.
Client DX: serve generated TS client artifact in CI (openapi-typescript) keeping FE types honest.

---

### Q12: What is the difference between HTTPException, custom exceptions + handlers, and returning JSONResponse errors?
* HTTPException: quick standard envelope.
* Custom domain exceptions (`class PaymentError(AppException)`) + registered handler map to consistent business error payloads with status codes centralized — clients code against YOUR taxonomy.
* Direct JSONResponse return bypasses exception machinery; fine for bespoke one-offs but fragments conventions.
Best practice: AppError base carrying code/status; single handler serializing; logging hook inside handler keeps views clean.

---

### Q13: How do WebSockets work in FastAPI and how do you scale them?
```py
@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket.accept()
    while True:
        msg = await websocket.receive_json()
```
* Connection manager registry per process broadcasting to sockets; cross-instance fan-out via Redis pub/sub channels each worker subscribes.
* Auth at accept-time via query/header token validation before accept().
* Backpressure awareness: slow consumers need send queues with drop policies; heartbeats/pings keep proxies alive.

---

### Q14: How do you test FastAPI applications thoroughly?
* `TestClient` (httpx-based) runs ASGI in-process: unit-test routes with dependency_overrides swapping DB/auth.
* Async tests via anyio/pytest-asyncio marking; lifespan startup triggered by `with TestClient(app)` context.
* Schema tests: assert generated openapi matches snapshot catching accidental contract breaks.
* DB strategy: transactional rollback fixtures against real Postgres (testcontainers), never sqlite-for-postgres illusions.

---

### Q15: What dependency_overrides patterns keep tests honest?
```py
app.dependency_overrides[get_current_user] = lambda: test_user
app.dependency_overrides[get_db] = override_db
```
* Override at the SAME callable identity the routes reference — wrapping factories break matching.
* Cleanup fixture clearing overrides after each test prevents leakage across suites.
Anti-pattern: monkeypatching internals instead of DI seams — brittle and hides contract drift.

---

### Q16: How does FastAPI handle concurrency limits and threadpool starvation?
* Anyio threadpool executes sync endpoints/backed calls; default token count ~40 — saturation manifests as latency spikes on sync routes while async routes stay responsive.
* Tune via `anyio.to_thread.current_default_thread_limiter().total_tokens = N` at startup.
* Guard rails: classify every blocking call; prefer async-native drivers (asyncpg/httpx); monitor threadpool queue depth metric.
This question separates people who've run production async services from tutorial readers.

---

### Q17: What is response class selection (JSONResponse vs ORJSONResponse vs UJSONResponse) about?
* Default json.dumps fine for small payloads; **orjson** dramatically faster + handles datetimes/uuids natively — set `default_response_class=ORJSONResponse` app-wide.
* Streaming responses (StreamingResponse/SSE) bypass serialization for large exports/event streams.
* Content negotiation nuance: choosing renderer per endpoint when some consumers want CSV/XLSX.
Measure before switching — serialization hotspots show clearly in py-spy profiles.

---

### Q18: How do you implement file downloads/uploads robustly?
Downloads: `FileResponse(path, filename=...)` supports range requests/multipart; object-storage pattern streams via httpx passthrough with backpressure rather than buffering.
Uploads: spooled UploadFile → stream chunks to storage (no full read); validate magic bytes; enforce size via content-length precheck + streaming counter; virus scan async gating availability.
Proxy interplay: client_max_body_size alignment; disable request buffering where supported for big files.

---

### Q19: What is the role of middleware vs dependencies vs background tasks — decision boundaries?
* Middleware: cross-cutting EVERY request concerns (CORS, tracing, timing) — sees raw request/response, no DI typing.
* Dependencies: composable per-route requirements with DI graph — auth/db/pagination.
* BackgroundTasks/queues: post-response work.
Misuse smells: auth implemented as middleware (loses typed user injection), per-route CORS config, business logic in background tasks needing request-scoped context. Boundaries stated crisply earn senior credit.

---

### Q20: How do you structure a large FastAPI codebase?
Layout:
```
app/
  main.py           # app factory, routers wiring
  core/{config,security,deps}
  domains/users/{router,service,repository,schemas,models}
```
* App factory pattern (`create_app(settings)`) enables multi-config/tests.
* Services hold business logic framework-free; repositories own queries; routers stay thin translation layers.
* Dependency modules centralize DI providers; avoid circular imports via interfaces/type protocols.

### Q21: How do you manage database sessions with SQLAlchemy 2.0 async in FastAPI?
* `create_async_engine` + `async_sessionmaker`; yield-dependency provides session per request; commit on success path explicitly (or unit-of-work service).
* Lazy-load danger under async: use `selectinload/joinedload` eager loading — lazy IO in event loop raises MissingGreenlet.
* Pool sizing: pool_size+max_overflow vs server limits; NullPool for serverless-style deployments.

---

### Q22: What is SQLModel and when would you choose it over separate Pydantic+SQLAlchemy?
* SQLModel merges Pydantic validation with SQLAlchemy ORM in one class — less duplication for simple CRUD.
* Trade-offs: younger ecosystem, complex queries still fall through to SQLAlchemy core; table=False models for pure validation handy.
Verdict pattern: prototypes/small services love it; large domains often split schemas (In/Out) from ORM entities anyway.

---

### Q23: How do you version an API in FastAPI?
Options: path prefix routers (`/api/v1`), custom header negotiation, or separate app mounts.
Mechanics: shared dependencies/services across versions; per-version response models; deprecation headers (`Sunset`) on old routes; OpenAPI docs per version via nested docs urls.
Rule: never mutate a released schema shape — additive fields only; breaking = new version router.

---

### Q24: What is the dependency on `Request` object useful for?
Access raw scope: client IP (behind proxies read X-Forwarded-For with trusted proxy config), headers not modeled, request state bag for middleware-injected context (request-id), URL info for audit logging.
Also needed for manual body reads in rare streaming cases.

---

### Q25: How does RequestValidationError customization improve client DX?
Handler flattens loc tuples into dot-paths ("body.items.2.price"), maps error types to stable codes, localizes messages optionally, logs at warn with request id.
Consistency principle: same envelope as business errors minus stack noise; include `errors[]` array enabling form libraries to bind per-field.

---

### Q26: What is the correct way to run startup/shutdown logic now?
Modern lifespan:
```py
@asynccontextmanager
async def lifespan(app):
    app.state.http = httpx.AsyncClient()
    yield
    await app.state.http.aclose()
app = FastAPI(lifespan=lifespan)
```
* Replaces deprecated on_event handlers; exceptions during startup abort boot visibly.
* Access via `request.app.state.*` or dependencies reading app state.

---

### Q27: What are the options for serving static files / SPA fallback in FastAPI?
* `StaticFiles(directory=..., html=True)` mounts asset dirs; SPA catch-all route returning index.html excluding `/api` prefixes via path converters.
* Production reality: serve statics from CDN/nginx; app focuses on API — mount only for self-contained demos.

---

### Q28: How do you add request tracing/correlation IDs cleanly?
Middleware generates/inherits `x-request-id`, stores in contextvar; logging filter injects into every record; outbound httpx client adds header propagating downstream.
OpenTelemetry FastAPI instrumentation gives spans per route automatically — contextvars integrate with OTel context propagation.
Interview point: contextvars (not globals) keep concurrency-safe correlation.

---

### Q29: What is the role of `response_model_exclude_unset/exclude_none` etc.?
Serialization flags controlling output shape: exclude_unset honors exactly what caller sent (PATCH echo), exclude_none strips optional nulls for compact payloads, include list whitelisting per-call overrides of the model schema.
Subtle bug they prevent: PATCH responses accidentally nulling fields clients omitted.

---

### Q30: How do you secure admin/internal endpoints separately?
Layers: network (separate listener/port not exposed publicly), auth (role-checker dependency), plus IP allowlist middleware for ops routes; disable in public OpenAPI (`include_in_schema=False`).
Health endpoints exempt from auth but rate-limited; metrics endpoint bound to internal interface only.

### Q31: How do you handle rate limiting in FastAPI?
* slowapi (limiter wrapper) keyed by IP/user with redis backend for clusters; or custom dependency using Redis INCR+TTL Lua for atomicity.
* Headers RateLimit-* returned; 429 with Retry-After.
Distributed correctness note: per-process limits lie behind multiple workers — shared store mandatory.

---

### Q32: What is the difference between Header/Depends injection and middleware for authz decisions?
Middleware sees only request/response — no typed user, no DI graph, applies globally.
Dependencies compose per-route with type safety, overrides in tests, and can consume sub-dependencies.
Verdict: transport concerns → middleware; authorization/business gating → dependencies. Mixed teams producing both patterns for auth is a design smell.

---

### Q33: How do you stream responses (SSE/NDJSON) correctly?
```py
async def gen():
    yield f"data: {json.dumps(evt)}\n\n"
return StreamingResponse(gen(), media_type="text/event-stream")
```
* Heartbeats keep proxies alive; disable buffering headers (X-Accel-Buffering: no); client disconnect detection via request.is_disconnected polling or cancellation exception.
* Backpressure: await-able generators naturally pause on send — avoid unbounded internal queues.

---

### Q34: What is Pydantic Settings' secrets_dir / vault integration pattern?
* `secrets_dir=/run/secrets` reads docker-swarm/k8s secret files as fields — no env leaking into process listings.
* Vault path: fetch at startup into settings instance via custom sources; rotation strategy documented (restart vs dynamic reload).
Principle: validated config object is the ONLY access point — grep-enforced.

---

### Q35: What causes 422 vs 400 debates and what's the clean resolution?
FastAPI returns 422 for validation automatically; many teams prefer 400 semantics for clients.
Resolution options: override RequestValidationError handler returning 400 while preserving error payload; OR accept RFC-compliant 422 and document.
Consistency + client contract documentation matters more than the philosophical side.

---

### Q36: How do you implement idempotency keys here?
Dependency reading Idempotency-Key header → storage lookup (redis SETNX processing marker + persisted response store).
Concurrent duplicates: SETNX loser polls marker until resolved/receives 409 Retry-After; completed replays stored response verbatim; body hash mismatch → 422.
TTL cleanup job expires stale entries.

---

### Q37: What is the graceful shutdown sequence for uvicorn deployments?
SIGTERM → stop accepting new connections, finish inflight (uvicorn grace period), lifespan shutdown closes pools/clients flush buffers.
K8s: preStop sleep bridging LB propagation; readiness flipping early.
Verify by chaos kill under load asserting zero failed requests — the acceptance test.

---

### Q38: How do you profile FastAPI performance?
* py-spy top/dump on live process (no instrumentation needed) exposing hot sync paths.
* OTel spans timing dependencies/handlers; event-loop lag monitor detecting blocking calls.
* Load tooling: locust/k6 scenarios matching production shapes; watch p99 not averages.
Common finds: sync drivers inside async def, JSON serialization of giant payloads, missing pool sizing.

---

### Q39: What are the risks of `response_model=None` and returning raw dicts?
Loses output validation (internal leaks ship), docs degrade (schema unknown), refactors silently change API shape.
Acceptable only for streaming/binary or hyper-dynamic proxy endpoints — otherwise always declare models. Lint rule banning None default enforces discipline.

---

### Q40: How do you organize multi-worker deployment configuration (gunicorn+uvicorn workers)?
gunicorn -k uvicorn.workers.UvicornWorker -w N binds once per worker; N ≈ 2×cores+1 starting point adjusted by load tests; max_requests+jitter recycling against leaks.
Proxy headers: --forwarded-allow-ips trusting your LB so client IPs/scheme correct.
Zero-downtime: rolling restarts behind LB + graceful timeout alignment.

### Q41: How do you handle multi-tenancy in FastAPI services?
* Tenant resolution dependency (subdomain/header/JWT claim) storing tenant into contextvar; repositories inject `where(tenant_id=ctx)` automatically.
* RLS pairing on Postgres via SET LOCAL app.tenant per session checkout (pool reset hooks critical).
* Cache keys and queue messages carry tenant explicitly — the two classic leak vectors.

---

### Q42: What is the pattern for integrating Celery/arq with FastAPI cleanly?
* Broker initialized at lifespan; task submission returns job id stored in result backend; status endpoint polls.
* arq shares the same event loop (async native) fitting FastAPI naturally; celery suits legacy sync stacks.
* Contract: tasks receive primitive args (ids), re-fetch state inside — never serialize ORM objects through broker.

---

### Q43: How does FastAPI support OAuth2 flows concretely?
* OAuth2PasswordBearer for password flow issuing JWTs from /token endpoint; implicit/authorization-code flows documented via security schemes for third-party clients.
* Scopes wired via Security() dependencies; token payload carries scopes; UI padlock reflects requirements.
Refresh tokens: httpOnly cookies for web; rotation with reuse detection standard.

---

### Q44: What is the difference between app-level exception handlers and per-route try/except?
App handlers centralize mapping (one envelope, logging hook) — routes stay declarative.
Per-route try/except appropriate for route-specific fallback semantics (return default value instead of error).
Anti-pattern: swallowing exceptions broadly inside handlers hiding bugs — always log original traceback before transforming.

---

### Q45: What is the role of `examples`/`json_schema_extra` in real teams?
Rich examples per endpoint power docs try-it-out and contract tests; shared example factories keep fixtures consistent.
OpenAPI-driven mock servers unblock frontend before backend completion.
Small effort, large DX payoff — worth naming in reviews when missing.

---

### Q46: How do you enforce lint/type discipline on FastAPI codebases?
Stack: ruff (imports/format/rules incl. ASYNC blocking-call detectors like flake8-async equivalents), mypy strict with plugins (pydantic plugin), ban patterns via custom rules (raw dict returns, unused response_model=None).
CI gates typecheck+tests+schema-diff. Culture: annotations are contracts — untyped params rejected in review.

---

### Q47: What deployment targets suit FastAPI and what changes between them?
* Containers behind LB (gunicorn uvicorn workers) — classic.
* Serverless (Lambda/Mangum): cold starts matter, no lifespan reuse guarantees → connection via pools outside or accept overhead; streaming limited.
* Edge-ish (not typical for python). Choose by traffic shape; document pool sizing differences per target.

---

### Q48: How do you implement feature flags here without wrecking latency?
* Flags cached locally (polling service every N sec / push via redis pubsub); evaluation pure function keyed by stable user bucket.
* Dependency `feature("new_checkout")` gating routers; kill switches default-off.
Avoid per-request remote flag API calls — the latency tax shows instantly in p99.

---

### Q49: What is your incident playbook for an async Python service?
Triage: event-loop lag metric first (blocking call suspicion), threadpool saturation second, downstream dependency errors third.
Mitigations: shed load via rate limit bump, restart workers to clear stuck loops, rollback lever.
Postmortem: add regression test reproducing blocking path (loop-lag assertion in CI).

---

### Q50: What final principles would you teach a team adopting FastAPI well?
Synthesis:
* Types are the product — annotate everything, let the framework work.
* Async discipline: never block the loop; classify IO explicitly.
* DI seams everywhere make tests trivial and swaps cheap.
* Schema-first thinking: OpenAPI is a product artifact reviewed like code.
* Measure loop health continuously — async performance problems are silent until they aren't.





