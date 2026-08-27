import crypto from "node:crypto";

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/**
 * Sandbox mode lets the entire purchase flow be exercised without live keys.
 * It is ONLY active when explicitly enabled AND no real keys are configured,
 * so it can never silently bypass a production gateway.
 */
export function sandboxAllowed(): boolean {
  return process.env.PAYMENT_MODE === "allow-sandbox" && !razorpayConfigured();
}

interface RazorpayOrderResponse {
  id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  error?: { description?: string };
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResponse> {
  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes ?? {}
    })
  });

  const data = (await response.json().catch(() => ({}))) as RazorpayOrderResponse;
  if (!response.ok || !data.id) {
    throw Object.assign(
      new Error(data.error?.description || "Payment gateway rejected the order."),
      { status: 502 }
    );
  }
  return data;
}

export function verifyRazorpaySignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected, "utf-8");
  const b = Buffer.from(input.signature || "", "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
