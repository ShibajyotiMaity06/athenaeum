import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StackSummary } from "@/lib/content";

export default function StackCard({ stack }: { stack: StackSummary }) {
  const initial = stack.name.charAt(0);
  return (
    <Link
      href={`/library/${stack.slug}`}
      className="corner-flourish group block rounded border border-grain bg-oak p-6 transition-all duration-500 hover:border-brass/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="arch-top relative mb-6 aspect-[5/3] overflow-hidden border border-grain bg-background">
        {/* Aged plate artwork */}
        <div
          className="sepia-img absolute inset-0 scale-105 group-hover:scale-100"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, rgba(201,169,98,0.16), transparent 55%), linear-gradient(180deg, #2b231d 0%, #1c1714 70%)"
          }}
        />
        <span
          aria-hidden="true"
          className="font-heading absolute inset-0 flex items-center justify-center pt-3 text-[5.5rem] leading-none text-brass/25"
        >
          {initial}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pt-2 text-xl text-brass/40 opacity-70"
        >
          ✶
        </span>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[9px] uppercase tracking-[0.3em] text-faded">
          Codex · {stack.levels.length} folios
        </span>
      </div>

      <p className="kicker">Volume {stack.numeral}</p>
      <h3 className="font-heading mt-2 text-2xl text-parchment transition-colors duration-300 group-hover:text-brass-light">
        {stack.name}
      </h3>
      <p className="mt-1.5 font-body text-sm text-faded">
        {stack.questionCount} passages across {stack.levels.length} degrees
      </p>

      <span className="mt-5 inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.22em] text-brass">
        Open the volume
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
          strokeWidth={1.5}
        />
      </span>
    </Link>
  );
}
