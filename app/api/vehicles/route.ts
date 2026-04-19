import { NextResponse } from "next/server";
import { VehicleCategory } from "@prisma/client";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

type VehicleBody = {
  category?: VehicleCategory;
  brand?: string;
  model?: string;
  year?: number;
  registrationNumber?: string;
  location?: string;
  /** Owner-placed map pin (optional; otherwise geocoded from `location`) */
  latitude?: number | null;
  longitude?: number | null;
  seats?: number;
  fuelType?: string;
  transmission?: string;
  description?: string;
  features?: string[];
  dailyRate?: number;
  priceHourly?: number | null;
  priceWeekly?: number | null;
  vehiclePhotoUrl?: string;
  ownershipPaperUrl?: string;
  insurancePaperUrl?: string;
};

function parseOwnerMapPin(body: VehicleBody): { latitude: number; longitude: number } | null {
  const { latitude: latRaw, longitude: lngRaw } = body;
  if (latRaw === undefined || latRaw === null || lngRaw === undefined || lngRaw === null) {
    return null;
  }
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude: lat, longitude: lng };
}

/** Geocode a location string to lat/lng via Nominatim (free, no key needed). */
async function geocodeLocation(
  location: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "MotoRent/1.0 (vehicle-listing-geocoder)" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;
    return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

const FUEL = new Set(["gasoline", "diesel", "electric", "hybrid"]);
const TRANS = new Set(["manual", "automatic"]);

function optionalPositiveInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only owners can submit vehicles in this flow" },
      { status: 403 }
    );
  }

  if (user.verificationStatus !== "APPROVED") {
    return NextResponse.json(
      { error: "Your owner account must be approved first" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as VehicleBody;
  const missing: string[] = [];
  if (!body.brand?.trim()) missing.push("brand");
  if (!body.model?.trim()) missing.push("model");
  if (body.year === undefined || body.year === null) missing.push("year");
  if (!body.registrationNumber?.trim()) missing.push("registrationNumber");
  if (!body.location?.trim()) missing.push("location");
  if (body.dailyRate === undefined || body.dailyRate === null) missing.push("dailyRate");
  if (!body.vehiclePhotoUrl?.trim()) missing.push("vehiclePhotoUrl");
  if (!body.ownershipPaperUrl?.trim()) missing.push("ownershipPaperUrl");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const daily = Number(body.dailyRate);
  if (!Number.isFinite(daily) || daily <= 0) {
    return NextResponse.json(
      { error: "dailyRate must be a positive number" },
      { status: 400 }
    );
  }
  const yr = Number(body.year);
  if (!Number.isFinite(yr) || yr < 1990 || yr > 2035) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const catRaw = String(body.category ?? "BIKE").toUpperCase();
  const category =
    catRaw === "CAR" ? VehicleCategory.CAR : VehicleCategory.BIKE;
  const seats = body.seats === undefined || body.seats === null ? NaN : Number(body.seats);
  if (!Number.isFinite(seats) || seats < 1 || seats > 50) {
    return NextResponse.json(
      { error: "Seats must be a number between 1 and 50" },
      { status: 400 }
    );
  }
  const fuel = (body.fuelType || "gasoline").toLowerCase();
  const trans = (body.transmission || "manual").toLowerCase();
  if (!FUEL.has(fuel)) {
    return NextResponse.json(
      { error: "Invalid fuelType (use gasoline, diesel, electric, or hybrid)" },
      { status: 400 }
    );
  }
  if (!TRANS.has(trans)) {
    return NextResponse.json(
      { error: "Invalid transmission (use manual or automatic)" },
      { status: 400 }
    );
  }

  const features = Array.isArray(body.features)
    ? body.features.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const locationStr = body.location!.trim();
  const ownerPin = parseOwnerMapPin(body);
  const geocoded = ownerPin ? null : await geocodeLocation(locationStr);
  const coords = ownerPin ?? geocoded;

  const vehicle = await db.vehicle.create({
    data: {
      ownerId: user.id,
      category,
      brand: body.brand!.trim(),
      model: body.model!.trim(),
      year: yr,
      registrationNumber: body.registrationNumber!.trim(),
      location: locationStr,
      ...(coords ?? {}),
      seats,
      fuelType: fuel,
      transmission: trans,
      description: body.description?.trim() || null,
      features,
      dailyRate: daily,
      priceHourly: optionalPositiveInt(body.priceHourly),
      priceWeekly: optionalPositiveInt(body.priceWeekly),
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
