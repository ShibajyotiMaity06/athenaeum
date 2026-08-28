import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Database,
  Globe,
  Layers,
  Lock,
  Server,
  Shield,
  Sparkles,
  Terminal,
  X,
  Zap
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import GeoPrice from "@/components/GeoPrice";
import TrustedUsersBadge from "@/components/TrustedUsersBadge";
import { getLibraryStats, listStacks } from "@/lib/content";
import { ROLE_PILLARS, SITE, TECH_CATEGORIES } from "@/lib/site";
import { getTrustedUserCount } from "@/lib/db";

const FAQS = [
  {
    q: "What is included with free access vs lifetime access?",
    a: "Every visitor can read the first 5 questions of every single difficulty level across all 27+ technologies for free — that is over 400+ complete model answers with no account or card required. The one-time lifetime key unlocks all 3,600+ questions, full implementation code folios, and all future technology additions forever."
  },
  {
    q: "Is it really a one-time payment with no subscription?",
    a: "Yes. Exactly one single payment localized to your country. There are no recurring charges, no monthly renewals, and no hidden fees. Once enrolled, your account has permanent lifetime access."
  },
  {
    q: "How are the questions organized?",
    a: "Content is structured into three clear degrees per technology: Easy (Foundations, core definitions, and screening questions), Medium (Practical patterns, edge cases, and real-world mechanisms), and Hard (Runtime internals, architecture, memory models, and concurrency)."
  },
  {
    q: "Is System Design (HLD & LLD) covered?",
    a: "Yes. DevPrep includes dedicated, comprehensive tracks for High-Level Design (HLD: scalability, load balancing, caching, sharding, distributed transactions) and Low-Level Design (LLD: SOLID principles, design patterns, clean architecture)."
  },
  {
    q: "How does DevPrep compare to LeetCode or GeeksforGeeks?",
    a: "LeetCode focuses strictly on Data Structures & Algorithms (DSA). General sites like GFG have outdated, crowd-sourced, and uncurated articles. DevPrep focuses on technical engineering domain knowledge — the exact framework internals, architecture, and language mechanics interviewers actually test."
  },
  {
    q: "Which payment methods are supported?",
    a: "Payments are processed securely via Razorpay, supporting UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, Net Banking, and major international cards."
  },
  {
    q: "What if I experience issues with my payment?",
    a: "Your access is bound to your account automatically upon payment verification. If any network timeout occurs, sign in and your order status can be re-verified instantly, or contact support@devprep.online for immediate assistance."
  }
];

