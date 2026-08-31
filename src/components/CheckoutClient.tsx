"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Lock, ShieldCheck, Tag, X, Check, Sparkles, Layers, BookOpen } from "lucide-react";
import { calculatePromoPrice, PLANS, SITE, type CurrencyCode, type PricingPlan, type AccessTier } from "@/lib/site";
import { useVisitorCurrency } from "@/components/GeoPrice";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface Props {
  userEmail: string;
  userName: string;
  hasAccess: boolean;
  userTier?: AccessTier;
  sandbox: boolean;
  keyId: string | null;
  initialCurrency?: CurrencyCode | null;
  defaultPlan?: PricingPlan;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutClient({
  userEmail,
  userName,
  hasAccess,
  userTier = "full",
  sandbox,
  keyId,
  initialCurrency = "INR",
  defaultPlan = "full"
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planQuery = searchParams.get("plan");
  
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    planQuery === "interview" ? "interview" : defaultPlan
  );
  const [currency, setCurrency] = useState<CurrencyCode | null>(initialCurrency ?? null);
  const geoCurrency = useVisitorCurrency();
  const [manualChoice, setManualChoice] = useState(false);

  // Promo code states
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!manualChoice && !currency && geoCurrency) setCurrency(geoCurrency);
  }, [geoCurrency, manualChoice, currency]);

  const active: CurrencyCode = (currency ?? geoCurrency) || "INR";
  const [phase, setPhase] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const priceCalculation = calculatePromoPrice(selectedPlan, active, appliedPromo);
  const activePlanMeta = PLANS[selectedPlan];

  function handleApplyPromo(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setPromoError(null);
    setPromoSuccessMsg(null);
    const trimmed = promoInput.trim().toUpperCase();
    if (!trimmed) {
      setPromoError("Please enter a promo code.");
      return;
    }
    const check = calculatePromoPrice(selectedPlan, active, trimmed);
    if (!check.valid) {
      setPromoError("Invalid promo code. Please check and try again.");
      return;
    }
    setAppliedPromo(trimmed);
    setPromoSuccessMsg(`Promo code "${trimmed}" applied! ${check.discountPercent}% discount unlocked.`);
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError(null);
    setPromoSuccessMsg(null);
  }

  async function completePurchase() {
    setError(null);
    setPhase("busy");
    try {
      /* Sandbox path */
      if (sandbox) {
        await new Promise((r) => setTimeout(r, 800));
        const res = await fetch("/api/payments/sandbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currency: active,
            plan: selectedPlan,
            promoCode: appliedPromo || undefined
          })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Sandbox transaction failed.");
        setPhase("done");
        router.refresh();
        return;
      }

      /* Live Razorpay path */
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Payment gateway could not be loaded. Please check your connection.");
      }

      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: active,
          plan: selectedPlan,
          promoCode: appliedPromo || undefined
        })
      });
      const orderData = await orderRes.json().catch(() => null);
      if (!orderRes.ok || !orderData?.ok) {
        throw new Error(orderData?.error || "Could not create order.");
      }

      const rzp = new window.Razorpay({
        key: keyId ?? orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "DevPrep",
        description: `DevPrep ${activePlanMeta.name} — ${priceCalculation.valid ? "30% Off" : "Lifetime Access"}`,
        image: `${SITE.url}/icon.svg`,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#ff4757", backdrop_color: "#16191d" },
        notes: {
          platform: "DevPrep",
          email: userEmail,
          plan: selectedPlan,
          promoCode: appliedPromo || ""
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json().catch(() => null);
            if (!verifyRes.ok || !verifyData?.ok) {
              // Fallback to sync endpoint
              const syncRes = await fetch("/api/payments/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id
                })
              });
              const syncData = await syncRes.json().catch(() => null);
              if (syncRes.ok && syncData?.ok) {
                setPhase("done");
                router.refresh();
                return;
              }

              setError(verifyData?.error || "Payment verification failed. Please check your Account Desk to re-verify.");
              setPhase("idle");
              return;
            }
            setPhase("done");
            router.refresh();
          } catch {
            setError("Network issue during verification. Please visit your Account Desk to verify.");
            setPhase("idle");
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled before completion.");
            setPhase("idle");
          }
        }
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setPhase("idle");
    }
  }

  // If user already has full scholar access
  if (hasAccess && userTier === "full") {
    return (
      <div className="industrial-card p-10 text-center max-w-xl mx-auto corner-screws">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Full Lifetime Access is Active
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Your account has complete unrestricted access to all 3,600+ questions across all 27+ technologies AND the full Interview Prep codex.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/interview-prep" className="btn-industrial btn-industrial-primary py-3 px-6 text-xs w-full sm:w-auto">
            <span>Explore Interview Prep Codex</span>
          </Link>
          <Link href="/#technologies" className="btn-industrial btn-industrial-secondary py-3 px-6 text-xs w-full sm:w-auto">
            <span>Browse All 27+ Technologies</span>
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="industrial-card p-10 text-center max-w-xl mx-auto corner-screws">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-[var(--text-primary)]">
          Order Verified &amp; Access Unlocked
        </h2>
        <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">
          Your <strong className="text-[var(--text-primary)]">{activePlanMeta.name}</strong> license has been permanently bound to <strong className="text-[var(--text-primary)]">{userEmail}</strong>.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/interview-prep" className="btn-industrial btn-industrial-primary py-3.5 px-8 text-xs w-full sm:w-auto">
            <span>Go to Interview Prep</span>
          </Link>
          <Link href="/#technologies" className="btn-industrial btn-industrial-secondary py-3.5 px-8 text-xs w-full sm:w-auto">
            <span>Explore Technologies</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Plan Selection Switcher */}
      <div className="mb-8">
        <div className="text-center mb-4">
          <span className="stamped-label-accent">SELECT ACCESS LEVEL</span>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1">Choose Your Lifetime Preparation Plan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Plan 1: Full Scholar Access */}
          <button
            type="button"
            onClick={() => setSelectedPlan("full")}
            className={`text-left p-5 rounded-xl border-2 transition-all relative ${
              selectedPlan === "full"
                ? "border-[var(--accent)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] ring-2 ring-[var(--accent)]/20"
                : "border-[var(--border-card)] bg-[var(--bg-recessed)] hover:border-[var(--border-card-hover)]"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">
                {PLANS.full.badge}
              </span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "full" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-slate-400"
              }`}>
                {selectedPlan === "full" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span>{PLANS.full.name}</span>
            </h3>
            <p className="font-mono text-2xl font-black text-[var(--text-primary)] mt-1.5">
              {PLANS.full[active].display}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              3,600+ Questions Codex + Full Interview Prep Codex + All Future Tech
            </p>
          </button>

          {/* Plan 2: Interview Prep Key */}
          <button
            type="button"
            onClick={() => setSelectedPlan("interview")}
            className={`text-left p-5 rounded-xl border-2 transition-all relative ${
              selectedPlan === "interview"
                ? "border-[var(--accent)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] ring-2 ring-[var(--accent)]/20"
                : "border-[var(--border-card)] bg-[var(--bg-recessed)] hover:border-[var(--border-card-hover)]"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                {PLANS.interview.badge}
              </span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "interview" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-slate-400"
              }`}>
                {selectedPlan === "interview" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{PLANS.interview.name}</span>
            </h3>
            <p className="font-mono text-2xl font-black text-[var(--text-primary)] mt-1.5">
              {PLANS.interview[active].display}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              150+ Curated Interview Questions + Verified Solutions + 160+ Source URLs
            </p>
          </button>
        </div>
      </div>

      {/* Price Display Card */}
      <div className="industrial-card p-8 text-center corner-screws border-2 border-[var(--accent)]/30">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="stamped-label-accent">
            {active === "INR" ? "INDIA · DOMESTIC ACCESS" : "INTERNATIONAL ACCESS"} · {activePlanMeta.shortName.toUpperCase()}
          </span>
          {priceCalculation.valid && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              {priceCalculation.discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-center gap-3">
          {priceCalculation.valid && (
            <span className="font-mono text-2xl sm:text-3xl font-bold line-through text-[var(--text-muted)] opacity-60">
              {priceCalculation.originalDisplay}
            </span>
          )}
          <p className="font-mono text-5xl sm:text-6xl font-black text-[var(--text-primary)]">
            {priceCalculation.display}
          </p>
        </div>

        {priceCalculation.valid ? (
          <p className="mt-2 text-xs text-emerald-600 font-mono font-medium">
            30% discount applied · You save {priceCalculation.savingsDisplay}
          </p>
        ) : (
          <p className="mt-2 text-xs text-[var(--text-muted)] font-mono">
            {activePlanMeta[active].note}
          </p>
        )}
      </div>

      {/* Promo Code Input Module */}
      <div className="mt-6 industrial-recessed p-4 rounded-xl border border-[var(--border-recessed)]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label htmlFor="promoCodeInput" className="text-xs font-mono font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Have a Promo Code?</span>
          </label>
          {appliedPromo && (
            <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Code applied
            </span>
          )}
        </div>

        {appliedPromo ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono font-bold text-xs rounded">
                {appliedPromo}
              </span>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300">
                30% discount applied (-{priceCalculation.savingsDisplay})
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-rose-500 flex items-center gap-1 transition-colors px-2 py-1"
              title="Remove promo code"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="flex gap-2">
            <input
              id="promoCodeInput"
              type="text"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value.toUpperCase());
                setPromoError(null);
              }}
              placeholder="Enter promo code"
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] text-sm font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors uppercase"
            />
            <button
              type="submit"
              disabled={!promoInput.trim()}
              className="btn-industrial btn-industrial-secondary px-5 py-2.5 text-xs font-mono font-semibold disabled:opacity-50"
            >
              Apply
            </button>
          </form>
        )}

        {promoError && (
          <p className="mt-2 text-xs font-mono text-rose-500 flex items-center gap-1.5">
            <X className="w-3 h-3 shrink-0" />
            {promoError}
          </p>
        )}

        {promoSuccessMsg && !promoError && (
          <p className="mt-2 text-xs font-mono text-emerald-600 flex items-center gap-1.5">
            <Check className="w-3 h-3 shrink-0" />
            {promoSuccessMsg}
          </p>
        )}
      </div>

      {/* Order Summary Module */}
      <div className="mt-6 industrial-recessed p-6 space-y-3 font-mono text-xs text-[var(--text-muted)]">
        <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
          <span>SELECTED PLAN</span>
          <span className="text-[var(--text-primary)] font-bold">{activePlanMeta.name}</span>
        </div>

        {selectedPlan === "full" ? (
          <>
            <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
              <span>LIFETIME QUESTION ACCESS</span>
              <span className="text-[var(--text-primary)] font-bold">3,600+ Questions</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
              <span>INTERVIEW PREP CODEX</span>
              <span className="text-emerald-600 font-bold">Included (All Techs)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
              <span>ALL CURRENT &amp; FUTURE CODICES</span>
              <span className="text-emerald-600 font-bold">Included Forever</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
              <span>INTERVIEW PREP ACCESS</span>
              <span className="text-emerald-600 font-bold">Full Unlimited Access</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
              <span>CURATED TECH CODICES</span>
              <span className="text-[var(--text-primary)] font-bold">Node.js, JS, React &amp; more</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
              <span>SOURCE CITATIONS &amp; DOCS</span>
              <span className="text-emerald-600 font-bold">160+ Verified URLs</span>
            </div>
          </>
        )}

        {priceCalculation.valid && (
          <>
            <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
              <span>BASE LIST PRICE</span>
              <span className="text-[var(--text-muted)] line-through font-bold">
                {priceCalculation.originalDisplay}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)] text-emerald-600">
              <span>PROMO CODE ({priceCalculation.code}) 30% OFF</span>
              <span className="font-bold">
                -{priceCalculation.savingsDisplay}
              </span>
            </div>
          </>
        )}

        <div className="flex justify-between py-2">
          <span>AMOUNT DUE</span>
          <span className="text-[var(--accent)] font-bold text-sm">
            {priceCalculation.display}
          </span>
        </div>
      </div>

      {sandbox && (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Sandbox test mode active. No real card will be charged. Click below to simulate instant payment verification.
          </span>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-mono">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={phase === "busy"}
        onClick={completePurchase}
        className="btn-industrial btn-industrial-primary py-4 px-8 text-sm w-full mt-6 shadow-[var(--shadow-btn-primary)] flex items-center justify-center gap-2.5 disabled:opacity-60"
      >
        {phase === "busy" ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Connecting Gateway…</span>
          </>
        ) : (
          <span>Pay {priceCalculation.display} · Unlock {activePlanMeta.shortName}</span>
        )}
      </button>

      <p className="mt-4 text-center text-xs font-mono text-[var(--text-muted)]">
        Processed securely through Razorpay · 256-bit encryption
      </p>
    </div>
  );
}
