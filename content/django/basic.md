# Django - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is Django and what are its core design philosophies?
* A high-level Python web framework enabling rapid development of secure, maintainable sites.
* Core philosophies: **batteries-included** (ORM, auth, admin, forms shipped), **DRY**, **explicit is better than implicit**, **loose coupling** (apps are pluggable), **security by default** (CSRF/XSS/clickjacking protections on).
* Follows the MVT pattern (Model-View-Template) — Django's flavor of MVC where templates play the "view" role and views act as controllers.

---

### Q2: Explain the MVT architecture.
* **Model**: data layer — Python classes mapping to database tables (`models.Model`), owning validation and relationships.
* **View**: request/response logic — receives HttpRequest, queries models, returns HttpResponse (function-based or class-based).
* **Template**: presentation layer — HTML with Django Template Language (`{{ variable }}`, `{% tag %}`).
Flow: URL dispatcher routes to view → view pulls data via models → renders template → response. Contrast with MVC: there is no separate controller; the framework's URLconf + view fill that role.

---

### Q3: What is the role of settings.py?
* Central configuration module: `INSTALLED_APPS`, database backends (`DATABASES`), middleware order, templates config, static/media roots, auth validators, i18n/timezone.
* Environment separation handled by reading env vars (`os.environ.get`) or splitting modules (base/dev/prod).
* Secrets never hardcoded — pulled from environment.
* Settings are import-once Python — anything can be configured programmatically, which enables dynamic overrides in tests (`override_settings`).

---

### Q4: What are apps in Django?
* Self-contained modules doing one thing ("blog", "accounts") — each with models/views/admin/tests migrations.
* Registered via `INSTALLED_APPS`; Django discovers models, signals, template tags automatically.
* Design goal: reusable/pluggable — a well-built app can drop into other projects with minimal coupling.
* Rule of thumb: new feature area ⇒ new app, not a bigger monolithic app. Cross-app imports go through services or explicit imports, avoiding circular dependencies.

---

### Q5: What is manage.py used for?
* Project-specific CLI wrapper around `django-admin`: runserver, migrate, makemigrations, shell, createsuperuser, test, collectstatic.
* Sets `DJANGO_SETTINGS_MODULE` so commands execute within your project context.
* Custom commands: add `management/commands/mytask.py` inside an app → callable as `python manage.py mytask`.
Interview tip: mention `inspectdb` (reverse-engineer models from legacy DB) as a lesser-known gem.

---

### Q6: Explain migrations — what do makemigrations and migrate do?
* `makemigrations`: diffs current model definitions against recorded migration files, generating Python change scripts (add field, alter index...).
* `migrate`: applies pending migrations to the actual database, recording them in `django_migrations`.
* Migrations are versioned code — reviewable, testable, reversible (`migrate app_name 0004` rolls back).
* Watch-outs: editing applied migrations corrupts history; model changes without migrations drift silently in prod.

---

### Q7: What is the ORM? Show a basic query.
```py
Book.objects.filter(author__name="Tolstoy", published__year__gte=2000).order_by("-published").first()
```
* Object-Relational Mapper translating Python expressions into SQL — database-portable, injection-safe by construction.
* QuerySets are lazy: no SQL runs until iteration/slicing/len; chaining composes one query.
* Field lookups (`__gte`, `__icontains`, `__in`) express WHERE clauses declaratively.
Trade-off to mention: complex analytical SQL may still warrant `.raw()` or `connection.cursor()` escapes.

---

### Q8: What is the difference between project and app?
* **Project**: the whole deployment — settings, root URLconf, one manage.py; a container.
* **App**: a pluggable submodule implementing a capability (models+views+templates+admin).
One project hosts many apps; an app ideally belongs to many projects (reusability).
Common interview trap: "can two projects share an app?" — yes, if it's packaged properly and doesn't depend on project settings beyond configuration.

---

