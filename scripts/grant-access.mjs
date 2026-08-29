import { MongoClient } from "mongodb";

async function grantAccessToPaidUsers() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not found");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "devprep");
  const usersCol = db.collection("users");
  const ordersCol = db.collection("orders");

  const grants = [
    {
      email: "rohannagpure88@gmail.com",
      userId: "usr_mte7z1sz3mov",
      orderId: "order_TVY0u2FYrNivM8",
      paymentId: "pay_TVY17b2EoEu3XC",
      amount: 39900,
      currency: "INR",
      paidAt: "2026-08-29T10:10:51.000Z"
    },
    {
      email: "karandutta2011@gmail.com",
      userId: "usr_mtdx90lqxh85",
      orderId: "order_TVSv0BGJZSrPrK",
      paymentId: "pay_TVSv5zjpdvtqd2",
      amount: 39900,
      currency: "INR",
      paidAt: "2026-08-29T05:11:41.000Z"
    },
    {
      email: "smvmvenunisandhan6e17@gmail.com",
      userId: "usr_mtd27kia67mz",
      orderId: "order_TVE5ia5hbLeC1I",
      paymentId: "pay_TVE6wpHN3OMfFa",
      amount: 39900,
      currency: "INR",
      paidAt: "2026-08-28T14:42:30.000Z"
    }
  ];

  for (const g of grants) {
    console.log(`Processing ${g.email}...`);

    // 1. Upsert Order
    await ordersCol.updateOne(
      { id: g.orderId },
      {
        $set: {
          id: g.orderId,
          userId: g.userId,
          provider: "razorpay",
          amount: g.amount,
          currency: g.currency,
          status: "paid",
          paymentId: g.paymentId,
          paidAt: g.paidAt,
          createdAt: g.paidAt
        }
      },
      { upsert: true }
    );

    // 2. Grant User Access
    const updateResult = await usersCol.updateOne(
      { email: g.email.toLowerCase() },
      {
        $set: {
          access: {
            granted: true,
            provider: "razorpay",
            orderId: g.orderId,
            paymentId: g.paymentId,
            amount: g.amount,
            currency: g.currency,
            grantedAt: g.paidAt
          }
        }
      }
    );

    console.log(`Updated user ${g.email}: modifiedCount=${updateResult.modifiedCount}`);
  }

  console.log("\nVerifying updated users:");
  for (const g of grants) {
    const user = await usersCol.findOne({ email: g.email.toLowerCase() });
    console.log(`- ${user?.email} -> access:`, user?.access);
  }

  await client.close();
}

grantAccessToPaidUsers().catch(console.error);
