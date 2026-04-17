import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signSession, setSessionCookie } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

type LoginBody = {
  email?: string;
  password?: string;
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

  if (user.role === "GENERAL") {
    return NextResponse.json(
      { error: "General users must login with Google" },
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

  if (user.role === "RENTER" && user.verificationStatus !== "APPROVED") {
    return NextResponse.json(
      {
        error:
          "Your account is not approved by admin yet. Please wait for verification email.",
        verificationStatus: user.verificationStatus,
      },
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