### Q9: What does the urls.py / URL dispatcher do?
```py
urlpatterns = [
    path("books/<int:pk>/", BookDetailView.as_view(), name="book-detail"),
]
```
* Routes clean URLs to views via `path()`/`re_path()`, capturing typed parameters (`<int:pk>`, `<slug:title>`).
* `include()` mounts app-level urlconfs — namespacing via `app_name` enables reverse lookup `"books:detail"`.
* Always use named URLs + `reverse()`/`{% url %}` instead of hardcoding paths — refactors stay safe.
Ordering matters: first match wins.

---

### Q10: What is the Django admin and why is it powerful?
* Auto-generated CRUD interface built from model metadata — production-quality list filters, search, inlines, permission checks.
* Enabled by registering models in `admin.py` (`@admin.register(Book)`), customizing `ModelAdmin` (list_display, search_fields, raw_id_fields for FK perf).
* Value: instant internal tooling for ops/content teams without writing UI.
Caveat: it's an internal tool — not a customer-facing product surface; heavy customization signals you need real views.

### Q11: Compare function-based views (FBVs) and class-based views (CBVs).
* **FBV**: explicit function `(request, ...) -> response` — everything visible in one place, simplest to reason about and review.
* **CBV**: classes composing behavior via mixins (`ListView`, `DetailView`, `CreateView`) — less repetition for CRUD, but logic hides across MRO chains.
Guidance: FBV for custom/complex flows; generic CBVs for standard object pages. `django-braces`/`LoginRequiredMixin` handle common needs.
Interviewers like hearing: "I read CBVs through the MRO before editing" — shows respect for their hidden depth.

---

### Q12: How do templates work? What are template inheritance and context?
* DTL renders HTML with variable interpolation `{{ user.name }}` and tags `{% if %} {% for %} {% include %}`.
* **Inheritance**: base.html defines `{% block content %}`; child templates extend and fill blocks — site chrome written once.
* Context = dict passed by view (`render(request, "x.html", {"books": qs})`); `context_processors` inject globals (request, auth user) into every render.
* Autoescaping is ON by default — XSS-safe unless you deliberately mark safe (`|safe`, `mark_safe`) which demands sanitized input.

---

### Q13: What is the difference between render(), redirect() and HttpResponse?
* `render(request, template, ctx)` — full page render returning 200 with HTML.
* `HttpResponse("text", status=201)` — raw response construction; JSON via `JsonResponse` (serializes + correct content-type).
* `redirect(url_or_name)` — returns 302 (or 301 if specified) telling client to fetch elsewhere; use after successful POSTs (PRG pattern).
Also know: `HttpResponseNotFound`, `get_object_or_404` shortcut raising Http404 → default 404 page.

---

### Q14: What is get_object_or_404 and why prefer it over try/except?
```py
book = get_object_or_404(Book, pk=pk, is_active=True)
```
* Fetches one object or raises Http404 → Django renders the 404 handler; saves three lines of try/DoesNotExist per view.
* Accepts the same lookups as filter — conditions belong in the query, not post-fetch checks.
* Variants: `get_list_or_404` for empty-list cases.
It's the idiomatic guard for detail/edit/delete views; interviewers expect it named immediately.

---

### Q15: Explain ForeignKey, OneToOneField and ManyToManyField.
* **ForeignKey** — many-to-one: many books → one author; DB column author_id on book. `on_delete=CASCADE/PROTECT/SET_NULL` mandatory.
* **OneToOneField** — unique FK: one user ↔ one profile; reverse access `user.profile`.
* **ManyToManyField** — join table managed automatically: book.tags; supports `through=` model when the relationship carries data (date added).
Know reverse accessors (`book.author`, `author.book_set` or related_name) — `related_name` questions appear constantly.

---

### Q16: What is the purpose of related_name?
* Renames the reverse accessor from the default lowercase_set: `Author.books` instead of `author.book_set.all()`.
* Mandatory uniqueness: two FKs to same model need distinct names or Django errors.
* `'+'` disables the reverse relation entirely.
Readability win: ORM code reads like domain language — `author.books.filter(...)`. Interview follow-up: how to query the reverse relation directly → `Book.objects.filter(author=author)` or `author__in`.

---

