import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { recordOrder } from "@/lib/db";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";
import { PRICING, type CurrencyCode } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in before approaching the ledger." }, { status: 401 });
  }
  if (user.access.granted) {
    return NextResponse.json({ ok: false, error: "Your access is already sealed." }, { status: 409 });
  }
  if (!razorpayConfigured()) {
    return NextResponse.json(
      { ok: false, error: "The live ledger is not yet configured." },
      { status: 503 }
    );
  }

  let currency: string = "INR";
  try {
    const body = (await req.json()) as { currency?: string };
    if (body.currency && body.currency in PRICING) currency = body.currency;
  } catch {
    /* default currency stands */
  }

  const code = currency as CurrencyCode;
  const price = PRICING[code];

  try {
    const order = await createRazorpayOrder({
      amount: price.amount,
      currency: code,
      receipt: `devprep_${Date.now().toString(36)}`,
      notes: { platform: "DevPrep", userId: user.id, email: user.email }
    });

    await recordOrder({
      id: order.id!,
      userId: user.id,
      provider: "razorpay",
      amount: order.amount ?? price.amount,
      currency: order.currency ?? code,
      status: "created",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      display: price.display
    });
  } catch (error) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, error: err.message || "Gateway error." },
      { status: err.status ?? 502 }
    );
  }
}
