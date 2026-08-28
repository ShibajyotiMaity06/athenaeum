"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Lock, ArrowRight } from "lucide-react";
import type { Question } from "@/lib/content";
import GeoPrice from "@/components/GeoPrice";

export interface TabLevelData {
  slug: "easy" | "medium" | "hard";
  label: string;
  sublabel: string;
  totalQuestions: number;
  freeQuestions: Question[];
  lockedCount: number;
  levelUrl: string;
}

interface TechHubTabsProps {
  technologyName: string;
  technologySlug: string;
  levels: TabLevelData[];
  unlocked: boolean;
}

export default function TechHubTabs({
  technologyName,
  technologySlug,
  levels,
  unlocked
}: TechHubTabsProps) {
  const [activeTab, setActiveTab] = useState<"easy" | "medium" | "hard">("easy");

  return (
    <div className="w-full">
      {/* ── Mechanical Tab Selector ── */}
      <div
        role="tablist"
        aria-label={`${technologyName} Difficulty Levels`}
        className="flex flex-wrap items-center gap-3 p-2 bg-[var(--bg-recessed)] rounded-xl shadow-[var(--shadow-recessed)] border border-[var(--border-recessed)]"
      >
        {levels.map((level) => {
          const isActive = activeTab === level.slug;
          return (
            <button
              key={level.slug}
              id={`tab-${level.slug}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${level.slug}`}
              onClick={() => setActiveTab(level.slug)}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-[var(--bg-chassis)] text-[var(--accent)] shadow-[var(--shadow-floating)] border border-[var(--border-card)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive
                    ? level.slug === "easy"
                      ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                      : level.slug === "medium"
                      ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                      : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                    : "bg-gray-400 dark:bg-gray-600"
                }`}
              />
              <span>{level.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-recessed)] text-[var(--text-muted)] border border-[var(--border-recessed)]">
                {level.totalQuestions}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Server-Rendered Tab Panels (All 3 rendered in SSR HTML for SEO!) ── */}
      <div className="mt-6">
        {levels.map((level) => {
          const isActive = activeTab === level.slug;
          return (
            <div
              key={level.slug}
              id={`panel-${level.slug}`}
              role="tabpanel"
              aria-labelledby={`tab-${level.slug}`}
              aria-hidden={!isActive}
              className={`transition-opacity duration-200 ${
                isActive ? "block opacity-100" : "hidden opacity-0"
              }`}
            >
              {/* Level Header Strip */}
              <div className="mb-6 p-5 rounded-xl bg-[var(--bg-chassis)] border border-[var(--border-card)] shadow-[var(--shadow-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="stamped-label-accent">{level.label} Level</span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="stamped-label">{level.totalQuestions} Questions Total</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{level.sublabel}</p>
                </div>

                <Link
                  href={level.levelUrl}
                  className="btn-industrial btn-industrial-secondary py-2.5 px-4 text-xs"
                >
                  <span>Open Full {level.label} List</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
                </Link>
              </div>

              {/* Free Visible Questions Accordions */}
              <div className="space-y-4">
                {level.freeQuestions.map((q, idx) => (
                  <details
                    key={q.id}
                    className="tech-question group rounded-xl bg-[var(--bg-chassis)] border border-[var(--border-card)] shadow-[var(--shadow-card)] p-5 hover:shadow-[var(--shadow-floating)] transition-all"
                  >
                    <summary className="font-sans font-semibold text-base sm:text-lg text-[var(--text-primary)] select-none">
                      <span className="font-mono text-xs font-bold text-[var(--accent)] min-w-[2.5rem] px-2 py-1 rounded bg-[var(--bg-recessed)] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                        Q{q.num || idx + 1}
                      </span>
                      <span className="q-title flex-1 leading-snug">{q.title}</span>
                      <ChevronDown className="q-icon w-5 h-5 shrink-0" />
                    </summary>

                    <div className="mt-5 pt-4 border-t border-[var(--border-recessed)] pl-2 sm:pl-10">
                      <div
                        className="manuscript"
                        dangerouslySetInnerHTML={{ __html: q.html }}
                      />
                    </div>
                  </details>
                ))}
              </div>

              {/* Locked / Upgrade Notice Banner */}
              {!unlocked && level.lockedCount > 0 && (
                <div className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-[#2d3436] to-[#1e272e] text-white shadow-[var(--shadow-floating)] relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,71,87,0.2)] text-[var(--accent)] font-mono text-xs font-bold uppercase tracking-wider mb-3">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{level.lockedCount} More {level.label} Questions Locked</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        Unlock the complete {technologyName} {level.label} question bank
                      </h3>
                      <p className="mt-2 text-sm text-[#a8b2d1] max-w-xl">
                        Get instant access to all {level.totalQuestions} questions, in-depth model answers, code sandboxes, and all 27+ technologies for a single one-time payment.
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-center gap-3">
                      <Link
                        href="/pricing"
                        className="btn-industrial btn-industrial-primary py-3.5 px-8 text-sm w-full md:w-auto shadow-[var(--shadow-btn-primary)]"
                      >
                        <span>Unlock All — <GeoPrice className="ml-1" /></span>
                      </Link>
                      <span className="font-mono text-[11px] text-[#a8b2d1]">
                        One-time payment · Lifetime access
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
