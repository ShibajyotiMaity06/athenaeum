"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, User, Loader2, LogOut } from "lucide-react";
import GeoPrice from "@/components/GeoPrice";
import ThemeToggle from "@/components/ThemeToggle";

interface SessionInfo {
  authenticated: boolean;
  name?: string;
  role?: "admin" | "scholar";
}

export default function SiteHeader() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let alive = true;
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: SessionInfo) => alive && setSession(data))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [pathname]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store"
      });
    } catch {
      // Continue to redirect even if network fails
    }
    // Hard refresh/redirect to home page so all cached state is wiped clean
    window.location.href = "/";
  }

  const links = [
    { href: "/interview-prep", label: "Interview Prep" },
    { href: "/#technologies", label: "Technologies" },
    { href: "/frontend-interview-questions", label: "Frontend" },
    { href: "/backend-interview-questions", label: "Backend" },
    { href: "/sde-interview-questions", label: "Core CS & SDE" },
    { href: "/pricing", label: "Pricing" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-chassis)]/95 backdrop-blur-md border-b border-[var(--border-recessed)] shadow-sm transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 gap-3">
        {/* Brand Logo with Tactile Bezel */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0" aria-label="DevPrep home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-white font-mono font-black text-lg shadow-[var(--shadow-btn-primary)] transition-transform group-hover:scale-105 shrink-0">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-black text-lg tracking-tight text-[var(--text-primary)] leading-none whitespace-nowrap">
              DevPrep
            </span>
            <span className="font-mono text-[9px] font-bold text-[var(--text-muted)] tracking-wider uppercase whitespace-nowrap">
              Systematic Prep
            </span>
          </div>
        </Link>

        {/* Desktop Primary Nav - Single Line */}
        <nav className="hidden items-center gap-1 md:flex lg:gap-2 shrink-0" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[11px] lg:text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors py-1.5 px-2 lg:px-2.5 rounded-md hover:bg-[var(--bg-recessed)] whitespace-nowrap shrink-0"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* User Auth, Dark Mode Toggle & CTA Button */}
        <div className="hidden items-center gap-2.5 md:flex shrink-0">
          <ThemeToggle />

          {session?.authenticated ? (
            <>
              <Link
                href="/account"
                className="btn-industrial btn-industrial-secondary py-2 px-3.5 text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="max-w-[120px] truncate">{session.name || "Account"}</span>
              </Link>
              <button
                onClick={signOut}
                disabled={signingOut}
                className="btn-industrial btn-industrial-ghost py-2 px-3 text-xs flex items-center gap-1.5 disabled:opacity-60 whitespace-nowrap"
              >
                {signingOut ? (
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
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-industrial btn-industrial-ghost py-2 px-3 text-xs font-bold whitespace-nowrap"
              >
                Sign in
              </Link>
              <Link
                href="/pricing"
                className="btn-industrial btn-industrial-primary py-2.5 px-5 text-xs shadow-[var(--shadow-btn-primary)] whitespace-nowrap"
              >
                <span>Unlock All — <GeoPrice className="ml-1" /></span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle & theme toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg bg-[var(--bg-recessed)] text-[var(--text-primary)] hover:text-[var(--accent)] shadow-[var(--shadow-recessed)]"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-[var(--border-recessed)] bg-[var(--bg-panel)] px-6 py-6 md:hidden shadow-lg">
          <nav className="grid gap-3" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="p-2.5 rounded-lg bg-[var(--bg-chassis)] font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[var(--border-recessed)] flex flex-col gap-2">
              {session?.authenticated ? (
                <>
                  <Link
                    href="/account"
                    className="btn-industrial btn-industrial-secondary py-3 text-xs text-center"
                    onClick={() => setOpen(false)}
                  >
                    Account Desk ({session.name})
                  </Link>
                  <button
                    onClick={signOut}
                    disabled={signingOut}
                    className="btn-industrial btn-industrial-ghost py-2.5 text-xs flex items-center justify-center gap-2"
                  >
                    {signingOut ? (
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
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-industrial btn-industrial-secondary py-3 text-xs text-center"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/pricing"
                    className="btn-industrial btn-industrial-primary py-3.5 text-xs text-center"
                    onClick={() => setOpen(false)}
                  >
                    Unlock All — <GeoPrice className="ml-1" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
