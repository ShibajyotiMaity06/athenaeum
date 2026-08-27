"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  mode: "login" | "register";
  nextPath?: string;
}

export default function AuthForm({ mode, nextPath = "/library" }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";
  const destination = nextPath.startsWith("/") ? nextPath : "/library";

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
        setError(data?.error || "Something went astray. Try once more.");
        return;
      }
      router.push(destination);
      router.refresh();
    } catch {
      setError("The archive is unreachable. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6" noValidate>
      {isRegister && (
        <div>
          <label htmlFor="name" className="field-label">Full name</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="field-input"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="reader@example.com"
          className="field-input"
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Secret passphrase
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
          placeholder={isRegister ? "At least eight characters" : "••••••••"}
          className="field-input"
        />
      </div>

      {error && (
        <p role="alert" className="rounded border border-crimson/60 bg-crimson/15 px-4 py-3 font-body text-[15px] text-parchment">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary h-13 w-full px-8 py-4">
        {busy ? "Consulting the ledger…" : isRegister ? "Enrol as Scholar" : "Enter the Library"}
      </button>

      <p className="text-center font-body text-[15px] text-faded">
        {isRegister ? (
          <>
            Already inscribed?{" "}
            <Link href={`/login${nextPath !== "/library" ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="link-brass">
              Sign in
            </Link>
          </>
        ) : (
          <>
            Not yet a member?{" "}
            <Link href={`/register${nextPath !== "/library" ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="link-brass">
              Enrol now
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
