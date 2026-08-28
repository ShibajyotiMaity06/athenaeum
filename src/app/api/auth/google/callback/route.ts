import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, getGoogleUserInfo } from "@/lib/google";
import { createUser, getUserByEmail } from "@/lib/db";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const loginUrl = new URL("/login", req.url);

  if (error) {
    loginUrl.searchParams.set("error", `Google authentication was canceled: ${error}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    loginUrl.searchParams.set("error", "No authorization code was returned by Google.");
    return NextResponse.redirect(loginUrl);
  }

  // Parse state to retrieve next destination
  let nextDestination = "/#technologies";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
      if (typeof decoded.next === "string" && decoded.next.startsWith("/")) {
        nextDestination = decoded.next;
      }
    } catch {
      // default destination stands
    }
  }

  try {
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    // 1. Exchange authorization code for access token
    const tokenResponse = await exchangeGoogleCode(code, redirectUri);

    // 2. Fetch Google profile
    const profile = await getGoogleUserInfo(tokenResponse.accessToken);

    if (!profile.email) {
      loginUrl.searchParams.set("error", "Google did not provide a valid email address.");
      return NextResponse.redirect(loginUrl);
    }

    const email = profile.email.trim().toLowerCase();

    // 3. Find or create user
    let user = await getUserByEmail(email);

    if (!user) {
      const displayName = profile.name?.trim() || profile.given_name?.trim() || "Scholar";
      // Create user with a secure random password hash
      const randomPassword = `OAuth_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      user = await createUser({
        name: displayName,
        email,
        password: randomPassword
      });
    }

    // 4. Issue session token
    const token = await signSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // 5. Redirect user to their destination with the session cookie set
    const destinationUrl = new URL(nextDestination, req.url);
    const res = NextResponse.redirect(destinationUrl);

    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(req.nextUrl.hostname));

    return res;
  } catch (err) {
    loginUrl.searchParams.set("error", (err as Error).message || "Failed to sign in with Google.");
    return NextResponse.redirect(loginUrl);
  }
}
