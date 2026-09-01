# Next.js - Medium Interview Questions

## Theory Questions & Answers

### Q1: How does Incremental Static Regeneration (ISR) work under the hood? Explain "Stale-While-Revalidate".
**Answer:**
ISR allows Next.js to update static pages *after* the initial build without re-deploying the entire site.
* **Initial Request:** The server serves the pre-rendered HTML/JSON generated at build time (instantaneous CDN delivery).
* **Revalidation Window:** If a request comes after the defined `revalidate` period (e.g., 60 seconds):
  1. Next.js serves the **stale** static page to the current visitor.
  2. Next.js triggers a **revalidation process** in the background on the server.
  3. The server regenerates the page and updates the CDN cache with new static files.
  4. Subsequent visitors receive the newly updated static page.

---

### Q2: What is On-Demand Revalidation, and how is it superior to time-based ISR?
**Answer:**
On-Demand Revalidation updates static pages instantly when data changes, rather than waiting for a time interval to expire.
* **Action:** Uses `revalidatePath()` or `revalidateTag()` inside server context to purge the cache.
* **Superiority:**
  * **Efficiency:** Eliminates unnecessary API queries during low-traffic periods.
  * **Freshness:** Solves the stale-data issue by updating the CDN cache immediately when a database write occurs.

---

### Q3: Explain Server Actions in Next.js and how they eliminate client-to-server API boilerplate.
**Answer:**
Server Actions are asynchronous functions that run on the server but can be invoked directly from Client or Server Components.
* **Mechanism:** Next.js generates an implicit POST request endpoint under the hood when a Server Action is declared.
* **Benefits:**
  * **No API Controllers:** Eliminates writing custom Route Handlers or `fetch()` boilerplate to save form data.
  * **Progressive Enhancement:** Forms can submit and work even before the client-side JavaScript has fully loaded.
  * **Security:** Runs inside the server environment with access to backend services.

---

### Q4: How does Middleware work in Next.js? Detail its execution order and limitations.
**Answer:**
Middleware runs code *before* a request is completed, enabling request rewrite, headers manipulation, and redirection.
* **Execution Timing:** Executes after routing but before matches in the filesystem (pages or public folder) are processed.
* **Runtime:** Runs on the **Edge Runtime** (lightweight V8 engine), not standard Node.js.
* **Limitations:**
  * Cannot use standard Node.js APIs (like `fs`, `child_process`).
  * Limited external package compatibility (only packages using standard web APIs).
  * Max execution memory and time limits apply (Vercel limits).

---

### Q5: Explain Route Groups in the App Router and how they affect path layouts.
**Answer:**
Route Groups are directories wrapped in parentheses, such as `(marketing)` or `(shop)`.
* **Path Exclusion:** The folder name is omitted from the URL path (e.g., `app/(shop)/product/page.js` is accessed via `/product`).
* **Layout Isolation:** Allows creating distinct layouts for specific groups of pages without creating subdirectories in the URL.
* **Multiple Root Layouts:** Can be used to create multiple root layouts with different `<html>` tags by placing pages inside separate route group folders.

---

### Q6: Explain Parallel Routes in the App Router and how they benefit dashboards.
**Answer:**
Parallel Routes allow rendering multiple pages simultaneously or conditionally within the same layout.
* **Syntax:** Folders prefixed with `@` (e.g., `@analytics` and `@team`).
* **Slot Passing:** Slots are passed as props to the layout component in the same directory:
  ```javascript
  export default function Layout({ children, analytics, team }) {
    return <div style={{ display: "flex" }}>{children}{analytics}{team}</div>;
  }
  ```
* **Independent Loading:** Each parallel route can have its own independent `loading.js` and `error.js` boundaries.

---

### Q7: Explain Intercepting Routes and their typical use cases.
**Answer:**
Intercepting Routes allow you to load a route from another part of your application inside the current layout.
* **Syntax:** Match path patterns: `(.)` matches same level, `(..)` matches one level up, `(...)` matches from root.
* **How it works:** When navigating client-side, the route is intercepted (e.g., showing a photo in a modal overlay over the feed). When reloading the page or sharing the link, the full, un-intercepted page renders.
* **Use Case:** Modal login overlays, photo detail overlays, product quick-view panels.

