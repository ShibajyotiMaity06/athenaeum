# Django - Medium Interview Questions

## Theory Questions & Answers

### Q1: What is the N+1 queries problem and how do select_related and prefetch_related fix it?
* Looping over `books` and touching `book.author` fires one query per book (N+1).
* **select_related** - SQL JOIN for FK/OneToOne: single query, `Book.objects.select_related("author")`.
* **prefetch_related** - second query + in-Python join for M2M/reverse FK: `Books.prefetch_related("tags")`.
* Deep paths supported (`select_related("author__profile")`), Prefetch objects allow filtered prefetches.
Detection: `django-debug-toolbar`, `nplusone`, or `assertNumQueries` in tests. Always name the detection tool - interviews love that.

---

### Q2: Explain QuerySet laziness and when queries actually execute.
* Chaining builds an abstract description; execution triggers on iteration, list(), bool(), len(), slicing with step, or pickle.
* Consequences:
  * Building then never iterating = zero cost.
  * `if queryset:` executes - surprising DB hit in conditionals; use `.exists()`.
  * Caching: results memoize on the SAME QuerySet after first evaluation; reusing a half-consumed iterator can surprise - re-chain from manager for fresh intent.

---

### Q3: What are F expressions and Q objects?
```py
from django.db.models import F, Q
Book.objects.update(views=F("views") + 1)          # atomic in SQL
Book.objects.filter(Q(year=2024) | Q(isbn__isnull=True))
```
* **F** references column values server-side - race-free increments without read-modify-write round trips.
* **Q** composes OR/NOT logic beyond implicit AND of kwargs; combinable with `&`/`|` and parentheses.
Advanced note: F also enables comparisons between fields and optimistic concurrency via conditional update returning rowcount.

---

### Q4: What is select_for_update and how do transactions work in Django?
```py
from django.db import transaction
with transaction.atomic():
    book = Book.objects.select_for_update().get(pk=pk)
    book.stock -= 1; book.save()
```
* `atomic()` wraps a block/decorator in BEGIN…COMMIT/ROLLBACK; nested atomics become savepoints.
* `select_for_update()` locks rows until commit - pair INSIDE atomic, else no-op.
* `transaction.on_commit(fn)` defers side effects (emails, cache busts) until data is durable - classic interview favorite.
Autocommit default means EVERY statement commits alone unless wrapped - say it explicitly.

---

### Q5: What signals exist and why are they risky? Alternatives?
* Built-ins: `pre_save/post_save`, `pre_delete/post_delete`, `m2m_changed`, `request_started`...
* Risks: invisible control flow (saving a model somewhere triggers email far away), hard to test/order, fire during loaddata/migrations unexpectedly.
Alternatives preferred: override `save()`/`delete()` explicitly, service layer functions, or transaction.on_commit hooks for reactions.
If signals stay: keep them thin (enqueue task only), document loudly, register receivers in AppConfig.ready().

---

### Q6: How does Django authenticate users? What lives on request.user?
* `AuthenticationMiddleware` attaches `request.user` (LazyUser resolving on first access) from session-stored `_auth_user_id` validated by hash.
* Backends pluggable (`AUTHENTICATION_BACKENDS`) - email login, LDAP, OAuth mapping to User model.
* Custom user model: `AUTH_USER_MODEL = "accounts.User"` set BEFORE first migration (AbstractUser extend or AbstractBaseUser+PermissionsMixin for full control).
Swapping later is painful - interviewers probe this early-decision trap.

---

### Q7: What are permissions and groups? How do you enforce them?
* Per-model defaults: add/change/delete/view auto-created; custom via `Meta.permissions`.
* Checks: `user.has_perm("app.add_book")`; DRF layer maps to permission_classes.
* Views: `PermissionRequiredMixin`, `@permission_required`.
* Groups bundle permissions for role assignment; object-level checks require custom backend or django-guardian.
Mention `@login_required` vs `LoginRequiredMixin` distinction as table stakes knowledge.

---

### Q8: How does Django's session engine work?
* Session middleware reads cookie `sessionid` → loads server-side data (db/cache/cache_db/signed_cookies backends).
* Data is a dict (`request.session["cart"]=...`); expiry via `SESSION_COOKIE_AGE` or browser-close flag.
* Security: HttpOnly by default; rotate session key on login (`cycle_key()`) defeating fixation; signed_cookies trades server storage for client visibility (no secrets!).
Scaling note: db sessions under heavy traffic → cache-based Redis backend.

