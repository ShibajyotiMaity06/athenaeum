"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Lock, ShieldCheck, Zap } from "lucide-react";
import { PRICING, SITE, type CurrencyCode } from "@/lib/site";
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
  sandbox: boolean;
  keyId: string | null;
  initialCurrency?: CurrencyCode | null;
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
  sandbox,
  keyId,
  initialCurrency = "INR"
}: Props) {
  const router = useRouter();
  const [currency, setCurrency] = useState<CurrencyCode | null>(initialCurrency ?? null);
  const geoCurrency = useVisitorCurrency();
  const [manualChoice, setManualChoice] = useState(false);

  useEffect(() => {
    if (!manualChoice && !currency && geoCurrency) setCurrency(geoCurrency);
  }, [geoCurrency, manualChoice, currency]);
  const active: CurrencyCode | null = currency ?? geoCurrency;
  const [phase, setPhase] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const price = active ? PRICING[active] : null;

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
          body: JSON.stringify({ currency: active })
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
        body: JSON.stringify({ currency })
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
        description: "DevPrep Lifetime Scholar Access — 3,600+ Questions",
        image: `${SITE.url}/icon.svg`,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#ff4757", backdrop_color: "#16191d" },
        notes: {
          platform: "DevPrep",
          email: userEmail
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json().catch(() => null);
          if (!verifyRes.ok || !verifyData?.ok) {
            setError(verifyData?.error || "Payment verification failed.");
            setPhase("idle");
            return;
          }
          setPhase("done");
          router.refresh();
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

  if (hasAccess) {
    return (
      <div className="industrial-card p-10 text-center max-w-xl mx-auto corner-screws">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Lifetime Access is Active
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Your account has full unrestricted access to all 3,600+ questions across every technology.
        </p>
        <Link href="/#technologies" className="btn-industrial btn-industrial-primary py-3.5 px-8 mt-6 inline-flex text-xs">
          <span>Start Practicing Questions</span>
        </Link>
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
          Your lifetime license has been permanently bound to <strong className="text-[var(--text-primary)]">{userEmail}</strong>.
        </p>
        <Link href="/#technologies" className="btn-industrial btn-industrial-primary py-4 px-10 mt-8 inline-flex text-xs">
          <span>Explore All 27+ Codices</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Price Display Card */}
      {price && active && (
        <div className="industrial-card p-8 text-center corner-screws border-2 border-[var(--accent)]/30">
          <span className="stamped-label-accent">
            {active === "INR" ? "INDIA · DOMESTIC ACCESS" : "INTERNATIONAL ACCESS"}
          </span>
          <p className="font-mono text-5xl sm:text-6xl font-black text-[var(--text-primary)] mt-3">
            {price.display}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)] font-mono">{price.note}</p>
        </div>
      )}

      {/* Order Summary Module */}
      <div className="mt-8 industrial-recessed p-6 space-y-3 font-mono text-xs text-[var(--text-muted)]">
        <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
          <span>LIFETIME QUESTION ACCESS</span>
          <span className="text-[var(--text-primary)] font-bold">3,600+ Questions</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[rgba(186,190,204,0.4)]">
          <span>ALL CURRENT &amp; FUTURE CODICES</span>
          <span className="text-emerald-600 font-bold">Included Forever</span>
        </div>
        <div className="flex justify-between py-2">
          <span>AMOUNT DUE</span>
          <span className="text-[var(--accent)] font-bold text-sm">
            {price ? price.display : "…"}
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
        disabled={phase === "busy" || !price}
        onClick={completePurchase}
        className="btn-industrial btn-industrial-primary py-4 px-8 text-sm w-full mt-6 shadow-[var(--shadow-btn-primary)] flex items-center justify-center gap-2.5 disabled:opacity-60"
      >
        {phase === "busy" ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Connecting Gateway…</span>
          </>
        ) : (
          <span>Pay {price ? price.display : ""} · Unlock Lifetime Access</span>
        )}
      </button>

      <p className="mt-4 text-center text-xs font-mono text-[var(--text-muted)]">
        Processed securely through Razorpay · 256-bit encryption
      </p>
    </div>
  );
}
