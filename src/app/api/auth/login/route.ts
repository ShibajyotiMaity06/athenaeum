import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, toPublicUser } from "@/lib/db";
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";



/** Modest brute-force throttle: five attempts per email per rolling minute. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;

function throttled(email: string): boolean {
  const now = Date.now();
  const entry = attempts.get(email);
  if (!entry || entry.resetAt < now) {
    attempts.set(email, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("Malformed request.");
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) return fail("Both email and secret are required.");
  if (throttled(email)) {
    return fail("Too many attempts. Rest a moment and try again.", 429);
  }

  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return fail("The archives do not recognise those credentials.", 401);
  }

  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  });
  const res = NextResponse.json({ ok: true, user: toPublicUser(user) });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(req.nextUrl.hostname));
  return res;
}
