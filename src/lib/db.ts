/**
 * Athenaeum data facade.
 *
 * Backends:
 *  • MongoDB   — enabled automatically when MONGODB_URI is set
 *  • JSON file — durable atomic fallback (data/db.json) for zero-config runs
 *
 * Both implement identical signatures; every operation is async.
 */
import type { AccessGrant, OrderRecord, UserRecord } from "@/lib/store/types";
import * as jsonStore from "@/lib/store/json";
import * as mongoStore from "@/lib/store/mongo";

export type { AccessGrant, OrderRecord, UserRecord };

const backend = mongoStore.mongoEnabled() ? mongoStore : jsonStore;

if (!globalThis.__athenaeumBackendLogged) {
  globalThis.__athenaeumBackendLogged = true;
  console.log(
    `[athenaeum] Data layer: ${mongoStore.mongoEnabled() ? "MongoDB" : "local JSON fallback"}`
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __athenaeumBackendLogged: boolean | undefined;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  return backend.getUserByEmail(email);
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  return backend.getUserById(id);
}

export async function getOrdersByUser(userId: string): Promise<OrderRecord[]> {
  return backend.getOrdersByUser(userId);
}

export async function getOrderByProviderId(id: string): Promise<OrderRecord | null> {
  return backend.getOrderByProviderId(id);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserRecord> {
  return backend.createUser(input);
}

export async function grantAccess(
  userId: string,
  grant: Omit<AccessGrant, "granted" | "grantedAt">
): Promise<UserRecord | null> {
  return backend.grantAccess(userId, grant);
}

export async function recordOrder(order: OrderRecord): Promise<void> {
  return backend.recordOrder(order);
}

export async function markOrderPaid(
  orderId: string,
  paymentId: string
): Promise<OrderRecord | null> {
  return backend.markOrderPaid(orderId, paymentId);
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
