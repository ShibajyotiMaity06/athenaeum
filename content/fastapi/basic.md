# FastAPI - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is FastAPI and what makes it popular?
* A modern Python framework for building APIs on standard type hints (ASGI-based, via Starlette + Pydantic).
* Headline features: automatic validation from annotations, interactive docs (Swagger/ReDoc) generated free, async-first performance, dependency injection system.
* Popularity drivers: near-Node throughput with Python ergonomics, minimal boilerplate, editor autocompletion because everything is typed.

---

### Q2: What role do type hints play in FastAPI?
* They ARE the framework contract: parameters annotated `int`, `UUID`, Pydantic models drive parsing, validation, serialization and the OpenAPI schema.
* Wrong types yield automatic 422 responses with precise error locations - no manual checking code.
* Editors autocomplete everything; mypy catches mismatches pre-runtime.
Interview line: "In FastAPI you don't validate inputs; you DECLARE them."

---

### Q3: What is a path operation? Show a basic example.
```py
@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
```
* Decorator binds HTTP method + path to function (`@app.get/post/put/delete`).
* Path parameter typed int → auto-conversion/validation.
* Optional query param `q` defaults None; return dict auto-serialized to JSON.

---

### Q4: How do query parameters work?
* Function params not in path become query params: `def list(skip: int = 0, limit: int = Query(default=10, le=100))`.
* Constraints via `Query(gt=0, max_length=...)`; alias support maps external names to pythonic ones.
* Multiple values: `tags: list[str] = Query([])` accepts `?tags=a&tags=b`.

---

### Q5: How do request bodies work with Pydantic models?
```py
class ItemIn(BaseModel):
    name: str
    price: float = Field(gt=0)
    tags: set[str] = set()

@app.post("/items")
async def create(item: ItemIn): ...
```
* POST/PUT body parsed into the model automatically; nested models validated recursively.
* Extra fields forbidden/configurable (`model_config = ConfigDict(extra="forbid")`).
* Response model (`response_model=ItemOut`) filters output shape separately from input.

---

### Q6: What is Pydantic and what does v2 change?
* Data validation/serialization library using type hints; core rewritten in Rust for v2 → massive speed gains.
* v2 changes worth naming: `model_config` replaces inner Config class, `field_validator`/`model_validator` decorators replace v1 validators, `.model_dump()` replaces `.dict()`, stricter defaults on coercion.
* Settings management via `BaseSettings` reads env vars with validation - config as code.

---

### Q7: What is automatic documentation and where does it come from?
* Every app serves `/docs` (Swagger UI) and `/redoc` plus raw OpenAPI JSON at `/openapi.json`.
* Generated from route decorators, type hints, response_model, status codes, tags, and docstrings (become descriptions).
* Customize metadata: title/version/contact at app creation; `include_in_schema=False` hides internals.
This free contract enables client generation - mention openapi-generator as workflow.

---

### Q8: What is uvicorn and how does it relate to Starlette?
* Starlette provides ASGI toolkit (routing, middleware, WebSockets); FastAPI layers API ergonomics on top.
* Uvicorn is the ASGI *server* running the app (event loop = uvloop optionally); gunicorn can manage uvicorn workers for multiprocess deploys.
Analogy for interviews: "Starlette is Flask-like micro layer; Uvicorn is gunicorn's async cousin; FastAPI adds typing-driven DX."

---

### Q9: Sync vs async def endpoints - when does each make sense?
* `async def`: I/O-bound handlers awaiting non-blocking libs (httpx, asyncpg) - high concurrency on one event loop.
* Plain `def`: FastAPI runs them in the threadpool automatically - safe for blocking SDKs (boto3, legacy DB drivers) without freezing the loop.
Anti-pattern: `async def` containing `time.sleep` or blocking driver calls - stalls EVERY request. Rule: await what's async; delegate what blocks.

---

