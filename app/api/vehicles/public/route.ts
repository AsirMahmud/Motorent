import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // BIKE | CAR
  const search = searchParams.get("q")?.trim().toLowerCase();

  const vehicles = await db.vehicle.findMany({
    where: {
      status: "APPROVED",
      isActive: true,
      ...(type === "BIKE" || type === "CAR" ? { category: type } : {}),
    },
    select: {
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
      viewCount: true,
      status: true,
      owner: {
        select: { id: true, fullName: true, verificationStatus: true },
      },
      // Check for any active (accepted, not yet returned) booking
      bookings: {
        where: { status: "ACCEPTED", returnedAt: null },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const filtered = search
    ? vehicles.filter(
        (v) =>
          v.brand.toLowerCase().includes(search) ||
          v.model.toLowerCase().includes(search) ||
          v.location.toLowerCase().includes(search)
      )
    : vehicles;

  // Flatten: replace bookings[] with a simple boolean flag
  const result = filtered.map(({ bookings, ...v }) => ({
    ...v,
    isOnRental: bookings.length > 0,
  }));

  return NextResponse.json({ vehicles: result });
}