---

### Q9: What middleware ordering rules matter?
Middleware runs top-down on request, bottom-up on response - order defines behavior:
* SecurityMiddleware early (redirects HTTPS, HSTS).
* SessionMiddleware before AuthenticationMiddleware (auth depends on session).
* GZip after content generation but before ETag-sensitive ones.
* CsrfViewMiddleware must precede views needing tokens; LocalMemoryCache experiments last.
Interview exercise: explain why swapping Session above/below CommonMiddleware breaks things subtly - show you've debugged ordering once.

---

### Q10: What is context_processors and when would you write one?
* Callables receiving `request` returning dicts merged into every template render context (`django.template.context_processors.request` gives `request`).
* Custom example: `site_settings` processor exposing branding/config so templates avoid hardcoded values.
Cost: runs per render - keep cheap, cache expensive lookups.
Alternative for view-specific data: pass explicitly or use inclusion_tags; global processors are for genuinely global values only.

### Q11: How do aggregate and annotate differ? Give real examples.
```py
from django.db.models import Count, Avg
Book.objects.aggregate(total=Count("id"), avg_price=Avg("price"))   # dict, whole table
Author.objects.annotate(book_count=Count("book"))                    # per-row virtual column
```
* `annotate` adds computed value per object enabling `.filter(book_count__gt=5)` (HAVING).
* Joins multiply rows before aggregation - `Count("book", distinct=True)` fixes inflated counts on multi-join annotates.
Classic bug interview: annotated counts double after adding a second annotate over M2M - explain the JOIN explosion and the distinct fix.

---

### Q12: What are values(), values_list() and only()/defer() for?
* `values("id","name")` / `values_list("id", flat=True)` - dict/tuple rows skipping model instantiation; huge wins for exports/JSON endpoints.
* `only("id","name")` - load subset, defer rest until accessed (then lazy fetch per field); `defer()` inverse.
* Danger: accessing deferred fields in loops silently N+1s - profile.
Rule: shape payloads at query time to match consumption; model objects are not free.

---

### Q13: What are custom managers and QuerySets? Show a pattern.
```py
class PublishedQuerySet(models.QuerySet):
    def published(self): return self.filter(status="published")

class Book(models.Model):
    objects = PublishedQuerySet.as_manager()
```
* Managers = table-level entry points; QuerySet methods = chainable domain queries (`Book.objects.published().featured()`).
* Benefits: reusable business filters, testable units, keeps views thin.
* Multiple managers allowed; `_default_manager` ordering matters for related descriptors.

---

### Q14: Explain model inheritance strategies: abstract, multi-table, proxy.
* **Abstract base**: common fields copied into children; no parent table - default choice for shared columns (timestamps mixin).
* **Multi-table**: real parent table + child OneToOne link; querying parents needs joins; polymorphism gets messy (`select_subclasses`).
* **Proxy**: same table, different Python behavior/ordering/managers - zero schema impact.
Decision sentence: "share fields → abstract; share behavior not schema → proxy; true is-a persistence → multi-table (rarely)."

---

### Q15: How do you design database indexes in Django?
* Modern: `Meta.indexes = [models.Index(fields=["status","created"])...]`; unique implies index; Postgres supports `Index(include=[...])` covering indexes.
* Composite order follows leftmost-prefix rule; filter+sort columns ordered accordingly.
* Verify with `qs.explain(analyze=True)` against production-shaped data.
Anti-patterns: indexing every field (write tax), single low-cardinality booleans alone. Indexes follow measured slow-query logs.

---

### Q16: What is select_for_update's nowait/skip_locked for? Queue-pattern walkthrough.
```py
with transaction.atomic():
    job = Job.objects.select_for_update(skip_locked=True)\
                      .filter(status="pending").first()
    job.status = "claimed"; job.save()
```
* Default locks block competing workers (serialize throughput); `nowait=True` raises instead; **skip_locked** lets N workers drain a queue concurrently without collisions.
* Lock applies to selected rows until commit; pair strictly inside atomic().
Postgres extras: `of=("self",)` limiting lock to main table vs joined relations. This snippet is a beloved senior question.

---

### Q17: How does Django Forms validation flow work?
* `is_valid()` triggers per-field pipeline (to_python → validators → clean_<field>), then object-level `clean()` for cross-field rules; failures collect into `form.errors`.
* Read results via `cleaned_data`; raise ValidationError(message, code="x") mapping to UI messages.
* ModelForms inherit model constraints; `save(commit=False)` allows pre-persist mutation (attaching request.user).
Favorite probe: where does confirm-password live? → clean() - it needs two fields.

