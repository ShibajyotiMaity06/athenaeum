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
  title: "Lifetime Pricing — Lifetime Access Desk | DevPrep",
  description:
    "One-time localized payment for complete, unrestricted lifetime access to 3,600+ technical interview questions across 27+ technologies.",
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
          Pay once, prepare forever. Unlock every question, model answer, and future tech track with a single contribution.
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
          <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
            Your license will be tied permanently to your email address. It takes 10 seconds to sign up.
          </p>

          <div className="mt-8 flex flex-col gap-3 max-w-sm mx-auto w-full">
            {/* Google Fast Sign-In */}
            <a
              href="/api/auth/google?next=%2Fpricing"
              className="btn-industrial btn-industrial-secondary py-3.5 px-6 text-xs w-full flex items-center justify-center gap-3 border border-[var(--border-card)] shadow-[var(--shadow-card)] font-semibold"
            >
              <svg
                className="w-4 h-4 shrink-0"
                width={16}
                height={16}
                style={{ width: "16px", height: "16px", minWidth: "16px", minHeight: "16px" }}
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </a>

            {/* Email Sign-Up */}
            <Link
              href="/register?next=%2Fpricing"
              className="btn-industrial btn-industrial-primary py-3.5 px-6 text-xs w-full shadow-[var(--shadow-btn-primary)]"
            >
              <span>Create Account with Email</span>
            </Link>

            {/* Existing User Sign-In */}
            <Link
              href="/login?next=%2Fpricing"
              className="btn-industrial btn-industrial-ghost py-2 px-4 text-xs w-full text-center"
            >
              <span>Already have an account? <strong className="text-[var(--accent)] underline">Sign in</strong></span>
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
      <section className="mt-20 pt-12 border-t border-[var(--border-recessed)] grid gap-6 sm:grid-cols-3 text-center">
        <div className="industrial-recessed p-6">
          <CreditCard className="w-6 h-6 text-[var(--accent)] mx-auto mb-3" />
          <h3 className="font-bold text-sm text-[var(--text-primary)]">All Payment Rails</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">UPI (GPay/PhonePe), Cards, Net Banking via Razorpay</p>
        </div>
        <div className="industrial-recessed p-6">
          <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-3" />
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
