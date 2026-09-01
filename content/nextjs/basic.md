# Next.js - Basic Interview Questions

## Theory Questions & Answers

### Q1: What is Next.js, and what are its key advantages over a vanilla React SPA?
**Answer:**
Next.js is a production-ready **React meta-framework** that enables hybrid rendering rendering strategies (SSR, SSG, ISR, CSR) out of the box.
* **Server-Side Pre-rendering:** Delivers pre-rendered HTML to the client, improving **SEO** and **Initial Page Load (LCP)**.
* **Built-in Optimizations:** Features native components for optimizing images (`next/image`), scripts (`next/script`), fonts (`next/font`), and routes (`next/link`).
* **Zero Config:** Automatically configures Webpack/Turbopack code splitting, compilation, and minification.
* **Hybrid Data Fetching:** Allows different rendering methods on a page-by-page basis.

---

### Q2: Explain the core differences between CSR, SSR, SSG, and ISR rendering models.
**Answer:**
* **CSR (Client-Side Rendering):** The server sends a bare-bones HTML page containing a JavaScript bundle. The browser downloads and executes the JS to build the UI at runtime.
* **SSR (Server-Side Rendering):** Pre-renders HTML on the server **for each incoming request**. Best for dynamic, user-specific data that must be search-engine crawlable.
* **SSG (Static Site Generation):** Pre-renders HTML at **build time**. HTML files remain static on a CDN. Best for static assets like blogs or marketing sites.
* **ISR (Incremental Static Regeneration):** Regenerates static pages in the background **periodically** after the build has finished, without needing a full rebuild.

---

### Q3: What are the main differences between the Pages Router and the App Router?
**Answer:**
* **Routing Architecture:** Pages Router routes are determined by files in the `/pages` directory. App Router is built on the `/app` directory where folders define routes and a `page.js` file serves as the route leaf.
* **Default Component Type:** Pages Router uses standard React components (Client Components). App Router leverages **React Server Components (RSC)** by default.
* **Layout Management:** Pages Router uses custom `_app.js` and `_document.js` for global layouts. App Router supports nested layouts using `layout.js` at any route level.
* **Data Fetching:** Pages Router uses `getStaticProps` and `getServerSideProps`. App Router uses standard async `fetch()` with custom cache configurations inside Server Components.

---

### Q4: What is the purpose of `_app.js` and `_document.js` in the Pages Router?
**Answer:**
* **`_app.js`:** Custom root wrapper that initializes pages. Used for persistent layouts, global CSS imports, state providers (e.g., Redux, React Query), and page-change tracking. Runs on both server and client.
* **`_document.js`:** Custom HTML shell renderer. Used to inject `<html>` attributes, language codes, custom fonts, or SSR CSS-in-JS styles. Only runs on the server and cannot use React hooks or client-side logic.

---

### Q5: How does Dynamic Routing work in the App Router vs Pages Router?
**Answer:**
Both use bracket syntax, but structure files differently:
* **Pages Router:** File `pages/post/[id].js` maps to `/post/:id`.
* **App Router:** Folder `app/post/[id]/page.js` maps to `/post/:id`.
* **Catch-All Routing:** Brackets with an ellipsis `[...slug]` map to nested sub-routes (e.g., `/post/a/b/c`).
* **Optional Catch-All:** Double brackets `[[...slug]]` match the base route as well as nested sub-routes (e.g., matching `/post` as well as `/post/a/b`).

---

### Q6: What is the `next/image` component, and how does it prevent Cumulative Layout Shift (CLS)?
**Answer:**
`next/image` is an optimized replacement for the HTML `<img>` tag that:
* **Resizes and Compresses:** Serves custom sizes and modern formats (WebP/AVIF) dynamically based on client viewport.
* **Demands Dimensions:** Requires explicit `width` and `height` properties or uses the `fill` layout, reserving layout space *before* the image is downloaded to eliminate **CLS**.
* **Lazy Loads:** Postpones loading images outside the viewport until they approach it.
* **Uses Blur Placeholders:** Supports local/remote blurred placeholder previews while fetching high-res images.

---

### Q7: Why is `next/link` preferred over standard anchor tags (`<a>`) in Next.js?
**Answer:**
* **Client-side Navigation:** Intercepts clicks to navigate routes without triggering a full page reload, maintaining application state.
* **Route Prefetching:** Pre-downloads resources for linked routes when the link enters the browser's viewport, making subsequent navigations instantaneous.
* **Optimized Preloading:** Integrates seamlessly with Next.js code-splitting mechanics to download only the necessary JS chunks for the destination page.

