import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { grantAccess, recordOrder } from "@/lib/db";
import { sandboxAllowed } from "@/lib/razorpay";
import { PRICING, type CurrencyCode } from "@/lib/site";

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
  if (user.access.granted) {
    return NextResponse.json({ ok: false, error: "Your access is already sealed." }, { status: 409 });
  }

  let currency: CurrencyCode = "INR";
  try {
    const body = (await req.json()) as { currency?: CurrencyCode };
    if (body.currency && body.currency in PRICING) currency = body.currency;
  } catch {
    /* default stands */
  }

  const price = PRICING[currency];
  const simulatedId = `sbx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  await recordOrder({
    id: simulatedId,
    userId: user.id,
    provider: "sandbox",
    amount: price.amount,
    currency,
    status: "paid",
    paymentId: `pay_simulated_${simulatedId.slice(4)}`,
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString()
  });

  await grantAccess(user.id, {
    provider: "sandbox",
    orderId: simulatedId,
    paymentId: `pay_simulated_${simulatedId.slice(4)}`,
    amount: price.amount,
    currency
  });

  return NextResponse.json({ ok: true });
}
