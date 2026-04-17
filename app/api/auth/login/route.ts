import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signSession, setSessionCookie } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

type LoginBody = {
  email?: string;
  password?: string;
  /** When set, login succeeds only if the account matches this portal. */
  intent?: "ADMIN" | "OWNER" | "RENTER";
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (user.role === "GENERAL" && !user.passwordHash) {
    return NextResponse.json(
      { error: "This account uses Google sign-in. Please continue with Google." },
      { status: 403 }
    );
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);
  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Owners must be APPROVED to login
  if (user.role === "OWNER" && user.verificationStatus !== "APPROVED") {
    return NextResponse.json(
      {
        error: "Your owner account is pending admin approval. You will be notified by email.",
        verificationStatus: user.verificationStatus,
      },
      { status: 403 }
    );
  }

  if (body.intent === "ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "This email is not an admin account. Use the owner or renter sign-in page." },
      { status: 403 }
    );
  }

  if (body.intent === "OWNER" && user.role !== "OWNER") {
    return NextResponse.json(
      { error: "This email is not an owner account. Use the admin or renter sign-in page." },
      { status: 403 }
    );
  }

  if (body.intent === "RENTER" && user.role !== "GENERAL") {
    return NextResponse.json(
      { error: "This email is not a renter account. Use the owner or admin sign-in page." },
      { status: 403 }
    );
  }

  const token = signSession({ userId: user.id, role: user.role });
  await setSessionCookie(token);

  return NextResponse.json({
    message: "Login successful",
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verificationStatus: user.verificationStatus,
    },
  });
}