---

### Q18: DRF serializers vs Django Forms?
* Both validate input; serializers additionally serialize ORM objects outward (JSON-ready primitives) and support nested writes.
* DRF stack: Serializer → ViewSet → Router generating REST routes; permission_classes, throttle scopes, renderer negotiation layered around.
* ModelSerializer introspects model fields; hand-written explicit serializers preferred at stable public boundaries.
One mental model across surfaces: `validate_<field>` + object-level `validate()` mirror forms exactly.

---

### Q19: What caching layers does Django offer and how do you order them?
* Backends: locmem (dev), Redis/Memcached via django-redis (prod), database.
* Granularities: per-site middleware, per-view `@cache_page`, template `{% cache %}` fragments, low-level `cache.get/set` for query results.
* Invalidation discipline: generation keys bumped on writes avoid scan deletes; redis enables `delete_pattern`.
Layer rule: cache expensive COMPUTATIONS at lowest level first; full-page caching only for truly anonymous static-ish pages.

---

### Q20: Which CBV mixins do you actually use and what caution applies?
Common set: LoginRequiredMixin, PermissionRequiredMixin, UserPassesTestMixin, SuccessMessageMixin, pagination via MultipleObjectMixin attrs.
Custom example worth citing: JSON-form mixin returning structured errors for invalid forms on XHR.
Caution: mixin MRO conflicts - two mixins overriding the same hook silently shadow each other; keep them orthogonal, document ordering requirements, prefer composing small behaviors over inheritance chains.

---

### Q21: How does i18n work end-to-end in Django?
* Mark strings via gettext/{% trans %}; makemessages extracts to .po per locale; compilemessages builds .mo (build step!).
* Resolution order: i18n_patterns URL prefix → session → Accept-Language header → LANGUAGE_CODE default.
* Localize numbers/dates via L10N settings + localize filters.
Team practice: translation CI gate failing when new strings lack msgids; translators never touch code files directly.

---

### Q22: What deployment concerns are specific to Django?
* WSGI/ASGI server (gunicorn/uvicorn workers) behind reverse proxy; DEBUG=False forces ALLOWED_HOSTS correctness.
* Static/media: collectstatic into CDN/object storage (whitenoise for simple cases); media uploads never on ephemeral disks.
* Secrets/env config, migration strategy (`migrate --check` gating deploys), health endpoints, logging config (LOGGING dict w/ structured formatters).
### Q23: How do database connection settings scale in production?
* `CONN_MAX_AGE` persistent connections reduce handshake churn; beyond one server, pgbouncer transaction pooling sits between app and Postgres.
* Caveats: pgbouncer transaction mode breaks prepared statements/`select_for_update` assumptions unless configured; read/write splitting via routers (`class PrimaryReplicaRouter`) directing reads to replicas.
* Multiple databases: `using()` on queries, atomic(using="replica") nuances - writes must route primary explicitly.

---

### Q24: What are database routers and when do you write one?
* Router class answers db_for_read/model/migrations/allows_relation - enabling replica reads, per-app sharding, or legacy DB integration.
* Rules to state: migrations need explicit allow_migrate targets; stale replica reads require stickiness strategy (recent-write window pinned to primary).
Keep routing logic centralized & tested - silent misroutes corrupt business data.

---

### Q25: Explain the migration of a large table without downtime.
Playbook:
1. Add new nullable column (metadata-only).
2. Deploy code writing both columns.
3. Backfill in batched updates (by pk ranges) with sleep/throttle watching replication lag.
4. Switch reads behind flag; verify parity via checksums.
5. Later release drops old column.
Tooling: django-postgres-extra / raw SQL CONCURRENTLY indexes; never ALTER TABLE blocking on 100M rows. Mention zero-downtime contract discipline generally.

---

### Q26: What is a data migration and how do you write one safely?
```py
def forwards(apps, schema_editor):
    Book = apps.get_model("books", "Book")
    for b in Book.objects.filter(new_field__isnull=True).iterator():
        b.new_field = compute(b); b.save(update_fields=["new_field"])
```
* RunPython with reverse code; use historical model (apps.get_model) NOT current import - schema matches that point in time.
* Safety: iterator() avoids memory blowups; batch updates; guard idempotency; separate schema vs data migrations for reviewability.

---