---

### Q8: What are App Router segment configuration options, and how do you force dynamic rendering?
**Answer:**
Segment configuration options are exported constants that configure page or layout behavior.
* **`export const dynamic = 'force-dynamic'`**: Disables caching, forcing Next.js to render the segment dynamically on every single request.
* **`export const dynamic = 'force-static'`**: Forces the page to be static and cacheable, ignoring dynamic headers, cookies, or search parameters.
* **`export const revalidate = 60`**: Sets time-based ISR interval (in seconds) for the page.

---

### Q9: Explain Next.js data caching mechanisms: Request Memoization, Data Cache, and Full Route Cache.
**Answer:**
Next.js applies caching at multiple stages:
* **Request Memoization:** Deduplicates identical `fetch()` requests (with the same URL and options) in a single render pass. Cleared after the render cycle.
* **Data Cache:** Persists fetched data across server requests and deployments. Configured using `fetch(url, { cache: 'force-cache' })`.
* **Full Route Cache:** Caches the statically generated HTML and RSC payload of a route on the server. Bypassed for dynamic routes.

---

### Q10: What is Server Component Hydration mismatch, and how do you prevent/resolve it?
**Answer:**
A Hydration Error occurs when the server-pre-rendered HTML structure does not match the initial client-side rendered virtual DOM structure.
* **Causes:** Using browser APIs (`window`, `localStorage`), random numbers (`Math.random()`), or local date/time objects inside initial render steps.
* **Resolution:**
  1. Wrap browser-specific code inside a `useEffect` hook.
  2. Disable SSR for the offending component using dynamic imports with `{ ssr: false }`.
  3. Suppress warning selectively on text nodes using the `suppressHydrationWarning` attribute.

---

### Q11: How do you configure CSS-in-JS (e.g., styled-components) in the App Router?
**Answer:**
Styled-components relies on runtime client execution, conflicting with Server Components.
* **Solution:** Create a custom registry client component to collect and inject styles during server-side pre-rendering:
  ```jsx
  'use client';
  import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
  // Wrapped in client component registry pattern to inject styled rules into document head during SSR
  ```
* **Integration:** Wrap the registry around the children of the Root Layout.

---

### Q12: What is the difference between utilizing the `unoptimized` prop and default optimizations on `next/image`?
**Answer:**
* **Optimized (Default):** Compresses, scales, and reformats images dynamically. Charges image optimization quotas on Vercel.
* **Unoptimized (`unoptimized={true}`):** Serves the raw source image file exactly as provided (no resizing, compression, or formatting changes).
* **When to use:** Great for high-quality SVG files, highly dynamic content (user-provided GIFs), or when using external image hosts where optimizing on Next.js side is budget-prohibitive.

---

### Q13: How does code splitting work with `next/dynamic` in Pages vs App Router?
**Answer:**
* **Pages Router:** `next/dynamic` acts as a direct wrapper around `React.lazy` to dynamically load and split components on demand, reducing initial browser JS load.
* **App Router:** Works similarly, but behaves strictly for **Client Components**. Since Server Components are executed entirely on the server, they are naturally modularized and chunked, eliminating the need to use `next/dynamic` for standard server components.

---

### Q14: Explain the difference between `generateStaticParams` (App Router) and `getStaticPaths` (Pages Router).
**Answer:**
* **`getStaticPaths`:** Returns a JSON object with paths and fallbacks. Used in Pages Router to define dynamic SSG routes.
* **`generateStaticParams`:** Returns an array of parameter objects directly inside a dynamic segment `page.js`.
* **Under the hood:** It runs during `next build` to pre-generate paths. It is simpler, fully typed, and can run asynchronously inside Server Components.

---

### Q15: How do Route Handlers handle CORS headers?
**Answer:**
Since Route Handlers export standard `Response` objects, CORS headers must be appended manually to response meta-parameters:
* **Example:**
  ```javascript
  export async function GET() {
    return NextResponse.json({ data: 'success' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  ```

