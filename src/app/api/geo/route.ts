import { NextRequest, NextResponse } from "next/server";
import { countryFromHeaders, currencyForCountry } from "@/lib/geo";

export const dynamic = "force-dynamic";

/**
 * Resolves the visitor's currency:
 *  1. Edge/proxy country headers (Vercel / Cloudflare / custom)
 *  2. null → the client falls back to locale/timezone inference
 */
export async function GET(req: NextRequest) {
  const country = countryFromHeaders(req.headers);
  const currency = currencyForCountry(country);
  return NextResponse.json(
    { country, currency },
    { headers: { "Cache-Control": "no-store" } }
  );
}
