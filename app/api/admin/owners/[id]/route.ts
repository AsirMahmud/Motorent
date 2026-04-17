import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const owner = await db.user.findFirst({
    where: { id, role: "OWNER" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      verificationStatus: true,
      verificationNote: true,
      verificationReviewedAt: true,
      nidOrPassportUrl: true,
      drivingLicenseUrl: true,
      ownershipPaperUrl: true,
      passportPhotoUrl: true,
      createdAt: true,
      updatedAt: true,
      vehicles: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!owner) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  return NextResponse.json({ owner });
}
