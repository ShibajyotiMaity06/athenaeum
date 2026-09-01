import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { newId, type AccessGrant, type OrderRecord, type UserRecord } from "./types";

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

function seedAccounts(db: Database): void {
  // 1. Seed Admin
  if (!db.users.some((u) => u.role === "admin")) {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@devprep.online").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "DevPrep#2026Admin";
    db.users.push({
      id: newId(),
      name: "DevPrep Admin",
      email: adminEmail,
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      role: "admin",
      createdAt: new Date().toISOString(),
      access: { granted: true, provider: "admin", grantedAt: new Date().toISOString() }
    });
    console.log(`[devprep] Administrator seeded → ${adminEmail}`);
  }

  // 2. Seed Razorpay Reviewer / Tester Account
  const testEmail = "reviewer@devprep.online";
  if (!db.users.some((u) => u.email.toLowerCase() === testEmail)) {
    db.users.push({
      id: newId(),
      name: "Razorpay Reviewer",
      email: testEmail,
      passwordHash: bcrypt.hashSync("DevPrep#Tester2026", 10),
      role: "scholar",
      createdAt: new Date().toISOString(),
      access: { granted: false, provider: null }
    });
    console.log(`[devprep] Razorpay Reviewer test account seeded → ${testEmail}`);
  }

  // 3. Grant Full Access to VIP emails
  const vipEmails = [
    "dipakmaity903@gmail.com",
    "shibajyoti.maity06@gmail.com",
    "debajyoti.maity29@gmail.com"
  ];

  for (const vip of vipEmails) {
    const existing = db.users.find((u) => u.email.toLowerCase() === vip);
    if (existing) {
      existing.access = {
        granted: true,
        tier: "full",
        tiers: ["full", "interview", "dsa"],
        hasDsa: true,
        provider: "admin",
        grantedAt: new Date().toISOString()
      };
    } else {
      db.users.push({
        id: newId(),
        name: vip.split("@")[0],
        email: vip,
        passwordHash: bcrypt.hashSync("DevPrep#Scholar2026", 10),
        role: "scholar",
        createdAt: new Date().toISOString(),
        access: {
          granted: true,
          tier: "full",
          tiers: ["full", "interview", "dsa"],
          hasDsa: true,
          provider: "admin",
          grantedAt: new Date().toISOString()
        }
      });
    }
  }

  persist();
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
      seedAccounts(cache);
      return cache;
    } catch {
      try { renameSync(DB_FILE, `${DB_FILE}.corrupt-${Date.now()}`); } catch { /* noop */ }
    }
  }
  cache = freshDb();
  seedAccounts(cache);
  return cache;
}

function persist(): void {
  if (!cache) return;
  const snapshot = JSON.stringify(cache, null, 2);
  queue = queue
    .then(() => {
      const tmp = `${DB_FILE}.tmp-${Date.now()}`;
      writeFileSync(tmp, snapshot, "utf-8");
      renameSync(tmp, DB_FILE);
    })
    .catch((err) => {
      console.error("[devprep] Failed to write db.json:", err);
    });
}

/* ── Queries ── */

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const db = load();
  const normalized = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const db = load();
  return db.users.find((u) => u.id === id) ?? null;
}

export async function getOrdersByUser(userId: string): Promise<OrderRecord[]> {
  const db = load();
  return db.orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export async function getUserCount(): Promise<number> {
  const db = load();
  return db.users.length;
}

export async function getOrderByProviderId(providerOrderId: string): Promise<OrderRecord | null> {
  const db = load();
  return db.orders.find((o) => o.id === providerOrderId) ?? null;
}

/* ── Mutations ── */

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserRecord> {
  const db = load();
  const normalized = input.email.trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
    throw Object.assign(new Error("An account with this email already exists."), { status: 409 });
  }
  const user: UserRecord = {
    id: newId(),
    name: input.name.trim(),
    email: normalized,
    passwordHash: bcrypt.hashSync(input.password, 10),
    role: "scholar",
    createdAt: new Date().toISOString(),
    access: { granted: false, provider: null }
  };
  db.users.push(user);
  persist();
  return user;
}

export async function grantAccess(
  userId: string,
  grant: Omit<AccessGrant, "granted" | "grantedAt">
): Promise<UserRecord | null> {
  const db = load();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  const existingTiers = user.access?.tiers || (user.access?.tier ? [user.access.tier] : []);
  const newTiers = Array.from(new Set([...existingTiers, ...(grant.tier ? [grant.tier] : [])]));
  const hasDsa = grant.tier === "dsa" || user.access?.hasDsa === true || user.access?.tier === "dsa";

  user.access = {
    ...grant,
    granted: true,
    tier: grant.tier || user.access?.tier || "full",
    tiers: newTiers,
    hasDsa,
    grantedAt: user.access?.grantedAt || new Date().toISOString()
  };
  persist();
  return user;
}

export async function grantAccessByEmail(
  email: string,
  grant: Omit<AccessGrant, "granted" | "grantedAt">
): Promise<UserRecord | null> {
  const db = load();
  const normalized = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email === normalized);
  if (!user) return null;

  const existingTiers = user.access?.tiers || (user.access?.tier ? [user.access.tier] : []);
  const newTiers = Array.from(new Set([...existingTiers, ...(grant.tier ? [grant.tier] : [])]));
  const hasDsa = grant.tier === "dsa" || user.access?.hasDsa === true || user.access?.tier === "dsa";

  user.access = {
    ...grant,
    granted: true,
    tier: grant.tier || user.access?.tier || "full",
    tiers: newTiers,
    hasDsa,
    grantedAt: user.access?.grantedAt || new Date().toISOString()
  };
  persist();
  return user;
}

export async function recordOrder(order: OrderRecord): Promise<void> {
  const db = load();
  const existing = db.orders.findIndex((o) => o.id === order.id);
  if (existing >= 0) db.orders[existing] = order;
  else db.orders.push(order);
  persist();
}

export async function upsertOrder(order: OrderRecord): Promise<void> {
  const db = load();
  const existing = db.orders.findIndex((o) => o.id === order.id);
  if (existing >= 0) db.orders[existing] = order;
  else db.orders.push(order);
  persist();
}

export async function markOrderPaid(
  providerOrderId: string,
  paymentId: string
): Promise<OrderRecord | null> {
  const db = load();
  const order = db.orders.find((o) => o.id === providerOrderId);
  if (!order) return null;
  order.status = "paid";
  order.paymentId = paymentId;
  order.paidAt = new Date().toISOString();
  persist();
  return order;
}