### Q17: What does on_delete do? Compare CASCADE, PROTECT, SET_NULL.
* Fires when referenced row is deleted:
  * **CASCADE** — delete dependents too (posts die with author).
  * **PROTECT** — raise ProtectedError blocking deletion until children handled (financial records).
  * **SET_NULL** — nullify FK (requires null=True): orphaned items survive unowned.
  * Also SET_DEFAULT, DO_NOTHING (dangerous unless DB-level triggers manage it).
Choice expresses DOMAIN intent — deleting a User cascading vs protecting invoices is a business decision, not a technical default.

---

### Q18: What is makemigrations vs migrate conflict handling? What is --merge?
* Two branches both created migrations (teammates parallel work) → migration graph forks; Django refuses ambiguous order.
* `makemigrations --merge` creates a combining migration serializing both branches safely when they touch different fields.
* Prevention: small frequent migrations, rebase discipline, CI check running `makemigrations --check --dry-run` failing when models/migrations drift.
Hard truth worth stating: merged conflicts touching SAME field still need manual reconciliation of operation order.

---

### Q19: What is the Django shell used for?
* Interactive REPL inside project context: `python manage.py shell` (IPython if installed).
* Uses: quick ORM experiments, data fixes, inspecting generated SQL (`print(qs.query)`), ad-hoc scripts via `shell -c`.
* Production hygiene: write one-off fixes as reviewed scripts/management commands instead of live shell surgery; wrap mutations in transactions.
Mention `shell_plus` (django-extensions) auto-importing models — a beloved quality-of-life tool.

---

### Q20: How do you run tests in Django and what does TestCase give you?
```py
class BookTests(TestCase):
    def setUp(self): self.author = Author.objects.create(name="A")
    def test_str(self): self.assertEqual(str(self.book), "Title")
```
* `manage.py test` discovers `test*.py`; TestCase wraps EACH test in a database transaction rolled back afterward — fast isolation.
* Fixtures via factories (factory_boy) beat JSON fixtures for maintainability.
* Extras: `override_settings`, `Client()` for request-level tests, LiveServerTestCase for selenium.
Zero-config speed is why Django's testing story gets praised in interviews.

---

### Q21: What is staticfiles and collectstatic?
* Static assets live per-app `static/` dirs plus `STATICFILES_DIRS`; `collectstatic` gathers them into `STATIC_ROOT` for CDN/nginx serving in production.
* ManifestStaticFilesStorage adds hashed filenames → safe far-future caching via `{% static %}`.
* Dev runserver serves them automatically when DEBUG=True.
Media (user uploads) is a separate pipeline — never mix the two configs.

---

### Q22: null=True vs blank=True?
* `null=True` — DATABASE stores NULL (non-string columns).
* `blank=True` — VALIDATION allows empty (forms/serializers).
Strings conventionally use `blank=True` with empty-string default and keep null=False — avoiding two "empty" representations.
Gotcha: unique+null permits multiple NULLs on Postgres; conditional UniqueConstraint solves it cleanly.

---

### Q23: Which model Meta options matter most?
* `ordering` — default sort (needs index backing on big tables).
* `constraints` — UniqueConstraint/CheckConstraint push integrity to the DB layer where app validation can't be bypassed.
* `indexes`, `verbose_name(_plural)`, `default_permissions`.
Name your constraints explicitly so future migrations can alter them stably.

---

### Q24: What is get_absolute_url for?
* Model method returning canonical URL: `reverse("book-detail", args=[self.pk])`.
* Powers admin "view on site", sitemaps, email links — one object, one address.
Keeps URL knowledge on the model instead of scattered hardcoded paths across templates.

---

### Q25: How do you write custom template tags/filters?
* App package `templatetags/mytags.py` with `@register.filter` (value transforms) or `@register.simple_tag` (computed snippets); templates `{% load mytags %}` first.
* Inclusion tags render subtemplates with computed context — reusable widgets without view coupling.
Discipline: presentation shaping in filters; business logic stays in Python/views.

---

