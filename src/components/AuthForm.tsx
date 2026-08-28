"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

interface Props {
  mode: "login" | "register";
  nextPath?: string;
}

export default function AuthForm({ mode, nextPath = "/#technologies" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";
  const destination = nextPath.startsWith("/") ? nextPath : "/#technologies";

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  function fillReviewerCredentials() {
    setEmail("reviewer@devprep.online");
    setPassword("DevPrep#Tester2026");
    setError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister ? { name, email, password } : { email, password }
        )
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Authentication failed. Please try again.");
        return;
      }
      router.push(destination);
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setBusy(false);
    }
  }

  const googleAuthHref = `/api/auth/google?next=${encodeURIComponent(destination)}`;

  return (
    <div className="space-y-6">
      {/* Google Sign-In Button */}
      <div>
        <a
          href={googleAuthHref}
          className="btn-industrial btn-industrial-secondary py-3.5 px-6 text-xs w-full flex items-center justify-center gap-3 border border-[var(--border-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-floating)] transition-all font-semibold"
        >
          <svg
            className="w-4 h-4 shrink-0"
            width={16}
            height={16}
            style={{ width: "16px", height: "16px", minWidth: "16px", minHeight: "16px" }}
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isRegister ? "Sign up with Google" : "Continue with Google"}</span>
        </a>
      </div>

      {/* Mechanical Separator */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-[var(--border-recessed)] w-full" />
        <span className="bg-[var(--bg-chassis)] px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] absolute">
          OR WITH EMAIL
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {isRegister && (
          <div>
            <label htmlFor="name" className="stamped-label mb-2 block">Full Name</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className="industrial-input"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="stamped-label mb-2 block">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@example.com"
            className="industrial-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="stamped-label mb-2 block">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={isRegister ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isRegister ? "At least 8 characters" : "••••••••"}
            className="industrial-input"
          />
        </div>

        {error && (
          <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-xs text-rose-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-industrial btn-industrial-primary py-4 px-8 text-xs w-full shadow-[var(--shadow-btn-primary)] mt-2"
        >
          {busy ? "Authenticating…" : isRegister ? "Create Account & Continue" : "Sign In to DevPrep"}
        </button>

        <p className="text-center font-mono text-xs text-[var(--text-muted)] pt-2">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link
                href={`/login${nextPath !== "/#technologies" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
                className="text-[var(--accent)] font-bold underline underline-offset-4"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to DevPrep?{" "}
              <Link
                href={`/register${nextPath !== "/#technologies" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
                className="text-[var(--accent)] font-bold underline underline-offset-4"
              >
                Create free account
              </Link>
            </>
          )}
        </p>
      </form>

      {/* Reviewer / Razorpay Testing Credentials Helper */}
      {!isRegister && (
        <div className="pt-4 border-t border-[var(--border-recessed)]">
          <div className="industrial-recessed p-4 text-xs font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[var(--accent)] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Razorpay / Test Account</span>
              </span>
              <button
                type="button"
                onClick={fillReviewerCredentials}
                className="px-2 py-0.5 rounded bg-[var(--bg-chassis)] border border-[var(--border-card)] text-[10px] font-bold text-[var(--text-primary)] hover:text-[var(--accent)] shadow-sm"
              >
                Auto Fill
              </button>
            </div>
            <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
              <div>Email: <strong className="text-[var(--text-primary)]">reviewer@devprep.online</strong></div>
              <div>Password: <strong className="text-[var(--text-primary)]">DevPrep#Tester2026</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
