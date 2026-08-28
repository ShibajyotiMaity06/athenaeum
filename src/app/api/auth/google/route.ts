import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthUrl, isGoogleAuthEnabled } from "@/lib/google";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nextPath = searchParams.get("next") || "/#technologies";

  if (!isGoogleAuthEnabled()) {
    const errorUrl = new URL("/login", req.url);
    errorUrl.searchParams.set(
      "error",
      "Google Sign-In is not configured yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local."
    );
    return NextResponse.redirect(errorUrl);
  }

  // Derive redirect URI dynamically based on the incoming request host
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  // Encode the state parameter with random salt and next destination
  const stateData = JSON.stringify({
    next: nextPath.startsWith("/") ? nextPath : "/#technologies",
    nonce: Math.random().toString(36).slice(2, 10)
  });
  const state = Buffer.from(stateData).toString("base64url");

  try {
    const googleAuthUrl = getGoogleOAuthUrl(redirectUri, state);
    return NextResponse.redirect(googleAuthUrl);
  } catch (err) {
    const errorUrl = new URL("/login", req.url);
    errorUrl.searchParams.set("error", (err as Error).message || "Failed to initiate Google OAuth.");
    return NextResponse.redirect(errorUrl);
  }
}