### Q26: How does CSRF protection work?
* CsrfViewMiddleware validates a per-session token submitted with unsafe methods: `{% csrf_token %}` in forms or `X-CSRFToken` header for AJAX (read from csrftoken cookie).
* Failures return 403 before your view runs.
* `@csrf_exempt` is a smell — legitimate mainly for webhooks that authenticate via signatures instead.
SameSite cookies layer on top; both together are standard posture.

---

### Q27: Walk the request/response lifecycle through middleware.
1. Server → middleware chain `__call__` top-down (pre-view work: sessions, auth attach).
2. URL resolver → view executes → response born.
3. Chain unwinds bottom-up applying response transforms (compression, headers).
View exceptions route via `process_exception`; template responses allow `process_template_response` hooks.
Bidirectional order explains nearly every "middleware didn't run" mystery.

---

### Q28: Fixtures vs factories?
* Fixtures = serialized data files loaded via loaddata — good for reference/seed data (country codes, plans).
* For tests they rot: opaque ids, merge conflicts, drift from models — factories (factory_boy) generate fresh consistent objects per test instead.
Rule of thumb interviewers accept instantly: reference data → fixtures; test data → factories.

---

### Q29: What changes when DEBUG=False?
* Real 404/500 handlers activate; ALLOWED_HOSTS enforced; automatic static serving stops; error logging/emailing engages.
Classic deploy breakage checklist item — every Django engineer has hit it once.
Security: debug pages leak settings/source fragments; DEBUG=True must never ship.

---

### Q30: How does LOGGING configuration work?
* Dict-based config: loggers (named channels), handlers (console/file/queue), formatters (plain/JSON), filters.
* Django's "django" logger surfaces request exceptions when DEBUG=False; add per-domain loggers (`logging.getLogger("billing")`) enabling targeted levels.
### Q31: What are generic class-based views you should know?
* `ListView` (paginate object lists), `DetailView`, `CreateView`/`UpdateView` (model forms + redirect), `DeleteView` (confirm page), `TemplateView`, `RedirectView`.
* Configure via attributes (`model`, `fields`, `success_url`) or overrides (`get_queryset`, `form_valid`).
* They shine for standard CRUD pages; anything bespoke usually ends clearer as FBV.

---

### Q32: How does pagination work in Django?
* `Paginator(qs, per_page)` + page number → `Page` object with items, `has_next/previous`; ListView gets it via `paginate_by`.
* Template renders windowed page links; invalid pages raise 404 (`allow_empty_first_page` nuance).
* Large-offset pagination is slow on big tables — keyset/cursor pagination for APIs at scale.

---

### Q33: What is messages framework used for?
* One-shot flash messages queued between requests via middleware+context processor: `messages.success(request, "Saved")`, displayed in base template loop over `messages`.
* Levels map to UI severity (debug→success); storage backends configurable (cookie default).
Classic PRG companion after redirects.

---

### Q34: What is the difference between request.GET and request.POST?
* Both QueryDicts (multi-value aware: `.getlist("tags")`).
* GET — query params, idempotent reads; POST — form/body data for mutations (CSRF-checked).
* Body JSON endpoints parse `request.body` manually or use DRF request.data; files live in `request.FILES`.

---

### Q35: What is a slug and why use SlugField?
* URL-safe identifier ("war-and-peace") enabling readable SEO-friendly URLs instead of raw pks.
* `SlugField(unique=True)` + prepopulated_fields in admin from title; lookups by slug need an index (unique provides one).
* Combined pattern: `/books/<int:pk>-<slug>/` gives both fast lookup and pretty URLs.

---

### Q36: What is reverse() and {% url %}?
* Reverse URL mapping: name → actual path, honoring current namespaces.
```py
reverse("books:detail", kwargs={"pk": 5})
```
Templates use `{% url 'books:detail' book.pk %}`.
Benefit: URLs defined once in urlconf; renaming paths never breaks references — hardcoded hrefs are review red flags.

---

### Q37: What is the login flow's session rotation concern?
* On privilege change (login), call `login()` which cycles the session key internally — prevents fixation where attacker pre-plants a session id.
* Manual flows must remember `request.session.cycle_key()` before writing auth state.
Pair with HttpOnly/SameSite cookies and secure flag in prod.

