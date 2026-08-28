import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in — DevPrep",
  description: "Sign in to access your DevPrep interview questions account.",
  robots: { index: false }
};

export default async function LoginPage({
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
          <span className="stamped-label-accent">ACCOUNT PORTAL</span>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] mt-2">
            Welcome back
          </h1>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
            Sign in to access your questions and progress.
          </p>
        </header>
        <div>
          <Suspense fallback={<div className="h-64 flex items-center justify-center font-mono text-xs text-[var(--text-muted)]">Loading interface…</div>}>
            <AuthForm mode="login" nextPath={next} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
