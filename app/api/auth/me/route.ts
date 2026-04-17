import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verificationStatus: user.verificationStatus,
      verificationNote: user.verificationNote,
      nidOrPassportUrl: user.nidOrPassportUrl,
      drivingLicenseUrl: user.drivingLicenseUrl,
      passportPhotoUrl: user.passportPhotoUrl,
      createdAt: user.createdAt,
    },
  });
}

type PatchBody = {
  fullName?: string;
  phone?: string;
  nidOrPassportUrl?: string;
  drivingLicenseUrl?: string;
};

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PatchBody;
  const data: Partial<typeof body> = {};

  if (body.fullName?.trim()) data.fullName = body.fullName.trim();
  if (body.phone?.trim()) data.phone = body.phone.trim();
  if (body.nidOrPassportUrl?.trim()) data.nidOrPassportUrl = body.nidOrPassportUrl.trim();
  if (body.drivingLicenseUrl?.trim()) data.drivingLicenseUrl = body.drivingLicenseUrl.trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // If renter is resubmitting docs, reset to PENDING for re-review
  const needsReview =
    user.role === "GENERAL" &&
    user.verificationStatus === "REJECTED" &&
    (data.nidOrPassportUrl || data.drivingLicenseUrl);

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      ...data,
      ...(needsReview ? { verificationStatus: "PENDING", verificationNote: null } : {}),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      verificationStatus: true,
      verificationNote: true,
      nidOrPassportUrl: true,
      drivingLicenseUrl: true,
    },
  });

  return NextResponse.json({ user: updated });
}
