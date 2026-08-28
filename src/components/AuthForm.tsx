"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  mode: "login" | "register";
  nextPath?: string;
}

export default function AuthForm({ mode, nextPath = "/#technologies" }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";
  const destination = nextPath.startsWith("/") ? nextPath : "/#technologies";

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

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 font-mono text-xs text-rose-800">
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
  );
}
