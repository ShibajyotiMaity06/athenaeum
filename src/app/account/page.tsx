import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, BookOpen, ReceiptText } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import OrnateDivider from "@/components/OrnateDivider";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUser } from "@/lib/db";
import { PRICING, type CurrencyCode } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Desk",
  robots: { index: false }
};

function money(amountMinor: number, currency: string): string {
  if (currency === "INR") return `â‚¹${(amountMinor / 100).toFixed(0)}`;
  return `$${(amountMinor / 100).toFixed(2)}`;
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const orders = await getOrdersByUser(user.id);
  const isAdmin = user.role === "admin";
  const sealed = Boolean(user.access.granted);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-14">
        <p className="kicker">Your Desk</p>
        <h1 className="font-heading mt-4 text-5xl">{user.name}</h1>
        <p className="mt-3 font-body italic text-faded">
          {user.email}
          {isAdmin && (
            <span className="ml-3 rounded border border-brass/60 px-2 py-0.5 font-display text-[9px] uppercase not-italic tracking-[0.25em] text-brass">
              Warden · unrestricted
            </span>
          )}
        </p>
        <OrnateDivider className="mt-8 w-full max-w-md" />
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        {/* Seal status */}
        <section aria-labelledby="seal-heading" className="rounded border border-grain bg-oak p-8">
          <h2 id="seal-heading" className="kicker">State of your seal</h2>

          {sealed ? (
            <div className="mt-6 flex items-start gap-5">
              <span
                className={`${isAdmin && user.access.provider === "admin" ? "" : "wax-seal"} flex h-16 w-16 shrink-0 items-center justify-center rounded-full border ${
                  isAdmin && user.access.provider === "admin"
                    ? "border-brass/60"
                    : ""
                }`}
              >
                <BadgeCheck className={`h-7 w-7 ${isAdmin && user.access.provider === "admin" ? "text-brass" : "text-parchment"}`} strokeWidth={1.25} />
              </span>
              <div>
                <p className="font-heading text-2xl">Open shelves</p>
                <p className="mt-2 leading-relaxed text-faded">
                  {isAdmin
                    ? "Warden's privilege — every volume answers to you."
                    : `Scholar access sealed via ${user.access.provider === "razorpay" ? "Razorpay" : "the sandbox ledger"} on ${
                        user.access.grantedAt ? new Date(user.access.grantedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "an earlier date"
                      }.`}
                </p>
                {!isAdmin && (
                  <p className="mt-2 font-body text-sm italic text-faded">
                    Lifetime rights incl. future additions · receipt below
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <p className="font-heading text-2xl">Awaiting your seal</p>
              <p className="mt-2 leading-relaxed text-faded">
                The corridors are walkable, but the codices remain closed until a single
                contribution of â‚¹500 / $10 is recorded.
              </p>
              <Link href="/pricing" className="btn btn-primary mt-6 h-12 px-8">
                Visit the ledger
              </Link>
            </div>
          )}

          <div className="ornate-divider my-8" aria-hidden="true" />

          <div className="flex flex-wrap gap-4">
            <Link href="/library" className="btn btn-secondary h-11 px-6">
              <BookOpen className="h-4 w-4" strokeWidth={1.5} />
              Reading Room
            </Link>
            <LogoutButton />
          </div>
        </section>

        {/* Ledger */}
        <section aria-labelledby="ledger-heading" className="rounded border border-grain bg-oak p-8">
          <h2 id="ledger-heading" className="kicker flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-brass" strokeWidth={1.5} />
            The ledger
          </h2>

          {orders.length === 0 ? (
            <p className="mt-6 italic leading-relaxed text-faded">
              No entries yet. When you settle at the desk, receipts are kept here forever.
            </p>
          ) : (
            <ul className="mt-6 grid gap-5">
              {orders.map((o) => {
                const cur = (o.currency in PRICING ? o.currency : "INR") as CurrencyCode;
                return (
                  <li key={o.id} className="rounded border border-grain bg-background p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display tracking-[0.15em] text-brass">
                        {money(o.amount, cur)}{" "}
                        <span className="text-faded">{cur}</span>
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em] ${
                          o.status === "paid"
                            ? "bg-crimson/25 text-parchment"
                            : "border border-grain text-faded"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <dl className="mt-3 space-y-1 font-body text-[13px] text-faded">
                      <div className="flex justify-between gap-4">
                        <dt>Reference</dt>
                        <dd className="truncate font-mono text-[11px]" title={o.paymentId || o.id}>
                          {(o.paymentId || o.id).slice(0, 22)}…
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Via</dt>
                        <dd className="capitalize">{o.provider}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Date</dt>
                        <dd>{new Date(o.createdAt).toLocaleDateString("en-IN")}</dd>
                      </div>
                    </dl>
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
