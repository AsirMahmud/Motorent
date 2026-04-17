import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // PENDING | APPROVED | REJECTED

  const renters = await db.user.findMany({
    where: {
      role: "GENERAL",
      ...(status && ["PENDING", "APPROVED", "REJECTED"].includes(status)
        ? { verificationStatus: status as "PENDING" | "APPROVED" | "REJECTED" }
        : {}),
    },
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
      _count: { select: { bookingsAsRenter: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Attach total spend per renter
  const renterIds = renters.map((r) => r.id);
  const spendRows = await db.booking.groupBy({
    by: ["renterId"],
    where: { renterId: { in: renterIds } },
    _sum: { totalPrice: true },
  });
  const spendMap = Object.fromEntries(spendRows.map((r) => [r.renterId, r._sum.totalPrice ?? 0]));

  const result = renters.map((r) => ({
    ...r,
    totalSpend: spendMap[r.id] ?? 0,
  }));

  return NextResponse.json({ renters: result });
}
