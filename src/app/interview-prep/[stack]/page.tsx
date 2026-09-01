import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Layers, ShieldCheck, Sparkles, Terminal, Code2, Cpu, Database, Server, Coffee, Network, FileCode2, Globe, Monitor, Leaf } from "lucide-react";
import { getInterviewStack, getInterviewStacks } from "@/lib/interview-data";
import { getCurrentUser, hasInterviewAccess } from "@/lib/auth";
import { SITE } from "@/lib/site";
import InterviewQuestionList from "@/components/InterviewQuestionList";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ stack: string }>;
}

export async function generateStaticParams() {
  const stacks = getInterviewStacks();
  return stacks.map((s) => ({ stack: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stack: stackSlug } = await params;
  const stack = getInterviewStack(stackSlug);
  if (!stack) return { title: "Codex Not Found | DevPrep" };

  return {
    title: `${stack.name} Interview Questions & Solutions | DevPrep`,
    description: `${stack.totalQuestions} curated real-world technical interview questions across Easy, Medium, and Hard tiers for ${stack.name}. Verified model solutions and documentation citations.`,
    alternates: { canonical: `${SITE.url}/interview-prep/${stack.slug}` }
  };
}

export default async function InterviewStackPage({ params }: Props) {
  const { stack: stackSlug } = await params;
  const stack = getInterviewStack(stackSlug);
  if (!stack) notFound();

  const user = await getCurrentUser();
  const unlocked = hasInterviewAccess(user);

  function getTechIcon(icon: string) {
    switch (icon) {
      case "nodejs":
        return <Terminal className="w-8 h-8 text-emerald-500" />;
      case "javascript":
        return <Code2 className="w-8 h-8 text-amber-500" />;
      case "typescript":
        return <FileCode2 className="w-8 h-8 text-blue-400" />;
      case "react":
        return <Cpu className="w-8 h-8 text-cyan-500" />;
      case "nextjs":
        return <Globe className="w-8 h-8 text-teal-400" />;
      case "java":
        return <Coffee className="w-8 h-8 text-orange-500" />;
      case "springboot":
      case "spring-boot":
      case "spring":
        return <Leaf className="w-8 h-8 text-emerald-500" />;
      case "sql":
        return <Database className="w-8 h-8 text-blue-500" />;
      case "dbms":
        return <Server className="w-8 h-8 text-purple-500" />;
      case "computernetworks":
      case "computer-networks":
      case "networks":
        return <Network className="w-8 h-8 text-indigo-500" />;
      case "os":
      case "operating-systems":
        return <Monitor className="w-8 h-8 text-rose-500" />;
      case "hld":
      case "systemdesign":
      case "system-design":
        return <Layers className="w-8 h-8 text-purple-400" />;
      default:
        return <BookOpen className="w-8 h-8 text-[var(--accent)]" />;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      {/* ── Breadcrumb & Navigation ── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/interview-prep" className="hover:text-[var(--accent)] transition-colors">
          Interview Prep
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-bold">{stack.name}</span>
      </nav>

      {/* ── Header Banner ── */}
      <header className="industrial-card p-6 sm:p-8 corner-screws border-2 border-[var(--border-card)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-[var(--bg-recessed)] shadow-[var(--shadow-recessed)] shrink-0">
              {getTechIcon(stack.icon)}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="stamped-label-accent">CURATED CODEX</span>
                {unlocked && (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    ACCESS UNLOCKED
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                {stack.name} Interview Questions
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
                {stack.description}
              </p>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--border-recessed)] gap-2 shrink-0">
            <span className="text-xs font-mono text-[var(--text-muted)]">Codex Volume</span>
            <span className="font-mono text-2xl font-black text-[var(--text-primary)]">
              {stack.totalQuestions} Questions
            </span>
          </div>
        </div>
      </header>

      {/* ── Questions & Sources Feed ── */}
      <main>
        <InterviewQuestionList
          stackSlug={stack.slug}
          stackName={stack.name}
          questions={stack.questions}
          sources={stack.sources}
          hasAccess={unlocked}
        />
      </main>

      {/* ── Bottom Switcher to Other Stacks ── */}
      <footer className="pt-10 border-t border-[var(--border-recessed)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/interview-prep"
            className="btn-industrial btn-industrial-secondary py-2.5 px-4 text-xs font-mono flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Interview Tracks</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/#technologies"
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              Browse 3,600+ Full Tech Codices &rarr;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
