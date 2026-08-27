"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import { PRICING, type CurrencyCode } from "@/lib/site";
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
      /* â”€â”€ Sandbox path: no keys configured — simulate a settled payment â”€â”€ */
      if (sandbox) {
        await new Promise((r) => setTimeout(r, 900));
        const res = await fetch("/api/payments/sandbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currency: active })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.error || "The simulated ledger refused the entry.");
        setPhase("done");
        router.refresh();
        return;
      }

      /* â”€â”€ Live Razorpay path â”€â”€ */
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("The payment script could not be summoned. Check your connection.");
      }

      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency })
      });
      const orderData = await orderRes.json().catch(() => null);
      if (!orderRes.ok || !orderData?.ok) {
        throw new Error(orderData?.error || "Could not prepare your order.");
      }

      const rzp = new window.Razorpay({
        key: keyId ?? orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Athenaeum",
        description: "Scholar Access — The Developer's Codex",
        prefill: { name: userName, email: userEmail },
        theme: { color: "#C9A962" },
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
            setError(verifyData?.error || "Payment could not be verified. Contact the warden.");
            setPhase("idle");
            return;
          }
          setPhase("done");
          router.refresh();
        },
        modal: {
          ondismiss: () => {
            setError("The ledger was closed before payment concluded.");
            setPhase("idle");
          }
        }
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected difficulty arose.");
      setPhase("idle");
    }
  }

  if (hasAccess) {
    return (
      <div className="ornate-frame mx-auto max-w-xl rounded border border-brass/60 bg-oak p-10 text-center">
        <BadgeCheck className="mx-auto h-10 w-10 text-brass" strokeWidth={1.25} />
        <h2 className="font-heading mt-6 text-3xl">Your key already turns the lock.</h2>
        <p className="mt-4 text-faded">
          Scholar access is active on this account — every volume stands open to you.
        </p>
        <Link href="/library" className="btn btn-primary mt-8 h-12 px-8">
          Enter the Reading Room
        </Link>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="ornate-frame mx-auto max-w-xl rounded border border-grain bg-oak p-12 text-center">
        <span className="wax-seal mx-auto flex h-20 w-20 items-center justify-center rounded-full">
          <ShieldCheck className="h-8 w-8 text-parchment" strokeWidth={1.25} />
        </span>
        <h2 className="font-heading mt-8 text-4xl">Sealed &amp; Recorded</h2>
        <p className="mt-4 leading-relaxed text-faded">
          Your contribution is entered into the ledger. Scholar access is now bound
          to <strong className="text-parchment">{userEmail}</strong>.
        </p>
        <Link href="/library" className="btn btn-primary mt-10 h-13 px-10 py-4">
          Open the Reading Room
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Localized Price Card */}
      {price && active && (
        <div className="corner-flourish relative rounded border border-brass bg-oak p-8 text-center shadow-[0_0_0_1px_rgba(201,169,98,0.4),0_10px_30px_rgba(0,0,0,0.35)]">
          <p className="kicker">{active === "INR" ? "Bharat · Domestic Region" : "International Region"}</p>
          <p className="font-heading mt-3 text-5xl text-brass-light sm:text-6xl">
            {price.display}
          </p>
          <p className="mt-3 text-sm italic text-faded">{price.note}</p>
          
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                const nextCode = active === "INR" ? "USD" : "INR";
                setCurrency(nextCode);
                setManualChoice(true);
              }}
              className="text-xs text-brass/70 underline underline-offset-4 transition-colors hover:text-brass"
            >
              Switch to {active === "INR" ? "USD ($9)" : "INR (₹399)"}
            </button>
          </div>
        </div>
      )}

      {/* Ledger summary */}
      <div className="mt-8 rounded border border-grain bg-oak/50 p-7">
        <dl className="grid gap-3 font-body text-[15px]">
          <div className="flex justify-between border-b border-grain pb-3">
            <dt className="text-faded">Lifetime reading rights</dt>
            <dd>All 27 volumes · all future additions</dd>
          </div>
          <div className="flex justify-between border-b border-grain pb-3">
            <dt className="text-faded">Due at this desk</dt>
            <dd className="font-display tracking-[0.15em] text-brass">
              {price ? price.display : "…"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-faded">Renewals</dt>
            <dd>None — one payment, one time</dd>
          </div>
        </dl>

        {sandbox && (
          <p className="mt-6 flex items-start gap-2 rounded border border-brass/40 bg-background px-4 py-3 text-sm italic leading-relaxed text-faded">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
            Sandbox ledger active — Razorpay keys are not yet inscribed, so this desk
            records a simulated settlement. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
            in .env.local to charge real rupees.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded border border-crimson/60 bg-crimson/15 px-4 py-3 text-[15px]">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={phase === "busy" || !price}
          onClick={completePurchase}
          className="btn btn-primary mt-8 h-14 w-full px-10"
        >
        {phase === "busy"
            ? "Consulting the ledger…"
            : price
              ? `Pay ${price.display} · Seal my access`
              : "Detecting your region…"}
        </button>

        <p className="mt-4 text-center text-sm italic text-faded">
          Settled through Razorpay · keys stay hashed in our vaults
        </p>
      </div>
    </div>
  );
}
