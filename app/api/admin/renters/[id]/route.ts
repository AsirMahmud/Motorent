import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const renter = await db.user.findFirst({
    where: { id, role: "GENERAL" },
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
      createdAt: true,
      bookingsAsRenter: {
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              vehiclePhotoUrl: true,
              dailyRate: true,
              location: true,
              owner: { select: { fullName: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!renter) {
    return NextResponse.json({ error: "Renter not found" }, { status: 404 });
  }

  const totalSpend = renter.bookingsAsRenter.reduce((s, b) => s + b.totalPrice, 0);

  return NextResponse.json({ renter: { ...renter, totalSpend } });
}
