export type AccessTier = "full" | "interview";

export interface AccessGrant {
  granted: boolean;
  tier?: AccessTier;
  provider: "admin" | "razorpay" | "sandbox" | null;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  grantedAt?: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "scholar";
  createdAt: string;
  access: AccessGrant;
}

export interface OrderRecord {
  id: string;
  userId: string;
  provider: "razorpay" | "sandbox";
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  tier?: AccessTier;
  paymentId?: string;
  createdAt: string;
  paidAt?: string;
}

export function newId(prefix = "usr"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