---

### Q8: What are React Server Components (RSC) and what are their benefits?
**Answer:**
RSCs are components that render exclusively on the server and are serialized into a lightweight JSON payload before being sent to the client.
* **Smaller Client Bundles:** Dependencies used inside server components (e.g., Markdown parsers) remain on the server, saving megabytes of JS from being downloaded.
* **Direct Server Access:** Can query databases, connect to microservices, and read files directly from the server.
* **Secure Environment:** Keeps API keys, tokens, and database credentials hidden from the client browser.
* **Default in App Router:** All components inside the `app/` directory are RSCs by default.

---

### Q9: When should you use Client Components (`'use client'`) in Next.js?
**Answer:**
You must opt into Client Components using the `'use client'` directive at the top of a file when the component:
* Uses state hooks like `useState`, `useReducer`, or `useTransition`.
* Uses lifecycle hooks or side-effect hooks like `useEffect` or `useLayoutEffect`.
* Accesses browser-only APIs (`window`, `document`, `localStorage`).
* Uses interactive event listeners (`onClick`, `onChange`, `onSubmit`).

---

### Q10: What is the concept of "hydration" in Next.js?
**Answer:**
Hydration is the process where client-side JavaScript execution environment takes over the pre-rendered HTML sent by the server.
* **HTML Delivery:** The server generates static or SSR HTML to show UI quickly.
* **JS Execution:** The browser downloads the JS bundle.
* **Event Binding:** React matches the static DOM structure with the virtual DOM and binds interactive event handlers (like click listeners), making the page interactive.

---

### Q11: How do you handle styling (CSS Modules, Global CSS, and Tailwind) in Next.js?
**Answer:**
* **Global CSS:** Imported strictly in `_app.js` (Pages Router) or `layout.js` (App Router). Applies styles globally.
* **CSS Modules:** Files named `[name].module.css` where styles are locally scoped by appending a unique hash to class names to prevent name collisions.
* **Tailwind CSS:** Configured via `tailwind.config.js` and imported globally to use utility classes seamlessly in Server and Client Components.

---

### Q12: What is `getStaticProps` in the Pages Router, and when is it executed?
**Answer:**
`getStaticProps` is a Pages Router method used to fetch data for Static Site Generation (SSG).
* **Execution Timing:** Runs at **build time** during `next build`. It does not run at request time in production unless using ISR.
* **Data Context:** Fetches data on the server and serializes it as props passed to the page component.
* **Use Case:** Perfect for static pages with data that doesn't change frequently, such as about pages, documentation, or marketing content.

---

### Q13: What is `getServerSideProps` in the Pages Router, and when is it executed?
**Answer:**
`getServerSideProps` is a Pages Router method used for Server-Side Rendering (SSR).
* **Execution Timing:** Runs on the server **on every incoming request** in production.
* **Dynamic Execution:** Receives a `context` parameter containing request queries, cookies, and HTTP headers.
* **Use Case:** Best for pages displaying personalized, dynamic user dashboards or highly localized query-based search result pages.

---

### Q14: Why is `getStaticPaths` required when using dynamic routes with `getStaticProps`?
**Answer:**
When generating static pages dynamically (e.g., `/blog/[slug]`), Next.js needs to know at build time exactly which pages to compile.
* **Role:** `getStaticPaths` returns an array of possible parameter values (e.g., a list of all blog slugs) that Next.js uses to statically pre-render the individual HTML files.
* **Fallback Property:** Determines what to do if a user visits a dynamic route that was not pre-built (can be `false` to render a 404, `true` to build lazily with a loading UI, or `'blocking'` to build lazily without loading indicators).

---

### Q15: What are API Routes in the Pages Router?
**Answer:**
API Routes are serverless functions defined under the `pages/api` directory.
* **Routing:** Any file inside `pages/api` maps to the `/api/*` endpoint (e.g., `pages/api/user.js` -> `/api/user`).
* **Format:** Exports a default handler function with Node-style request (`req`) and response (`res`) parameters.
* **Use Case:** Building custom API middleware, database operations, or webhook endpoints directly inside Next.js.

---

