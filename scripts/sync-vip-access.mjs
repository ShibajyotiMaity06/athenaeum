import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Simple env parser
function loadEnv() {
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const VIP_EMAILS = [
  "dipakmaity903@gmail.com",
  "shibajyoti.maity06@gmail.com",
  "debajyoti.maity29@gmail.com"
];

async function syncMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("MongoDB URI not found in environment, skipping mongo sync.");
    return;
  }

  const client = new MongoClient(uri, { tls: true });
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db(process.env.MONGODB_DB || "devprep");
    const users = db.collection("users");

    for (const email of VIP_EMAILS) {
      const user = await users.findOne({ email: email.toLowerCase() });
      if (user) {
        await users.updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              "access.granted": true,
              "access.tier": "full",
              "access.tiers": ["full", "interview", "dsa"],
              "access.hasDsa": true,
              "access.provider": "admin",
              "access.grantedAt": new Date().toISOString()
            }
          }
        );
        console.log(`[Mongo] Granted full 399 access to existing user: ${email}`);
      } else {
        await users.insertOne({
          id: "vip_" + Math.random().toString(36).substring(2, 10),
          name: email.split("@")[0],
          email: email.toLowerCase(),
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
        console.log(`[Mongo] Seeded and granted full 399 access to: ${email}`);
      }
    }
  } catch (err) {
    console.error("[Mongo] Error during VIP sync:", err.message);
  } finally {
    await client.close();
  }
}

function syncJsonDb() {
  const dbPath = join(process.cwd(), "data", "db.json");
  if (!existsSync(dbPath)) return;

  try {
    const data = JSON.parse(readFileSync(dbPath, "utf-8"));
    if (!Array.isArray(data.users)) data.users = [];

    for (const email of VIP_EMAILS) {
      const existing = data.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        existing.access = {
          granted: true,
          tier: "full",
          tiers: ["full", "interview", "dsa"],
          hasDsa: true,
          provider: "admin",
          grantedAt: new Date().toISOString()
        };
        console.log(`[JSON DB] Updated ${email} with full access.`);
      } else {
        data.users.push({
          id: "vip_" + Math.random().toString(36).substring(2, 10),
          name: email.split("@")[0],
          email: email.toLowerCase(),
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
        console.log(`[JSON DB] Seeded ${email} with full access.`);
      }
    }

    writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    console.log("[JSON DB] db.json synced successfully!");
  } catch (err) {
    console.error("[JSON DB] Error syncing db.json:", err.message);
  }
}

async function run() {
  await syncMongo();
  syncJsonDb();
  console.log("All VIP accounts synced with Free Full 399 Scholar Access!");
}

run();
