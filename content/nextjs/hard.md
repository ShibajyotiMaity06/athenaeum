# Next.js - Hard Interview Questions

## Theory Questions & Answers

### Q1: Detail the React Server Components (RSC) serialization protocol. How does the client-side reconciler merge the stream?
**Answer:**
* **Serialization Protocol:** Server Components compile to a **flight JSON stream** rather than HTML. This stream contains element types, props, and references to client component JS bundles (known as client references) but completely excludes the actual JS implementation of the server components.
* **Transmission:** The stream is pushed over HTTP to the client in real time as chunks resolve on the server.
* **Client-Side Merging:** The React client-side reconciler reads the stream. When it encounters a Client Component reference, it fetches the pre-chunked JS from the CDN, boots it, and instantiates the component. It then merges this virtual DOM representation into the existing DOM tree without destroying state inside active React client islands.

---

### Q2: How does the Rust-based Next.js Compiler (SWC) optimize server vs client bundle splitting?
**Answer:**
* **AST Analysis:** SWC parses the file Abstract Syntax Tree (AST) to identify exports, imports, and directives.
* **Dead Code Elimination:** When `'use client'` is declared, SWC splits the module, packaging the client dependencies into browser bundles and exporting an empty reference proxy to the server bundle.
* **Inlining and Minification:** SWC compiles TS/JSX down to native JS, inline-evaluates static conditions, strips unused code paths, and hashes chunks, executing these tasks up to 10x faster than Webpack's Babel loader.

---

