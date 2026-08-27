import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByProviderId, grantAccess, markOrderPaid } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";

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

  const order = await getOrderByProviderId(orderId);
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "No matching order found." }, { status: 404 });
  }
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, alreadySealed: true });
  }

  if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
    return NextResponse.json(
      { ok: false, error: "Signature mismatch — the payment could not be trusted." },
      { status: 400 }
    );
  }

  await markOrderPaid(orderId, paymentId);
  await grantAccess(user.id, {
    provider: "razorpay",
    orderId,
    paymentId,
    amount: order.amount,
    currency: order.currency
  });

  return NextResponse.json({ ok: true });
}
