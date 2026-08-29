import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByProviderId, grantAccess, markOrderPaid, upsertOrder } from "@/lib/db";
import { fetchRazorpayOrder, verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Session expired." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ ok: false, error: "Incomplete payment proof." }, { status: 400 });
  }

  // 1. Verify cryptographic signature first
  if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
    return NextResponse.json(
      { ok: false, error: "Signature mismatch — the payment could not be trusted." },
      { status: 400 }
    );
  }

  // 2. Fetch existing order or reconstruct from Razorpay API
  let order = await getOrderByProviderId(orderId);
  let amount = order?.amount ?? 39900;
  let currency = order?.currency ?? "INR";

  if (!order) {
    const rzpOrder = await fetchRazorpayOrder(orderId);
    if (rzpOrder) {
      amount = rzpOrder.amount ?? amount;
      currency = rzpOrder.currency ?? currency;
    }

    await upsertOrder({
      id: orderId,
      userId: user.id,
      provider: "razorpay",
      amount,
      currency,
      status: "paid",
      paymentId,
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString()
    });
  } else {
    await markOrderPaid(orderId, paymentId);
  }

  // 3. Guarantee user gets lifetime access
  await grantAccess(user.id, {
    provider: "razorpay",
    orderId,
    paymentId,
    amount,
    currency
  });

  return NextResponse.json({ ok: true });
}