### Q3: What memory leak hazards exist in Next.js Server-Side Rendering (SSR) and how do you resolve them?
**Answer:**
* **Module-Scope Singletons:** Declaring shared connections (e.g., database clients like Knex or Prisma) in the global module scope of files can create new database connections on every dynamic server-side rebuild or hot-reload.
* **Dynamic Event Listeners:** Appending events to global objects (like `process` or custom EventEmitters) inside server renders causes listeners to pile up, exhausting process memory.
* **Resolution:** Implement the singleton pattern utilizing global context caching (`globalThis` or Node's global object) to reuse active instances across compiler hot-reloads in development.

---

### Q4: Explain the difference between React Server hydration and incremental hydration of Client islands.
**Answer:**
* **React Server hydration:** Traditional React SSR hydrates the **entire** page at once. If any part of the component tree is missing its client-side JS bundle, hydration is delayed, blocking interactions.
* **Incremental Hydration:** Next.js divides Client Components into discrete boundaries (islands) wrapped in Suspense.
* **Prioritization:** Allows the browser to hydrate visible or highly interactive parts of the page first, using event delegation to record user actions on non-hydrated elements and replay them once their bundle arrives.

---

### Q5: How does Partial Prerendering (PPR) merge React's streaming HTML with static shell compilation?
**Answer:**
PPR optimizes rendering by splitting pages into a static shell and dynamic segments:
* **Build Time:** Next.js compiles layout, structural wrappers, and static components to pure HTML.
* **Request Time:** The CDN serves the static HTML shell instantly.
* **Streaming Holes:** Unresolved promises inside `<Suspense>` boundaries are left as empty placeholders. The server processes these dynamic fetches and streams the resolved HTML chunks to fill the holes, merging them without client-side navigation.

---

### Q6: Explain the request lifecycle of an App Router page through Middleware and Edge Runtime.
**Answer:**
1. **Network Entry:** Request hits the Edge routing layer (e.g., Vercel's Anycast Network).
2. **Middleware Execution:** Runs `middleware.js` in a V8 Edge sandbox. Evaluates headers, cookies, redirects, and rewrites.
3. **Route Match:** Next.js matches the path to a page segment.
4. **Server Execution (RSC):** The matched page runs on Node.js or Edge runtime. Resolves asynchronous fetches, executing database and API operations in parallel.
5. **Streaming Response:** Serializes components into flight stream payloads and streams them to the browser alongside hydration bundles.

---

### Q7: What security vulnerabilities are inherent to Server Actions and how can they be mitigated?
**Answer:**
* **Vulnerabilities:**
  * **Hidden Parameter Tampering:** Exposing dynamic database IDs as hidden fields in form actions can allow attackers to modify the ID before submitting.
  * **Authorization Bypass:** Assuming that because an Action is called from a restricted page, it is secure. Actions can be triggered directly by custom HTTP POST requests.
* **Mitigation:**
  * **Zero Trust:** Treat Server Actions as public API endpoints. Always validate session contexts, permissions, and request body structures (using schemas like Zod) inside the action itself.
  * **Encryption:** Keep IDs and dynamic session tokens encrypted using secure state variables or cookies.

---

### Q8: Explain the four layers of the Next.js cache hierarchy.
**Answer:**
* **Request Memoization:** Caches identical `fetch` calls within a single React render pass. Cleared once the request finishes.
* **Data Cache:** Persists data across user requests and builds. Configured with `{ cache: 'force-cache' }` or `unstable_cache`. Must be manually purged via revalidation.
* **Full Route Cache:** Caches compiled HTML and RSC payloads on the server. Dynamic paths or routes containing `no-store` bypass this cache.
* **Router Cache:** Client-side cache that stores visited and pre-fetched route segments in browser memory. Invalidated on browser reload or via `router.refresh()`.

---

### Q9: How do you implement cross-subdomain single sign-on (SSO) in multi-zone Next.js deployments?
**Answer:**
* **Domain Configuration:** Deploy micro-frontends on subdomains (e.g., `app.domain.com` and `checkout.domain.com`).
* **Shared Cookie Storage:** Write session tokens to the wildcard root domain (`.domain.com`) with `HttpOnly`, `Secure`, and `SameSite=Lax` configurations.
* **Validation:** Next.js Middleware on each subdomain extracts the shared cookie, verifies the cryptographically signed JWT via a shared authentication provider, and forwards the session context in the request headers.

---

### Q10: Contrast the Edge Runtime vs the Node.js Runtime in Next.js.
**Answer:**
* **Edge Runtime:** Runs inside a lightweight V8 sandbox. Features faster boot times, lower cold starts, and executes closer to the user geographically.
* **Limitations:** Lacks standard Node.js APIs (e.g., `fs`, native C++ addons). Memory and file-size execution limits are strictly enforced.
* **Node.js Runtime:** Runs on a full Node.js server. Access to the complete npm ecosystem and standard backend libraries. Higher latency and resource footprints.

---

### Q11: How do Nested Layouts affect memory consumption and DOM element propagation?
**Answer:**
* **Memory footprint:** Each nested level of `layout.js` retains its state and DOM tree during client-side navigations. In deeply nested layouts, memory usage can grow as components are held in memory.
* **DOM Nesting:** Next.js nests layout containers in the DOM hierarchy (e.g., Layout 1 wraps Layout 2, which wraps Page). To optimize performance, keep layouts lean and avoid using heavy client state or deep HTML nesting in structural layouts.

---

### Q12: How does React's `use` hook work with promises in Client Components, and how does it affect rendering?
**Answer:**
* **How it works:** Unlike standard hooks, `use()` can be called conditionally or inside loops.
* **Execution:** If passed a Promise, it suspends rendering of the Client Component until the promise resolves.
* **Error handling:** Requires wrapping the component inside a parent `<Suspense>` boundary (for loading states) and an Error Boundary (to catch rejected promises).

---

### Q13: How do you debug high TTFB (Time to First Byte) in production Next.js applications?
**Answer:**
1. **Isolate Server Actions:** Check database queries, external API latency, and blocking backend processes during rendering.
2. **Profiling:** Inject OpenTelemetry or APM metrics (like Sentry or Datadog) to measure server execution phases.
3. **Identify Blocking Fetches:** Look for un-cached, sequential `await` calls that block the rendering stream.
4. **Edge Optimization:** Use streaming layouts (`loading.js`) to serve static shells instantly and lower TTFB.

---

### Q14: How do you architect a multi-tenant application in Next.js using dynamic middleware rewrites?
**Answer:**
* **Tenant Isolation:** Use wildcard routing patterns.
* **Flow:**
  1. Middleware intercepts the incoming request.
  2. Parse the hostname (e.g., `tenant1.app.com`).
  3. Query database or cache to verify tenant eligibility.
  4. Rewrite the internal path dynamically using `NextResponse.rewrite()` to point to a hidden route folder: `/tenants/tenant1/dashboard`.
  5. The end-user sees their custom domain path seamlessly.

---

### Q15: How do you handle real-time WebSocket connections in Next.js?
**Answer:**
Next.js serverless functions (like Route Handlers or Vercel Serverless) cannot hold persistent WebSocket connections open.
* **Architectural Options:**
  1. **Standalone Node Server:** Run Next.js in standalone node mode and attach a custom `ws` or `socket.io` server to the Node.js server instance.
  2. **External Gateway:** Use a dedicated external WebSocket gateway (e.g., Pusher, AWS API Gateway, or Ably) to manage connections, and trigger real-time updates from Next.js via standard HTTP POST calls.

---

### Q16: How does the `unstable_cache` API prevent data leakage in multi-tenant systems?
**Answer:**
Using custom cache keys to isolate cached data:
* **Risk:** Sharing cached database queries across tenants can leak sensitive data.
* **Resolution:** Ensure the dynamic tenant ID is included in the cache key array passed to `unstable_cache`. This isolates cached data for each tenant:
  ```javascript
  const getTenantData = unstable_cache(
    async () => fetchDb(),
    ['tenant-data', tenantId], // Scopes the cache to this specific tenant
    { revalidate: 3600 }
  );
  ```

---

### Q17: Explain the structure and purpose of the `.next` build output folder.
**Answer:**
* **`.next/server`:** Contains compiled server-side routes, Server Components, Route Handlers, and static files used during server pre-rendering.
* **`.next/static`:** Contains hashed JS, CSS, and asset bundles served directly to clients from the CDN.
* **Build Manifests:** Files like `required-server-files.json` and `routes-manifest.json` outline routing redirect tables, route matching patterns, and runtime dependencies.

---

### Q18: What is the impact of HTTP/3 multiplexing on Next.js asset loading?
**Answer:**
* **Multiplexing:** HTTP/3 allows loading multiple JavaScript, CSS, and image chunks in parallel over a single UDP connection without blocking other assets (solving head-of-line blocking).
* **Chunking Optimization:** Next.js leverages this by breaking bundles into smaller, highly modular files. This improves performance because only changed files are re-downloaded, while the rest are loaded instantly from the browser cache.

---

### Q19: How do you implement Incremental Static Regeneration (ISR) when deploying Next.js on non-Vercel platforms?
**Answer:**
Deploying Next.js on standard CDNs (like Cloudflare or Akamai) requires manual cache invalidation logic:
* **Bypass Strategy:** CDNs cache HTML files. If Next.js runs behind an external CDN, ISR updates are not automatically reflected in the CDN cache.
* **Resolution:** Configure the CDN to respect cache headers, or use on-demand revalidation to trigger webhook calls that purge the CDN's cache when Next.js updates.

---

### Q20: How do you prevent sensitive server-only environment variables from leaking to the client?
**Answer:**
* **Prefix Isolation:** Ensure that sensitive keys (like database passwords or private API keys) are **never** prefixed with `NEXT_PUBLIC_`.
* **Build-Time Verification:** Use the `server-only` package in modules that import sensitive keys.
* **Runtime Verification:** Use libraries like `t3-env` to validate and enforce that server-only variables are never bundled or accessed on the client side.

---

### Q21: What is the "double hydration" problem and how does Next.js mitigate it?
**Answer:**
* **The Problem:** In traditional React hydration, the entire page is rendered on the server, then rendered again on the client to attach event handlers. This duplicate work can block the main thread.
* **Next.js Mitigation:** By splitting pages into Server and Client Components, Next.js only hydrates the interactive Client Components. Server Components skip hydration entirely, reducing blocking times.

---

### Q22: How do you configure a monorepo containing multiple Next.js apps with Turborepo?
**Answer:**
* **Shared Packages:** Create shared workspaces for components (e.g., `packages/ui`), utility libraries (`packages/utils`), and TS configs (`packages/tsconfig`).
* **Caching:** Configure `turbo.json` to cache build tasks and assets, allowing Turborepo to reuse cached builds if files have not changed.
* **Compilation:** Use Next.js transpilation (`transpilePackages: ['@repo/ui']` in `next.config.js`) to import and build shared TS components.

---

### Q23: How do you manage server-side hydration when using state management libraries like Zustand?
**Answer:**
Zustand stores are typically singletons, which can lead to data leaks or synchronization issues between the server and client:
* **The Issue:** A shared singleton store on the server can leak data between different user requests.
* **Resolution:** Create a custom hook or provider that instantiates a new Zustand store instance for each individual request:
  ```javascript
  const StoreContext = createContext();
  // Instantiates a fresh, isolated store instance per request inside a Provider wrapper
  ```

---

### Q24: What is a Multi-Zone setup in Next.js, and when should you use it?
**Answer:**
Multi-Zone allows deploying multiple independent Next.js applications under a single shared domain.
* **How it works:** Rewrite rules route specific paths to different apps (e.g., `/blog` to App A, `/checkout` to App B).
* **Use Case:** Scaling large projects with independent, decentralized teams, or splitting a large codebase into smaller, more manageable apps.

---

### Q25: Contrast `dynamicParams = true` vs `dynamicParams = false` in `generateStaticParams`.
**Answer:**
* **`dynamicParams = true` (Default):** If a user requests a path that was not generated at build time, Next.js dynamically pre-renders the page on the server and caches it for future requests (similar to ISR fallback).
* **`dynamicParams = false`:** If a path is not generated at build time, Next.js immediately returns a `404 Not Found` page, preventing any dynamic rendering at runtime.

---

### Q26: How do you configure a Content Security Policy (CSP) with secure nonces in Next.js?
**Answer:**
A CSP restricts unauthorized scripts. To allow secure Next.js scripts, use a secure cryptographic nonce:
* **Implementation:** Generate a random base64 nonce inside Next.js Middleware on every request, append it to the CSP header, and forward the nonce in the request headers so Next.js can inject it into inline `<script>` tags.

---

### Q27: What is the differences between `revalidatePath` with layout scope vs page scope?
**Answer:**
* **`revalidatePath(path, 'page')` (Default):** Invalidates only the specified page, keeping parent layouts cached.
* **`revalidatePath(path, 'layout')`:** Invalidates the specified page and **all nested pages and layouts** underneath it. This triggers a broader cache purge, which is useful when shared layout elements (like navigation menus) update.

---

### Q28: How does automatic font optimization work in Next.js?
**Answer:**
* **Build Integration:** During the build phase, `next/font` fetches remote Google font files and bundles them locally.
* **Inlining:** Injecting local font declarations directly into the HTML header ensures fonts load instantly without external network requests, preventing layout shifts (CLS).

---

### Q29: How do you stream Server-Sent Events (SSE) inside an App Router Route Handler?
**Answer:**
By returning a custom `ReadableStream` response with a `text/event-stream` content-type header:
```javascript
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('data: Initial update\n\n'));
      // Keep stream alive with periodic data updates
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}
```

---

### Q30: How do you implement dynamic, edge-optimized routing with i18n configurations?
**Answer:**
* **Detection:** Extract the preferred language from request headers (e.g., `Accept-Language`) inside Middleware.
* **Rewrite:** If the user is on the root path (e.g., `/dashboard`), rewrite the request to the locale-specific path (e.g., `/fr/dashboard` or `/en/dashboard`) at the Edge.

---

### Q31: What is the difference between `React.startTransition` and standard state changes on route navigation?
**Answer:**
* **Standard changes:** Standard state changes can block the main UI thread during heavy computations or rendering.
* **`startTransition`:** Tells React that a state change is non-urgent. This allows React to prioritize user interactions (like clicks or typing) and keep the UI responsive while rendering the transition in the background.

---

### Q32: What build runner limitations exist when statically pre-rendering millions of pages?
**Answer:**
Pre-rendering millions of pages at build time can cause build runners to run out of memory or time out.
* **Mitigation:**
  * Statically pre-render only the most popular pages (e.g., top 1,000 pages).
  * Use `dynamicParams = true` to render less popular pages on demand when they are first requested, saving build time and memory.

---

### Q33: Why are standard Node.js APIs unavailable inside Next.js Edge Middleware?
**Answer:**
Middleware executes in Vercel Edge Sandboxes powered by V8 isolates:
* **Architecture:** Unlike full Node.js servers, V8 isolates run a lightweight JS runtime. They exclude heavy Node.js built-ins (like `child_process` or `net`) to minimize container sizes, reduce startup latency, and optimize edge deployments.

---

### Q34: How does `next/dynamic` manage CSS bundle injection for lazy-loaded Client Components?
**Answer:**
* **Isolation:** Next.js extracts CSS styles for lazy-loaded components into separate, dedicated CSS chunks.
* **Dynamic Loading:** When a component is imported dynamically, the client router downloads the CSS chunk and injects it into the document head *before* rendering the component, preventing layout shifts.

---

### Q35: How do you implement secure CSRF protection for API Route Handlers in Next.js?
**Answer:**
* **Verification:** Since route handlers do not have automatic CSRF checks, you must validate them manually.
* **Flow:** Extract the custom CSRF token from the request headers and compare it against the cryptographically signed token stored in the user's session cookie. If they do not match, return a `403 Forbidden` response.

---

### Q36: What is the purpose of the `.next/required-server-files.json` file?
**Answer:**
This file lists the exact configuration options, environment variables, and dependencies required to run the Next.js server in a production environment.
* **Deployment use:** Cloud providers and CI/CD tools parse this file to verify and prepare the hosting environment before launching the standalone Next.js server.

---

### Q37: How do server-side dynamic imports differ from client-side dynamic imports in Next.js?
**Answer:**
* **Server-Side Dynamic Imports:** The module is resolved and pre-rendered into the initial server-side HTML payload, but its JavaScript bundle is kept separate and loaded lazily.
* **Client-Side Dynamic Imports (`{ ssr: false }`):** Prevents the component from rendering on the server entirely; it is only loaded and rendered in the browser.

---

### Q38: How do you optimize Largest Contentful Paint (LCP) for dynamic video components in Next.js?
**Answer:**
* **Optimization:** Avoid using heavy client-side players for primary hero video banners.
* **Resolution:** Use native, optimized `<video>` tags with proper attributes (`preload="auto"`, `muted`, `playsInline`, `autoplay`). Deliver video chunks over a CDN with support for range requests to speed up load times.

---

### Q39: How do you integrate OpenTelemetry (OTel) inside `instrumentation.ts`?
**Answer:**
* **Integration:** Initialize the OTel SDK inside the `register()` function in `instrumentation.ts`.
* **Distributed Tracing:** Captures server-side database queries, external API fetches, and rendering spans, and sends them to tracing collectors (like Jaeger or Honeycomb) to measure performance.

---

### Q40: How do you programmatically bypass the Next.js Data Cache for a single request?
**Answer:**
By setting cache bypass options in the `fetch` request:
```javascript
await fetch('https://api.example.com/data', {
  cache: 'no-store', // Bypasses the Next.js Data Cache
  headers: {
    'Cache-Control': 'no-cache', // Tells downstream CDN and API caches to bypass their caches
  }
});
```

---

### Q41: Explain the security implications of importing Server Actions into Client Components.
**Answer:**
Importing a Server Action into a Client Component exposes its backend endpoint to the browser.
* **Vulnerability:** Next.js generates an implicit POST request endpoint for the action. If the action does not validate user sessions, an attacker can trigger the endpoint directly with malicious payloads.
* **Best Practice:** Always perform robust validation and authorization inside the action itself.

---

### Q42: How does React's `cache` function differ from Next.js's Data Cache?
**Answer:**
* **React `cache`:** Deduplicates duplicate function calls or database queries *within a single request lifecycle*. It is non-persistent and cleared once the request finishes.
* **Next.js Data Cache:** A persistent cache that stores data across different user requests and server instances. Must be manually invalidated using revalidation tags or paths.

---

### Q43: How do you build a custom dynamic router for a headless CMS inside Next.js?
**Answer:**
* **Setup:** Create a catch-all route folder: `app/[[...slug]]/page.js`.
* **Execution:** Inside `page.js`, fetch the current slug structure from the headless CMS.
* **Dynamic Resolution:** Match the CMS page type (e.g., product page, blog, landing page) and render the corresponding page layout dynamically.

---

### Q44: How do you coordinate ISR/revalidation across multiple self-hosted instances?
* Problem: time-based ISR caches pages per-process; with N replicas behind a load balancer, instance A may serve stale content after instance B revalidated — on-demand `res.revalidate()` only mutates the receiving process's cache.
* Solutions ladder:
  1. Sticky-free correctness: treat every instance equally by broadcasting revalidation events over Redis pub/sub / NATS; each pod flushes its in-memory cache entry.
  2. Centralize cache: shared LRU (Redis/Memcached) in front of instances for full-route HTML, with instances acting as render workers.
  3. Version-tagged purge at the CDN layer (Fastly/Varnish surrogate keys) so origin staleness matters less.
* Kubernetes nuance: rolling deploys must drain old-generation caches or mix pre/post-deploy HTML fragments (hydration mismatch risk).
* This question separates "used Vercel" from "operated Next.js" — expect follow-ups on cache keys, deploy markers, and graceful handoff windows.

### Q45: How does streaming SSR interact with backpressure and aborted renders?
* When a client disconnects mid-stream (navigation away, tab close), continuing to render wastes CPU and DB load: frameworks propagate abort signals into React — suspended promises receive rejection, rendering unwinds, `finally` cleanup runs.
* Server-to-client TCP backpressure means slow consumers stall `flush()`; well-behaved runtimes pause generating further shell chunks rather than buffering unbounded HTML in memory.
* Slow subtree containment: wrap laggy data sources in Suspense so their delay streams late without blocking shell; set timeouts around fetches (AbortSignal) so a hung upstream becomes a streamed fallback + error boundary instead of a stuck response holding a worker.
* Production symptom to cite: memory spikes correlating with many concurrent partial renders indicate missing timeouts/no abort propagation — fix at the data-fetch layer, not with generic PM2 restarts.

### Q46: How do you prevent SSRF when your server fetches user-supplied URLs?
* Threat: attacker supplies `https://internal-metadata.aws/iam/...` or `http://localhost:6379` — your Next server (inside trusted network) fetches it, leaking credentials or mutating internal services.
* Defense-in-depth checklist:
  1. Allowlist outbound hosts/schemes (https only); reject IPs outright — resolve DNS then verify resolved addresses against private ranges (10/8, 172.16/12, 192.168/16, 127/8, link-local, cloud metadata 169.254.169.254) to defeat DNS-rebinding.
  2. Disable redirects or re-validate each hop; cap response size and timeout (AbortSignal).
  3. Egress proxy/firewall for the app subnet; separate network policies for renderer vs data services.
  4. Never echo raw fetched content into HTML (stored XSS vector) — sanitize or treat as opaque bytes.
* Framework note: image optimizer had historical SSRF CVEs — keep `images.remotePatterns` strict and Next patched; auditors specifically probe `/api/fetch?url=` style proxies.

### Q47: What dominates Edge Middleware cold starts and how do you optimize them?
* Edge functions pay startup costs per isolate: module evaluation of your bundled middleware + framework glue, V8 isolate spin-up, and (on some platforms) regional cold placement.
* Budget discipline: middleware bundles should stay tiny — import only what's needed for routing/auth decisions (JWT verification lib, cookie parsing); heavy SDKs (DB ORMs, large utils) balloon cold time since edge bundles include everything reachable.
* Patterns: move heavy logic to Node runtime Route Handlers invoked conditionally; precompute verification keys (WebCrypto imported once at module top); avoid top-level awaits on slow resources; keep regexes precompiled and small.
* Measure: platform traces show cold vs warm invocations; p99 latency SLOs usually force warm-traffic design (regional min instances where supported).
* Contrast: Node runtime middleware trades slightly higher cold cost for full API access — choosing runtimes per segment is itself the senior answer.

### Q48: How does the React Compiler integrate with Next.js and what changes for developers?
* The compiler (React Forget lineage) statically analyzes components/hooks and auto-inserts memoization equivalent to disciplined useMemo/useCallback/memo — eliminating most manual memo boilerplate and its stale-dependency bugs.
* Next adoption: enable via `experimental.reactCompiler: true` (plus babel-plugin-react-compiler or SWC-supported path); works alongside existing code — un-analyzable patterns bail out safely rather than mis-optimize.
* Consequences: fewer renders by default; ESLint plugin flags code that breaks Rules of React (the compiler's assumptions) — adopting it effectively enforces stricter purity discipline codebase-wide.
* Remaining manual work: structural wins (virtualization, code-splitting, moving work to server components) are untouched — the compiler optimizes within components, not architectures; profiling still required for real bottlenecks.

### Q49: How do you isolate per-request state in Next.js server code (module scope hazards)?
* Node servers multiplex requests through shared module instances — anything stashed in module/global variables (SDK clients with request-bound config, memoized-per-user data, locale state) bleeds across users; classic bug class: tenant A sees tenant B's data after warm reuse.
* Safe patterns: derive request context inside the request path (pass explicitly); use `AsyncLocalStorage` to scope implicit context per request; React `cache()` for per-render dedupe; construct request-scoped clients instead of configuring singletons per user.
* Known footguns: `getServerSideProps`-era examples caching promises in module maps; Zustand stores created at module level shared across requests (fix: per-request factory + context provider — the documented Next.js SSR pattern); global interceptors mutating headers per-request.
* Audit technique: grep for top-level mutable singletons in server-only code paths; load-test two tenants concurrently and assert isolation.

### Q50: What are View Transitions in Next.js and what problems do they solve?
* The View Transitions API lets the browser animate DOM morphs atomically (old snapshot fades/slides out, new animates in) without manual double-buffer hacks; Next exposes experimental support hooking App Router navigations (`experimental.viewTransition`) and React's `<ViewTransition>` primitives.
* Wins: continuity cues reduce cognitive load (list→detail expansions, shared-element morphs), smoother perceived performance on slow navigations because the transition masks fetch latency, and CSS-only choreography (view-transition-name pairing) replacing fragile FLIP libraries.
* Constraints: same-document transitions are cheap; cross-document needs MPA support; nested naming collisions cause group merges; reduced-motion media queries must gate effects for accessibility.
* Senior framing: transitions are UX polish layered on correct data loading — never a substitute for streaming/Suspense; measure INP impact since animations compete with input responsiveness.

---

## Coding & Implementation Challenges

### Q51: Multi-Tenant Hostname Routing Middleware
**Requirement:** Build a Next.js Middleware that intercepts requests, extracts the hostname, verifies tenant eligibility, and rewrites the internal request path dynamically to a hidden `/tenants/*` folder.

```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Exclude static assets and api endpoints
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Parse tenant from subdomain or hostname
  let tenant = '';
  if (hostname.includes('.localhost:3000')) {
    tenant = hostname.split('.localhost:3000')[0];
  } else if (hostname.includes('.example.com')) {
    tenant = hostname.split('.example.com')[0];
  }

  // If a tenant is identified, rewrite the internal request path dynamically
  if (tenant && tenant !== 'www') {
    url.pathname = `/tenants/${tenant}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
```

---

### Q52: Highly Secure Server Action with Zod Schema Validation
**Requirement:** Build a secure Server Action inside `app/actions.js` that performs user authentication checks, validates incoming request bodies using Zod, and handles potential errors gracefully.

```javascript
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

const profileUpdateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
});

export async function updateProfile(formData) {
  // 1. Authenticate user session
  const sessionToken = cookies().get('session_token')?.value;
  if (!sessionToken) {
    return { success: false, error: 'Unauthorized. Please login.' };
  }

  // 2. Validate input schema
  const validation = profileUpdateSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
  });

  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed.',
      details: validation.error.flatten().fieldErrors,
    };
  }

  const { username, email } = validation.data;

  try {
    // 3. Perform database transaction
    const res = await fetch('https://api.example.com/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ username, email }),
    });

    if (!res.ok) {
      throw new Error('Database transaction failed.');
    }

    // 4. Invalidate relevant caches
    revalidateTag('user_profile');

    return { success: true, message: 'Profile updated successfully!' };
  } catch (error) {
    console.error('Update profile action error:', error);
    return { success: false, error: 'Internal server error. Please try again.' };
  }
}
```

---

### Q53: Streaming Server-Sent Events Route Handler
**Requirement:** Write a Next.js App Router Route Handler that streams simulated server logs to the client using a secure `ReadableStream` response with continuous HTTP chunks.

```javascript
export const runtime = 'edge'; // Use Edge Runtime for optimized streaming

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let count = 0;

      const intervalId = setInterval(() => {
        if (count >= 5) {
          clearInterval(intervalId);
          controller.enqueue(encoder.encode('event: complete\ndata: Stream finished\n\n'));
          controller.close();
          return;
        }

        const logMessage = JSON.stringify({
          timestamp: new Date().toISOString(),
          status: 'success',
          message: `Log line #${count + 1}`,
        });

        controller.enqueue(encoder.encode(`data: ${logMessage}\n\n`));
        count++;
      }, 1000);

      // Handle stream termination or client disconnects
      requestAnimationFrame(() => {}); 
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
```

---

### Q54: Observability Setup in Instrumentation
**Requirement:** Create an `instrumentation.ts` file at the root directory to initialize trace instrumentation handlers using standard Node.js server dependencies.

```typescript
export async function register() {
  // Only initialize telemetry on the server-side Node.js environment
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-grpc');
    const { Resource } = await import('@opentelemetry/resources');
    const { SemanticResourceAttributes } = await import('@opentelemetry/semantic-conventions');

    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'nextjs-app',
      }),
      traceExporter: new OTLPTraceExporter({
        url: 'grpc://localhost:4317',
      }),
    });

    try {
      sdk.start();
      console.log('OpenTelemetry SDK initialized successfully!');
    } catch (error) {
      console.error('Error starting OpenTelemetry SDK:', error);
    }
  }
}
```

---

### Q55: Tag-Based Database Cache Utility
**Requirement:** Implement a database cache wrapper using `unstable_cache` and React's `cache` function to deduplicate and cache expensive database queries with tag-based invalidation.

```javascript
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// Mock DB client
const db = {
  async fetchUsers() {
    console.log('Executing expensive SQL query in DB...');
    return [{ id: 1, name: 'John Doe' }];
  },
};