### Q16: How do Route Handlers work in the App Router?
**Answer:**
Route Handlers are the App Router's equivalent to API routes, defined in files named `route.js` within the `app` directory.
* **Format:** Uses web standard `Request` and `Response` objects.
* **Method Exporting:** Exports explicit functions matching HTTP verbs (e.g., `export async function GET(request) {}`, `POST`, `PUT`, `DELETE`).
* **No Co-existence:** A `route.js` file cannot exist in the same directory segment as a `page.js` file to avoid URL mapping conflicts.

---

### Q17: What is the purpose of `layout.js` in the App Router?
**Answer:**
`layout.js` defines UI shared across nested routes.
* **State Retention:** Layouts do not re-render on page transition; they maintain state (e.g., input values, scroll positions).
* **Nesting:** Root layout (`app/layout.js`) wraps all sub-routes. Sub-directories can have their own `layout.js` which nests inside the parent layouts.
* **Root Layout Requirement:** The root layout is mandatory and must contain the `<html>` and `<body>` tags.

---

### Q18: What is the difference between `layout.js` and `template.js` in the App Router?
**Answer:**
* **`layout.js`:** Persists across route transitions. State is maintained, and CSS/DOM trees are reused without re-mounting components.
* **`template.js`:** Creates a **new instance** of the component on route transitions. It mounts on every navigation, clearing component state and running entry animations or `useEffect` hooks again.

---

### Q19: How do you implement dynamic metadata for SEO in the App Router?
**Answer:**
Instead of exporting a static `metadata` object, you export an asynchronous `generateMetadata` function from a `page.js` file.
* **Usage:**
  ```javascript
  export async function generateMetadata({ params }) {
    const id = params.id;
    const item = await fetchItem(id);
    return { title: item.name, description: item.desc };
  }
  ```
* **Performance:** Next.js automatically deduplicates fetch requests across metadata generation and page execution.

---

### Q20: Explain the purpose of `loading.js` and Suspense in the App Router.
**Answer:**
`loading.js` is built on top of React Suspense to manage loading states transparently.
* **File-based boundary:** Placing `loading.js` in a folder wraps the main route page in a React `<Suspense>` boundary automatically.
* **Streaming UI:** Sends the static layout and fallback UI (skeletons) instantly while streaming dynamic content to the client as soon as server-side fetches resolve.

---

### Q21: How do you handle application errors using `error.js` in the App Router?
**Answer:**
`error.js` serves as a React Error Boundary for a specific segment.
* **Client Component:** Must be a client component (`'use client'`).
* **Error Isolation:** Prevents errors in dynamic components from breaking the entire application. It receives an `error` object and a `reset()` callback to attempt recovery.
* **Bypassing Layouts:** An `error.js` boundary does not catch errors thrown inside a parent layout in the same directory.

---

### Q22: What is `global-error.js` and how does it differ from standard `error.js`?
**Answer:**
* **Scope:** Standard `error.js` does not catch errors in the root layout (`app/layout.js`).
* **`global-error.js`:** Placed in the root `/app` directory, it wraps the entire application and can catch errors occurring in the root layout. It must define its own `<html>` and `<body>` tags.

---

### Q23: What is the purpose of the `not-found.js` file in the App Router?
**Answer:**
`not-found.js` is used to render a custom 404 UI.
* **Automatic Triggers:** Rendered automatically when a URL route is not matched.
* **Programmatic Triggers:** Can be invoked explicitly from inside Server Components or Route Handlers using the `notFound()` function imported from `next/navigation`.

---

### Q24: How does the `next/font` component optimize web fonts?
**Answer:**
* **Self-hosting:** Automatically downloads and self-hosts external Google Fonts or local files at build time. No browser requests are sent to Google Web Fonts at runtime.
* **Layout Shift Prevention:** Injects pre-calculated CSS sizing overrides into the font-face definition to prevent **Cumulative Layout Shift (CLS)** when fallback fonts transition to loaded custom fonts.

---

### Q25: What is the purpose of the `next/script` component?
**Answer:**
`next/script` provides optimized loading strategies for third-party JavaScript files.
* **`strategy="beforeInteractive"`:** Loads script before Next.js hydration code compiles (best for security checkers or bot protection).
* **`strategy="afterInteractive"`:** Default strategy. Loads script immediately after the page becomes interactive (best for standard tracking tags).
* **`strategy="lazyOnload"`:** Loads script during browser idle times (best for heavy feedback widgets or chat tools).

---

