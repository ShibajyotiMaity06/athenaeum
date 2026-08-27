"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Search, BookOpen } from "lucide-react";

export interface ReaderEntry {
  id: string;
  num: number;
  label: string;
  title: string;
  html: string;
}

export interface ReaderGroup {
  key: string;
  heading: string;
  numeral: string;
  entries: ReaderEntry[];
}

export default function ReaderClient({ groups }: { groups: ReaderGroup[] }) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        entries: g.entries.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.label.toLowerCase().includes(q) ||
            e.html.toLowerCase().includes(q.replace(/[<>&]/g, ""))
        )
      }))
      .filter((g) => g.entries.length > 0);
  }, [groups, q]);

  const totalShown = filtered.reduce((n, g) => n + g.entries.length, 0);

  function setAll(open: boolean) {
    containerRef.current
      ?.querySelectorAll("details.codex-entry")
      .forEach((el) => ((el as HTMLDetailsElement).open = open));
  }

  return (
    <div ref={containerRef}>
      <div className="mb-10 flex flex-col gap-4 rounded border border-grain bg-oak/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block flex-1">
          <span className="sr-only">Search this codex</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faded"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search within this codex…"
            className="field-input pl-11 italic"
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="hidden font-display text-[10px] uppercase tracking-[0.2em] text-faded sm:block">
            {totalShown} / {groups.reduce((n, g) => n + g.entries.length, 0)} entries
          </span>
          <button type="button" onClick={() => setAll(true)} className="btn btn-secondary h-10 px-4">
            Unfold all
          </button>
          <button type="button" onClick={() => setAll(false)} className="btn btn-secondary h-10 px-4">
            Fold all
          </button>
        </div>
      </div>

      {totalShown === 0 && (
        <div className="grid place-items-center gap-4 rounded border border-grain bg-oak/50 py-20 text-center">
          <BookOpen className="h-8 w-8 text-faded" strokeWidth={1.25} />
          <p className="max-w-sm italic text-faded">
            No passage answers to “{query}”. Loosen your phrasing and search again.
          </p>
        </div>
      )}

      {filtered.map((group) => (
        <section key={group.key} id={group.key} className="scroll-mt-24 pb-14 last:pb-0">
          <header className="mb-6 mt-4 first:mt-0">
            <p className="kicker">
              {group.numeral} · {group.heading}
            </p>
            <div className="ornate-divider mt-5" aria-hidden="true" />
          </header>

          <div className="overflow-hidden rounded border border-grain bg-oak/40">
            {group.entries.map((entry) => (
              <details
                key={entry.id}
                id={entry.id}
                className="codex-entry scroll-mt-24 border-b border-grain px-6 py-5 last:border-b-0 hover:bg-background/40 sm:px-8"
              >
                <summary>
                  <span className="font-display min-w-[3rem] shrink-0 text-xs tracking-[0.18em] text-brass">
                    {entry.num.toString().padStart(2, "0")}
                  </span>
                  <span className="q-title font-heading flex-1 text-lg leading-snug text-parchment transition-colors duration-300 sm:text-xl">
                    {entry.title}
                  </span>
                  <ChevronDown className="chev h-4 w-4 shrink-0 self-center" strokeWidth={1.5} />
                </summary>
                <div
                  className="manuscript mt-5 pr-2 pl-12 sm:pl-14"
                  dangerouslySetInnerHTML={{ __html: entry.html }}
                />
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