export default async function HomePage() {
  const stats = getLibraryStats();
  const allStacks = listStacks();
  const initialUserCount = await getTrustedUserCount();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/#technologies`,
      "query-input": "required name=search_term_string"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  };

  return (
    <div className="flex flex-col bg-[var(--bg-chassis)]">
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={faqJsonLd} />

      {/* ─────────────────────────────────────────────────────────────────────
          1. HERO SECTION WITH HARDWARE ACCENTS & LIVE USER BADGE
         ───────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[var(--border-recessed)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              {/* Live Trusted Users Counter Badge */}
              <div className="mb-6">
                <TrustedUsersBadge initialCount={initialUserCount} />
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-[1.08]">
                Stop preparing randomly.{" "}
                <span className="text-[var(--accent)]">
                  Prepare systematically.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-xl">
                One unified platform for Web Development, Backend, Core CS, System Design &amp; DevOps.
                Graded strictly from Foundations to Internals. <strong className="text-[var(--text-primary)]"><GeoPrice /> lifetime</strong>, no subscription.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="#technologies"
                  className="btn-industrial btn-industrial-primary py-4 px-8 text-sm shadow-[var(--shadow-btn-primary)]"
                >
                  <span>Start Free · Browse Questions</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-industrial btn-industrial-secondary py-4 px-7 text-sm"
                >
                  <span>Unlock Lifetime — <GeoPrice className="ml-1" /></span>
                </Link>
              </div>

              {/* Trust Strip */}
              <div className="mt-8 pt-6 border-t border-[var(--border-recessed)] flex flex-wrap items-center gap-6 font-mono text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>5 Free Qs per tech</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified model answers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Never a subscription</span>
                </div>
              </div>
            </div>

            {/* 3D CSS Hardware Device Mockup */}
            <div className="crt-bezel relative">
              <div className="flex items-center justify-between pb-3 px-1 border-b border-[#2d3436] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff4757] shadow-[0_0_6px_#ff4757]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffa502]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2ed573]" />
                  <span className="font-mono text-[11px] text-[#a8b2d1] ml-2">DEVPREP-TERMINAL // v2.6</span>
                </div>
                <div className="font-mono text-[10px] text-[#2ed573] uppercase tracking-wider font-bold">
                  ONLINE · 27 NODES
                </div>
              </div>

              <div className="crt-screen p-5 text-left font-mono text-xs text-[#f0f2f5] space-y-4">
                <div className="flex items-center justify-between text-[#a8b2d1] pb-2 border-b border-[#1e272e]">
                  <span>SYSTEM_LOAD: 3,600+ ENTRIES</span>
                  <span className="text-[#55efc4]">DIFFICULTY: GRADED</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-[#15191d] border border-[#232930] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">● EASY</span>
                      <span className="text-zinc-200">React Reconciliation &amp; Fiber</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">OPEN</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#15191d] border border-[#232930] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">▲ MEDIUM</span>
                      <span className="text-zinc-200">PostgreSQL MVCC &amp; WAL</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">OPEN</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#15191d] border border-[#232930] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">■ HARD</span>
                      <span className="text-zinc-200">Distributed Consensus (Raft)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">LOCKED</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#111417] border border-[#2d3436] font-mono text-[11px] text-[#74b9ff] space-y-1">
                  <div className="text-zinc-400">// Model Answer Preview:</div>
                  <div className="text-[#a8b2d1]">
                    &quot;Fiber breaks synchronous recursive rendering into prioritized incremental units of work...&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          2. ROLE PILLARS (Career Track Portals)
         ───────────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-[var(--border-recessed)] bg-[var(--bg-chassis)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="stamped-label-accent">CAREER-TARGETED CODICES</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] mt-2">
              Select Your Target Engineering Role
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Curated, complete interview syllabus specifically designed for role-specific interview loops.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Object.values(ROLE_PILLARS).map((role) => (
              <Link
                key={role.slug}
                href={`/${role.slug}`}
                className="industrial-card group p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">
                      {role.techSlugs.length} TECHNOLOGIES
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] group-hover:animate-ping" />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {role.roleName}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                    {role.metaDescription.slice(0, 110)}…
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-recessed)] flex items-center justify-between text-xs font-mono text-[var(--text-primary)]">
                  <span>View Role Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          3. THREE DEGREES OF DIFFICULTY (Industrial Progression)
         ───────────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-[var(--border-recessed)] bg-[var(--bg-chassis)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="stamped-label-accent">CURATED METHODOLOGY</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] mt-2">
              Three Degrees of Calibration
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              No generic question dumps. Every question is calibrated against actual interview stages.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Easy Degree */}
            <div className="industrial-card p-8 flex flex-col justify-between corner-screws">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-xs font-bold mb-4 border border-emerald-500/20">
                  <span>DEGREE 01 · EASY</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Foundations &amp; Screening
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  First-round phone screens, core terminology, execution model, fundamentals, and syntax precision.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-[var(--text-primary)]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Exact definitions &amp; mental models</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Common trap questions</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-[var(--border-recessed)] font-mono text-xs text-emerald-500 font-bold">
                ✓ 5 Free Questions in every technology
              </div>
            </div>

            {/* Medium Degree */}
            <div className="industrial-card p-8 flex flex-col justify-between corner-screws">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-mono text-xs font-bold mb-4 border border-amber-500/20">
                  <span>DEGREE 02 · MEDIUM</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Mechanisms &amp; Real-World
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Production patterns, state synchronization, caching layers, error recovery, and framework nuances.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-[var(--text-primary)]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                    <span>Concurrency &amp; race conditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500" />
                    <span>Memory leak diagnoses</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-[var(--border-recessed)] font-mono text-xs text-amber-500 font-bold">
                ✓ 5 Free Questions in every technology
              </div>
            </div>

            {/* Hard Degree */}
            <div className="industrial-card p-8 flex flex-col justify-between corner-screws border-2 border-[var(--accent)]/30">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 font-mono text-xs font-bold mb-4 border border-rose-500/20">
                  <span>DEGREE 03 · HARD</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Internals &amp; Architecture
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Engine internals, memory layout, lock contention, distributed consensus, low-level OS primitives.
                </p>
                <div className="mt-6 space-y-2.5 font-mono text-xs text-[var(--text-primary)]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-rose-500" />
                    <span>V8, JVM, libuv internals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-rose-500" />
                    <span>Distributed trade-offs (CAP, ACID)</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-[var(--border-recessed)] font-mono text-xs text-rose-500 font-bold">
                ✓ 5 Free Questions in every technology
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4. ALL 27+ TECHNOLOGY HUBS (Organized by Engineering Discipline)
         ───────────────────────────────────────────────────────────────────── */}
      <section id="technologies" className="py-20 border-b border-[var(--border-recessed)] bg-[var(--bg-chassis)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="stamped-label-accent">THE COMPLETE CODEX</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] mt-2">
              Explore All 27+ Technology Codices
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Direct access to every technology curriculum with 5 free unlocked questions per difficulty level.
            </p>
          </div>

          <div className="space-y-12">
            {TECH_CATEGORIES.map((cat) => {
              const catStacks = allStacks.filter((s) => cat.slugs.includes(s.slug));
              if (catStacks.length === 0) return null;

              return (
                <div key={cat.name} className="industrial-card p-6 sm:p-8 corner-screws">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--border-recessed)]">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                      <h3 className="font-sans font-bold text-lg text-[var(--text-primary)]">
                        {cat.name}
                      </h3>
                    </div>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {catStacks.length} CODICES AVAILABLE
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {catStacks.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/${s.hubSlug}`}
                        className="industrial-recessed group p-4 flex flex-col justify-between hover:border-[var(--accent)] transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                              {s.name}
                            </h4>
                            <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1">
                              {s.questionCount} Total Questions
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-500 px-2 py-0.5 rounded bg-emerald-500/10">
                            5 FREE / LEVEL
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[var(--border-recessed)] flex items-center justify-between font-mono text-[11px] text-[var(--text-muted)]">
                          <span>Easy · Medium · Hard</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-[var(--accent)]" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          5. FREEMIUM DEMO BANNER (Interactive Preview)
         ───────────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-[var(--border-recessed)] bg-[var(--bg-chassis)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="industrial-card p-8 sm:p-12 text-center corner-screws">
            <span className="stamped-label-accent">ZERO-RISK VERIFICATION</span>
            <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mt-2">
              400+ Complete Model Answers Free Forever
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
              We never ask for payment upfront. Read 5 full questions per difficulty across React, Node.js, SQL, System Design, and 23 other technologies before deciding.
            </p>

            {/* Visual Question Unlock Simulator */}
            <div className="mt-8 max-w-lg mx-auto space-y-2.5 text-left font-mono">
              {[
                "Q1. How does React Fiber work under the hood?",
                "Q2. Explain PostgreSQL MVCC isolation levels.",
                "Q3. How does Node.js libuv event loop handle threadpool tasks?",
                "Q4. Difference between optimistic vs pessimistic locking?",
                "Q5. How does Raft algorithm ensure leader election consistency?"
              ].map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[var(--bg-chassis)] border border-[var(--border-card)] flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-xs font-bold text-emerald-500 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{q} · Free Preview</span>
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">Full Solution Open</span>
                </div>
              ))}

              <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--accent)]/40 shadow-[var(--shadow-recessed)] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--accent)] font-mono text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Q6 to Q120 · Unlocked with Lifetime Key</span>
                </div>
                <span className="text-xs font-mono font-black text-[var(--text-primary)] px-2 py-0.5 rounded bg-[var(--bg-recessed)] border border-[var(--border-card)]">
                  <GeoPrice />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          6. PRICING SECTION (Lifetime Punched Metal Style)
         ───────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 border-b border-[var(--border-recessed)] bg-[var(--bg-chassis)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="stamped-label-accent">LIFETIME ACCESS PASS</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)] mt-2">
            One Key. Every Technical Question.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)] max-w-xl mx-auto">
            No recurring monthly charges. No renewal reminders. Pay once and keep your technical interview edge forever.
          </p>

          <div className="mt-12 industrial-card p-8 sm:p-12 max-w-xl mx-auto corner-screws border-2 border-[var(--accent)]/40 relative">
            <div className="inline-block px-3 py-1 rounded-full bg-[var(--bg-recessed)] font-mono text-xs font-bold text-[var(--accent)] mb-4 border border-[var(--border-card)]">
              LIFETIME SCHOLAR ACCESS
            </div>

            <div className="mb-6">
              <span className="font-mono text-5xl sm:text-6xl font-black text-[var(--text-primary)]">
                <GeoPrice />
              </span>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-2">
                One-time settlement · Inclusive of all taxes · No recurring fees
              </p>
            </div>

            <div className="space-y-3 text-left pt-6 border-t border-[var(--border-recessed)]">
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>All 27+ Technology Codices unlocked immediately</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>3,600+ Questions with verified, production-grade model answers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Easy, Medium &amp; Hard difficulty levels throughout</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Full practical coding folios &amp; polyfills</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-primary)] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>All future questions &amp; new technologies included at no extra cost</span>
              </div>
            </div>

            <Link
              href="/pricing"
              className="btn-industrial btn-industrial-primary py-4 px-10 text-sm w-full mt-8 shadow-[var(--shadow-btn-primary)]"
            >
              <span>Enrol &amp; Unlock Everything</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="mt-4 text-xs font-mono text-[var(--text-muted)]">
              Processed securely through Razorpay · 256-bit SSL encryption
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          7. COMPARISON MATRIX (DevPrep vs LeetCode vs GFG)
         ───────────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-[var(--border-recessed)] bg-[var(--bg-chassis)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="stamped-label-accent">OBJECTIVE COMPARISON</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)] mt-2">
              Why Engineers Choose DevPrep
            </h2>
          </div>

          <div className="industrial-card p-6 sm:p-8 corner-screws overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-recessed)] text-[var(--text-muted)]">
                  <th className="p-4">DIMENSION</th>
                  <th className="p-4 text-[var(--accent)] font-bold">DEVPREP</th>
                  <th className="p-4">GENERAL ARTICLES (GFG)</th>
                  <th className="p-4">ALGO SITES (LeetCode)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-recessed)]">
                <tr>
                  <td className="p-4 font-bold text-[var(--text-primary)]">Curated Model Answers</td>
                  <td className="p-4 text-emerald-500 font-bold">✓ Production-Grade Code</td>
                  <td className="p-4 text-[var(--text-muted)]">Crowd-sourced / Inconsistent</td>
                  <td className="p-4 text-[var(--text-muted)]">User Forum Submissions</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-[var(--text-primary)]">Calibration Levels</td>
                  <td className="p-4 text-emerald-500 font-bold">3 Rigorous Degrees (E/M/H)</td>
                  <td className="p-4 text-[var(--text-muted)]">Uncalibrated Lists</td>
                  <td className="p-4 text-[var(--text-muted)]">Algorithmic Only</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-[var(--text-primary)]">Framework Internals</td>
                  <td className="p-4 text-emerald-500 font-bold">Deep (Fiber, JVM, libuv, etc.)</td>
                  <td className="p-4 text-[var(--text-muted)]">Superficial Syntax</td>
                  <td className="p-4 text-[var(--text-muted)]">None (Algorithms only)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-[var(--text-primary)]">System Design (HLD &amp; LLD)</td>
                  <td className="p-4 text-emerald-500 font-bold">Included in Core Access</td>
                  <td className="p-4 text-[var(--text-muted)]">Fragmented Articles</td>
                  <td className="p-4 text-[var(--text-muted)]">Separate Paid Upsell</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-[var(--text-primary)]">Pricing Model</td>
                  <td className="p-4 text-emerald-500 font-bold"><GeoPrice /> One-Time Lifetime</td>
                  <td className="p-4 text-[var(--text-muted)]">Ad-heavy or Free/Messy</td>
                  <td className="p-4 text-[var(--text-muted)]">$35+/mo Recurring</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          8. SOCIAL PROOF / STATS STRIP
         ───────────────────────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-[var(--border-recessed)] bg-[var(--bg-chassis)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="industrial-recessed p-6">
              <span className="font-mono text-3xl sm:text-4xl font-black text-[var(--text-primary)]">3,600+</span>
              <p className="stamped-label text-[10px] mt-2">QUESTIONS CURATED</p>
            </div>
            <div className="industrial-recessed p-6">
              <span className="font-mono text-3xl sm:text-4xl font-black text-[var(--accent)]">27+</span>
              <p className="stamped-label text-[10px] mt-2">TECH DISCIPLINES</p>
            </div>
            <div className="industrial-recessed p-6">
              <span className="font-mono text-3xl sm:text-4xl font-black text-[var(--text-primary)]">100%</span>
              <p className="stamped-label text-[10px] mt-2">MODEL ANSWERS</p>
            </div>
            <div className="industrial-recessed p-6">
              <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-500">
                <GeoPrice />
              </span>
              <p className="stamped-label text-[10px] mt-2">LIFETIME ACCESS</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          9. FAQ SECTION (Accordion with FAQPage JSON-LD)
         ───────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 border-b border-[var(--border-recessed)] bg-[var(--bg-chassis)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="stamped-label-accent">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)] mt-2">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="tech-question group industrial-card p-5 cursor-pointer"
              >
                <summary className="font-sans font-semibold text-base sm:text-lg text-[var(--text-primary)] flex items-center justify-between gap-4">
                  <span className="q-title flex-1">{faq.q}</span>
                  <ChevronDown className="q-icon w-5 h-5 shrink-0" />
                </summary>
                <p className="mt-4 pt-3 border-t border-[var(--border-recessed)] text-sm text-[var(--text-muted)] leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          10. FINAL CALL TO ACTION
         ───────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-[#2d3436] to-[#1e272e] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
            SYSTEM READY // PREPARE TODAY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-4">
            Stop preparing randomly. Prepare systematically.
          </h2>
          <p className="mt-4 text-base text-[#a8b2d1] max-w-xl mx-auto">
            Get lifetime access to 3,600+ interview questions across 27+ technologies with one single contribution.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="btn-industrial btn-industrial-primary py-4 px-10 text-sm shadow-[var(--shadow-btn-primary)] w-full sm:w-auto"
            >
              <span>Take Your Seat · <GeoPrice className="ml-1" /></span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#technologies"
              className="btn-industrial btn-industrial-secondary py-4 px-8 text-sm w-full sm:w-auto bg-[#353b48] text-white border-[#4b5563]"
            >
              <span>Explore Free Questions</span>
            </Link>
          </div>

          <p className="mt-6 text-xs font-mono text-[#a8b2d1]">
            One-time contribution · Lifetime rights · All future codices included
          </p>
        </div>
      </section>
    </div>
  );
}