### Q26: How do Environment Variables work in Next.js?
**Answer:**
Next.js supports `.env` files with strict access permissions:
* **Server-Only:** Standard variables (e.g., `DATABASE_URL=xyz`) are only accessible in server-side processes (API routes, Server Components).
* **Client-Exposed:** Variables prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_API_URL=abc`) are compiled into the client-side bundle and are accessible in browser-rendered components.

---

### Q27: What is automatic code-splitting in Next.js?
**Answer:**
Instead of building a single colossal JavaScript bundle, Next.js automatically splits code:
* **Route Isolation:** Each page/route bundle only contains JavaScript files and imports required for that specific path.
* **Shared Chunks:** Creates shared common chunks for libraries imported across multiple pages. This minimizes initial payload size and boosts performance.

---

### Q28: How does prefetching work in `next/link`?
**Answer:**
* **Viewport Detection:** When a `Link` component enters the user's viewport, Next.js prefetches the corresponding route's build chunks in the background.
* **Cache Storage:** Stored in the client-side router cache.
* **Instant Transitions:** Navigations are nearly instantaneous because data fetching and UI assets are already preloaded.
* **Disabling:** Can be turned off by setting `prefetch={false}`.

---

### Q29: What is the difference between `next dev`, `next build`, and `next start`?
**Answer:**
* **`next dev`:** Starts the Next.js development server with hot-reloading, Fast Refresh, and local error mapping enabled.
* **`next build`:** Compiles the application for production, optimizing assets, bundling JS, generating static files (SSG), and mapping build metrics.
* **`next start`:** Starts the compiled, optimized production server. Must be executed *after* `next build`.

---

### Q30: How does Next.js handle path aliases or absolute imports?
**Answer:**
Allows importing files without using deep relative paths like `../../../../components/Button`.
* **Configuration:** Configured in `jsconfig.json` or `tsconfig.json` using the `paths` object:
  ```json
  "paths": {
    "@/components/*": ["components/*"]
  }
  ```
* **Result:** Allows imports like `import Button from '@/components/Button'`.

---

### Q31: What is Fast Refresh?
**Answer:**
Fast Refresh is a built-in developer experience feature that provides near-instantaneous feedback for edits.
* **React State Retention:** Updates only the edited component file in the browser without reloading the page or discarding existing React state.
* **Error Resilience:** Recovers gracefully from syntax or runtime errors without requiring a hard refresh once the errors are resolved.

---

### Q32: What is the role of the `public` directory in Next.js?
**Answer:**
The `/public` folder is mapped directly to the root path of the deployed web server.
* **Assets:** Used for hosting static resources like images (e.g., `/public/logo.png`), icons (`/public/favicon.ico`), or static files (`/public/robots.txt`).
* **Access:** Accessible directly in code using absolute paths starting from the slash (e.g., `<img src="/logo.png" />`).

---

### Q33: How does client-side search routing work using `useSearchParams`?
**Answer:**
The `useSearchParams` client hook allows reading URL query parameters in App Router components.
* **Example:** In `/search?query=react`, `useSearchParams().get('query')` returns `'react'`.
* **Usage with Suspense:** Reading `useSearchParams` inside a component requires wrapping the component inside a `<Suspense>` boundary to prevent the entire page from reverting to client-side de-optimization during build pre-rendering.

---

### Q34: What is the purpose of `usePathname` and `useRouter` hooks in the App Router?
**Answer:**
* **`usePathname()`:** A client-side hook that returns the current path's pathname (e.g., `'/dashboard/settings'`).
* **`useRouter()`:** A hook that lets you navigate programmatically. It has methods like `router.push('/target')`, `router.replace()`, `router.refresh()`, and `router.back()`. Imported from `next/navigation` (not `next/router` which is for Pages Router).

---

### Q35: How do you configure redirects in `next.config.js`?
**Answer:**
Redirects can be configured programmatically inside the `redirects` async function in `next.config.js`.
* **Syntax:**
  ```javascript
  module.exports = {
    async redirects() {
      return [{ source: '/old-path', destination: '/new-path', permanent: true }];
    }
  }
  ```
* **HTTP Status Code:** `permanent: true` issues a `308 Permanent Redirect` (browser caches it). `permanent: false` issues a `307 Temporary Redirect`.

---

### Q36: What is dynamic importing in Next.js, and when should you use it?
**Answer:**
Dynamic importing lazy-loads dependencies or components when they are needed rather than bundling them in the initial load.
* **Implementation:** Done via `next/dynamic` (App/Pages Router client-side) or `React.lazy()`.
* **Use Case:** Loading heavy client-side interactive widgets (e.g., a rich-text editor or interactive maps) only when a user clicks a button or scrolls them into view.

---

### Q37: What is SWC in Next.js?
**Answer:**
SWC is an extensible Rust-based compilation platform built into Next.js to replace Babel.
* **Speed:** Compiles JavaScript/TypeScript code up to 17x faster than Babel.
* **Tasks:** Handles code transpilation, JS minification, CSS minification, and Fast Refresh integrations out of the box.

---

### Q38: How do you handle custom 404 and 500 error pages in the Pages Router?
**Answer:**
* **Custom 404:** Create a `pages/404.js` file. Statically generated at build time.
* **Custom 500:** Create a `pages/500.js` file. Executed on the server when a server-side crash occurs.
* **Combined Custom Page:** Creating `pages/_error.js` can override both, receiving a status code from the request context to render custom error messages.

---

### Q39: What are the standard cache-control headers Next.js sets for static files?
**Answer:**
* **Static Assets (HTML/JSON):** Next.js sends `Cache-Control: public, max-age=0, must-revalidate` for pages that are SSR or updated dynamically to ensure the client always checks with the server.
* **Built Assets (JS/CSS/Image Chunks):** Next.js sends `Cache-Control: public, max-age=31536000, immutable` because built files are generated with unique content-addressable hashes and never change.

---

### Q40: What are dynamic route segments, and what is the difference between `[slug]` and `[[...slug]]`?
**Answer:**
* **`[slug]` (Single Segment):** Matches exactly one segment. e.g., `/blog/react` is matched, but `/blog` and `/blog/react/tutorials` are not matched.
* **`[[...slug]]` (Optional Catch-All):** Matches any depth of folders AND the base folder. e.g., `/blog`, `/blog/react`, and `/blog/react/tutorials` are all matched.

---

### Q41: How do you read dynamic route parameters in a Server Component in the App Router?
**Answer:**
Every page component in the App Router receives a default `params` prop from the router.
* **Usage:**
  ```javascript
  export default async function Page({ params }) {
    const slug = params.slug; // If folder is [slug]/page.js
    return <div>Active Post: {slug}</div>;
  }
  ```

---

### Q42: What is the default caching behavior of the `fetch()` API in the App Router?
**Answer:**
In Next.js, the global `fetch()` Web API is overridden to support server-side caching:
* **`fetch(url)`:** Caches the response permanently in the **Data Cache** by default (equivalent to `cache: 'force-cache'`).
* **`fetch(url, { cache: 'no-store' })`:** Bypasses caching entirely, fetching data dynamically from the API endpoint on every request.
* **`fetch(url, { next: { revalidate: 3600 } })`:** Cache response, revalidating after a maximum time limit of 1 hour (ISR behavior).

---

### Q43: How do you disable Server-Side Rendering (SSR) for a component in Next.js?
**Answer:**
Using dynamic imports with the `ssr: false` configuration:
* **Example:**
  ```javascript
  import dynamic from 'next/dynamic';
  const ClientOnlyWidget = dynamic(() => import('@/components/Widget'), {
    ssr: false
  });
  ```
* **Result:** Prevents Next.js from pre-rendering the component on the server. The component is only mounted during hydration on the client side.

---

### Q44: What is the purpose of `next/head` in the Pages Router?
* Lets pages set document head elements (title, meta description, OG/Twitter cards, canonical links) per-route from any component tree position.
* Elements are collected and rendered into `<Head>` during SSR so crawlers see correct SEO tags in initial HTML.
* Ordering rule: child components override parent values for duplicate tags (last wins); global defaults belong in `_app.js`.
* In the App Router this is replaced by the declarative Metadata API (`metadata` / `generateMetadata` exports), so `next/head` knowledge maps mostly to legacy codebases.

### Q45: How do you handle different HTTP methods in API Routes and Route Handlers?
* Pages Router (`pages/api/*.js`): export one handler and branch on `req.method`:
```js
export default function handler(req, res) {
  switch (req.method) {
    case 'GET': return res.json(items);
    case 'POST': /* create */ return res.status(201).json(created);
    default: return res.setHeader('Allow', ['GET','POST']).status(405).end();
  }
}
```
* App Router (`route.ts`): export named functions per verb - `GET`, `POST`, `PATCH`, `DELETE` - Next wires them automatically; unsupported methods automatically get proper 405 responses.
* Both styles should validate input, return typed JSON, and avoid leaking stack traces.

### Q46: What is `next.config.js`? Name commonly used configuration options.
* The build/runtime control center at project root, exporting an object consumed by the CLI.
* Frequent options: `reactStrictMode`, `images.remotePatterns/domains`, `rewrites/redirects/headers`, `env`, `basePath` + `assetPrefix` (sub-path hosting/CDN), `output: 'standalone' | 'export'`, `experimental` flags (PPR, Turbopack), `eslint`/`typescript` build-time behavior, webpack/turbopack extensions.
* It's JavaScript - you can branch config by `process.env.NODE_ENV`; keep it deterministic because builds run it at compile time.

### Q47: How does Next.js support TypeScript?
* First-class: `.ts/.tsx` supported natively; `create-next-app --typescript` scaffolds `tsconfig.json` automatically (running dev/build auto-installs deps and generates missing config).
* Next generates special types: `next-env.d.ts` referencing Next's ambient types; typed route helpers via `NextPage<Props>`, `GetStaticProps`, `GetServerSideProps`, and App Router equivalents (`PageProps` patterns).
* Type-checking runs during `next build` by default (configurable via `typescript.ignoreBuildErrors` - discouraged).
* Strict-mode-friendly templates plus typed API handlers (`NextApiRequest/Response`) give end-to-end safety without extra bundler plugins (SWC strips types).

### Q48: When would you use a custom Express/Node server with Next.js - and why usually not?
* Legit reasons: legacy server integrations (existing middleware ecosystems), exotic URL schemes before rewrites existed, server-sent events with tight socket control, or libraries needing direct access to Node's HTTP server lifecycle.
* Costs: you own process management, lose some zero-config optimizations, complicate deployments (must run your server instead of `next start`), and opt out of certain platform features (some Vercel analytics/routing behaviors assume standard entry).
* Modern replacements that removed most needs: `rewrites/redirects/headers` config, Middleware, Route Handlers, and `instrumentation.ts`. Default answer: stay on the standard server unless a hard requirement forces otherwise.

### Q49: What do basePath and assetPrefix configure?
* `basePath: '/docs'` mounts the entire app under a subpath - all routes, links, and router APIs become prefix-aware automatically (`/docs/blog` served for `/blog`). Useful for multi-app hosting behind one domain or GitHub Pages-style paths.
* `assetPrefix` points static assets (JS/CSS chunks) at a CDN origin while HTML keeps serving from the app origin - offloads bandwidth and improves cache hits globally.
* They combine: assets can live on `https://cdn.example.com/docs/_next/*` while the app serves under `/docs`.
* Gotchas: hardcoded absolute URLs break under basePath (use `next/link` and relative asset imports); images config needs the path reflected too.

