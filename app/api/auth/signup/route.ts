import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

type SignupBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  nidOrPassportUrl?: string;
  drivingLicenseUrl?: string;
  ownershipPaperUrl?: string;
  passportPhotoUrl?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SignupBody;

  const requiredFields = [
    "fullName",
    "email",
    "phone",
    "password",
    "nidOrPassportUrl",
    "drivingLicenseUrl",
    "ownershipPaperUrl",
    "passportPhotoUrl",
  ] as const;

  const missing = requiredFields.filter((field) => !body[field]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: body.email }, { phone: body.phone }],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "User already exists with this email or phone" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(body.password!, 12);
  const user = await db.user.create({
    data: {
      fullName: body.fullName!,
      email: body.email!,
      phone: body.phone!,
      passwordHash,
      role: "OWNER",
      nidOrPassportUrl: body.nidOrPassportUrl!,
      drivingLicenseUrl: body.drivingLicenseUrl!,
      ownershipPaperUrl: body.ownershipPaperUrl!,
      passportPhotoUrl: body.passportPhotoUrl!,
      verificationStatus: "PENDING",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      verificationStatus: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      message:
        "Signup successful. Your verification request is pending admin approval.",
      user,
      adminReviewRequired: true,
    },
    { status: 201 }
  );
}