### Q27: What is the apps registry and AppConfig.ready() used for?
* Django populates an app registry during startup - models resolve here; importing models at module top-level of settings-era files causes AppRegistryNotReady.
* ready() registers signals, custom checks, plugin hooks after all apps loaded.
Understanding this lifecycle explains most circular-import mysteries interviewers pose.

---

### Q28: How does DRF authentication + permission layering work?
* Authentication classes identify credentials (SessionAuthentication, TokenAuthentication, JWT via simplejwt) setting request.user - failures yield 401.
* Permissions authorize (IsAuthenticated, custom object-level has_object_permission) - failures yield 403.
* Order matters: authenticate → permission → throttle → serialization.
Object-level checks must fetch scoped querysets too (defense in depth) - permission alone isn't enough if queryset leaks others' rows.

---

### Q29: What are DRF viewsets/routers buying you?
* ViewSets bundle list/retrieve/create/update/destroy logic; DefaultRouter generates URLconf automatically with browsable API root.
* Customization points: get_queryset() for user scoping, serializer_class switching by action, @action(detail=True) custom endpoints.
Trade-off: implicitness - teams document action maps or prefer explicit APViews for complex endpoints.

---

### Q30: How does DRF validation flow differ from forms?
* Serializer fields validate like form fields; object-level validate(); ModelSerializer pulls unique validators from model (UniqueTogetherValidator auto).
* Errors return field-keyed JSON enabling client-side mapping - is_valid(raise_exception=True) standardizes 400 payloads.
Nested writes need explicit create/update overrides - a classic interview probe (writable nested serializers pitfalls).

---

### Q31: What throttling strategies exist in DRF?
* AnonRateThrottle/UserRateThrottle/ScopedRateThrottle backed by cache (redis for clusters); rates like "60/min".
* Scope per endpoint class attribute; burst vs sustained via multiple throttle classes.
* Distributed correctness depends on shared cache - in-memory locmem silently breaks limits across workers (favorite gotcha).

---

### Q32: What is select_for_update's interplay with get_or_create?
Race: two processes get_or_create same row → both miss, both insert → IntegrityError on second (unique constraint saves you).
Robust pattern wraps in atomic with select_for_update on parent row serializing creation, or catches IntegrityError and re-fetches.
Explaining this race + two mitigations is a staple senior Django question.

### Q33: What are custom model fields and when to write one?
* Subclass Field implementing db_type/to_python/from_db_value; migrations autodetect changes.
* Justified: exotic column types (Postgres ArrayField/JSONB), domain primitives (Money) reused broadly.
Otherwise compose: plain columns + property wrappers - less machinery to maintain.

---

### Q34: How does ContentType framework enable generic relations?
* contenttypes catalogs installed models; GenericForeignKey = content_type + object_id pointing anywhere.
* Powers feeds/moderation/attachments across entities.
Costs: no FK integrity, awkward joins/prefetch. Prefer explicit FK unless polymorphism is genuinely required.

---

### Q35: What does django.contrib.postgres add?
* ArrayField, RangeFields, JSONB helpers, full-text SearchVector/SearchRank, trigram similarity, transaction-only extensions via migration ops.
* Example: site search on SearchRank for mid-size datasets without Elasticsearch.
Remember extension activation migrations (TrigramExtension) run in migrate.

---

### Q36: How do you profile and optimize a slow Django view?
1. Reproduce with realistic data under silk/debug-toolbar.
2. Query census: n+1 hunt, duplicate queries per template fragment.
3. EXPLAIN ANALYZE offenders; index or reshape queries.
4. Python hotspots (serialization loops) → values_list/caching chunks.
5. Re-measure; lock gains with assertNumQueries tests.
Narrating ordered diagnosis beats tool name-dropping.

---

### Q37: lazy vs immediate translation objects?
* gettext_lazy returns proxy resolved at render - required at import time (model field verbose names).
* gettext translates immediately with current locale - fine inside request handling.
Mixing wrongly yields English-only UIs under i18n; the bug interview is diagnosing exactly that.

---

### Q38: Production security settings checklist?
SECURE_SSL_REDIRECT, HSTS (seconds + subdomains + preload), SESSION/CSRF cookie Secure flags, SECURE_PROXY_SSL_HEADER behind proxies, SECURE_CONTENT_TYPE_NOSNIFF, X_FRAME_OPTIONS DENY, SESSION_COOKIE_AGE sane.
`manage.py check --deploy` audits; CSP added via middleware package with nonces.

---

