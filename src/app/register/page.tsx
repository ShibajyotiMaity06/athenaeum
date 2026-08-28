import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create an Account — DevPrep",
  description: "Create a free account to track your interview prep progress.",
  robots: { index: false }
};

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/#technologies";

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-20">
      <div className="industrial-card p-8 sm:p-10 corner-screws">
        <header className="text-center mb-8">
          <span className="stamped-label-accent">ACCOUNT INITIALIZATION</span>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] mt-2">
            Create account
          </h1>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
            Free preview across 27+ technologies. One key unlocks all.
          </p>
        </header>
        <div>
          <Suspense fallback={<div className="h-64 flex items-center justify-center font-mono text-xs text-[var(--text-muted)]">Loading interface…</div>}>
            <AuthForm mode="register" nextPath={next} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
