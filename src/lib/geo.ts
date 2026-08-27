import type { CurrencyCode } from "@/lib/site";

/**
 * Best-effort country detection from edge/proxy headers.
 * Works out-of-the-box on Vercel (x-vercel-ip-country) and Cloudflare
 * (cf-ipcountry); custom proxies can forward x-country-code.
 */
export function countryFromHeaders(headers: Headers): string | null {
  return (
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    headers.get("x-geo-country") ||
    null
  );
}

export function currencyForCountry(country: string | null): CurrencyCode | null {
  if (!country) return null;
  const c = country.toUpperCase();
  if (c === "IN") return "INR";
  return "USD";
}
