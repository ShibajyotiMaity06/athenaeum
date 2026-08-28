import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_TARGET_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "shibajyoti.maity06@gmail.com";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name, category, subject, message, url } = body;

    // Validate mandatory fields
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { ok: false, error: "Please describe the error or problem in at least a few words." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim();
    const cleanCategory = typeof category === "string" ? category.trim() : "Error Report";
    const cleanSubject = typeof subject === "string" && subject.trim() ? subject.trim() : "Issue / Error Report";
    const cleanName = typeof name === "string" && name.trim() ? name.trim() : "DevPrep User";
    const cleanMessage = message.trim();
    const cleanUrl = typeof url === "string" ? url.trim() : "";

    // Forward report securely to admin inbox via FormSubmit AJAX service (server-side only)
    let emailSent = false;
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(ADMIN_TARGET_EMAIL)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `[DevPrep] ${cleanCategory}: ${cleanSubject}`,
          "Reporter Email": cleanEmail,
          "Reporter Name": cleanName,
          "Category": cleanCategory,
          "Subject": cleanSubject,
          "Page Context / URL": cleanUrl || "N/A",
          "Problem Description": cleanMessage,
          "Timestamp": new Date().toISOString(),
          _template: "table"
        })
      });

      if (response.ok) {
        emailSent = true;
      } else {
        console.warn("[contact-api] FormSubmit response not ok:", response.status);
      }
    } catch (err) {
      console.error("[contact-api] Failed to forward email via FormSubmit:", err);
    }

    // Also attempt to store in MongoDB if connected for durability
    try {
      const mongoUri = process.env.MONGODB_URI?.trim();
      if (mongoUri) {
        const { MongoClient } = await import("mongodb");
        const client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db(process.env.MONGODB_DB || "devprep");
        await db.collection("error_reports").insertOne({
          email: cleanEmail,
          name: cleanName,
          category: cleanCategory,
          subject: cleanSubject,
          message: cleanMessage,
          url: cleanUrl,
          emailSent,
          createdAt: new Date()
        });
        await client.close();
      }
    } catch (dbErr) {
      console.warn("[contact-api] MongoDB error_reports record insert failed:", dbErr);
    }

    return NextResponse.json({
      ok: true,
      message: "Your report has been successfully submitted. Our team will look into it."
    });
  } catch (err) {
    console.error("[contact-api] Unhandled error:", err);
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
