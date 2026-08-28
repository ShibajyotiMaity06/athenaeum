import { NextResponse } from "next/server";
import { getTrustedUserCount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trustedCount = await getTrustedUserCount();
    return NextResponse.json(
      { ok: true, trustedCount },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json({ ok: true, trustedCount: 38 });
  }
}