### Q10: What are status codes handling options in FastAPI?
* Default per method (200 GET, 201 for POST with status_code param override on decorator).
* Raise `HTTPException(status_code=404, detail="Item not found")` for errors - returns {"detail": ...} envelope.
* Return `JSONResponse(status_code=201)` directly when custom headers/content needed.
Custom exception handlers map domain errors to consistent envelopes globally.

### Q11: What is dependency injection in FastAPI and why is it powerful?
```py
async def get_db() -> AsyncIterator[Session]:
    async with SessionLocal() as s:
        yield s

@app.get("/users")
async def list_users(db: Session = Depends(get_db)): ...
```
* `Depends()` declares requirements; the framework resolves them (with sub-dependencies, caching per request) before your handler runs.
* Power: swap implementations for tests via `app.dependency_overrides`, share logic (auth, pagination) declaratively, resources with `yield` get cleanup semantics.
It's the framework's answer to middleware+services, but granular and typed.

---

### Q12: How do you handle authentication in FastAPI?
* Define security scheme dependency: `OAuth2PasswordBearer(tokenUrl="/token")` returns credentials; a dependency verifies JWT and returns current user.
```py
async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> User: ...
@app.get("/me"); async def me(user: User = Depends(get_current_user)): ...
```
* Reuse by chaining: admin endpoints depend on get_current_user then check role.
* OpenAPI shows the padlock UI automatically - free docs integration.

---

### Q13: What are routers and why structure apps with them?
* `APIRouter(prefix="/users", tags=["users"])` groups related operations; app includes routers (`app.include_router(users_router)`).
* Benefits: modular files, repeated prefix/dependencies/tags declared once, versioned APIs (`/api/v1`) composed cleanly.
* Dependencies on router apply to all its routes - auth gating an entire module in one line.

---

### Q14: What middleware options exist and how do you add CORS?
```py
app.add_middleware(CORSMiddleware, allow_origins=[...], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
```
* Also GZipMiddleware, TrustedHostMiddleware; custom ASGI/HTTP middleware functions or classes supported.
* Ordering matters - added later wraps outermost.
CORS specifics to name: preflight OPTIONS handling, credentials require explicit origins (never `*`).

---

### Q15: What is response_model and why separate it from input model?
```py
@app.post("/items", response_model=ItemOut)
async def create(item: ItemIn): return orm_item
```
* Output filtering/serialization contract: removes internal fields (password_hash), adds computed fields, documents schema.
* Enables same handler serving different shapes per route/version.
Also enables response validation errors in dev catching accidental leaks early.

---

### Q16: How do you serve background tasks?
Quick: `BackgroundTasks` parameter → `tasks.add_task(send_email, email)` executed after response sent (same process).
Limits: no persistence/retry; dies with process.
Production answer: heavy/durable work goes to Celery/Dramatiq/arq queues; BackgroundTasks suits fire-and-forget light side effects (metrics flush, cache warm).

---

### Q17: What are Form/File parameters?
* `Form()` reads multipart/urlencoded fields like Query but from body; `File()` + `UploadFile` handles uploads giving spooled file object with `.filename/.content_type` plus async `.read()`.
* Size guards: stream chunks rather than read whole file for large uploads; validate content-type AND magic bytes.
Multiple files: `list[UploadFile]`.

---

### Q18: What is the difference between Path, Query, Body, Header, Cookie parameter classes?
* They declare WHERE a value comes from plus constraints/metadata (alias, examples, deprecated).
* Without them FastAPI infers location heuristically; explicit classes remove ambiguity (e.g., scalar body payloads need `Body(embed=True)`).
* All feed the OpenAPI schema - examples improve generated docs quality noticeably.

---

### Q19: What is the default automatic error format? How do you customize?
* Validation failures return 422 `{"detail": [{loc, msg, type}...]}` listing each violation path.
* Customize: override `RequestValidationError` handler returning domain envelope (flatten loc, translate messages); register via `@app.exception_handler(YourError)` for business exceptions too.
Consistency principle: clients should parse ONE error shape across the API.

