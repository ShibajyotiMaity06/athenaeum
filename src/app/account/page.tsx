import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, BookOpen, CheckCircle2, ReceiptText, Shield, User } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import SyncPaymentButton from "@/components/SyncPaymentButton";
import GeoPrice from "@/components/GeoPrice";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUser } from "@/lib/db";
import { PRICING, type CurrencyCode } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account Desk — DevPrep",
  robots: { index: false }
};

function money(amountMinor: number, currency: string): string {
  if (currency === "INR") return `₹${(amountMinor / 100).toFixed(0)}`;
  return `$${(amountMinor / 100).toFixed(2)}`;
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const orders = await getOrdersByUser(user.id);
  const isAdmin = user.role === "admin";
  const isFull = Boolean(isAdmin || (user.access.granted && (user.access.tier === "full" || !user.access.tier)));
  const isInterview = Boolean(user.access.granted && user.access.tier === "interview");
  const hasAccess = isFull || isInterview;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <header className="mb-10 industrial-card p-6 sm:p-8 corner-screws">
        <div className="flex items-center gap-2 mb-2">
          <span className="led-indicator led-green" />
          <span className="stamped-label-accent">DEVPREP USER TERMINAL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
          {user.name}
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-mono text-[var(--text-muted)]">
          {user.email}
          {isAdmin && (
            <span className="ml-3 px-2 py-0.5 rounded bg-[var(--accent)] text-white text-[10px] font-bold uppercase">
              ADMIN
            </span>
          )}
          {isFull && !isAdmin && (
            <span className="ml-3 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] font-bold uppercase">
              FULL SCHOLAR PASS
            </span>
          )}
          {isInterview && (
            <span className="ml-3 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px] font-bold uppercase">
              INTERVIEW PREP KEY
            </span>
          )}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
        {/* Access Status Panel */}
        <section className="industrial-card p-6 sm:p-8">
          <span className="stamped-label mb-4 block">LICENSE STATUS</span>

          {hasAccess ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {isFull ? "Full Lifetime Scholar Access" : "Interview Prep Key Active"}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    {isFull
                      ? "All 3,600+ questions across 27+ technologies, full Interview Prep codex, and all future updates are unlocked."
                      : "Full access to the Interview Prep codex across Node.js, JavaScript, React & more. Verified solutions & documentation sources are unlocked."}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(186,190,204,0.4)] flex flex-wrap gap-3">
                <Link href="/interview-prep" className="btn-industrial btn-industrial-primary py-2.5 px-5 text-xs">
                  <span>Interview Prep Codex</span>
                </Link>
                <Link href="/#technologies" className="btn-industrial btn-industrial-secondary py-2.5 px-5 text-xs">
                  <span>Browse 3,600+ Questions</span>
                </Link>
                {isInterview && (
                  <Link href="/pricing?plan=full" className="btn-industrial btn-industrial-ghost py-2.5 px-4 text-xs text-[var(--accent)] font-bold">
                    <span>Upgrade to All-Access (₹399)</span>
                  </Link>
                )}
                <LogoutButton />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Free Preview Active
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    You can read 5 questions per codex for free. Get the <strong>Interview Key (₹299)</strong> or <strong>Full Scholar Pass (₹399)</strong> for unrestricted lifetime access.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(186,190,204,0.4)] flex flex-wrap gap-3 items-center">
                <Link href="/pricing" className="btn-industrial btn-industrial-primary py-3 px-6 text-xs">
                  <span>Choose Your Plan — ₹299 / ₹399</span>
                </Link>
                <LogoutButton />
              </div>
              <SyncPaymentButton />
            </div>
          )}
        </section>

        {/* Order History */}
        <section className="industrial-recessed p-6">
          <span className="stamped-label mb-4 block flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-[var(--accent)]" />
            <span>TRANSACTION HISTORY</span>
          </span>

          {orders.length === 0 ? (
            <p className="text-xs font-mono text-[var(--text-muted)] py-4">
              No orders on file yet. Upgrades will be recorded here permanently.
            </p>
          ) : (
            <ul className="space-y-3 font-mono text-xs">
              {orders.map((o) => {
                const cur = (o.currency in PRICING ? o.currency : "INR") as CurrencyCode;
                return (
                  <li key={o.id} className="p-3 bg-[var(--bg-chassis)] rounded-lg border border-[var(--border-card)]">
                    <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
                      <span>{money(o.amount, cur)} {cur}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] uppercase">
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-[var(--text-muted)] flex justify-between">
                      <span>{new Date(o.createdAt).toLocaleDateString("en-IN")}</span>
                      <span>{o.provider}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