### Q50: Which browsers does Next.js target and how are polyfills handled?
* Next ships sane defaults: modern evergreen browsers (Chrome/Firefox/Safari/Edge current versions); the browserslist field in package.json overrides targets for SWC transpilation.
* Core JS polyfills are injected automatically for older Safari/IE-era gaps historically (fetch, URL, IntersectionObserver stubs etc.) - modern majors dropped IE support entirely, shrinking polyfill weight.
* Library-level polyfills (e.g., core-js imports) remain your responsibility for exotic APIs; `next/script` strategy controls when heavy third-party scripts load.
* Practical interview point: SWC replaces Babel for transpile+minify; if you add a `.babelrc` you silently opt OUT of SWC's faster pipeline (and lose some transforms) - usually a mistake unless migrating legacy build chains.

---

## Coding & Implementation Challenges

### Q51: Dynamic SSG Blog Page in Pages Router
**Requirement:** Build a dynamic blog page (`pages/blog/[slug].js`) that fetches blog content at build time utilizing `getStaticPaths` (to declare the paths to pre-render) and `getStaticProps` (to retrieve the blog post metadata based on the active path parameters).

```jsx
import React from 'react';

// Mock DB function
const fetchBlogPostFromMockDb = async (slug) => {
  const posts = {
    'nextjs-intro': { title: 'Introduction to Next.js', content: 'Next.js is a meta-framework on top of React...', date: '2026-08-01' },
    'rendering-patterns': { title: 'Understanding Rendering Patterns', content: 'SSG vs SSR vs ISR can be tricky to master...', date: '2026-08-15' }
  };
  return posts[slug] || null;
};

export default function BlogPostPage({ post }) {
  if (!post) {
    return <p>Loading or Post not found...</p>;
  }

  return (
    <article style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>{post.title}</h1>
        <time style={{ color: '#888', fontSize: '0.9rem' }}>Published on: {post.date}</time>
      </header>
      <section style={{ lineHeight: 1.6, fontSize: '1.1rem', color: '#333' }}>
        <p>{post.content}</p>
      </section>
    </article>
  );
}

// Generates the static HTML routes at build time
export async function getStaticPaths() {
  const dynamicPaths = [
    { params: { slug: 'nextjs-intro' } },
    { params: { slug: 'rendering-patterns' } }
  ];

  return {
    paths: dynamicPaths,
    fallback: false // Returns 404 page for unmatched slugs
  };
}

// Fetches the specific data for each individual page at build time
export async function getStaticProps({ params }) {
  const post = await fetchBlogPostFromMockDb(params.slug);

  if (!post) {
    return {
      notFound: true, // Tells Next.js to render a 404 page
    };
  }

  return {
    props: {
      post
    }
  };
}
```

