import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthUrl, getGoogleRedirectUri, isGoogleAuthEnabled } from "@/lib/google";

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

  const redirectUri = getGoogleRedirectUri(req);

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
