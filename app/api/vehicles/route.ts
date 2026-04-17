import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

type VehicleBody = {
  brand?: string;
  model?: string;
  year?: number;
  registrationNumber?: string;
  dailyRate?: number;
  vehiclePhotoUrl?: string;
  ownershipPaperUrl?: string;
  insurancePaperUrl?: string;
};

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "RENTER") {
    return NextResponse.json(
      { error: "Only renters can submit vehicles in this flow" },
      { status: 403 }
    );
  }

  if (user.verificationStatus !== "APPROVED") {
    return NextResponse.json(
      { error: "Your renter account must be approved first" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as VehicleBody;
  const requiredFields = [
    "brand",
    "model",
    "year",
    "registrationNumber",
    "dailyRate",
    "vehiclePhotoUrl",
    "ownershipPaperUrl",
  ] as const;

  const missing = requiredFields.filter((field) => !body[field]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const vehicle = await db.vehicle.create({
    data: {
      ownerId: user.id,
      brand: body.brand!,
      model: body.model!,
      year: Number(body.year),
      registrationNumber: body.registrationNumber!,
      dailyRate: Number(body.dailyRate),
      vehiclePhotoUrl: body.vehiclePhotoUrl!,
      ownershipPaperUrl: body.ownershipPaperUrl!,
      insurancePaperUrl: body.insurancePaperUrl,
      status: "PENDING",
    },
    select: {
      id: true,
      brand: true,
      model: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      message:
        "Vehicle profile submitted. It is pending admin approval with document review.",
      vehicle,
    },
    { status: 201 }
  );
}

export async function GET() {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vehicles = await db.vehicle.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ vehicles });
}