---

### Q16: How does Next.js protect Server Actions from CSRF (Cross-Site Request Forgery) attacks?
**Answer:**
Next.js provides built-in CSRF protection for Server Actions:
* **Token Comparison:** When a Server Action is triggered via POST, Next.js checks the `Origin` header of the incoming request.
* **Match validation:** The `Origin` header must match the host origin of the current request headers (the domain the app is running on). If there is a mismatch, the action is rejected with a `400 Bad Request`.

---

### Q17: What features are disabled when configuring static exports (`output: 'export'`)?
**Answer:**
Static exports compile pages strictly to static HTML/CSS/JS files, disabling server-dependent processes:
* **Disabled Features:**
  * SSR data fetching (`cache: no-store` or `getServerSideProps` calls).
  * API Routes or Route Handlers requiring dynamic server execution.
  * Next.js dynamic routing middleware (`middleware.js`).
  * Dynamic image optimization via standard Next.js image server.
  * Incremental Static Regeneration (ISR).

---

### Q18: How do you read and write Cookies in Next.js App Router Server Components?
**Answer:**
Using the `cookies()` API imported from `next/headers`.
* **Read Cookies:** `cookies().get('token')` returns the cookie object.
* **Write Cookies:** Cookies can **only** be written inside **Server Actions** or **Route Handlers** using `cookies().set('name', 'value')`.
* **Read-only Exception:** Standard Server Components are read-only; they cannot write or mutate cookies because they run during page rendering when headers have already been sent.

---

### Q19: Explain how `loading.js` streams content using React Suspense.
**Answer:**
* **Streaming Protocol:** Next.js splits the page into chunks and streams HTML over a single HTTP connection.
* **Instant Fallback:** The server sends the layout and `loading.js` UI instantly to the browser.
* **Dynamic Hydration:** As soon as data resolves on the server, the corresponding HTML chunks are rendered and pushed to the client, replacing the loading skeleton in the DOM without requiring a client-side rerender.

---

### Q20: What is the purpose of the `server-only` package?
**Answer:**
`server-only` is a build-time guard package.
* **Role:** Ensures that specific modules or database files are never accidentally imported into Client Components.
* **Implementation:** Add `import 'server-only'` at the top of a file. If any Client Component imports this file, Next.js throws a build-time compile error.

---

### Q21: How does the Client-Side Router Cache work, and how do you invalidate it?
**Answer:**
The Client-Side Router Cache stores pre-fetched and previously visited route segments in client-side memory.
* **Persistence:** Does not clear on route changes.
* **Invalidation methods:**
  * Programmatically trigger `router.refresh()` inside Client Components to tell Next.js to re-fetch the route from the server.
  * Use dynamic Server Actions that invoke `revalidatePath()` or `revalidateTag()`, which automatically invalidates the client cache.

---

### Q22: What are the performance benefits of React Server Components (RSC) compared to classic SSR?
**Answer:**
* **RSC vs SSR:** SSR renders entire pages to HTML. RSC renders individual components to a structured JSON stream.
* **Client JS Savings:** Standard SSR still downloads client JS files for every rendered component. RSC downloads **zero client JS** for server-only components.
* **Hydration Preservation:** Moving route segments or links on the client does not destroy client state inside existing islands during RSC stream reconciliations.

---

### Q23: How do you configure Webpack/Turbopack custom configurations inside `next.config.js`?
**Answer:**
By extending the `webpack` property in the configuration object:
* **Example:**
  ```javascript
  module.exports = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // Injects custom loaders or plugins
      config.module.rules.push({ test: /\.svg$/, use: ['@svgr/webpack'] });
      return config;
    }
  }
  ```

---

### Q24: What is the purpose of `instrumentation.ts` in Next.js?
**Answer:**
`instrumentation.ts` is used to integrate observability, logging, and error tracing services.
* **File Location:** Placed in the root directory (or inside `/src` if used).
* **Trigger:** Invokes its exported `register()` function **once** when a new Next.js server instance starts up.
* **Use Case:** Initializing OpenTelemetry, Sentry, or custom system metrics tracking.

