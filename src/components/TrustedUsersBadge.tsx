"use client";

import { useEffect, useState } from "react";
import { Users, Star } from "lucide-react";

export default function TrustedUsersBadge({ initialCount = 38 }: { initialCount?: number }) {
  const [count, setCount] = useState<number>(initialCount);

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data: { ok?: boolean; trustedCount?: number }) => {
        if (alive && data.ok && typeof data.trustedCount === "number") {
          setCount(data.trustedCount);
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full industrial-card corner-screws shadow-[var(--shadow-card)]">
      {/* Visual Avatar Stack */}
      <div className="flex -space-x-2 overflow-hidden">
        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[var(--bg-chassis)] bg-emerald-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">
          S
        </div>
        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[var(--bg-chassis)] bg-blue-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">
          R
        </div>
        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[var(--bg-chassis)] bg-amber-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">
          A
        </div>
        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[var(--bg-chassis)] bg-[var(--accent)] text-white font-mono font-bold text-[10px] flex items-center justify-center">
          D
        </div>
      </div>

      {/* Text & Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-current" />
          ))}
        </div>
        <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
          Trusted by <strong className="text-[var(--accent)] font-black text-sm">{count}</strong> users
        </span>
      </div>
      <span className="led-indicator led-green" />
    </div>
  );
}
