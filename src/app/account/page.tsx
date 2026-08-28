import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, BookOpen, CheckCircle2, ReceiptText, Shield, User } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
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
  const hasAccess = Boolean(user.access.granted || isAdmin);

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
                    Lifetime Access Unlocked
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    {isAdmin
                      ? "Admin privileges active — unrestricted access to all codices."
                      : `Scholar access verified via ${
                          user.access.provider === "razorpay" ? "Razorpay" : "the sandbox ledger"
                        }. All 3,600+ questions and future updates are unlocked.`}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(186,190,204,0.4)] flex flex-wrap gap-3">
                <Link href="/#technologies" className="btn-industrial btn-industrial-primary py-2.5 px-5 text-xs">
                  <span>Browse Questions</span>
                </Link>
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
                    You can read 5 questions per level across every technology. Unlock all 3,600+ questions for ₹399 / $9 lifetime.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(186,190,204,0.4)] flex flex-wrap gap-3">
                <Link href="/pricing" className="btn-industrial btn-industrial-primary py-3 px-6 text-xs">
                  <span>Upgrade to Lifetime Access — <GeoPrice className="ml-1" /></span>
                </Link>
                <LogoutButton />
              </div>
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
