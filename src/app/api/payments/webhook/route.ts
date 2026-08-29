import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getUserById, grantAccess, grantAccessByEmail, upsertOrder } from "@/lib/db";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing signature header." }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: "Cannot read payload." }, { status: 400 });
  }

  const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const eventType = String(event.event ?? "");

  // Handle payment.captured or order.paid
  if (eventType === "payment.captured" || eventType === "order.paid") {
    const payload = event.payload as {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
          currency?: string;
          email?: string;
          notes?: Record<string, string>;
          status?: string;
        };
      };
      order?: {
        entity?: {
          id?: string;
          amount?: number;
          currency?: string;
          notes?: Record<string, string>;
          status?: string;
        };
      };
    };

    const paymentEntity = payload?.payment?.entity;
    const orderEntity = payload?.order?.entity;

    const paymentId = paymentEntity?.id ?? "";
    const orderId = paymentEntity?.order_id || orderEntity?.id || "";
    const amount = paymentEntity?.amount ?? orderEntity?.amount ?? 39900;
    const currency = paymentEntity?.currency ?? orderEntity?.currency ?? "INR";
    const notes = paymentEntity?.notes ?? orderEntity?.notes ?? {};
    const email = (paymentEntity?.email || notes.email || "").toLowerCase().trim();
    const userId = notes.userId;

    let targetUserId = userId;
    if (!targetUserId && email) {
      const user = await getUserByEmail(email);
      if (user) targetUserId = user.id;
    }

    if (orderId) {
      await upsertOrder({
        id: orderId,
        userId: targetUserId || "unassigned",
        provider: "razorpay",
        amount,
        currency,
        status: "paid",
        paymentId: paymentId || undefined,
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString()
      });
    }

    if (targetUserId) {
      await grantAccess(targetUserId, {
        provider: "razorpay",
        orderId,
        paymentId,
        amount,
        currency
      });
    } else if (email) {
      await grantAccessByEmail(email, {
        provider: "razorpay",
        orderId,
        paymentId,
        amount,
        currency
      });
    }
  }

  return NextResponse.json({ status: "ok" });
}
