import Link from "next/link";
import { ArrowRight } from "lucide-react";
import OrnateDivider from "@/components/OrnateDivider";
import StackCard from "@/components/StackCard";
import GeoPrice from "@/components/GeoPrice";
import {
  FaqSection,
  FeaturesSection,
  PricingPreview,
  QuoteBand
} from "@/components/LandingSections";
import { getLibraryStats, listStacksSplit } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function HomePage() {
  const { core, annex } = listStacksSplit();
  const stats = getLibraryStats();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url,
        description: SITE.description
      },
      {
        "@type": "Product",
        name: `${SITE.name} — Scholar Access`,
        description: SITE.description,
        brand: { "@type": "Brand", name: SITE.name },
        offers: [
          { "@type": "Offer", priceCurrency: "INR", price: "399", availability: "https://schema.org/InStock", url: `${SITE.url}/pricing` },
          { "@type": "Offer", priceCurrency: "USD", price: "9.00", availability: "https://schema.org/InStock", url: `${SITE.url}/pricing` }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-32 lg:pt-28">
          <div>
            <p className="kicker">Est. {SITE.established} · A Private Reading Room</p>
            <h1 className="font-heading mt-6 text-5xl leading-[1.08] tracking-tight sm:text-6xl xl:text-7xl">
              Every question an interviewer may ask —{" "}
              <em className="text-brass-light">bound in one library.</em>
            </h1>
            <p className="drop-cap mt-8 max-w-xl text-lg leading-relaxed text-faded">
              Athenaeum gathers {stats.questions.toLocaleString("en-IN")} curated interview
              questions across {stats.volumes} disciplines of software craft — each graded from
              first principles to architecture. The first five passages of every codex are
              free to any wanderer; one small key opens all the rest.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/pricing" className="btn btn-primary h-14 px-10 text-[13px]">
                Unlock everything · <GeoPrice className="mx-1" />
              </Link>
              <Link href="#volumes" className="btn btn-secondary h-14 px-8">
                Survey the shelves
              </Link>
            </div>

            <p className="mt-6 font-body text-sm italic text-faded">
              One payment · lifetime reading rights · never a subscription
            </p>
          </div>

          {/* Arched window artwork */}
          <div className="ornate-frame mx-auto hidden w-full max-w-md rounded border border-grain bg-oak p-3 md:block">
            <div className="arch-top relative aspect-[4/5] overflow-hidden border border-grain bg-background">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 18%, rgba(201,169,98,0.22), transparent 55%), linear-gradient(180deg,#2e251e 0%, #171310 78%)"
                }}
              />
              {/* Open book line-art */}
              <svg viewBox="0 0 200 140" className="absolute inset-0 m-auto h-44 w-44 text-brass/80" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M100 34c-16-9-38-12-58-8v76c20-4 42-1 58 8z" />
                <path d="M100 34c16-9 38-12 58-8v76c-20-4-42-1-58 8z" />
                <path d="M100 34v76" strokeLinecap="round" />
                <path d="M56 52c12-2 24-1 34 3M56 66c12-2 24-1 34 3M56 80c12-2 24-1 34 3" opacity="0.55" strokeLinecap="round"/>
                <path d="M144 52c-12-2-24-1-34 3M144 66c-12-2-24-1-34 3M144 80c-12-2-24-1-34 3" opacity="0.55" strokeLinecap="round"/>
                <circle cx="100" cy="22" r="2.5" fill="currentColor" stroke="none" />
              </svg>
              <span aria-hidden="true" className="absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-[10px] uppercase tracking-[0.35em] text-faded">
                Liber Omnis
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ledger ─────────────────────────────────────────────────── */}
      <section className="border-y border-grain bg-oak/30 py-14">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-6 md:grid-cols-4">
          {[
            { value: String(stats.volumes), label: "Volumes shelved" },
            { value: String(stats.codices), label: "Codices catalogued" },
            { value: stats.questions.toLocaleString("en-IN"), label: "Questions answered" },
            { value: stats.challenges.toLocaleString("en-IN"), label: "Implementation folios" }
          ].map((s) => (
            <div key={s.label} className="group text-center">
              <dd className="font-heading text-5xl text-parchment transition-transform duration-300 group-hover:scale-110 group-hover:text-brass-light">
                {s.value}
              </dd>
              <dt className="kicker mt-3 transition-colors duration-300 group-hover:text-brass-light">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Proclamation ─────────────────────────────────────────────────── */}
      <section id="proclamation" className="scroll-mt-24 py-24 sm:py-32">
        <div className="ornate-frame mx-auto max-w-4xl rounded border border-grain bg-oak/50 p-10 sm:p-14">
          <header className="text-center">
            <p className="kicker">The Proclamation</p>
            <h2 className="font-heading mx-auto mt-5 max-w-2xl text-4xl leading-tight sm:text-5xl">
              Interviews are not trivia. They are readings.
            </h2>
          </header>
          <OrnateDivider className="mx-auto mt-9 w-72" />

          <div className="mx-auto mt-10 max-w-2xl space-y-6 text-lg leading-relaxed text-faded [&>p:first-child]:text-parchment">
            <p className="drop-cap">
              Somewhere between the tutorial and the offer letter lies a long corridor of
              questions — some fair, some cruel, all predictable in shape. This library was
              assembled by walking that corridor again and again until its every door had a name.
            </p>
            <p>
              Nineteen codices stand shelved here: frontend frameworks, server runtimes,
              languages, databases, networks, operating systems, system design. Each is
              graded into three degrees so a reader always knows whether they are standing
              on foundations or leaning over the deep end. Each carries an implementation
              folio, because writing beats reciting.
            </p>
            <p>
              We keep no seats for casual scrolling. A single contribution admits you for
              life — and the whole collection, additions included, becomes yours to read.
            </p>
          </div>

          <p className="mt-10 text-center font-display text-[11px] uppercase tracking-[0.3em] text-brass">
            — The Warden&apos;s Hand
          </p>
        </div>
      </section>

      {/* ── Volumes ──────────────────────────────────────────────────────── */}
      <section id="volumes" className="scroll-mt-24 border-t border-grain py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <header className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker">The Core Collection</p>
              <h2 className="font-heading mt-4 text-4xl sm:text-5xl">{core.length} volumes of craft</h2>
            </div>
            <Link href="/library" className="nav-link flex items-center gap-2">
              Enter the reading room <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </header>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {core.map((stack) => (
              <StackCard key={stack.slug} stack={stack} />
            ))}
          </div>

          {annex.length > 0 && (
            <div className="mt-28">
              <header className="text-center">
                <p className="kicker">More · The Annex</p>
                <h3 className="font-heading mt-4 text-3xl sm:text-4xl">
                  {annex.length} further wings of the library
                </h3>
                <p className="mx-auto mt-4 max-w-xl leading-relaxed text-faded">
                  Newer codices — state management, Python backends, the JVM,
                  and the data layer — shelved with the same discipline.
                </p>
              </header>
              <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {annex.map((stack) => (
                  <StackCard key={stack.slug} stack={stack} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <FeaturesSection />
      <PricingPreview />
      <QuoteBand />
      <FaqSection />

      {/* ── Final summons ────────────────────────────────────────────────── */}
      <section className="border-t border-grain py-24 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="kicker">The Door Stands Ajar</p>
          <h2 className="font-heading mt-5 text-4xl sm:text-5xl">
            Take the key. Keep it forever.
          </h2>
          <p className="mt-6 font-heading text-3xl text-brass-light">
            <GeoPrice />
          </p>
          <p className="mt-2 font-body italic text-faded">
            once — localized to your region, never again
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/pricing" className="btn btn-primary h-14 px-12">
              Claim scholar access
            </Link>
            <Link href="/login" className="btn btn-ghost h-12 px-4 text-brass-light">
              Already inscribed? Sign in →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
