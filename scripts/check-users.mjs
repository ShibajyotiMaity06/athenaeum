import { MongoClient } from "mongodb";
import { readFileSync, existsSync } from "fs";

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log("MONGODB_URI configured:", Boolean(uri));
  if (!uri) {
    console.log("No Mongo URI, checking data/db.json");
    if (existsSync("data/db.json")) {
      const data = JSON.parse(readFileSync("data/db.json", "utf8"));
      console.log("data/db.json users:", data.users);
      console.log("data/db.json orders:", data.orders);
    }
    return;
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "devprep");
  
  console.log("\n--- USERS ---");
  const users = await db.collection("users").find({}).toArray();
  console.log(`Total users in DB: ${users.length}`);
  for (const u of users) {
    console.log(`- ${u.email} | id: ${u.id} | role: ${u.role} | access: ${JSON.stringify(u.access)}`);
  }

  console.log("\n--- ORDERS ---");
  const orders = await db.collection("orders").find({}).toArray();
  console.log(`Total orders in DB: ${orders.length}`);
  for (const o of orders) {
    console.log(`- orderId: ${o.id} | userId: ${o.userId} | status: ${o.status} | paymentId: ${o.paymentId} | amount: ${o.amount}`);
  }

  await client.close();
}

main().catch(console.error);