---

### Q25: How do you implement API Rate Limiting in Next.js Middleware?
**Answer:**
By intercepting requests inside `middleware.js` and querying a database/cache (like Redis) using the client's IP address:
* **Flow:**
  1. Extract IP: `const ip = request.ip || '127.0.0.1'`.
  2. Query Redis for count: if count exceeds limit, return `new Response('Too Many Requests', { status: 429 })`.
  3. Otherwise, increment count with an expiry window and allow the request to pass.

---

### Q26: What is Partial Prerendering (PPR) in Next.js?
**Answer:**
PPR combines static and dynamic rendering within a single page using React Suspense.
* **Static Shell:** The static layout is pre-rendered at build time and served immediately.
* **Dynamic Holes:** Dynamic components wrapped in `<Suspense>` are replaced with skeletons in the static shell, and their execution is completed on-demand on the server before being streamed to the client.

---

### Q27: How does Next.js handle trailing slashes in URLs?
**Answer:**
Managed via the `trailingSlash` boolean in `next.config.js`.
* **`trailingSlash: false` (Default):** Redirects URLs with slashes to their clean equivalent (e.g., `/about/` -> `/about`).
* **`trailingSlash: true`:** Redirects clean URLs to have trailing slashes (e.g., `/about` -> `/about/`). Crucial for hosting setups on CDNs that rely on directory index files.

---

### Q28: How do you structure dynamic SEO metadata inside `generateMetadata`?
**Answer:**
```javascript
export async function generateMetadata({ params, searchParams }, parent) {
  const product = await fetchProduct(params.id);
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      images: [product.image, ...previousImages],
    },
  };
}
```

---

### Q29: How do you run and scale a Next.js application inside a Docker container?
**Answer:**
* **Configuration:** Use a multi-stage Dockerfile containing `node` base images.
* **Build optimization:** Use Next.js "standalone" output configuration (`output: 'standalone'` in `next.config.js`).
* **Result:** Generates a lightweight node server bundle containing only files required for production, omitting heavy Webpack cache files or local dependencies.

---

### Q30: What is the difference between shallow routing and deep router transitions?
**Answer:**
* **Shallow Routing:** (Pages Router `router.push(..., undefined, { shallow: true })`) updates the URL path or search query without triggering data-fetching methods like `getStaticProps` or `getServerSideProps`.
* **Deep Router Transitions:** Triggers the full data-fetching cycle on the server for the dynamic path, causing re-renders of the page components.

---

### Q31: How do you load third-party scripts dynamically in Next.js with `next/script`?
**Answer:**
Using `next/script` with prioritized strategies and event listeners:
```jsx
import Script from 'next/script';

export default function Page() {
  return (
    <Script
      src="https://example.com/analytics.js"
      strategy="afterInteractive"
      onLoad={() => console.log('Script loaded successfully!')}
      onError={(err) => console.error('Script failed to load:', err)}
    />
  );
}
```

---

### Q32: Explain the purpose and usage of the `useOptimistic` React hook in Next.js.
**Answer:**
`useOptimistic` allows updating the UI immediately during async Server Actions, assuming the action succeeds before it completes.
* **Usage:**
  1. Initialize with current server state: `const [optimisticState, addOptimistic] = useOptimistic(state, updateFn)`.
  2. Call `addOptimistic(newValue)` immediately when the user triggers an action.
  3. The hook automatically reverts to the real server state if the action fails or returns.

---

### Q33: How does the `unstable_cache` function isolate data fetching from pages?
**Answer:**
`unstable_cache` is a Next.js utility to cache expensive database queries or third-party API fetches.
* **Usage:**
  ```javascript
  const getCachedData = unstable_cache(
    async (id) => fetchFromDb(id),
    ['db-cache-key'],
    { revalidate: 3600, tags: ['users'] }
  );
  ```
* **Independence:** Can be declared anywhere in the code, decoupling database query caching from individual page segment revalidation configurations.

---