---

### Q20: What does `if __name__ == "__main__": uvicorn.run(...)` do vs production run?
* Dev convenience enabling `python main.py --reload`.
* Production: uvicorn/gunicorn worker management externally - multiple workers, bind host/port, proxy headers trust, no reload.
Knowing you never ship the __main__ block as the deploy story signals operational maturity.

---

### Q21: WSGI vs ASGI in one sentence each?
* **WSGI**: synchronous callable - one request per worker thread; Flask/Django classic world.
* **ASGI**: async extension adding WebSockets/long-lived connections plus event-loop concurrency - FastAPI/Starlette territory. Uvicorn serves it.

---

### Q22: How do you bind many query params into one typed model?
```py
class Filter(BaseModel):
    q: str | None = None
    limit: int = Query(default=20, le=100)

@app.get("/items")
async def items(f: Annotated[Filter, Query()]): ...
```
* `Query()` on a model aggregates query params into one validated object - tidy signatures for option-heavy endpoints. Same pattern exists for Header()/Cookie().

---

### Q23: What does Annotated add over default-value dependency style?
* `param: Annotated[User, Depends(get_user)]` keeps the TYPE pure without default sentinels - mypy-strict friendly and the modern docs pattern. Multiple metadata stack cleanly on top.

---

### Q24: Where does an HTTPException raised inside a DEPENDENCY land relative to handler logic?
* Dependency failures resolve before body parsing and before your handler runs - cheapest rejection point for auth errors; same global exception handlers process them.

---

### Q25: What do route tags control?
* Docs organization only - grouping/sections/order in Swagger & ReDoc. Zero runtime effect; include-time tag metadata adds descriptions.

---

### Q26: How do you return HTML or plain text instead of JSON?
* Return `HTMLResponse` / `PlainTextResponse` / `Response(content, media_type=...)` directly; per-router default_response_class switches conventions wholesale.

---

### Q27: Are HEAD/OPTIONS handled?
* CORSMiddleware answers preflight OPTIONS when configured; HEAD auto-derived from GET routes. Explicit @app.head exists for custom semantics.

---

### Q28: What is `dependencies=[...]` used for on a route/router?
* Runs dependencies purely for gating side effects (auth) WITHOUT injecting values into the handler signature. Router-level lists gate whole modules uniformly.

---

### Q29: Why set explicit OpenAPI operation ids?
* Stabilizes generated client function names - auto-generated ids churn across refactors breaking codegen consumers.

---

### Q30: What does include_in_schema=False hide?
* Removes a live route from OpenAPI/docs while keeping it routable - health probes, internal endpoints, legacy paths.

---

### Q31: How are response status codes declared?
* Decorator `status_code=status.HTTP_201_CREATED` documents + defaults responses; returning JSONResponse with explicit status overrides per-call.

---

### Q32: How is `{item_id:int}` validated?
* Path converter coerces + validates; violations return automatic 422 pinpointing the path parameter - no manual checks required.

---

### Q33: What do Enum parameters give you?
* Restricted value sets rendered as Swagger UI dropdowns; invalid input returns clean 422 listing allowed choices. str-mixin enums serialize smoothly.

---

### Q34: How do you set cookies/headers alongside a normal JSON return?
* Inject `response: Response`, mutate `response.set_cookie(...)`/headers, then return your object - framework merges both into the final response.

---

### Q35: What is redirect_slashes behavior?
* Router 307-redirects trailing-slash mismatches by default; strict APIs disable it so `/items/` vs `/items` differences 404 deliberately.

---

### Q36: How should CORS origins be configured for real deployments?
* Origins list from Settings injected into CORSMiddleware; wildcard + credentials is spec-illegal - enforce explicit origin lists via config validation.

---

### Q37: What do summary/description fields feed?
* Generated documentation quality: one-line summaries + markdown descriptions (auto from docstrings). Reviewers should treat missing descriptions as incomplete PRs.

