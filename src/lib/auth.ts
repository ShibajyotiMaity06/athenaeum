import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getUserById, type UserRecord } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/constants";

export { SESSION_COOKIE };
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // thirty days

function secretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET || "athenaeum-development-secret-do-not-use-in-production";
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

export interface SessionClaims {
  sub: string;
  email: string;
  role: "admin" | "scholar";
  name: string;
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ email: claims.email, role: claims.role, name: claims.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role === "admin" ? "admin" : "scholar",
      name: typeof payload.name === "string" ? payload.name : ""
    };
  } catch {
    return null;
  }
}

/** Read + verify the session from the incoming request (server components). */
export async function getSession(): Promise<SessionClaims | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Full database record for the current visitor, or null. */
export async function getCurrentUser(): Promise<UserRecord | null> {
  const session = await getSession();
  if (!session) return null;
  return await getUserById(session.sub);
}

/**
 * Cookie policy: Secure everywhere in production EXCEPT loopback hosts,
 * so `npm start` on http://localhost remains fully usable while real
 * deployments (https) always get hardened cookies.
 */
export function sessionCookieOptions(hostname: string, maxAge = 60 * 60 * 24 * 30) {
  const loopback =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production" && !loopback,
    path: "/",
    maxAge
  };
}