---

### Q52: App Router Async Server Component Dashboard
**Requirement:** Implement a modern Next.js App Router server component dashboard page (`app/dashboard/page.js`). It must run asynchronously, fetch dummy status data from an API, and compile multiple status visual components without using client-side JavaScript hooks (`useState` or `useEffect`).

```jsx
import React from 'react';

// Dynamic API fetch helper running entirely on the server
async function fetchDashboardStats() {
  try {
    const res = await fetch('https://api.github.com/repos/vercel/next.js', {
      // Instruct Next.js to fetch dynamically for every request (recreating getServerSideProps behavior)
      cache: 'no-store' 
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch stats');
    }

    const data = await res.json();
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return fallback stats if API rate limits are hit
    return { stars: 120500, forks: 26000, openIssues: 1200 };
  }
}

// App Router Page Components are async functions by default
export default async function DashboardPage() {
  const stats = await fetchDashboardStats();

  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#111' }}>Framework Status Dashboard</h1>
        <p style={{ margin: '4px 0 0', color: '#666' }}>Fetched directly from GitHub API at request-time</p>
      </header>

      {/* Stats Cards Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#888', textTransform: 'uppercase' }}>GitHub Stars</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#0070f3' }}>
            {stats.stars.toLocaleString()}
          </p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#888', textTransform: 'uppercase' }}>Forks</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats.forks.toLocaleString()}
          </p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#888', textTransform: 'uppercase' }}>Open Issues</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
            {stats.openIssues.toLocaleString()}
          </p>
        </div>

      </div>
    </div>
  );
}
```

