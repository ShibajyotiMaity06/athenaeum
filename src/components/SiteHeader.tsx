"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

interface SessionInfo {
  authenticated: boolean;
  name?: string;
  role?: "admin" | "scholar";
}

export default function SiteHeader() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/#volumes", label: "Volumes" },
    { href: "/library", label: "Reading Room" },
    { href: "/pricing", label: "Access" }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-grain bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="Athenaeum home">
          <span className="flex h-9 w-9 items-center justify-center rounded border border-brass/60 bg-background text-lg text-brass transition-transform duration-300 group-hover:scale-105">
            ✶
          </span>
          <span className="font-display text-sm tracking-[0.28em] text-parchment uppercase">
            Athenaeum
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {session?.authenticated ? (
            <>
              <Link href="/account" className="nav-link">
                {session.role === "admin" ? "Warden" : "Account"}
              </Link>
              <button onClick={signOut} className="btn btn-ghost h-10 px-2">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Sign in
              </Link>
              <Link href="/pricing" className="btn btn-primary h-10 px-6">
                Gain Entry
              </Link>
            </>
          )}
        </div>

        <button
          className="text-faded transition-colors hover:text-brass md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-grain bg-oak px-6 py-6 md:hidden">
          <nav className="grid gap-5" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {session?.authenticated ? (
              <>
                <Link href="/account" className="nav-link" onClick={() => setOpen(false)}>
                  Account
                </Link>
                <button onClick={signOut} className="btn btn-secondary h-11 w-full">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary h-11 w-full" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link href="/pricing" className="btn btn-primary h-11 w-full" onClick={() => setOpen(false)}>
                  Gain Entry
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
