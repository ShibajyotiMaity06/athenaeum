"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, User, Loader2, LogOut, ChevronDown } from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  // Close dropdown and mobile drawer on route change
  useEffect(() => {
    setDropdownOpen(false);
    setOpen(false);
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
    window.location.href = "/";
  }

  const links = [
    { href: "/dsa", label: "DSA" },
    { href: "/interview-prep", label: "Interview Prep" },
    { href: "/#technologies", label: "Technologies" },
    { href: "/frontend-interview-questions", label: "Frontend" },
    { href: "/backend-interview-questions", label: "Backend" },
    { href: "/sde-interview-questions", label: "Core CS & SDE" },
    { href: "/pricing", label: "Pricing" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg-chassis)]/95 backdrop-blur-md border-b border-[var(--border-recessed)] shadow-sm transition-colors duration-200">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Extreme Left: Brand Logo & Description */}
        <Link href="/" className="group flex items-center gap-3 shrink-0" aria-label="DevPrep home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-white font-mono font-black text-lg shadow-[var(--shadow-btn-primary)] transition-transform group-hover:scale-105 shrink-0">
            D
          </div>
          <div className="flex flex-col text-left">
            <span className="font-sans font-black text-lg tracking-tight text-[var(--text-primary)] leading-none whitespace-nowrap">
              DevPrep
            </span>
            <span className="font-mono text-[9px] font-bold text-[var(--text-muted)] tracking-wider uppercase whitespace-nowrap mt-1">
              Systematic Prep
            </span>
          </div>
        </Link>

        {/* Desktop Primary Nav */}
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

        {/* Extreme Right: Dark/Night Mode Toggle + Account Dropdown / Sign in */}
        <div className="hidden items-center gap-3 md:flex shrink-0">
          {/* Dark / Night Mode Toggle just left of the Account section */}
          <ThemeToggle />

          {session?.authenticated ? (
            /* Account Name with Dropdown Menu */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="btn-industrial btn-industrial-secondary py-2 px-3.5 text-xs flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold text-[10px]">
                  <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                </div>
                <span className="max-w-[130px] truncate font-semibold text-[var(--text-primary)]">
                  {session.name || "Account"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-[var(--accent)]" : ""
                  }`}
                />
              </button>

              {/* Dropdown with 1: Account, 2: Logout */}
              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-recessed)] shadow-[var(--shadow-floating)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3.5 py-2 border-b border-[var(--border-recessed)]">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      Signed in as
                    </p>
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5">
                      {session.name || "Scholar User"}
                    </p>
                  </div>

                  <div className="py-1">
                    {/* Item 1: Account */}
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-[var(--bg-recessed)] transition-colors w-full text-left"
                    >
                      <User className="w-4 h-4 text-[var(--accent)]" />
                      <span>Account</span>
                    </Link>

                    {/* Item 2: Logout */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={signOut}
                      disabled={signingOut}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors w-full text-left cursor-pointer disabled:opacity-60"
                    >
                      {signingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                          <span>Signing out…</span>
                        </>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Logout</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
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
            </div>
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
                    className="btn-industrial btn-industrial-secondary py-3 text-xs flex items-center justify-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Account ({session.name || "Scholar"})</span>
                  </Link>
                  <button
                    onClick={signOut}
                    disabled={signingOut}
                    className="btn-industrial btn-industrial-ghost py-2.5 text-xs flex items-center justify-center gap-2 text-rose-500"
                  >
                    {signingOut ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                        <span>Signing out…</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Logout</span>
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
