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
  const token = store.get(SESSION_COOKIE)?.value || store.get("athenaeum_session")?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Full database record for the current visitor, or null. */
export async function getCurrentUser(): Promise<UserRecord | null> {
  const session = await getSession();
  if (!session) return null;
  return await getUserById(session.sub);
}

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

export const FREE_VIP_EMAILS = [
  "dipakmaity903@gmail.com",
  "shibajyoti.maity06@gmail.com",
  "debajyoti.maity29@gmail.com"
];

export function isVipEmail(email?: string): boolean {
  if (!email) return false;
  return FREE_VIP_EMAILS.includes(email.toLowerCase().trim());
}

export function hasFullAccess(user?: UserRecord | null): boolean {
  if (!user) return false;
  if (user.role === "admin" || isVipEmail(user.email)) return true;
  if (!user.access?.granted) return false;
  if (user.access.tiers?.includes("full")) return true;
  return user.access.tier === "full" || (!user.access.tier && user.access.granted);
}

export function hasInterviewAccess(user?: UserRecord | null): boolean {
  if (!user) return false;
  if (user.role === "admin" || isVipEmail(user.email)) return true;
  if (!user.access?.granted) return false;
  if (user.access.tiers?.includes("interview") || user.access.tiers?.includes("full")) return true;
  return (
    user.access.tier === "interview" ||
    user.access.tier === "full" ||
    (!user.access.tier && user.access.granted)
  );
}

export function hasDsaAccess(user?: UserRecord | null): boolean {
  if (!user) return false;
  if (user.role === "admin" || isVipEmail(user.email)) return true;
  if (!user.access?.granted) return false;
  // Anyone with full access, interview plan (since interview includes DSA), or DSA plan has DSA access!
  return (
    user.access.tier === "dsa" ||
    user.access.tier === "interview" ||
    user.access.tier === "full" ||
    user.access.hasDsa === true ||
    Boolean(user.access.tiers?.some((t) => t === "dsa" || t === "interview" || t === "full")) ||
    (!user.access.tier && user.access.granted)
  );
}


