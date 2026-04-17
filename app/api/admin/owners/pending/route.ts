import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const owners = await db.user.findMany({
    where: {
      role: "OWNER",
      verificationStatus: "PENDING",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      verificationStatus: true,
      nidOrPassportUrl: true,
      drivingLicenseUrl: true,
      ownershipPaperUrl: true,
      passportPhotoUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ owners });
}
