import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { StackSummary } from "@/lib/content";

export default function StackCard({ stack }: { stack: StackSummary }) {
  return (
    <Link
      href={`/${stack.hubSlug}`}
      className="industrial-card p-6 flex flex-col justify-between group corner-screws"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-bold text-[var(--accent)]">
            MODULE #{stack.index.toString().padStart(2, "0")}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-recessed)] text-[var(--text-muted)]">
            {stack.questionCount} Questions
          </span>
        </div>

        <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
          {stack.name}
        </h3>

        <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
          Curated interview questions graded across Easy, Medium, and Hard difficulty tiers.
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[rgba(186,190,204,0.4)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)] group-hover:text-[var(--accent)]">
        <span className="font-bold">EXPLORE CODEX</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
