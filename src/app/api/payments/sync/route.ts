import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { grantAccess, upsertOrder } from "@/lib/db";
import { fetchRazorpayOrder, fetchRazorpayPayment, razorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  }

  if (user.access.granted) {
    return NextResponse.json({ ok: true, message: "Lifetime access is already active." });
  }

  if (!razorpayConfigured()) {
    return NextResponse.json({ ok: false, error: "Payment gateway is not configured." }, { status: 503 });
  }

  let body: { paymentId?: string; orderId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* optional body */
  }

  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  // 1. If explicit paymentId provided
  if (body.paymentId) {
    const payment = await fetchRazorpayPayment(body.paymentId.trim());
    if (
      payment &&
      (payment.status === "captured" || payment.status === "authorized") &&
      (String(payment.email || "").toLowerCase() === user.email.toLowerCase() ||
        (payment.notes as Record<string, string>)?.email?.toLowerCase() === user.email.toLowerCase() ||
        (payment.notes as Record<string, string>)?.userId === user.id)
    ) {
      const orderId = String(payment.order_id || "");
      const amount = Number(payment.amount || 39900);
      const currency = String(payment.currency || "INR");
      const planNote = (payment.notes as Record<string, string>)?.plan;
      const tier = planNote === "interview" ? "interview" : "full";

      await upsertOrder({
        id: orderId || `pay_order_${payment.id}`,
        userId: user.id,
        provider: "razorpay",
        amount,
        currency,
        tier,
        status: "paid",
        paymentId: String(payment.id),
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString()
      });

      await grantAccess(user.id, {
        provider: "razorpay",
        orderId,
        paymentId: String(payment.id),
        amount,
        currency,
        tier
      });

      return NextResponse.json({ ok: true, message: "Access successfully restored." });
    }
  }

  // 2. Scan recent Razorpay payments for this user's email
  try {
    const res = await fetch("https://api.razorpay.com/v1/payments?count=50", {
      headers: { Authorization: authHeader }
    });

    if (res.ok) {
      const data = (await res.json()) as { items?: Array<Record<string, unknown>> };
      const matched = (data.items || []).find((p) => {
        const emailMatch = String(p.email || "").toLowerCase() === user.email.toLowerCase();
        const noteMatch = (p.notes as Record<string, string>)?.email?.toLowerCase() === user.email.toLowerCase();
        const userIdMatch = (p.notes as Record<string, string>)?.userId === user.id;
        const isPaid = p.status === "captured" || p.status === "authorized";
        return isPaid && (emailMatch || noteMatch || userIdMatch);
      });

      if (matched) {
        const orderId = String(matched.order_id || "");
        const paymentId = String(matched.id || "");
        const amount = Number(matched.amount || 39900);
        const currency = String(matched.currency || "INR");
        const planNote = (matched.notes as Record<string, string>)?.plan;
        const tier = planNote === "interview" ? "interview" : "full";

        await upsertOrder({
          id: orderId || `pay_order_${paymentId}`,
          userId: user.id,
          provider: "razorpay",
          amount,
          currency,
          tier,
          status: "paid",
          paymentId,
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString()
        });

        await grantAccess(user.id, {
          provider: "razorpay",
          orderId,
          paymentId,
          amount,
          currency,
          tier
        });

        return NextResponse.json({ ok: true, message: "Access successfully restored." });
      }
    }
  } catch (err) {
    console.error("[devprep] Payment sync check error:", err);
  }

  return NextResponse.json({
    ok: false,
    error: "No captured payment found for this account. If you were debited, please contact support with your Payment ID."
  });
}