---

### Q38: What is @login_required vs LoginRequiredMixin?
* FBV decorator redirecting anonymous users to settings.LOGIN_URL with ?next= preserved.
* CBV mixin equivalent placed FIRST in MRO list ordering matters.
* DRF world: IsAuthenticated permission class instead. Know all three surfaces.

---

### Q39: What are management commands good for?
* Custom CLI tasks living in apps (`management/commands/send_digest.py`) — cron jobs, backfills, maintenance scripts sharing project context (ORM access).
* Options parsing via argparse add_arguments; output via self.stdout.write.
Production hygiene: idempotent, batched, logged — they run unattended at 3am.

---

### Q40: What is check framework?
* `manage.py check` runs registered system checks — misconfigurations, model errors, deprecated usage warnings.
* CI gate plus deploy gate (`manage.py check --deploy` surfacing security settings audit).
Custom checks register via AppConfig.ready for org-specific invariants (e.g., "every model has Meta.indexes on FK").

### Q41: What are template context_processors you rely on?
Built-ins: `request`, `auth` (user/permissions), `messages`, `media/static` resolvers, `tz`.
Custom example: settings processor exposing SITE_NAME/branding globally so templates never hardcode.
Cost note: runs on every render — keep cheap, cache heavy lookups.

---

### Q42: How do you serve user-uploaded files?
* FileField/ImageField storing relative path under MEDIA_ROOT; upload_to callables organizing by date/user.
* Production: object storage via django-storages (S3), serving signed URLs; validate content-type + size; never trust client filenames.
Serve uploads from a different domain/origin than the app to neutralize stored-XSS execution.

---

### Q43: What is the difference between HttpOnly session cookie and csrftoken cookie visibility?
* sessionid: HttpOnly — JS cannot read it (XSS can't steal sessions).
* csrftoken: readable by JS by design (double-submit pattern) — its safety comes from same-origin policy, not secrecy.
Explaining WHY one is hidden and the other isn't is a favorite junior-filter question.

---

### Q44: What is an AppConfig for?
* Per-app configuration class (`apps.py`) — name, label, verbose name, and crucially `ready()` hook where signal receivers register and imports with side effects belong.
* Label collisions across apps resolved here too.

---

### Q45: What is reverse lazy and when needed?
* `reverse_lazy("home")` defers URL resolution to call time — required where urlconfs aren't loaded yet (settings like LOGIN_URL, model defaults, declarative CBV attributes).

---

### Q46: What is Humanize or other contrib apps worth naming?
* django.contrib suite beyond admin/auth: humanize (intcomma/naturaltime), sitemaps, redirects (301 management in DB), flatpages, syndication feeds.
* Signals breadth of batteries-included claim with concrete examples.

---

### Q47: How do you handle timezone-aware datetimes?
* USE_TZ=True stores UTC; aware datetimes everywhere in code (`django.utils.timezone.now()`).
* Convert for display per-user via `timezone.localtime()` / template filters with active timezone.
Naive datetime mixing is the classic bug source — name the exception it raises.

---

### Q48: What is the difference between save() and update()?
* instance.save() runs full lifecycle (signals, auto_now fields) per object.
* queryset.update() issues single UPDATE bypassing signals/save logic — fast bulk changes but skips side effects.
Choosing wrongly either way is a classic bug story interviewers collect.

---

### Q49: What is bulk_create/bulk_update?
* `bulk_create(objs, batch_size=...)` single INSERT batches (skip signals/auto-pks partially); `bulk_update(objs, fields, batch_size)` efficient multi-row updates.
* Trade-offs documented above make them the default for data jobs over N-row loops.

---

### Q50: What is the first thing you check when a Django page is slow?
Methodical answer: enable debug-toolbar/silk locally → count queries (N+1 hunt) → check missing indexes via EXPLAIN → look for Python-side loops doing ORM work → caching opportunities last.
Showing an ordered diagnostic process beats guessing tools.




<!-- PART4 -->



