"use client";

import { useEffect, useState } from "react";
import { PLANS, PRICING, type CurrencyCode, type PricingPlan } from "@/lib/site";

let cached: Promise<CurrencyCode> | null = null;

function guessFromLocale(): CurrencyCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/Calcutta|Kolkata|Asia\/Calcutta/i.test(tz)) return "INR";
    const lang = navigator.language || "";
    if (/^en-IN/i.test(lang)) return "INR";
  } catch {
    /* fall through */
  }
  return "USD";
}

function resolve(): Promise<CurrencyCode> {
  if (!cached) {
    cached = fetch("/api/geo", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { currency?: CurrencyCode | null }) => data?.currency ?? guessFromLocale())
      .catch(() => guessFromLocale());
  }
  return cached;
}

/**
 * Renders exactly ONE localized price based on the visitor's location —
 * India sees INR (₹399 / ₹299), everywhere else sees USD ($9 / $7).
 */
export default function GeoPrice({
  className = "",
  plan = "full"
}: {
  className?: string;
  plan?: PricingPlan;
}) {
  const [currency, setCurrency] = useState<CurrencyCode | null>(null);

  useEffect(() => {
    let alive = true;
    resolve().then((c) => alive && setCurrency(c));
    return () => {
      alive = false;
    };
  }, []);

  if (!currency) {
    return (
      <span
        className={`inline-block h-[1em] w-14 animate-pulse rounded bg-brass/25 align-middle ${className}`}
        aria-hidden="true"
      />
    );
  }

  const selectedPlan = PLANS[plan] || PLANS.full;
  const priceDisplay = selectedPlan[currency]?.display || selectedPlan.INR.display;

  return (
    <span className={className} suppressHydrationWarning>
      {priceDisplay}
    </span>
  );
}

/** Shared resolver for other client components (checkout, toggles). */
export function useVisitorCurrency(): CurrencyCode | null {
  const [currency, setCurrency] = useState<CurrencyCode | null>(null);
  useEffect(() => {
    let alive = true;
    resolve().then((c) => alive && setCurrency(c));
    return () => {
      alive = false;
    };
  }, []);
  return currency;
}
