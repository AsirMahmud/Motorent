import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/server/db";

const SESSION_COOKIE = "moto_rent_session";

type SessionPayload = {
  userId: string;
  role: UserRole;
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

export async function requireAuth() {
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

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}
