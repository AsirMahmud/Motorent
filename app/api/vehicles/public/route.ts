import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // BIKE | CAR
  const search = searchParams.get("q")?.trim().toLowerCase();

  const vehicles = await db.vehicle.findMany({
    where: {
      status: "APPROVED",
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

  return NextResponse.json({ vehicles: filtered });
}
