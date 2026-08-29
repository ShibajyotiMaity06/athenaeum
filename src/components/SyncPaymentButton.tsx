"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function SyncPaymentButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setMsg(null);
    setIsError(false);

    try {
      const res = await fetch("/api/payments/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setMsg("Payment confirmed! Lifetime access activated.");
        setIsError(false);
        setTimeout(() => {
          router.refresh();
        }, 800);
      } else {
        setMsg(data?.error || "No completed payment record detected.");
        setIsError(true);
      }
    } catch {
      setMsg("Connection failed. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] font-mono hover:underline disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        <span>{loading ? "Checking payment ledger..." : "Paid but not unlocked? Verify transaction"}</span>
      </button>
      {msg && (
        <p className={`text-[11px] font-mono mt-1 ${isError ? "text-red-500" : "text-emerald-600"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