// 1. React cache() deduplicates identical queries within a single render pass
// 2. unstable_cache() caches the query results persistently across multiple user requests
export const getCachedUsers = cache(async () => {
  return unstable_cache(
    async () => {
      return await db.fetchUsers();
    },
    ['users-list-cache-key'], // Cache key
    {
      revalidate: 3600, // Cache for up to 1 hour
      tags: ['users'],  // Invalidation tags
    }
  )();
});
```

---

### Q56: Parallel Routes with Custom Sub-Navigation and Fallbacks
**Requirement:** Implement a dashboard component using parallel routes and loading boundaries. Handle custom sub-navigation and fallbacks gracefully if a slot is missing.

```jsx
// File: app/analytics/layout.js
import React from 'react';

export default function AnalyticsLayout({ children, sales, traffic }) {
  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1>Analytics Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', margin: '20px 0' }}>
        {/* Render parallel slots */}
        <section style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
          <h2>Sales Slot</h2>
          {sales}
        </section>
        <section style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
          <h2>Traffic Slot</h2>
          {traffic}
        </section>
      </div>
      <div>{children}</div>
    </div>
  );
}
```

```jsx
// File: app/analytics/@sales/default.js
import React from 'react';

export default function SalesDefault() {
  return (
    <div>
      <h3>Sales Overview</h3>
      <p>No sales data is available for this section. Please reload or select another interval.</p>
    </div>
  );
}
```

---

### Q57: Streamed Multipart/Form-Data S3 Upload Route Handler
**Requirement:** Build a Route Handler inside the App Router that parses incoming multipart/form-data directly to an S3 upload stream without saving files to disk.

```javascript
import { NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PassThrough } from 'stream';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const stream = new PassThrough();
    const fileBuffer = await file.arrayBuffer();
    stream.write(Buffer.from(fileBuffer));
    stream.end();

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `uploads/${Date.now()}-${file.name}`,
        Body: stream,
        ContentType: file.type,
      },
    });

    const result = await upload.done();

    return NextResponse.json({ success: true, location: result.Location }, { status: 200 });
  } catch (error) {
    console.error('S3 upload error:', error);
    return NextResponse.json({ error: 'Internal server error during upload.' }, { status: 500 });
  }
}
```
