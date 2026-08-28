import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle2, CreditCard, ShieldCheck, Zap } from "lucide-react";
import CheckoutClient from "@/components/CheckoutClient";
import GeoPrice from "@/components/GeoPrice";
import { getCurrentUser } from "@/lib/auth";
import { sandboxAllowed } from "@/lib/razorpay";
import { countryFromHeaders, currencyForCountry } from "@/lib/geo";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lifetime Pricing — ₹399 / $9 Lifetime Access | DevPrep",
  description:
    "One-time payment of ₹399 in India or $9 internationally for complete, unrestricted lifetime access to 3,600+ technical interview questions across 27+ technologies.",
  alternates: { canonical: `${SITE.url}/pricing` }
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  const sandbox = sandboxAllowed();
  const headerCountry = countryFromHeaders(await headers());
  const initialCurrency = currencyForCountry(headerCountry);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
      <header className="text-center max-w-2xl mx-auto mb-12">
        <span className="stamped-label-accent">TRANSPARENT VALUE</span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)] mt-2">
          Lifetime Access Desk
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Pay once, prepare forever. Unlock every question, model answer, and future tech track for ₹399 / $9.
        </p>
      </header>

      {!user ? (
        <div className="industrial-card p-8 sm:p-12 text-center max-w-xl mx-auto corner-screws">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-recessed)] text-[var(--accent)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-recessed)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Create or Access Your Account
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">
            Your license will be tied permanently to your email address. It takes 10 seconds to sign up.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?next=%2Fpricing"
              className="btn-industrial btn-industrial-primary py-3.5 px-8 text-xs w-full sm:w-auto"
            >
              <span>Create Account &amp; Enrol</span>
            </Link>
            <Link
              href="/login?next=%2Fpricing"
              className="btn-industrial btn-industrial-secondary py-3.5 px-8 text-xs w-full sm:w-auto"
            >
              <span>Already have an account? Sign in</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
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

      {/* Feature Guarantee Grid */}
      <section className="mt-20 pt-12 border-t border-[rgba(186,190,204,0.5)] grid gap-6 sm:grid-cols-3 text-center">
        <div className="industrial-recessed p-6">
          <CreditCard className="w-6 h-6 text-[var(--accent)] mx-auto mb-3" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">All Payment Rails</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">UPI (GPay/PhonePe), Cards, Net Banking via Razorpay</p>
        </div>
        <div className="industrial-recessed p-6">
          <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">Instant Access</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">License activates automatically upon verification</p>
        </div>
        <div className="industrial-recessed p-6">
          <Zap className="w-6 h-6 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">No Subscriptions</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">Zero renewals, zero recurring bills forever</p>
        </div>
      </section>
    </div>
  );
}
