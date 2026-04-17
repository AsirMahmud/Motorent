import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/next-auth";
import { db } from "@/lib/server/db";

const SESSION_COOKIE = "moto_rent_session";

type SessionPayload = {
  userId: string;
  role: "GENERAL" | "OWNER" | "ADMIN";
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySession(token: string): SessionPayload {
  return jwt.verify(token, getJwtSecret()) as SessionPayload;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Session from httpOnly JWT cookie (owner/admin email login). */
export async function requireAuthFromJwtCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const payload = verifySession(token);
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });
    return user;
  } catch {
    return null;
  }
}

/**
 * Authenticated user from JWT cookie or NextAuth (Google / GENERAL renters).
 */
export async function getAuthUser() {
  const fromCookie = await requireAuthFromJwtCookie();
  if (fromCookie) {
    return fromCookie;
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  return db.user.findUnique({
    where: { email: session.user.email },
  });
}

/** @alias getAuthUser — use for API routes and layouts that accept either auth mode */
export async function requireAuth() {
  return getAuthUser();
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}

