# Athenaeum — The Developer's Codex

A gated, SEO-first reading room of engineering-interview codices: **27 volumes ·
3,600+ curated questions** (React, Next.js, Node.js, JavaScript, TypeScript, Java,
Spring Boot, SQL, PostgreSQL, MongoDB, Prisma, Redis, DBMS, Django, FastAPI, Express,
Docker, OS, Networks, System Design, LLD, OOPs, HTML, CSS, Redux, Context API,
Zustand) — each graded **Basic / Medium / Hard**.

Built with **Next.js 15 (App Router) · React 19 · Tailwind CSS v4**, styled in the
*Academia / Classical* design language.

## Quick start

```bash
npm install
npm run dev          # syncs content from ../interview-prep → serves :3000
```

Production:

```bash
npm run build && npm start
```

## Your administrator key

Seeded automatically on first boot:

```
Email:    admin@athenaeum.dev
Password: Athenaeum#1876
```

The Warden bypasses the paywall entirely. Override via `.env.local`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD` — quote passwords containing `#`), then delete
`data/db.json` (JSON mode) or drop the `users` collection (Mongo) to re-seed.

## Access model

| Visitor | Can do |
|---|---|
| Anonymous | Landing, catalogue, **first 5 questions of every codex** |
| Registered | Same preview + personal desk/ledger |
| Paid Scholar | Everything, forever — all volumes incl. future additions |
| Warden | Everything, no payment |

## Payments (Razorpay)

* **₹399 India / $9 international** — one-time, lifetime.
* Currency is **auto-selected by location**: edge country headers on hosting platforms;
  timezone/locale fallback client-side. Only ONE price is ever shown.
* Live mode: set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, `PAYMENT_MODE=live`.
  Orders created server-side; payments verified via HMAC signature before sealing access.
* Sandbox mode: while keys are empty and `PAYMENT_MODE=allow-sandbox`, the desk records a
  simulated settlement — full journey testable without real money.

## Database

Set `MONGODB_URI` (+ optional `MONGODB_DB`) in `.env.local` and restart — the app uses
MongoDB automatically (`users` + `orders` collections; unique email index created).

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB=athenaeum
```

With **no URI configured**, an atomic local JSON store (`data/db.json`) keeps every
feature working offline — zero native dependencies either way.

## Content pipeline

`predev/prebuild/prestart` re-sync markdown from `../interview-prep` into `content/`
(configurable via `CONTENT_SOURCE`). Add/edit `.md` files there and redeploy —
counts across the site update automatically.

Annex ("More") volumes live beside core ones; landing splits them into the Core
Collection and The Annex sections automatically (`ANNEX_SLUGS` in `src/lib/site.ts`).

## Route map

```
/                        Landing (hero, stats, proclamation, core+annex volumes, pricing, FAQ)
/pricing                 Ledger desk — geo-selected currency, Razorpay/sandbox checkout
/login  /register        Readers' entrance / register of scholars
/library                 Public catalogue
/library/[stack]         Volume page: three degrees + counts   [public]
/library/[stack]/[level] Codex reader: first 5 free, rest sealed  [public preview]
/account                 Seal status + receipts ledger           [auth]
/api/auth/*              register · login · logout · session
/api/payments/*          order · verify · sandbox
/api/geo                 currency resolution for visitors
```

## SEO

Static prerendered landing, Metadata API + OG/Twitter tags, JSON-LD Product+Offers,
sitemap.xml, robots.txt. Catalogue & preview pages are indexable; account/API are not.
