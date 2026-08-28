import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create Account — DevPrep",
  description: "Enrol in DevPrep to unlock technical interview preparation.",
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
          <span className="stamped-label-accent">JOIN DEVPREP</span>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] mt-2">
            Create Account
          </h1>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
            Free forever account · Bind your lifetime license.
          </p>
        </header>
        <div>
          <AuthForm mode="register" nextPath={next} />
        </div>
      </div>
    </div>
  );
}
