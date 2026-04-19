import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";

const vehicleSelect = {
  id: true,
  ownerId: true,
  category: true,
  brand: true,
  model: true,
  year: true,
  registrationNumber: true,
  location: true,
  latitude: true,
  longitude: true,
  seats: true,
  fuelType: true,
  transmission: true,
  description: true,
  features: true,
  dailyRate: true,
  priceHourly: true,
  priceWeekly: true,
  vehiclePhotoUrl: true,
  insurancePaperUrl: true,
  viewCount: true,
  status: true,
  reviewNote: true,
  owner: {
    select: {
      id: true,
      fullName: true,
      verificationStatus: true,
    },
  },
} as const;

/**
 * Public: approved listings only; increments viewCount.
 * Owner (same ownerId): any status; does not increment views.
 * Admin: any status; does not increment views.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();

  const row = await db.vehicle.findFirst({
    where: { id },
    select: vehicleSelect,
  });

  if (!row) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const isOwner = user?.role === "OWNER" && user.id === row.ownerId;
  const isAdmin = user?.role === "ADMIN";

  if (row.status !== "APPROVED" && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  let viewCount = row.viewCount;
  if (row.status === "APPROVED" && !isOwner && !isAdmin) {
    const updated = await db.vehicle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
    viewCount = updated.viewCount;
  }

  const { reviewNote, ...rest } = row;

  return NextResponse.json({
    vehicle: {
      ...rest,
      viewCount,
      status: row.status,
      ...(isOwner || isAdmin ? { reviewNote } : {}),
    },
  });
}
