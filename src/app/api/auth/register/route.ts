import { NextRequest, NextResponse } from "next/server";
import { createUser, toPublicUser } from "@/lib/db";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";



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

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (name.length < 2) return fail("Please record your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("That email does not look valid.");
  if (password.length < 8) return fail("A secret of at least eight characters is required.");

  try {
    const user = await createUser({ name, email, password });
    const token = await signSession({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    const res = NextResponse.json({ ok: true, user: toPublicUser(user) });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(req.nextUrl.hostname));
    return res;
  } catch (error) {
    const err = error as Error & { status?: number };
    return fail(err.message || "Registration failed.", err.status ?? 500);
  }
}