### Q39: How do you secure file uploads end-to-end?
Validate extension AND sniffed content-type; cap size pre-read; regenerate filenames (never user input); store on object storage outside webroot with signed URLs; async AV scan gating availability; serve downloads with nosniff + Content-Disposition attachment for untrusted types.

---

### Q40: select_related on nullable relations & Prefetch scoping nuances?
* Nullable FK select_related uses LEFT JOIN - single row even when absent (author=None), no extra query.
* prefetch_related always second query; `Prefetch("tags", queryset=Tag.objects.filter(active=True))` scopes collections.
Nuance worth stating: very wide models can make big JOINs costlier than two queries - benchmark both directions.

### Q41: What is the difference between blank/null handling in ModelSerializer vs Form?
* Forms treat empty string as missing for strings; DRF serializers distinguish None vs "" strictly per field definitions (allow_null vs allow_empty).
* PATCH semantics: partial=True ignores absent fields entirely - required fields skipped without error.
Interview probe: how do you require a field on create but ignore on update? → extra_kwargs conditional or validate hooks checking instance presence.

---

### Q42: How do you implement soft deletes at the ORM level cleanly?
* Manager default queryset filtering `deleted_at__isnull=True` + related_name managers override; hard-delete escape hatch via _base_manager.
* Unique constraints interplay: partial unique index WHERE deleted_at IS NULL.
* Pitfalls: related object cascades bypass soft logic; admin needs explicit visibility toggle; every raw FK join elsewhere must remember the predicate - document loudly.

---

### Q43: What are database savepoints and nested atomic() semantics?
* Inner atomic blocks create SAVEPOINTs; exception inside inner rolls back to savepoint while outer may continue/commit - enabling partial failure recovery patterns.
* Exiting outer with pending inner exception still rolls everything.
* Beware side effects inside atomic that must run post-commit - use transaction.on_commit.

---

### Q44: How does Django test client differ from real WSGI behavior?
* Client bypasses sockets/middleware server layers? No - it runs full stack in-process EXCEPT static serving; but things like conditional GET header quirks and multi-part edge encodings differ subtly.
* Async views need async_client.
* For gateway-level behaviors (timeouts, chunked encoding) test against live server (LiveServerTestCase / staging).
Knowing the boundary prevents false confidence in green suites.

---

### Q45: What is the difference between TestCase and TransactionTestCase?
* TestCase wraps each test in rollback transaction - fast, but hides commit-time behaviors (on_commit callbacks don't fire unless captured).
* TransactionTestCase truncates tables between tests (slower) allowing commits, threads, on_commit testing via `captureOnCommitCallbacks`.
Choose per need; mixing ordering matters (TransactionTestCase after TestCases to avoid isolation leaks).

---

### Q46: What is assertNumQueries and why pin query counts?
```py
with self.assertNumQueries(3):
    self.client.get(url)
```
Guards against silent N+1 regressions in critical endpoints - CI fails when someone adds lazy access in a loop.
Pair with select_related fixes; keep budgets realistic (exact counts brittle → use max bounds helpers).

---

### Q47: What are signals' dispatch_uid and receiver weak references gotchas?
* Duplicate receivers fire twice unless `dispatch_uid="unique"` set (common on module reloads).
* Receivers stored weakly by default - lambdas/closures get garbage collected silently; use strong refs or named functions.
Both bugs produce "sometimes works" symptoms - classic debugging war story material.

---

### Q48: How do you structure settings for multiple environments cleanly?
Patterns: single settings package with base/dev/prod modules importing * from base; env-driven values via django-environ; secrets never committed.
12-factor alignment: config from environment; feature flags via env not code branches where possible.
Avoid: boolean soup DEBUG flags scattered - one ENV variable drives coherent profiles.

---

### Q49: What is whitenoise and when is it enough?
* Middleware serving compressed static files directly from app (hash-named via manifest) - removes CDN/nginx dependency for small-medium deployments.
* Limits: no geographic edge, no media handling; large scale still wants CDN fronting.
Perfect answer includes: hashed manifests + immutable cache headers + gzip/brotli precomputation.

---

### Q50: What is your go-to production checklist specific to Django?
Ordered: DEBUG=False + ALLOWED_HOSTS; migrate strategy gated; collectstatic+CDN; redis cache/session backends; error tracking (sentry); structured logging; health endpoints hitting DB/cache; secure headers audit via check --deploy; backup/restore rehearsal; worker queues separate from web dynos; CONN_MAX_AGE/pgbouncer sizing documented.






