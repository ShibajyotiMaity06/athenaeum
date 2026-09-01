import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasDsaAccess, hasFullAccess, hasInterviewAccess } from "@/lib/auth";
import { grantAccess, recordOrder } from "@/lib/db";
import { sandboxAllowed } from "@/lib/razorpay";
import { calculatePromoPrice, PLANS, type CurrencyCode, type PricingPlan } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Sandbox settlement — records a simulated paid order so the complete
 * purchase journey can be demonstrated without live Razorpay keys.
 * Refuses to run the moment real keys exist or PAYMENT_MODE changes.
 */
export async function POST(req: NextRequest) {
  if (!sandboxAllowed()) {
    return NextResponse.json(
      { ok: false, error: "The sandbox ledger is sealed." },
      { status: 403 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  let currency: CurrencyCode = "INR";
  let plan: PricingPlan = "full";
  let promoCode: string | undefined;

  try {
    const body = (await req.json()) as { currency?: CurrencyCode; plan?: PricingPlan; promoCode?: string };
    if (body.currency === "INR" || body.currency === "USD") currency = body.currency;
    if (body.plan === "dsa" || body.plan === "interview" || body.plan === "full") plan = body.plan;
    if (body.promoCode) promoCode = body.promoCode;
  } catch {
    /* defaults stand */
  }

  if (plan === "dsa" && hasDsaAccess(user)) {
    return NextResponse.json({ ok: false, error: "Your DSA Problem Codex access is already active." }, { status: 409 });
  }

  if (plan === "full" && hasFullAccess(user)) {
    return NextResponse.json({ ok: false, error: "Your full scholar access is already active." }, { status: 409 });
  }

  if (plan === "interview" && hasInterviewAccess(user)) {
    return NextResponse.json({ ok: false, error: "Your Interview Prep key is already active." }, { status: 409 });
  }

  const calculation = calculatePromoPrice(plan, currency, promoCode);
  const simulatedId = `sbx_${plan}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  await recordOrder({
    id: simulatedId,
    userId: user.id,
    provider: "sandbox",
    amount: calculation.finalAmount,
    currency,
    status: "paid",
    tier: plan,
    paymentId: `pay_simulated_${simulatedId.slice(4)}`,
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString()
  });

  await grantAccess(user.id, {
    provider: "sandbox",
    orderId: simulatedId,
    paymentId: `pay_simulated_${simulatedId.slice(4)}`,
    amount: calculation.finalAmount,
    currency,
    tier: plan
  });

  return NextResponse.json({ ok: true });
}
