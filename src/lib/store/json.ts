import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { newId, type OrderRecord, type UserRecord } from "./types";

/**
 * Fallback data layer — a durable atomic JSON document store.
 * Used automatically when MONGODB_URI is not configured.
 */

interface Database {
  users: UserRecord[];
  orders: OrderRecord[];
}

const DATA_DIR = join(process.cwd(), "data");
const DB_FILE = join(DATA_DIR, "db.json");

let cache: Database | null = null;
let queue: Promise<unknown> = Promise.resolve();

function freshDb(): Database {
  return { users: [], orders: [] };
}

function seedAdmin(db: Database): void {
  if (db.users.some((u) => u.role === "admin")) return;
  const email = (process.env.ADMIN_EMAIL || "admin@athenaeum.dev").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Athenaeum#1876";
  db.users.push({
    id: newId(),
    name: "The Warden",
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "admin",
    createdAt: new Date().toISOString(),
    access: { granted: true, provider: "admin", grantedAt: new Date().toISOString() }
  });
  persist();
  console.log(`[athenaeum] Administrator seeded → ${email}`);
}

function load(): Database {
  if (cache) return cache;
  mkdirSync(DATA_DIR, { recursive: true });
  if (existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(readFileSync(DB_FILE, "utf-8")) as Partial<Database>;
      cache = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : []
      };
      seedAdmin(cache);
      return cache;
    } catch {
      try { renameSync(DB_FILE, `${DB_FILE}.corrupt-${Date.now()}`); } catch { /* noop */ }
    }
  }
  cache = freshDb();
  seedAdmin(cache);
  persist();
  return cache;
}

function persist(): void {
  if (!cache) return;
  const tmp = `${DB_FILE}.tmp-${process.pid}-${Date.now()}`;
  writeFileSync(tmp, JSON.stringify(cache, null, 2), "utf-8");
  renameSync(tmp, DB_FILE);
}

async function transact<T>(fn: (db: Database) => T): Promise<T> {
  const run = queue.then(() => {
    const db = load();
    const result = fn(db);
    persist();
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/* ── Queries ── */

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const db = load();
  return db.users.find((u) => u.email === email.trim().toLowerCase()) ?? null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const db = load();
  return db.users.find((u) => u.id === id) ?? null;
}

export async function getOrdersByUser(userId: string): Promise<OrderRecord[]> {
  return load()
    .orders.filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderByProviderId(providerOrderId: string): Promise<OrderRecord | null> {
  return load().orders.find((o) => o.id === providerOrderId) ?? null;
}

/* ── Mutations ── */

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserRecord> {
  return transact((db) => {
    const email = input.email.trim().toLowerCase();
    if (db.users.some((u) => u.email === email)) {
      throw Object.assign(new Error("An account with this email already exists."), { status: 409 });
    }
    const user: UserRecord = {
      id: newId(),
      name: input.name.trim(),
      email,
      passwordHash: bcrypt.hashSync(input.password, 10),
      role: "scholar",
      createdAt: new Date().toISOString(),
      access: { granted: false, provider: null }
    };
    db.users.push(user);
    return user;
  });
}

export async function grantAccess(
  userId: string,
  grant: Omit<import("./types").AccessGrant, "granted" | "grantedAt">
): Promise<UserRecord | null> {
  return transact((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return null;
    user.access = { ...grant, granted: true, grantedAt: new Date().toISOString() };
    return user;
  });
}

export async function recordOrder(order: OrderRecord): Promise<void> {
  await transact((db) => {
    db.orders.push(order);
  });
}

export async function markOrderPaid(
  providerOrderId: string,
  paymentId: string
): Promise<OrderRecord | null> {
  return transact((db) => {
    const order = db.orders.find((o) => o.id === providerOrderId);
    if (!order) return null;
    order.status = "paid";
    order.paymentId = paymentId;
    order.paidAt = new Date().toISOString();
    return order;
  });
}
