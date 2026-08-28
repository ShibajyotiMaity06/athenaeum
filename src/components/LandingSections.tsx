import Link from "next/link";
import { Check, ChevronDown, Feather, Layers, ScrollText, Star } from "lucide-react";
import OrnateDivider from "@/components/OrnateDivider";
import GeoPrice from "@/components/GeoPrice";

/* ── Features ─────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Layers,
    title: "Three Degrees of Depth",
    body: "Every discipline is graded — Foundations to ground you, Intermediate to sharpen mechanism and trade-off, Advanced to expose internals, failure modes and architecture."
  },
  {
    icon: ScrollText,
    title: "The Implementation Folio",
    body: "Beyond theory, each codex carries worked implementation challenges — polyfills, parsers, rate limiters, type-level machines — written out in full."
  },
  {
    icon: Feather,
    title: "Set in Living Serif",
    body: "Answers are typeset for long reading: code under lamplight-dark panes, tables ruled in wood grain, ornament only where it serves the scholar."
  }
];

export function FeaturesSection() {
  return (
    <section className="border-y border-grain bg-oak/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <header className="text-center">
          <p className="kicker">Volume II · The Method</p>
          <h2 className="font-heading mt-4 text-4xl sm:text-5xl">Why readers stay</h2>
        </header>
        <OrnateDivider className="mx-auto mt-8 w-64" />

        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brass/40 bg-background">
                <f.icon className="h-6 w-6 text-brass" strokeWidth={1.25} />
              </span>
              <h3 className="font-heading mt-6 text-2xl">{f.title}</h3>
              <p className="mt-3 leading-relaxed text-faded">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing preview ──────────────────────────────────────────────────────── */

const INCLUDED = [
  "All 27 volumes — core collection & the annex",
  "3,600+ curated questions with full model answers",
  "Implementation folios included throughout",
  "First five passages of every codex, always free",
  "Basic · Medium · Hard grading everywhere",
  "Lifetime access incl. every future addition"
];

export function PricingPreview() {
  return (
    <section className="py-24 sm:py-32" id="access">
      <div className="mx-auto max-w-4xl px-6">
        <header className="text-center">
          <p className="kicker">Volume III · Terms of Access</p>
          <h2 className="font-heading mt-4 text-4xl sm:text-5xl">One key. The whole library.</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-faded">
            No tiers, no trials, no renewals. A single contribution keeps the
            lamps lit and the doors open to you forever.
          </p>
        </header>

        <div className="relative mx-auto mt-16 max-w-2xl">
          <span
            className="wax-seal absolute -top-5 right-8 z-10 flex h-16 w-16 rotate-6 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <Star className="h-6 w-6 text-parchment" strokeWidth={1.25} />
          </span>

          <div
            className="rounded border-2 border-brass/80 bg-oak p-10 shadow-[inset_0_0_0_4px_#251e19,inset_0_0_0_5px_rgba(74,63,53,0.8),0_18px_50px_rgba(0,0,0,0.45)] sm:p-12"
          >
            <p className="kicker text-center">Certificate of Admission</p>
            <div className="mt-6 text-center">
              <GeoPrice className="font-heading text-6xl tracking-tight text-brass-light sm:text-7xl" />
              <p className="mt-3 font-body italic text-faded">
                localized for your region · one-time · lifetime
              </p>
            </div>

            <ul className="mx-auto mt-10 grid max-w-lg gap-4">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px]">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-brass" strokeWidth={1.75} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 text-center">
              <Link href="/pricing" className="btn btn-primary h-14 px-12">
                Take your seat
              </Link>
              <p className="mt-4 text-sm italic text-faded">
                Settled securely through Razorpay · UPI, cards &amp; net-banking
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Quote band ───────────────────────────────────────────────────────────── */

export function QuoteBand() {
  return (
    <section className="border-y border-grain bg-oak/30 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span aria-hidden="true" className="text-2xl text-brass">❦</span>
        <blockquote className="font-heading mt-6 text-2xl italic leading-relaxed text-parchment sm:text-3xl">
          “The reading of all good books is like a conversation with the finest
          minds of past centuries.”
        </blockquote>
        <cite className="kicker mt-6 block not-italic">— René Descartes</cite>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: "What do I get without paying anything?",
    a: "Every codex opens its first five passages to every visitor — no account needed. That is 135+ model answers you can read right now across all 27 volumes."
  },
  {
    q: "What does the key unlock?",
    a: "Everything currently shelved and everything ever added: all 27 volumes spanning frontend, backend, languages, databases, networks, operating systems and system design — each graded Basic, Medium and Hard, implementation folios included."
  },
  {
    q: "How much does it cost?",
    a: "Scholar admission is localized to your region (one single payment, never a subscription). Complete, permanent lifetime access.",
    isCost: true
  },
  {
    q: "How do payments work?",
    a: "Contributions are processed securely by Razorpay — supporting UPI, debit/credit cards, net-banking and wallets. Your currency is detected automatically from your location. Once verified, Scholar access is bound to your account permanently."
  },
  {
    q: "May I inspect the shelves before paying?",
    a: "Yes. The catalogue of volumes and their sizes is open to all, and registered readers may walk the Reading Room corridors to see how every codex is organised before deciding."
  },
  {
    q: "What if something goes wrong with my payment?",
    a: "If a charge succeeds but your access was not sealed — rare, but the world is imperfect — sign in and visit Your Desk; unsettled entries show there. Still stuck? Write to the warden and it will be set right."
  }
];

export function FaqSection() {
  return (
    <section className="py-24" id="faq">
      <div className="mx-auto max-w-3xl px-6">
        <header className="text-center">
          <p className="kicker">Volume IV · Questions Posed</p>
          <h2 className="font-heading mt-4 text-4xl sm:text-5xl">Before you enrol</h2>
        </header>
        <OrnateDivider className="mx-auto mt-8 w-64" />

        <div className="mt-14 grid gap-4">
          {FAQS.map((f) => (
            <details key={f.q} className="codex-entry rounded border border-grain bg-oak px-6 py-5">
              <summary>
                <span className="q-title font-heading flex-1 text-lg sm:text-xl">{f.q}</span>
                <ChevronDown className="chev h-4 w-4 shrink-0 self-center" strokeWidth={1.5} />
              </summary>
              <div className="mt-4 pl-9 leading-relaxed text-faded">
                {f.isCost ? (
                  <p>
                    Exactly <GeoPrice className="font-semibold text-parchment" /> for your region — one single contribution, never a subscription.
                  </p>
                ) : (
                  <p>{f.a}</p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
