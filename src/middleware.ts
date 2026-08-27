import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/constants";

const secretKey = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET || "athenaeum-development-secret-do-not-use-in-production"
  );

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);

  if (!token) return NextResponse.redirect(loginUrl);

  try {
    await jwtVerify(token, secretKey());
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }
}

/* Only Your Desk is login-gated at the edge — the library itself is public,
   with per-codex preview/paywall logic handled server-side. */
export const config = {
  matcher: ["/account/:path*"]
};
