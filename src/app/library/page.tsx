import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import StackCard from "@/components/StackCard";
import GeoPrice from "@/components/GeoPrice";
import { getCurrentUser } from "@/lib/auth";
import { listStacks } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Reading Room — Every Volume",
  description:
    "Browse the full Athenaeum catalogue: 27 codices across frontend, backend, languages, databases, networks and system design, each graded Basic / Medium / Hard with a free preview.",
  alternates: { canonical: "/library" }
};

export default async function LibraryPage() {
  const user = await getCurrentUser();
  const stacks = listStacks();
  const unlocked = Boolean(user && (user.access.granted || user.role === "admin"));

  return (
    <>
      <header className="mb-12">
        <p className="kicker">The Reading Room</p>
        <h1 className="font-heading mt-4 text-5xl">{stacks.length} volumes, one key</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-faded">
          {unlocked ? (
            <>
              Welcome back, <span className="text-parchment">{user!.name}</span>. Every shelf
              stands open — read at whatever pace scholarship demands.
            </>
          ) : (
            <>
              Walk every corridor freely — each codex opens its{" "}
              <span className="text-parchment">first five passages</span> to you at once.
              One small key unlocks all the rest.
            </>
          )}
        </p>
      </header>

      {!unlocked && (
        <div className="corner-flourish mb-12 flex flex-col items-start gap-6 rounded border border-brass/50 bg-oak p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Lock className="mt-1 h-5 w-5 shrink-0 text-brass" strokeWidth={1.5} />
            <div>
              <h2 className="font-heading text-xl">Beyond five, the seal</h2>
              <p className="mt-1 max-w-lg leading-relaxed text-faded">
                A single contribution — <GeoPrice className="text-parchment font-medium" /> — opens
                everything, forever, including future additions.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="btn btn-primary h-12 shrink-0 px-8">
            Take the key
          </Link>
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {stacks.map((stack) => (
          <StackCard key={stack.slug} stack={stack} />
        ))}
      </div>
    </>
  );
}
