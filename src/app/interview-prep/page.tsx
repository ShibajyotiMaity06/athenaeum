import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Layers, Lock, Sparkles, Terminal, Code2, Cpu, Database, Server, Coffee, Network, FileCode2, Globe, Monitor } from "lucide-react";
import { getInterviewStacks, FREE_QUESTIONS_LIMIT } from "@/lib/interview-data";
import { getCurrentUser, hasInterviewAccess } from "@/lib/auth";
import { SITE, PLANS } from "@/lib/site";
import GeoPrice from "@/components/GeoPrice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Interview Prep Codex — Curated Real-World Technical Questions | DevPrep",
  description:
    "500+ high-frequency, real-world technical interview questions across Node.js, JavaScript, TypeScript, React 19, Next.js, Java, SQL, DBMS, Computer Networks, and Operating Systems with verified model solutions and documentation citations.",
  alternates: { canonical: `${SITE.url}/interview-prep` }
};

export default async function InterviewPrepHubPage() {
  const stacks = getInterviewStacks();
  const user = await getCurrentUser();
  const unlocked = hasInterviewAccess(user);

  const totalQuestions = stacks.reduce((acc, s) => acc + s.totalQuestions, 0);
  const totalSources = stacks.reduce((acc, s) => acc + s.sources.length, 0);

  function getTechIcon(icon: string) {
    switch (icon) {
      case "nodejs":
        return <Terminal className="w-6 h-6 text-emerald-500" />;
      case "javascript":
        return <Code2 className="w-6 h-6 text-amber-500" />;
      case "typescript":
        return <FileCode2 className="w-6 h-6 text-blue-400" />;
      case "react":
        return <Cpu className="w-6 h-6 text-cyan-500" />;
      case "nextjs":
        return <Globe className="w-6 h-6 text-teal-400" />;
      case "java":
        return <Coffee className="w-6 h-6 text-orange-500" />;
      case "sql":
        return <Database className="w-6 h-6 text-blue-500" />;
      case "dbms":
        return <Server className="w-6 h-6 text-purple-500" />;
      case "computernetworks":
      case "computer-networks":
      case "networks":
        return <Network className="w-6 h-6 text-indigo-500" />;
      case "os":
      case "operating-systems":
        return <Monitor className="w-6 h-6 text-rose-500" />;
      default:
        return <BookOpen className="w-6 h-6 text-[var(--accent)]" />;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      {/* ── Hero Section ── */}
      <header className="text-center max-w-3xl mx-auto mb-14">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="stamped-label-accent">CURATED REAL-WORLD PREP</span>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            5 FREE QUESTIONS PER STACK
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
          Technical Interview Prep Codex
        </h1>
        <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Targeted, high-yield interview questions designed to test production mechanisms, runtime internals, and edge-case handling. Backed by verified documentation citations.
        </p>
      </header>

      {/* ── Stats Metric Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <div className="industrial-recessed p-5 text-center">
          <p className="font-mono text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {totalQuestions}+
          </p>
          <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1 block">
            Screened Questions
          </span>
        </div>
        <div className="industrial-recessed p-5 text-center">
          <p className="font-mono text-2xl sm:text-3xl font-black text-[var(--accent)]">
            {stacks.length} Core
          </p>
          <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1 block">
            Engineering Tracks
          </span>
        </div>
        <div className="industrial-recessed p-5 text-center">
          <p className="font-mono text-2xl sm:text-3xl font-black text-emerald-600">
            {totalSources}+
          </p>
          <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1 block">
            Doc Source Citations
          </span>
        </div>
        <div className="industrial-recessed p-5 text-center">
          <p className="font-mono text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            Easy · Med · Hard
          </p>
          <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1 block">
            Difficulty Graded
          </span>
        </div>
      </div>

      {/* ── Stacks Showcase Grid ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Available Interview Tracks</h2>
              <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">
                (More Coming Soon)
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Select a technology to explore questions, answers, and verified official citations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stacks.map((st, idx) => (
            <Link
              key={st.slug}
              href={`/interview-prep/${st.slug}`}
              className="industrial-card p-6 sm:p-7 flex flex-col justify-between group corner-screws border-2 hover:border-[var(--accent)]/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[var(--bg-recessed)] shadow-[var(--shadow-recessed)]">
                    {getTechIcon(st.icon)}
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--accent)]">
                    TRACK #{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {st.name}
                </h3>

                <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                  {st.headline}
                </p>

                {/* Difficulty Breakdown Pills */}
                <div className="mt-5 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {st.easyCount} Easy
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {st.mediumCount} Medium
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    {st.hardCount} Hard
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(186,190,204,0.4)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)] group-hover:text-[var(--accent)]">
                <span className="font-bold">
                  {st.totalQuestions} Questions · {st.sources.length} Sources
                </span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}

          {/* ── More Coming Soon Card ── */}
          <div className="industrial-card p-6 sm:p-7 flex flex-col justify-between border-2 border-dashed border-[rgba(186,190,204,0.4)] bg-[var(--bg-recessed)]/40">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[var(--bg-recessed)] shadow-[var(--shadow-recessed)] text-[var(--accent)]">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                  EXPANDING CODEX
                </span>
              </div>

              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  More Tracks
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30">
                  Coming Soon
                </span>
              </div>

              <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                Python, Golang, System Design, Docker &amp; Kubernetes, and Rust interview question sets are actively being curated and benchmarked against official specs.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[rgba(186,190,204,0.3)]">
                  + Python
                </span>
                <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[rgba(186,190,204,0.3)]">
                  + Golang
                </span>
                <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[rgba(186,190,204,0.3)]">
                  + System Design
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-[rgba(186,190,204,0.4)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span className="font-bold">Next In Pipeline</span>
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-emerald-600">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Active Curation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing & Access Comparison Module ── */}
      {!unlocked && (
        <section className="mt-16 industrial-card p-8 sm:p-10 corner-screws border-2 border-[var(--accent)]/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="stamped-label-accent">FLEXIBLE ACCESS TIERS</span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Unlock Complete Model Solutions &amp; Documentation
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Choose between the dedicated <strong>Interview Prep Key (₹299)</strong> for targeted question mastery or the <strong>Full Scholar All-Access Pass (₹399)</strong> covering all 3,600+ questions across 27+ technologies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/pricing?plan=interview"
                className="btn-industrial btn-industrial-secondary py-3.5 px-6 text-xs text-center font-mono font-semibold"
              >
                <span>Interview Key — ₹299</span>
              </Link>
              <Link
                href="/pricing?plan=full"
                className="btn-industrial btn-industrial-primary py-3.5 px-6 text-xs text-center font-mono shadow-[var(--shadow-btn-primary)]"
              >
                <span>All-Access Pass — ₹399</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
