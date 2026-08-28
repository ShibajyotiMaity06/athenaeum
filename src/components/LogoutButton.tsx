"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store"
      });
    } catch {
      // Continue redirect even on network error
    }
    window.location.href = "/";
  }

  return (
    <button
      onClick={handleLogout}
      disabled={busy}
      className={`btn-industrial btn-industrial-secondary py-2.5 px-5 text-xs flex items-center gap-2 disabled:opacity-60 ${className}`}
    >
      {busy ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
          <span>Signing out…</span>
        </>
      ) : (
        <>
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </>
      )}
    </button>
  );
}