### Q34: How does standard Error Boundaries catch server-side errors in the App Router?
**Answer:**
* **Server Crashes:** If a Server Component throws an error, Next.js catches it on the server and generates a serialized error.
* **Client Handover:** The error is passed down to the nearest `error.js` boundary.
* **Stripped Errors:** In production, sensitive error message details are stripped from the client to prevent security leaks; only generic error messages or explicit codes remain visible to the browser.

---

### Q35: What is the difference between `cookies().set()` inside a Server Action vs Route Handler?
**Answer:**
Both can write cookies, but with different structures:
* **Server Action:** Next.js intercepts the response automatically and appends `Set-Cookie` headers to the serialization response protocol.
* **Route Handler:** Must append the cookie to the returned `NextResponse` instance manually or use the `cookies()` utility within the handler context prior to returning the response.

---

### Q36: How do you read standard request headers inside an App Router Server Component?
**Answer:**
Using the `headers()` API imported from `next/headers`:
```javascript
import { headers } from 'next/headers';

export default function MyServerComponent() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent');
  return <p>Visitor Browser: {userAgent}</p>;
}
```
* **Dynamic Trigger:** Calling `headers()` forces the page to opt out of static pre-rendering and compile dynamically on request time.

---

### Q37: How does pre-rendering work for Client Components?
**Answer:**
Client Components are **not** compiled purely on the client.
* **Server Pre-rendering:** Next.js pre-renders Client Components on the server during the SSR phase to generate static HTML.
* **Hydration:** The HTML is sent to the browser, and the client JavaScript is loaded to hook up state and interactive elements.
* **Safety precaution:** Client components must be ready to run in a node environment during pre-rendering without calling browser APIs on their root level.

---

### Q38: What is the purpose of the `assetPrefix` configuration in `next.config.js`?
**Answer:**
`assetPrefix` directs Next.js to load its static scripts, CSS files, and page bundles from an external host (typically a CDN) instead of the local origin server.
* **Usage:** `assetPrefix: 'https://cdn.example.com/'`.
* **Benefit:** Reduces bandwidth costs on origin servers and speeds up asset delivery using geographically distributed CDNs.

---

### Q39: What is the difference between `revalidatePath` and `revalidateTag` in Server Actions?
**Answer:**
* **`revalidatePath(path)`:** Purges the cache for all fetches on the specified path or layouts (e.g., `revalidatePath('/blog')`).
* **`revalidateTag(tag)`:** Purges the cache for specific queries matching the tag registered inside the `fetch()` option `next: { tags: ['blog_posts'] }`, regardless of what path or page they were called on.

---

### Q40: How does Turbopack differ from Webpack in Next.js?
**Answer:**
* **Turbopack:** A Rust-based successor to Webpack built into Next.js.
* **Performance:** Utilizes incremental compilation and a highly optimized caching architecture to build and reload pages up to 10x faster in development than Webpack.
* **Limitations:** Currently primarily optimized for Next.js development server compilations; Webpack remains the stable compiler fallback for complex custom build pipelines.

---

### Q41: What is the role of `default.js` inside Parallel Routes?
**Answer:**
`default.js` is a fallback page rendered when Next.js cannot retrieve a slot's state during a hard reload or navigation.
* **How it triggers:** If you reload a page at `/dashboard/settings` where `@analytics` does not have a matching `settings/page.js`, Next.js will render `@analytics/default.js` inside the layout instead of crashing or rendering a blank container.

---

### Q42: How do you secure backend endpoints inside the App Router from unauthorized request calls?
**Answer:**
By enforcing authorization checks at the top of the Route Handler or Middleware:
* **Token validation:** Extract the JWT or session cookie from headers.
* **Verify:** If missing or invalid, immediately return a `401 Unauthorized` JSON response:
  ```javascript
  return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  ```

---

### Q43: How do you bypass the Next.js router cache programmatically on the client?
**Answer:**
The Next.js client router cache cannot be bypassed easily through standard anchor navigations.
* **Resolution:** Use `router.refresh()` to fetch fresh data from the server, or implement Server Actions to trigger invalidation routes on completion, forcing the router cache to invalidate.

---

