import bcrypt from "bcryptjs";
import { MongoClient, type Db } from "mongodb";
import { newId, type AccessGrant, type OrderRecord, type UserRecord } from "./types";

/**
 * Primary data layer — MongoDB via the official driver.
 * Enabled automatically when MONGODB_URI is present in the environment.
 */

function uri(): string {
  return process.env.MONGODB_URI?.trim() || "";
}

export function mongoEnabled(): boolean {
  return Boolean(uri());
}

let clientPromise: Promise<Db> | null = null;

async function getDb(): Promise<Db> {
  if (!clientPromise) {
    const client = new MongoClient(uri(), {
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10
    });
    clientPromise = client.connect().then(async (connected) => {
      const db = connected.db(process.env.MONGODB_DB || "athenaeum");
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
      await db.collection("orders").createIndex({ id: 1 }, { unique: true });
      await seedAdmin(db);
      console.log("[athenaeum] Data layer: MongoDB connected");
      return db;
    });
    clientPromise.catch(() => {
      clientPromise = null;
    });
  }
  return clientPromise;
}

async function seedAdmin(db: Db): Promise<void> {
  const users = db.collection<UserRecord>("users");
  if (await users.findOne({ role: "admin" })) return;
  const email = (process.env.ADMIN_EMAIL || "admin@devprep.online").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "DevPrep#2026";
  await users.insertOne({
    id: newId(),
    name: "DevPrep Admin",
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "admin",
    createdAt: new Date().toISOString(),
    access: { granted: true, provider: "admin", grantedAt: new Date().toISOString() }
  });
  console.log(`[devprep] Administrator seeded → ${email}`);
}

const usersCol = async () => (await getDb()).collection<UserRecord>("users");
const ordersCol = async () => (await getDb()).collection<OrderRecord>("orders");

/* ── Queries ── */

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const col = await usersCol();
  return col.findOne({ email: email.trim().toLowerCase() }, { projection: { _id: 0 } });
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const col = await usersCol();
  return col.findOne({ id }, { projection: { _id: 0 } });
}

export async function getOrdersByUser(userId: string): Promise<OrderRecord[]> {
  const col = await ordersCol();
  return col.find({ userId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getOrderByProviderId(providerOrderId: string): Promise<OrderRecord | null> {
  const col = await ordersCol();
  return col.findOne({ id: providerOrderId }, { projection: { _id: 0 } });
}

/* ── Mutations ── */

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserRecord> {
  const col = await usersCol();
  const user: UserRecord = {
    id: newId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(input.password, 10),
    role: "scholar",
    createdAt: new Date().toISOString(),
    access: { granted: false, provider: null }
  };
  try {
    await col.insertOne({ ...user });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw Object.assign(new Error("An account with this email already exists."), { status: 409 });
    }
    throw error;
  }
  return user;
}

export async function grantAccess(
  userId: string,
  grant: Omit<AccessGrant, "granted" | "grantedAt">
): Promise<UserRecord | null> {
  const col = await usersCol();
  const result = await col.findOneAndUpdate(
    { id: userId },
    { $set: { access: { ...grant, granted: true, grantedAt: new Date().toISOString() } } },
    { returnDocument: "after", projection: { _id: 0 } }
  );
  return result ?? null;
}

export async function recordOrder(order: OrderRecord): Promise<void> {
  const col = await ordersCol();
  await col.insertOne({ ...order });
}

export async function markOrderPaid(
  providerOrderId: string,
  paymentId: string
): Promise<OrderRecord | null> {
  const col = await ordersCol();
  const result = await col.findOneAndUpdate(
    { id: providerOrderId },
    { $set: { status: "paid", paymentId, paidAt: new Date().toISOString() } },
    { returnDocument: "after", projection: { _id: 0 } }
  );
  return result ?? null;
}
