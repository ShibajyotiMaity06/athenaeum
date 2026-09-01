"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Filter,
  Flame,
  Globe,
  Layers,
  Lock,
  RotateCw,
  Search,
  ShieldAlert,
  Shuffle,
  Sparkles,
  Star,
  Terminal,
  Trophy,
  Zap,
  Code2,
  Check,
  X
} from "lucide-react";
import type { DsaTrack, DsaQuestion } from "@/lib/dsa-data";
import GeoPrice from "@/components/GeoPrice";

interface Props {
  tracks: DsaTrack[];
  isUnlocked?: boolean;
  userEmail?: string;
}

type FilterStatus = "all" | "unsolved" | "completed" | "bookmarked";

const FREE_PREVIEW_COUNT = 3;

export default function DsaClient({ tracks, isUnlocked = false, userEmail }: Props) {
  const [activeTrackId, setActiveTrackId] = useState<string>(tracks[0]?.id || "all");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [paywallModalOpen, setPaywallModalOpen] = useState<boolean>(false);
  const [lockedProblemIndex, setLockedProblemIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Load persistence from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const savedCompleted = localStorage.getItem("devprep_dsa_completed");
      if (savedCompleted) setCompletedMap(JSON.parse(savedCompleted));
      const savedBookmarks = localStorage.getItem("devprep_dsa_bookmarks");
      if (savedBookmarks) setBookmarkedMap(JSON.parse(savedBookmarks));
    } catch {
      /* ignore storage errors */
    }
  }, []);

  // Sync to localStorage
  function toggleComplete(id: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setCompletedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("devprep_dsa_completed", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function toggleBookmark(id: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setBookmarkedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("devprep_dsa_bookmarks", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const activeTrack = useMemo(() => {
    return tracks.find((t) => t.id === activeTrackId) || tracks[0];
  }, [tracks, activeTrackId]);

  // Available categories in the active track
  const availableCategories = useMemo(() => {
    if (!activeTrack) return [];
    const set = new Set<string>();
    activeTrack.questions.forEach((q) => {
      if (q.category) set.add(q.category);
    });
    return Array.from(set);
  }, [activeTrack]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (!activeTrack) return [];
    return activeTrack.questions.filter((q, originalIdx) => {
      const isItemLocked = !isUnlocked && originalIdx >= FREE_PREVIEW_COUNT;

      // If item is locked and user is searching, only search by index
      if (isItemLocked && search.trim()) {
        const term = search.toLowerCase();
        if (!q.index.toString().includes(term)) {
          return false;
        }
      } else if (search.trim()) {
        const term = search.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(term);
        const matchesCategory = q.category?.toLowerCase().includes(term);
        const matchesPlatform = q.platform?.toLowerCase().includes(term);
        const matchesIndex = q.index.toString().includes(term);
        if (!matchesTitle && !matchesCategory && !matchesPlatform && !matchesIndex) {
          return false;
        }
      }

      // Status
      const isCompleted = Boolean(completedMap[q.id]);
      const isBookmarked = Boolean(bookmarkedMap[q.id]);

      if (statusFilter === "completed" && !isCompleted) return false;
      if (statusFilter === "unsolved" && isCompleted) return false;
      if (statusFilter === "bookmarked" && !isBookmarked) return false;

      // Category
      if (!isItemLocked && categoryFilter !== "all" && q.category !== categoryFilter) return false;

      return true;
    });
  }, [activeTrack, search, statusFilter, categoryFilter, completedMap, bookmarkedMap, isUnlocked]);

  // Overall and current track stats
  const trackStats = useMemo(() => {
    if (!activeTrack) return { total: 0, completed: 0, percent: 0, bookmarked: 0 };
    const total = activeTrack.questions.length;
    const completed = activeTrack.questions.filter((q) => completedMap[q.id]).length;
    const bookmarked = activeTrack.questions.filter((q) => bookmarkedMap[q.id]).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent, bookmarked };
  }, [activeTrack, completedMap, bookmarkedMap]);

  const globalStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    tracks.forEach((t) => {
      t.questions.forEach((q) => {
        total++;
        if (completedMap[q.id]) completed++;
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [tracks, completedMap]);

  // Random Problem Picker (Excludes already marked questions)
  function handlePickRandom() {
    if (!isUnlocked) {
      setLockedProblemIndex(null);
      setPaywallModalOpen(true);
      return;
    }
    if (!activeTrack) return;
    
    const pool = activeTrack.questions;
    const uncompleted = pool.filter((q) => !completedMap[q.id]);

    let candidate: DsaQuestion | undefined;
    if (uncompleted.length > 0) {
      const idx = Math.floor(Math.random() * uncompleted.length);
      candidate = uncompleted[idx];
    } else if (pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      candidate = pool[idx];
    }

    if (candidate) {
      window.open(candidate.url, "_blank", "noopener,noreferrer");
    }
  }

  function handleLockedClick(index: number) {
    setLockedProblemIndex(index);
    setPaywallModalOpen(true);
  }

  function getPlatformBadgeColor(platform: string) {
    switch (platform) {
      case "LeetCode":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Codeforces":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "CSES":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "GeeksforGeeks":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "AtCoder":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "SPOJ":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  }

  function getDifficultyBadgeColor(difficulty?: string) {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "medium":
      case "med":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "hard":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-[var(--text-muted)] bg-[var(--bg-recessed)] border-[var(--border-recessed)]";
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Paywall Top Banner (If not purchased) ── */}
      {!isUnlocked && (
        <div className="industrial-card p-5 sm:p-6 corner-screws border-2 border-amber-500/40 bg-amber-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  PREVIEW MODE ACTIVE
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  Free Preview: First 3 problems of each track are unlocked
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-1">
                Unlock All 600+ Curated DSA Problems for <GeoPrice plan="dsa" />
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Complete unrestricted lifetime access to Google Top 50, Dynamic Programming, Graphs, Segment Trees &amp; Random problem selector.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
            <Link
              href="/pricing?plan=dsa"
              className="btn-industrial btn-industrial-primary py-3 px-5 text-xs sm:text-sm whitespace-nowrap shadow-[var(--shadow-btn-primary)] flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <span>Unlock DSA Codex (<GeoPrice plan="dsa" />)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing?plan=interview"
              className="btn-industrial btn-industrial-secondary py-3 px-4 text-xs whitespace-nowrap flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              <span>Interview + DSA (<GeoPrice plan="interview" />)</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Top Header Stats Panel ── */}
      <div className="industrial-card p-6 sm:p-8 corner-screws flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="stamped-label-accent">CURATED DSA MASTERY</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--bg-recessed)] text-[var(--text-muted)] border border-[var(--border-card)]">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>{globalStats.completed} / {globalStats.total} Solved</span>
            </span>
            {isUnlocked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                ✓ LIFETIME UNLOCKED
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Algorithmic Engineering &amp; DSA Codex
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
            600+ Curated Data Structure &amp; Algorithmic problems across LeetCode, Google SWE rounds, Dynamic Programming, Graphs, Segment Trees, and classic competitive paradigms.
          </p>
        </div>

        {/* Global Action: Random Problem Generator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handlePickRandom}
            className="btn-industrial btn-industrial-primary py-3 px-5 text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[var(--shadow-btn-primary)] cursor-pointer group"
          >
            {isUnlocked ? (
              <Shuffle className="w-4 h-4 transition-transform group-hover:rotate-45" />
            ) : (
              <Lock className="w-4 h-4 text-amber-300" />
            )}
            <span>Random Unsolved Problem</span>
            {isUnlocked ? (
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/30 text-amber-200 border border-amber-300/30">
                PRO
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Track Switcher Tabs (Industrial Rail) ── */}
      <div className="border-b border-[var(--border-recessed)] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {tracks.map((t) => {
            const isActive = t.id === activeTrackId;
            const completedInTrack = t.questions.filter((q) => completedMap[q.id]).length;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTrackId(t.id);
                  setCategoryFilter("all");
                }}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-[var(--shadow-btn-primary)] scale-[1.02]"
                    : "bg-[var(--bg-panel)] text-[var(--text-muted)] border-[var(--border-recessed)] hover:text-[var(--text-primary)] hover:border-[var(--border-card)]"
                }`}
              >
                <span>{t.shortName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--bg-recessed)] text-[var(--text-muted)]"
                  }`}
                >
                  {completedInTrack > 0 ? `${completedInTrack}/${t.count}` : t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Track Details & Controls Bar ── */}
      <div className="industrial-card p-6 corner-screws space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-recessed)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-0.5 rounded border border-[var(--accent)]/20">
                {activeTrack.badge}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {trackStats.completed} of {trackStats.total} completed ({trackStats.percent}%)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {activeTrack.name}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {activeTrack.description}
            </p>
          </div>

          {/* Track Progress Meter */}
          <div className="flex items-center gap-4 min-w-[240px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-mono mb-1 text-[var(--text-muted)]">
                <span>Track Progress</span>
                <span className="font-bold text-[var(--text-primary)]">{trackStats.percent}%</span>
              </div>
              <div className="h-2.5 w-full bg-[var(--bg-recessed)] rounded-full overflow-hidden border border-[var(--border-recessed)]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[var(--accent)] transition-all duration-300 rounded-full"
                  style={{ width: `${trackStats.percent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handlePickRandom}
              title="Pick random question from this track"
              className="p-2.5 rounded-lg bg-[var(--bg-recessed)] text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-[var(--bg-panel)] transition-colors border border-[var(--border-card)] cursor-pointer shadow-sm"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] items-center">
          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeTrack.count} questions in ${activeTrack.shortName}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-[var(--bg-chassis)] border border-[var(--border-recessed)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[var(--bg-chassis)] p-1 rounded-lg border border-[var(--border-recessed)] text-xs font-mono">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[var(--accent)] text-white font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              All ({trackStats.total})
            </button>
            <button
              onClick={() => setStatusFilter("unsolved")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === "unsolved"
                  ? "bg-[var(--accent)] text-white font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Unsolved ({trackStats.total - trackStats.completed})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === "completed"
                  ? "bg-[var(--accent)] text-white font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Completed ({trackStats.completed})
            </button>
            <button
              onClick={() => setStatusFilter("bookmarked")}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                statusFilter === "bookmarked"
                  ? "bg-amber-500 text-white font-bold"
                  : "text-[var(--text-muted)] hover:text-amber-500"
              }`}
            >
              <Star className="w-3 h-3" />
              <span>({trackStats.bookmarked})</span>
            </button>
          </div>

          {/* Subcategory Filter if available */}
          {availableCategories.length > 1 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 text-xs font-mono rounded-lg bg-[var(--bg-chassis)] border border-[var(--border-recessed)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="all">All Topics ({availableCategories.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── Problem List Table / Rows ── */}
        <div className="space-y-2 pt-2">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[var(--border-recessed)] rounded-xl">
              <p className="font-mono text-sm text-[var(--text-muted)]">
                No questions found matching current filters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="mt-3 text-xs font-mono font-bold text-[var(--accent)] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const isCompleted = Boolean(completedMap[q.id]);
              const isBookmarked = Boolean(bookmarkedMap[q.id]);
              const isItemLocked = !isUnlocked && idx >= FREE_PREVIEW_COUNT;

              // ── LOCKED PROBLEM ROW (Completely masked: no real title, URL, platform, tags or blur) ──
              if (isItemLocked) {
                return (
                  <div
                    key={q.id}
                    onClick={() => handleLockedClick(q.index)}
                    className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[var(--border-recessed)] bg-[var(--bg-recessed)]/40 hover:bg-[var(--bg-panel)] hover:border-amber-500/40 transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      {/* Locked Disabled Checkbox */}
                      <div className="shrink-0 p-1 opacity-30 text-[var(--text-muted)] cursor-not-allowed">
                        <Circle className="w-5 h-5" />
                      </div>

                      {/* Locked Disabled Bookmark */}
                      <div className="shrink-0 p-1 opacity-30 text-[var(--text-muted)] cursor-not-allowed">
                        <Star className="w-4 h-4" />
                      </div>

                      {/* Masked Problem Title & Number */}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs sm:text-sm tracking-tight text-[var(--text-muted)] flex items-center gap-2">
                          <span className="font-mono text-xs text-[var(--text-muted)]/60 shrink-0">
                            #{q.index}
                          </span>
                          <span className="truncate text-[var(--text-secondary)] font-semibold">
                            Curated Problem #{q.index}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                            <Lock className="w-2.5 h-2.5" />
                            Locked
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                          Requires DSA Problem Codex or Interview Key
                        </p>
                      </div>
                    </div>

                    {/* Locked Action Button */}
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLockedClick(q.index);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Unlock</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // ── UNLOCKED / FREE PREVIEW PROBLEM ROW ──
              return (
                <div
                  key={q.id}
                  className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-150 ${
                    isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/20 opacity-80"
                      : "bg-[var(--bg-panel)] border-[var(--border-recessed)] hover:border-[var(--border-card)] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => toggleComplete(q.id, e)}
                      title={isCompleted ? "Mark as unsolved" : "Mark as completed"}
                      className="shrink-0 p-1 transition-colors text-[var(--text-muted)] hover:text-emerald-500 cursor-pointer"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-[var(--text-muted)] hover:text-[var(--accent)]" />
                      )}
                    </button>

                    {/* Bookmark Star */}
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(q.id, e)}
                      title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                      className="shrink-0 p-1 transition-colors text-[var(--text-muted)] hover:text-amber-500 cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isBookmarked ? "text-amber-500 fill-amber-500" : "text-[var(--text-muted)] opacity-50 group-hover:opacity-100"
                        }`}
                      />
                    </button>

                    {/* Problem Index & Title (Click to open in new tab) */}
                    <div className="min-w-0 flex-1">
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-semibold text-xs sm:text-sm tracking-tight hover:text-[var(--accent)] transition-colors flex items-center gap-1.5 ${
                          isCompleted ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                        }`}
                      >
                        <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                          #{q.index}
                        </span>
                        <span className="truncate">{q.title}</span>
                        {q.premium && (
                          <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20 shrink-0">
                            Premium
                          </span>
                        )}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[var(--accent)]" />
                      </a>

                      {/* Sub-tags */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[var(--text-muted)]">
                        {q.category && (
                          <span className="truncate text-[10px] text-[var(--text-muted)]">
                            {q.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Badges & Launch Button */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
                    {/* Acceptance Rate */}
                    {q.acceptance && (
                      <span className="hidden sm:inline-block text-[11px] font-mono font-bold text-[var(--text-muted)]">
                        {q.acceptance}
                      </span>
                    )}

                    {/* Difficulty Badge */}
                    {q.difficulty && (
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getDifficultyBadgeColor(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>
                    )}

                    {/* Platform Badge */}
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getPlatformBadgeColor(
                        q.platform
                      )}`}
                    >
                      {q.platform}
                    </span>

                    {/* Direct Launch Button */}
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[var(--bg-recessed)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-panel)] transition-colors border border-[var(--border-recessed)]"
                      title="Open problem in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Locked Modal (Paywall for Non-Paying Users) ── */}
      {paywallModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="industrial-card p-6 sm:p-8 max-w-md w-full corner-screws border-2 border-amber-500/40 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setPaywallModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                DSA CODEX PASS REQUIRED
              </span>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mt-2">
                Unlock Complete DSA Problem Codex
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                {lockedProblemIndex ? `Problem #${lockedProblemIndex}` : "The Random Unsolved Problem Generator"} and 600+ other high-yield DSA questions across LeetCode, Google Top 50, and DP Masterclass are unlocked with the DSA Problem Codex or the Interview Key bundle.
              </p>
            </div>

            <div className="my-6 p-4 rounded-xl bg-[var(--bg-recessed)] border border-[var(--border-card)] text-left space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>All 600+ Curated Problems Unlocked</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Top 50 Google SWE + DP Masterclass</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Random Unsolved Problem Generator</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Lifetime One-Time Settlement (<GeoPrice plan="dsa" />)</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/pricing?plan=dsa"
                className="btn-industrial btn-industrial-primary py-3.5 px-6 text-xs sm:text-sm w-full flex items-center justify-center gap-2 shadow-[var(--shadow-btn-primary)]"
              >
                <span>Unlock DSA Codex (<GeoPrice plan="dsa" />)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing?plan=interview"
                className="btn-industrial btn-industrial-secondary py-3 px-6 text-xs w-full flex items-center justify-center gap-2"
              >
                <span>Get Interview + DSA Bundle (<GeoPrice plan="interview" />)</span>
              </Link>
            </div>

            <p className="mt-3 text-[11px] font-mono text-center text-[var(--text-muted)]">
              One-time purchase · Instant unlock
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