### Q44: Why do request waterfalls happen in Server Components and how do you eliminate them?
* Sequential `await`s create artificial latency: each fetch waits for the previous even when independent - TTFB/LCP degrade linearly with chain depth.
```tsx
// BAD: ~a+b+c ms
const user = await getUser();
const orders = await getOrders(user.id);
const recs = await getRecommendations(user.id);
// GOOD: independent parts parallelize
const [orders, recs] = await Promise.all([getOrders(id), getRecs(id)]);
```
* Structural fixes: hoist truly independent fetches above dependent ones; split subtrees into sibling components that stream independently (each with its own await + Suspense boundary) so slow branches don't block fast ones.
* Distinguish *data dependency* (orders need userId → must chain or fetch keys first) from *render dependency* (recs don't need orders' value). Only true dependencies may serialize.
* Bonus: Request Memoization dedupes identical GETs within one render pass, so extracting shared lookups into helper calls is free.

### Q45: What per-request fetch cache options exist (`cache`, `next.revalidate`, `next.tags`)?
* `{ cache: 'force-cache' }` (default for GET in stable versions): read/write the Data Cache keyed by URL+options.
* `{ cache: 'no-store' }`: always fetch fresh, skip both Data Cache and Full Route Cache participation for that segment.
* `{ next: { revalidate: 60 } }`: time-based ISR semantics for that resource - cached, refreshed after TTL.
* `{ next: { tags: ['products'] } }`: attaches tag for `revalidateTag('products')` on-demand invalidation from Server Actions/Route Handlers.
* Combinations compose (tag + revalidate); POST requests are never cached. Knowing which knob answers "freshness policy per endpoint" is the interviewer's litmus test for App Router data-layer fluency.

### Q46: Route Handlers vs Server Actions - how do you choose?
* **Server Actions**: mutations triggered from your own UI (forms, buttons); RPC-style, progressive-enhancement friendly, automatic revalidation integration, no client fetch boilerplate; not meant as public APIs.
* **Route Handlers**: HTTP endpoints needed by third parties, webhooks (Stripe/GitHub), mobile apps, SSE streams, or anything requiring exact REST semantics, headers, and cache-control.
* Decision rules: browser-only consumer + mutation → Action; external caller or non-HTML client → Route Handler; idempotent public reads → Route Handler with caching; optimistic-update flows → Actions with `useOptimistic`.
* Security framing differs too: Actions get built-in CSRF posture + closure privacy; Handlers need explicit auth/CORS/rate-limiting like any API.

### Q47: What is useReportWebVitals and how do teams act on it?
* Client hook receiving Core Web Vitals entries (LCP, INP, CLS, FCP, TTFB) with ratings ('good'/'needs-improvement'/'poor') as they finalize - forward them to analytics (GA4, Datadog RUM, custom collector).
```tsx
'use client';
import { useReportWebVitals } from 'next/web-vitals';
useReportWebVitals(metric => navigator.sendBeacon('/vitals', JSON.stringify(metric)));
```
* Place once in a top-level client component; pairs with route change reporting for per-page scorecards.
* Operational value: ties field data to deploys - regressions in INP after shipping a heavy client bundle surface immediately; combine with `web-vitals` attribution build for debugging culprits.
* Interview angle: know why sendBeacon (fire-and-forget during unload) beats fetch here.

### Q48: How do you customize image loading (loaders, remotePatterns, priorities)?
* `remotePatterns` in next.config whitelists external origins with protocol/hostname/port/pathname precision - safer replacement for the old wildcard `domains`.
* Custom `loader` functions translate src→URL for third-party CDNs (Cloudinary/imgix/Akamai) letting `next/image` keep its layout/CLS guarantees while resizing happens remotely.
* `priority` prop preloads LCP candidates (hero banners) - injects preload link, disables lazy-load; pair with `sizes` so the browser picks correct candidate widths.
* `unoptimized` opts individual images or globally out of the optimizer (static export, already-optimized sources); `deviceSizes/imageSizes` tune the generated srcset ladder.