---

### Q38: What does deprecated=True produce?
* Strikethrough deprecation markers across generated docs signaling clients to migrate; pairs operationally with Sunset response headers.

---

### Q39: What is app.mount for?
* Delegating prefixes to sub-applications or StaticFiles instances - versioned splits and admin panels living beside your API with full isolation.

---

### Q40: How can CI catch accidental OpenAPI changes?
* Test asserting /openapi.json against stored snapshot (or oasdiff-style compare) - schema becomes a reviewed artifact like code.

---

### Q41: How do you handle file uploads in FastAPI?
* Use `UploadFile` and `File(...)` from `fastapi`:
```py
from fastapi import File, UploadFile

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    return {"filename": file.filename, "content_type": file.content_type, "size": len(contents)}
```
* `UploadFile` uses a SpooledTemporaryFile stored in memory until a threshold, then spills to disk - preventing memory exhaustion compared to raw `bytes = File(...)`.

---

### Q42: What is the difference between `bytes = File(...)` and `UploadFile`?
* `bytes = File(...)` loads the entire file content into memory at once as raw bytes. If a user uploads a 2 GB file, RAM spikes by 2 GB and risks an OOM crash.
* `UploadFile` exposes an async file-like interface with rolling buffer semantics, streaming chunks (`await file.read(1024)`), access to file metadata (filename, headers), and automatic cleanup.

---

### Q43: How do you read Form data in FastAPI?
* Use `Form(...)` from `fastapi` (requires `python-multipart` installed):
```py
from fastapi import Form

@app.post("/login/")
async def login(username: str = Form(...), password: str = Form(...)):
    return {"username": username}
```
* Form data is transmitted via `application/x-www-form-urlencoded` or `multipart/form-data` rather than JSON `application/json`.

---

### Q44: How do you configure global custom exception handlers in FastAPI?
* Decorate an async handler with `@app.exception_handler(ExceptionClass)`:
```py
from fastapi import Request
from fastapi.responses import JSONResponse

class ItemNotFoundException(Exception):
    def __init__(self, name: str):
        self.name = name

@app.exception_handler(ItemNotFoundException)
async def item_not_found_handler(request: Request, exc: ItemNotFoundException):
    return JSONResponse(
        status_code=404,
        content={"message": f"Item '{exc.name}' was not found in the codex."}
    )
```

---

### Q45: How can you override the default 422 RequestValidationError response?
* Register a handler for `RequestValidationError` from `fastapi.exceptions`:
```py
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"status": "error", "errors": exc.errors(), "body": exc.body}
    )
```

---

### Q46: What is the lifespan event handler in modern FastAPI applications?
* The async context manager passed to `FastAPI(lifespan=...)`, replacing deprecated `@app.on_event("startup")` and `@app.on_event("shutdown")`:
```py
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code before yield runs on startup (e.g. initialize connection pools)
    await db.connect()
    yield
    # Code after yield runs on shutdown (e.g. close connections)
    await db.disconnect()

app = FastAPI(lifespan=lifespan)
```

---

### Q47: How do you add HTTP middleware in FastAPI?
* Using `@app.middleware("http")` decorator:
```py
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response
```

---

### Q48: How do you serve static files in FastAPI?
* Mount `StaticFiles` from `fastapi.staticfiles`:
```py
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")
```
* Static assets are served efficiently via Starlette's ASGI static file handler.

---

### Q49: How do you write unit and integration tests for FastAPI with pytest?
* Use Starlette's `TestClient` (powered by `httpx`):
```py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
```

---

### Q50: How do you pass dependency overrides for testing in FastAPI?
* Mutate `app.dependency_overrides`:
```py
def override_get_db():
    return MockDatabaseSession()

app.dependency_overrides[get_db] = override_get_db

# Run tests with overridden dependencies
# Cleanup afterwards:
app.dependency_overrides.clear()
```