---

### Q53: Next Image Component Layout Implementation
**Requirement:** Build a card element showing how to use Next.js `next/image` optimizing remote image resources. Handle image scaling with responsive layout properties, configure custom blur placeholder strategies, and prevent layout shifting.

```jsx
import React from 'react';
import Image from 'next/image';

export function OptimizedProductCard() {
  return (
    <div 
      style={{
        maxWidth: '350px',
        border: '1px solid #eaeaea',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        fontFamily: 'sans-serif'
      }}
    >
      {/* Aspect-ratio parent container is essential to prevent cumulative layout shift */}
      <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: '#f0f0f0' }}>
        <Image
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30" // Unsplash product image
          alt="Premium minimalist wrist watch"
          fill // Uses absolute positioning to fill the parent container relative dimensions
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive image width source sizes
          style={{
            objectFit: 'cover', // Ensures image scales elegantly inside viewport container
          }}
          priority // Prioritizes loading of this image if it's rendered Above-The-Fold (LCP element)
          placeholder="blur"
          // Low-resolution Base64 transparent pixel to serve as blur background
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" 
        />
      </div>

      <div style={{ padding: '16px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0070f3', textTransform: 'uppercase' }}>
          Accessories
        </span>
        <h3 style={{ margin: '8px 0', fontSize: '1.2rem', color: '#333' }}>
          Classic Leather Watch
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.4, margin: '0 0 16px' }}>
          Crafted with genuine leather straps and scratch-resistant sapphire crystal glass.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#111' }}>$189.00</span>
          <button 
            style={{
              padding: '8px 16px',
              backgroundColor: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Q54: API Route in Pages Router (`pages/api/users.js`)
**Requirement:** Build an API route inside the Pages Router that supports both GET (fetching mock users data) and POST (creating a user with simple request validation) using proper HTTP status codes.

```javascript
// Mock in-memory database
const usersDb = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com' }
];

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Return 200 OK with the in-memory users list
      return res.status(200).json({ success: true, data: usersDb });

    case 'POST': {
      const { name, email } = req.body;

      // Basic Request Body Validation
      if (!name || !email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: name and email are mandatory.' 
        });
      }

      if (!email.includes('@')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format provided.' 
        });
      }

      // Generate a new user entry
      const newUser = {
        id: usersDb.length + 1,
        name,
        email
      };
      
      usersDb.push(newUser);

      // Return 211 Created with the new user record
      return res.status(201).json({ success: true, data: newUser });
    }

    default:
      // Set Allowed Headers and return 405 Method Not Allowed
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ 
        success: false, 
        message: `Method ${method} is not supported on this endpoint.` 
      });
  }
}
```

---

### Q55: Route Handler in App Router (`app/api/items/route.js`)
**Requirement:** Implement a modern App Router Route Handler using native Request/Response types. Handle custom JSON responses, dynamic status headers, and custom POST request parsing.

```javascript
import { NextResponse } from 'next/server';