### Q49: Describe a production-grade JWT auth flow with httpOnly cookies in Next.js.
* Login (Route Handler or Server Action): verify credentials → sign short-lived access JWT (+ refresh token) → set cookies `httpOnly; Secure; SameSite=Lax; Path=/` - inaccessible to XSS-running JS.
* Requests carry identity automatically; server components/actions read via `cookies()`; middleware performs cheap expiry checks and redirects unauthenticated users for protected route groups.
* Refresh strategy: silent rotation endpoint exchanging refresh token (rotation detection = theft signal), or backend-for-frontend sessions storing revocable state server-side.
* Logout clears cookies + revokes server session; consider CSRF tokens for cookie-authenticated mutations outside SameSite protection.
* Why not localStorage: any XSS exfiltrates tokens; httpOnly shrinks blast radius. Expect follow-ups on secret management, clock skew, and role claims placement.

### Q50: How do you implement i18n in the App Router?
* Built-in Pages Router i18n routing (`i18n` config, locale-prefixed paths) does NOT apply to the App Router - teams implement strategies directly:
  1. **Segment-based locales**: `app/[lang]/layout.tsx` validating locale param, loading dictionaries server-side, setting `lang` attribute; static generation via generateStaticParams over locales.
  2. **Middleware negotiation**: detect Accept-Language/cookie, redirect to prefixed path (edge-fast, no flash).
  3. **Libraries**: next-intl (mature App Router story: server+client message contexts, formatting), next-i18next (Pages-oriented), LinguiJS.
* Metadata/hreflang alternates generated per-locale via generateMetadata; RTL handled via CSS logical properties.
* Pitfalls: client bundles pulling whole dictionaries (split namespaces), hydration mismatches from locale-dependent Date formatting (format consistently server-side), and pluralization rules delegated to ICU MessageFormat rather than hand-rolled ifs.

---

## Coding & Implementation Challenges

### Q51: Next.js Middleware for JWT Auth Token Verification
**Requirement:** Build a Next.js `middleware.js` file at the root directory to intercept requests to `/dashboard/*` routes, check for a valid session token cookie, and redirect unauthorized requests to `/login`.

```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get('session_token')?.value;

    // Redirect to login if token is missing
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      // Pass the current pathname as a redirect query parameter
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // In a real-world application, you would verify the token cryptographically at the edge
  }

  return NextResponse.next();
}

// Config to specify matching paths for optimization
export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

### Q52: Next.js Server Action for Form Submission with Server-Side Validation
**Requirement:** Implement a Server Action in `app/actions.js` that handles form submissions, validates input using basic checks, handles potential server errors, and triggers cache revalidation.

```javascript
'use server';

import { revalidatePath } from 'next/cache';

export async function submitNewsletterSignup(prevState, formData) {
  const email = formData.get('email');

  // Server-side input validation
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Email field is required.' };
  }

  if (!email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    // Mock API dispatch or database insert
    const response = await fetch('https://api.example.com/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Database insertion rejected.');
    }

    // Revalidate the page containing the subscriber count
    revalidatePath('/newsletter');

    return { success: true, message: 'Thank you for signing up!' };
  } catch (error) {
    console.error('Newsletter action error:', error);
    return { success: false, error: 'Server error. Please try again later.' };
  }
}
```

---

### Q53: On-Demand Revalidation Route Handler
**Requirement:** Create an on-demand revalidation Route Handler (`app/api/revalidate/route.js`) in the App Router that validates a secure token and revalidates a specific cache tag or path.

```javascript
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const secret = searchParams.get('secret');

    // Authenticate the revalidation request
    if (secret !== process.env.REVALIDATION_SECRET_TOKEN) {
      return NextResponse.json({ message: 'Invalid token secret' }, { status: 401 });
    }

    if (!tag) {
      return NextResponse.json({ message: 'Missing "tag" query parameter' }, { status: 400 });
    }

    // Trigger on-demand tag revalidation
    revalidateTag(tag);

    return NextResponse.json({ revalidated: true, now: Date.now() }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error revalidating', error: error.message }, { status: 500 });
  }
}
```

---

### Q54: Infinite Scroll Pagination Component with Server Actions
**Requirement:** Build a React Client Component that renders a list of dynamic items and loads more records using a Server Action.

```jsx
'use client';

