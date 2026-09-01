import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasDsaAccess, hasFullAccess, hasInterviewAccess } from "@/lib/auth";
import { recordOrder } from "@/lib/db";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";
import { calculatePromoPrice, PLANS, type CurrencyCode, type PricingPlan } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in before approaching the ledger." }, { status: 401 });
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

  // Check if user already owns the specific requested plan
  if (plan === "dsa" && hasDsaAccess(user)) {
    return NextResponse.json({ ok: false, error: "Your DSA Problem Codex access is already active." }, { status: 409 });
  }

  if (plan === "full" && hasFullAccess(user)) {
    return NextResponse.json({ ok: false, error: "Your full scholar access is already active." }, { status: 409 });
  }

  if (plan === "interview" && hasInterviewAccess(user)) {
    return NextResponse.json({ ok: false, error: "Your Interview Prep key is already active." }, { status: 409 });
  }

  if (!razorpayConfigured()) {
    return NextResponse.json(
      { ok: false, error: "The live ledger is not yet configured." },
      { status: 503 }
    );
  }

  const promoInfo = calculatePromoPrice(plan, currency, promoCode);

  try {
    const order = await createRazorpayOrder({
      amount: promoInfo.finalAmount,
      currency,
      receipt: `devprep_${plan}_${Date.now().toString(36)}`,
      notes: {
        platform: "DevPrep",
        userId: user.id,
        email: user.email,
        plan,
        promoCode: promoInfo.valid ? (promoInfo.code ?? "") : ""
      }
    });

    await recordOrder({
      id: order.id!,
      userId: user.id,
      provider: "razorpay",
      amount: order.amount ?? promoInfo.finalAmount,
      currency: order.currency ?? currency,
      status: "created",
      tier: plan,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      tier: plan,
      keyId: process.env.RAZORPAY_KEY_ID,
      display: promoInfo.display,
      promoApplied: promoInfo.valid,
      discountPercent: promoInfo.discountPercent,
      originalDisplay: promoInfo.originalDisplay,
      savingsDisplay: promoInfo.savingsDisplay
    });
  } catch (error) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, error: err.message || "Gateway error." },
      { status: err.status ?? 502 }
    );
  }
}
