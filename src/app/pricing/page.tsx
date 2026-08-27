import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { CreditCard, ShieldCheck } from "lucide-react";
import CheckoutClient from "@/components/CheckoutClient";
import OrnateDivider from "@/components/OrnateDivider";
import { getCurrentUser } from "@/lib/auth";
import { sandboxAllowed } from "@/lib/razorpay";
import { countryFromHeaders, currencyForCountry } from "@/lib/geo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scholar Access — One Key, Lifetime Entry",
  description:
    "One contribution opens all 27 volumes of the Athenaeum forever: 3,600+ interview questions with answers and implementation folios. Settled securely via Razorpay.",
  alternates: { canonical: "/pricing" }
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  const sandbox = sandboxAllowed();
  const headerCountry = countryFromHeaders(await headers());
  const initialCurrency = currencyForCountry(headerCountry);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
      <header className="text-center">
        <p className="kicker">The Ledger Desk</p>
        <h1 className="font-heading mt-4 text-5xl">Terms of Access</h1>
        <OrnateDivider className="mx-auto mt-8 w-72" />
      </header>

      {!user ? (
        <div className="ornate-frame mx-auto mt-16 max-w-xl rounded border border-grain bg-oak p-12 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-brass" strokeWidth={1.25} />
          <h2 className="font-heading mt-6 text-3xl">First, inscribe yourself</h2>
          <p className="mt-4 leading-relaxed text-faded">
            An account costs nothing — it simply tells the ledger whose shelf to open
            once the toll is paid.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register?next=%2Fpricing" className="btn btn-primary h-13 px-8 py-4">
              Enrol as Scholar
            </Link>
            <Link href="/login?next=%2Fpricing" className="btn btn-secondary h-12 px-8">
              I already hold an account
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-16">
          <CheckoutClient
            userEmail={user.email}
            userName={user.name}
            hasAccess={Boolean(user.access.granted)}
            sandbox={sandbox}
            keyId={process.env.RAZORPAY_KEY_ID || null}
            initialCurrency={initialCurrency}
          />
        </div>
      )}

      <section className="mx-auto mt-20 max-w-2xl">
        <div className="ornate-divider" aria-hidden="true" />
        <div className="mt-10 grid gap-6 text-center sm:grid-cols-3">
          {[
            { icon: CreditCard, title: "Every modern rail", body: "UPI · cards · net-banking · wallets — via Razorpay." },
            { icon: ShieldCheck, title: "Sealed to you", body: "Access binds to your account instantly upon verification." },
            { icon: null, title: "No renewals, ever", body: "A single settlement; the collection only grows." }
          ].map((t) => (
            <div key={t.title}>
              {t.icon ? (
                <t.icon className="mx-auto h-6 w-6 text-brass" strokeWidth={1.25} />
              ) : (
                <span aria-hidden="true" className="block text-lg leading-7 text-brass">✶</span>
              )}
              <h3 className="font-heading mt-3 text-lg">{t.title}</h3>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-faded">{t.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
