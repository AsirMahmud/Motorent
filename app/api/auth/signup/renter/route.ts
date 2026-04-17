import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mail";

type RenterSignupBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  nidOrPassportUrl?: string;
  drivingLicenseUrl?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RenterSignupBody;

  const required = ["fullName", "email", "phone", "password", "nidOrPassportUrl", "drivingLicenseUrl"] as const;
  const missing = required.filter((f) => !body[f]);
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const existing = await db.user.findFirst({
    where: { OR: [{ email: body.email }, { phone: body.phone }] },
  });
  if (existing) {
    return NextResponse.json({ error: "An account with this email or phone already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password!, 12);
  const user = await db.user.create({
    data: {
      fullName: body.fullName!,
      email: body.email!,
      phone: body.phone!,
      passwordHash,
      role: "GENERAL",
      nidOrPassportUrl: body.nidOrPassportUrl!,
      drivingLicenseUrl: body.drivingLicenseUrl!,
      verificationStatus: "PENDING",
    },
    select: { id: true, fullName: true, email: true, verificationStatus: true },
  });

  await sendMail({
    to: user.email,
    subject: "MotoRent — KYC documents received",
    text: `Hi ${user.fullName},\n\nThank you for signing up as a renter on MotoRent!\n\nWe have received your NID and driving license. Our team will review your documents within 24 hours.\n\nYou will receive an email notification once your account is approved or if any documents need resubmission.\n\n— MotoRent Team`,
  });

  return NextResponse.json(
    { message: "Signup successful. Pending admin KYC review.", user, adminReviewRequired: true },
    { status: 201 }
  );
}
