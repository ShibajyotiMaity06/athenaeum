/**
 * DevPrep Data Facade.
 *
 * Backends:
 *  • MongoDB   — enabled automatically when MONGODB_URI is set
 *  • JSON file — durable atomic fallback (data/db.json) for zero-config runs
 *
 * Both implement identical signatures; operations fall back gracefully if remote DB drops.
 */
import type { AccessGrant, OrderRecord, UserRecord } from "@/lib/store/types";
import * as jsonStore from "@/lib/store/json";
import * as mongoStore from "@/lib/store/mongo";

export type { AccessGrant, OrderRecord, UserRecord };

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  if (mongoStore.mongoEnabled()) {
    try {
      return await mongoStore.getUserByEmail(email);
    } catch (err) {
      console.warn("[db] MongoDB getUserByEmail failed, falling back to local store:", err);
    }
  }
  return jsonStore.getUserByEmail(email);
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  if (mongoStore.mongoEnabled()) {
    try {
      return await mongoStore.getUserById(id);
    } catch (err) {
      console.warn("[db] MongoDB getUserById failed, falling back to local store:", err);
    }
  }
  return jsonStore.getUserById(id);
}

export async function getOrdersByUser(userId: string): Promise<OrderRecord[]> {
  if (mongoStore.mongoEnabled()) {
    try {
      return await mongoStore.getOrdersByUser(userId);
    } catch (err) {
      console.warn("[db] MongoDB getOrdersByUser failed, falling back to local store:", err);
    }
  }
  return jsonStore.getOrdersByUser(userId);
}

export async function getOrderByProviderId(id: string): Promise<OrderRecord | null> {
  if (mongoStore.mongoEnabled()) {
    try {
      return await mongoStore.getOrderByProviderId(id);
    } catch (err) {
      console.warn("[db] MongoDB getOrderByProviderId failed, falling back to local store:", err);
    }
  }
  return jsonStore.getOrderByProviderId(id);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserRecord> {
  if (mongoStore.mongoEnabled()) {
    try {
      return await mongoStore.createUser(input);
    } catch (err) {
      if ((err as { status?: number }).status === 409) {
        throw err;
      }
      console.warn("[db] MongoDB createUser failed, falling back to local store:", err);
    }
  }
  return jsonStore.createUser(input);
}

export async function grantAccess(
  userId: string,
  grant: Omit<AccessGrant, "granted" | "grantedAt">
): Promise<UserRecord | null> {
  if (mongoStore.mongoEnabled()) {
    try {
      return await mongoStore.grantAccess(userId, grant);
    } catch (err) {
      console.warn("[db] MongoDB grantAccess failed, falling back to local store:", err);
    }
  }
  return jsonStore.grantAccess(userId, grant);
}

export async function recordOrder(order: OrderRecord): Promise<void> {
  if (mongoStore.mongoEnabled()) {
    try {
      await mongoStore.recordOrder(order);
      return;
    } catch (err) {
      console.warn("[db] MongoDB recordOrder failed, falling back to local store:", err);
    }
  }
  return jsonStore.recordOrder(order);
}

export async function markOrderPaid(
  orderId: string,
  paymentId: string
): Promise<OrderRecord | null> {
  if (mongoStore.mongoEnabled()) {
    try {
      return await mongoStore.markOrderPaid(orderId, paymentId);
    } catch (err) {
      console.warn("[db] MongoDB markOrderPaid failed, falling back to local store:", err);
    }
  }
  return jsonStore.markOrderPaid(orderId, paymentId);
}

/* Public shape — never leaks password hashes */
export function toPublicUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    hasAccess: user.access.granted,
    access: user.access
  };
}