// Mock in-memory item database
const items = [
  { id: '101', title: 'Ergonomic Desk', status: 'In Stock' }
];

// Handles GET requests
export async function GET() {
  return NextResponse.json(
    { success: true, count: items.length, data: items },
    { status: 200 }
  );
}

// Handles POST requests
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, status } = body;

    // Field verification
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Missing 'title' field in JSON payload." },
        { status: 400 }
      );
    }

    const newItem = {
      id: String(Date.now()),
      title,
      status: status || 'Pending'
    };

    items.push(newItem);

    return NextResponse.json(
      { success: true, data: newItem },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Malformed JSON body input.' },
      { status: 400 }
    );
  }
}
```

---

### Q56: Client Component Search Bar in App Router
**Requirement:** Build a client component Search Bar in the App Router that dynamically pushes search queries to URL params (`?query=user_input`) using `useSearchParams`, `usePathname`, and `useRouter`.

```jsx
'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term) => {
    // Create query params helper instance
    const params = new URLSearchParams(searchParams.toString());

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // Wrap push transition state inside startTransition hook for concurrent rendering performance
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px 0', fontFamily: 'sans-serif' }}>
      <label 
        htmlFor="search" 
        style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px' }}
      >
        Search Catalog
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id="search"
          type="text"
          defaultValue={searchParams.get('query') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type to search items..."
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
        {isPending && (
          <span 
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.8rem',
              color: '#888'
            }}
          >
            Searching...
          </span>
        )}
      </div>
    </div>
  );
}
```

---

### Q57: Nested Layout Structure in App Router
**Requirement:** Implement a nested layout structure in the App Router. Build a main Dashboard layout with a left sidebar, and a settings page (`app/dashboard/settings/page.js`) that renders correctly inside it.

```jsx
// File: app/dashboard/layout.js
import React from 'react';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar Section */}
      <aside 
        style={{
          width: '240px',
          backgroundColor: '#1e293b',
          color: '#fff',
          padding: '24px',
          display: 'flex',
          flexDirection: 'col'
        }}
      >
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 24px 0', color: '#38bdf8' }}>Admin Portal</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a href="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Dashboard Home</a>
          <a href="/dashboard/settings" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>Settings</a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '40px' }}>
        {children} {/* This is where nested pages are loaded */}
      </main>
    </div>
  );
}
```

```jsx
// File: app/dashboard/settings/page.js
import React from 'react';

export default function SettingsPage() {
  return (
    <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h1 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', color: '#0f172a' }}>System Settings</h1>
      <p style={{ color: '#64748b', margin: '0 0 24px 0' }}>Configure global settings, database profiles, and mail triggers.</p>
      
      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Site URL</label>
          <input 
            type="text" 
            defaultValue="https://example.com" 
            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Admin Email</label>
          <input 
            type="email" 
            defaultValue="admin@example.com" 
            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>
        <button 
          type="button" 
          style={{
            padding: '10px 16px',
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Save Configurations
        </button>
      </form>
    </div>
  );
}
```
