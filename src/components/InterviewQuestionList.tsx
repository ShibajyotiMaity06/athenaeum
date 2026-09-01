"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Lock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldAlert
} from "lucide-react";
import type { InterviewQuestion, UniqueSource, InterviewDifficulty } from "@/lib/interview-types";
import { FREE_QUESTIONS_LIMIT } from "@/lib/interview-types";

interface Props {
  stackSlug: string;
  stackName: string;
  questions: InterviewQuestion[];
  sources: UniqueSource[];
  hasAccess: boolean;
}

function formatInlineAnswer(text: string) {
  // Strip any raw markdown asterisks
  const cleaned = text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/(^|[^\w*])\*([^*\n]+?)\*([^\w*]|$)/g, "$1$2$3")
    .replace(/\*\*/g, "");

  // Format inline backticks `code`
  const parts = cleaned.split(/(`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      const code = part.slice(1, -1);
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[var(--bg-recessed)] font-mono text-[12px] text-[var(--accent)] border border-[var(--border-recessed)] font-semibold"
        >
          {code}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function InterviewQuestionList({
  stackSlug,
  stackName,
  questions,
  sources,
  hasAccess
}: Props) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty | "all" | "sources">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(1); // default expand first question

  const accessibleQuestions = useMemo(() => {
    return hasAccess ? questions : questions.slice(0, FREE_QUESTIONS_LIMIT);
  }, [hasAccess, questions]);

  const lockedCount = Math.max(0, questions.length - accessibleQuestions.length);

  const easyCount = accessibleQuestions.filter((q) => q.difficulty === "Easy").length;
  const mediumCount = accessibleQuestions.filter((q) => q.difficulty === "Medium").length;
  const hardCount = accessibleQuestions.filter((q) => q.difficulty === "Hard").length;

  const filteredQuestions = useMemo(() => {
    return accessibleQuestions.filter((q) => {
      const matchesDiff =
        selectedDifficulty === "all" ||
        selectedDifficulty === "sources" ||
        q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDiff && matchesSearch;
    });
  }, [accessibleQuestions, selectedDifficulty, searchQuery]);

  function getDifficultyColor(diff: InterviewDifficulty) {
    switch (diff) {
      case "Easy":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "Medium":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "Hard":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-[var(--bg-recessed)] text-[var(--text-muted)] border-[var(--border-recessed)]";
    }
  }

  return (
    <div className="space-y-8">
      {/* Filter and Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-recessed)] pb-5">
        {/* Difficulty Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDifficulty("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              selectedDifficulty === "all"
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "bg-[var(--bg-recessed)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-recessed)]"
            }`}
          >
            All Questions ({hasAccess ? questions.length : `${accessibleQuestions.length} Free`})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDifficulty("Easy")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              selectedDifficulty === "Easy"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-[var(--bg-recessed)] text-[var(--text-muted)] hover:text-emerald-500 hover:bg-[var(--bg-card)] border border-[var(--border-recessed)]"
            }`}
          >
            Easy ({easyCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDifficulty("Medium")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              selectedDifficulty === "Medium"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-[var(--bg-recessed)] text-[var(--text-muted)] hover:text-amber-500 hover:bg-[var(--bg-card)] border border-[var(--border-recessed)]"
            }`}
          >
            Medium ({mediumCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDifficulty("Hard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              selectedDifficulty === "Hard"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-[var(--bg-recessed)] text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-card)] border border-[var(--border-recessed)]"
            }`}
          >
            Hard ({hardCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDifficulty("sources")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
              selectedDifficulty === "sources"
                ? "bg-[var(--text-primary)] text-[var(--bg-chassis)] shadow-sm"
                : "bg-[var(--bg-recessed)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-recessed)]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sources ({sources.length})</span>
          </button>
        </div>

        {/* Search Box */}
        {selectedDifficulty !== "sources" && (
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${stackName} questions…`}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs font-mono bg-[var(--bg-card)] border border-[var(--border-card)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Free Access Notice Banner */}
      {!hasAccess && selectedDifficulty !== "sources" && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-recessed)] border border-[var(--accent)]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] mt-0.5 sm:mt-0 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-[var(--text-primary)]">
                Preview Mode Active · 5 Free Sample Questions
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Review verified answers and code patterns below. The remaining {lockedCount} questions in this codex are unlocked with the Interview Pass or Full Access.
              </p>
            </div>
          </div>
          <Link
            href={`/pricing?plan=interview`}
            className="btn-industrial btn-industrial-primary py-2 px-4 text-xs font-mono shrink-0"
          >
            <span>Unlock Codex — ₹299</span>
          </Link>
        </div>
      )}

      {/* ── View 1: Sources & Citations Tab ── */}
      {selectedDifficulty === "sources" ? (
        <div className="space-y-6">
          <div className="industrial-recessed p-6 rounded-xl border border-[var(--border-recessed)]">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="font-bold text-base text-[var(--text-primary)]">
                {stackName} Documentation &amp; Reference Sources
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Every answer in this codex is corroborated with official documentation, RFC specifications, and engine internals. Below are the {sources.length} unique references cited across all {questions.length} questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="industrial-card p-4 rounded-lg flex items-start justify-between gap-3 group hover:border-[var(--accent)]/40 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-recessed)] text-[var(--text-muted)] border border-[var(--border-recessed)] truncate">
                      {src.domain}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                      Cited {src.count}×
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {src.title}
                  </h4>
                  <p className="text-[11px] font-mono text-[var(--text-muted)]/70 truncate">
                    {src.url}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>
      ) : (
        /* ── View 2: Questions Feed ── */
        <div className="space-y-6">
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="industrial-card p-10 text-center space-y-3">
                <p className="text-xs font-mono text-[var(--text-muted)]">
                  {searchQuery
                    ? `No questions matching "${searchQuery}" in the ${hasAccess ? "codex" : "5 free preview questions"}.`
                    : "No questions found in this category."}
                </p>
                {!hasAccess && (
                  <p className="text-xs text-[var(--text-muted)]">
                    The remaining {lockedCount} {stackName} questions are unlocked with the Interview Pass.
                  </p>
                )}
                {!hasAccess && (
                  <Link
                    href="/pricing?plan=interview"
                    className="btn-industrial btn-industrial-primary py-2 px-5 text-xs font-mono inline-flex"
                  >
                    <span>Unlock All {questions.length} Questions</span>
                  </Link>
                )}
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isExpanded = expandedId === q.id;

                return (
                  <div
                    key={q.id}
                    id={`q-${q.id}`}
                    className="industrial-card p-5 sm:p-6 transition-all rounded-xl border border-[var(--border-card)]"
                  >
                    {/* Header / Question Title */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="cursor-pointer flex items-start justify-between gap-4 select-none"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[var(--accent)]">
                            Q{q.id.toString().padStart(2, "0")}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getDifficultyColor(
                              q.difficulty
                            )}`}
                          >
                            {q.difficulty}
                          </span>
                          {!hasAccess && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              FREE PREVIEW
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug">
                          {formatInlineAnswer(q.question)}
                        </h3>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle answer"
                        className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-recessed)] transition-colors mt-1"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Body / Answer */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-[var(--border-recessed)]">
                        <div className="space-y-5">
                          {/* Answer text / Code formatting */}
                          <div className="text-sm text-[var(--text-primary)] leading-relaxed space-y-3 font-sans">
                            {q.answer.split("\n\n").map((para, pIdx) => {
                              // Check if paragraph is a code block
                              if (
                                para.startsWith("for (") ||
                                para.startsWith("const ") ||
                                para.startsWith("let ") ||
                                para.startsWith("type ") ||
                                para.startsWith("interface ") ||
                                para.startsWith("import ") ||
                                para.includes("console.log(")
                              ) {
                                return (
                                  <pre
                                    key={pIdx}
                                    className="p-4 rounded-lg bg-[var(--bg-recessed)] font-mono text-xs text-[var(--text-primary)] overflow-x-auto border border-[var(--border-recessed)] my-2"
                                  >
                                    <code>{para}</code>
                                  </pre>
                                );
                              }
                              return (
                                <p key={pIdx} className="leading-relaxed">
                                  {formatInlineAnswer(para)}
                                </p>
                              );
                            })}
                          </div>

                          {/* Sources Links */}
                          {q.sources && q.sources.length > 0 && (
                            <div className="pt-4 border-t border-[var(--border-recessed)]/60">
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                                Verified Sources &amp; Further Reading:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {q.sources.map((s, sIdx) => (
                                  <a
                                    key={sIdx}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-mono py-1 px-2.5 rounded-md bg-[var(--bg-recessed)] border border-[var(--border-recessed)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors"
                                  >
                                    <span className="truncate max-w-[280px]">{s.title}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Locked Paywall Card for Unpaid Users */}
          {!hasAccess && lockedCount > 0 && (
            <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-[#2d3436] to-[#1e272e] text-white shadow-[var(--shadow-floating)] border border-[#1e272e] text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[rgba(255,71,87,0.2)] text-[var(--accent)] mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Unlock the remaining {lockedCount} {stackName} Questions &amp; Verified Answers
              </h3>
              <p className="text-xs sm:text-sm text-[#a8b2d1] max-w-xl mx-auto leading-relaxed">
                You have reached the end of the 5 free preview questions. Get unrestricted lifetime access to all {questions.length} questions, model solutions, architectural blueprints, and complete DSA codex.
              </p>
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/pricing?plan=interview"
                  className="btn-industrial btn-industrial-primary py-3 px-8 text-xs font-mono w-full sm:w-auto"
                >
                  <span>Unlock Interview Key — ₹299</span>
                </Link>
                <Link
                  href="/pricing?plan=full"
                  className="btn-industrial btn-industrial-secondary py-3 px-8 text-xs font-mono w-full sm:w-auto"
                >
                  <span>Get All-Access Scholar Pass — ₹399</span>
                </Link>
              </div>
              <p className="text-[11px] font-mono text-[#a8b2d1]">
                One-time settlement · Lifetime access · Zero recurring bills
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