import React, { useState, useTransition } from 'react';

// Mock Server Action directly inlined for preview (normally in actions.js)
async function fetchMoreItemsAction(offset) {
  'use server';
  const newItems = Array.from({ length: 5 }, (_, i) => `Item #${offset + i + 1}`);
  // Simulated server delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return newItems;
}

export function InfiniteScrollList({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const loadMore = () => {
    startTransition(async () => {
      const nextOffset = items.length;
      const nextItems = await fetchMoreItemsAction(nextOffset);
      setItems((prev) => [...prev, ...nextItems]);
    });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {items.map((item, index) => (
          <li 
            key={index} 
            style={{ padding: '12px', borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}
          >
            {item}
          </li>
        ))}
      </ul>
      <button
        onClick={loadMore}
        disabled={isPending}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isPending ? '#ccc' : '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {isPending ? 'Loading next items...' : 'Load More'}
      </button>
    </div>
  );
}
```

---

### Q55: Parallel and Intercepting Route Modal Layout
**Requirement:** Build a dashboard layout and directory modal file structure using parallel slots and intercepting folder configurations to open a details page inside a modal overlay.

```jsx
// File: app/dashboard/layout.js
import React from 'react';

export default function DashboardLayout({ children, modal }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>Dashboard Portal</h1>
      <div style={{ padding: '20px', backgroundColor: '#fff' }}>
        {children}
      </div>
      {/* If the route is intercepted, the modal slot will contain the modal component */}
      {modal}
    </div>
  );
}
```

```jsx
// File: app/dashboard/@modal/(.)view/[id]/page.js
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function InterceptedModalPage({ params }) {
  const router = useRouter();

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={() => router.back()} // Close modal on backdrop click
    >
      <div 
        style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px', maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click propagation
      >
        <h2>Modal Details: #{params.id}</h2>
        <p>This page was intercepted! Reloading will render the full detail page instead of this modal container.</p>
        <button 
          onClick={() => router.back()} 
          style={{ padding: '8px 16px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Close Detail Overlay
        </button>
      </div>
    </div>
  );
}
```

---

### Q56: Next.js Tailwind CSS Dark/Light Mode Theme Provider
**Requirement:** Implement a Client Component `ThemeProvider` with custom logic that sets up standard HTML body classes matching theme states without introducing hydration flicker errors.

```jsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Safely delay state rendering until hydrated to prevent hydration flickering
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.add(savedTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Swap document class
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
  };

  // Avoid flash of static layout by rendering children transparently after mount
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
```

---

### Q57: App Router Route Handler with In-Memory Rate Limiting and CORS Headers
**Requirement:** Implement a modern Route Handler inside the App Router that parses headers, runs a basic rate limit count check based on dynamic user client IPs, and attaches secure CORS headers.

```javascript
import { NextResponse } from 'next/server';

// Simple in-memory rate limiting store (normally Redis)
const rateLimitStore = new Map();
const LIMIT = 10; // Max 10 requests
const WINDOW_MS = 60 * 1000; // 1 minute window

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const currentTime = Date.now();

  // Create or retrieve client profile
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: currentTime + WINDOW_MS });
  } else {
    const clientData = rateLimitStore.get(ip);

    if (currentTime > clientData.resetTime) {
      // Reset rate limit window
      clientData.count = 1;
      clientData.resetTime = currentTime + WINDOW_MS;
    } else {
      clientData.count += 1;
    }

    if (clientData.count > LIMIT) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { 
          status: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'X-RateLimit-Limit': String(LIMIT),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(clientData.resetTime)
          }
        }
      );
    }
  }

  const clientData = rateLimitStore.get(ip);

  // Return successful response with headers
  return NextResponse.json(
    { message: 'Request successful! API access granted.' },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'X-RateLimit-Limit': String(LIMIT),
        'X-RateLimit-Remaining': String(LIMIT - clientData.count),
        'X-RateLimit-Reset': String(clientData.resetTime)
      }
    }
  );
}
```
