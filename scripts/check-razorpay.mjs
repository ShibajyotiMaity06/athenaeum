import { MongoClient } from "mongodb";

async function checkRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  console.log("Razorpay keyId present:", Boolean(keyId));
  console.log("Razorpay keySecret present:", Boolean(keySecret));

  if (!keyId || !keySecret) {
    console.log("Missing Razorpay keys.");
    return;
  }

  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  
  // Fetch recent payments from Razorpay API
  const res = await fetch("https://api.razorpay.com/v1/payments?count=10", {
    headers: { Authorization: authHeader }
  });
  
  if (!res.ok) {
    console.error("Failed to fetch Razorpay payments:", res.status, await res.text());
    return;
  }

  const data = await res.json();
  console.log(`\nFound ${data.items?.length || 0} recent payments in Razorpay:`);
  for (const p of data.items || []) {
    console.log(`- ID: ${p.id} | Order: ${p.order_id} | Status: ${p.status} | Email: ${p.email} | Contact: ${p.contact} | Amount: ${p.amount} ${p.currency} | CreatedAt: ${new Date(p.created_at * 1000).toISOString()}`);
  }
}

checkRazorpay().catch(console.error);
