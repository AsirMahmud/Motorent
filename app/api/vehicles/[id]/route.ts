import { NextResponse } from "next/server";
import { VehicleCategory } from "@prisma/client";
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
  ownershipPaperUrl: true,
  insurancePaperUrl: true,
  isActive: true,
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

/* ── Shared helpers ──────────────────────────────────────────────── */

const FUEL = new Set(["gasoline", "diesel", "electric", "hybrid"]);
const TRANS = new Set(["manual", "automatic"]);

function optionalPositiveInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

function parseOwnerMapPin(body: Record<string, unknown>): { latitude: number; longitude: number } | null {
  const latRaw = body.latitude as number | null | undefined;
  const lngRaw = body.longitude as number | null | undefined;
  if (latRaw === undefined || latRaw === null || lngRaw === undefined || lngRaw === null) return null;
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude: lat, longitude: lng };
}

async function geocodeLocation(location: string): Promise<{ latitude: number; longitude: number } | null> {
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

/* ── GET — public vehicle detail ─────────────────────────────────── */

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

  if ((row.status !== "APPROVED" || !row.isActive) && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  let viewCount = row.viewCount;
  if (row.status === "APPROVED" && row.isActive && !isOwner && !isAdmin) {
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

/* ── PUT — owner edits their vehicle ─────────────────────────────── */

type VehicleUpdateBody = {
  category?: string;
  brand?: string;
  model?: string;
  year?: number;
  registrationNumber?: string;
  location?: string;
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can edit vehicles" }, { status: 403 });
  }

  // Verify ownership
  const existing = await db.vehicle.findFirst({
    where: { id },
    select: { id: true, ownerId: true, location: true, latitude: true, longitude: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  if (existing.ownerId !== user.id) {
    return NextResponse.json({ error: "You can only edit your own vehicles" }, { status: 403 });
  }

  const body = (await request.json()) as VehicleUpdateBody;

  // Build the update data object — only include fields that are provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};

  if (body.brand !== undefined) {
    if (!body.brand.trim()) return NextResponse.json({ error: "Brand cannot be empty" }, { status: 400 });
    data.brand = body.brand.trim();
  }

  if (body.model !== undefined) {
    if (!body.model.trim()) return NextResponse.json({ error: "Model cannot be empty" }, { status: 400 });
    data.model = body.model.trim();
  }

  if (body.year !== undefined) {
    const yr = Number(body.year);
    if (!Number.isFinite(yr) || yr < 1990 || yr > 2035) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }
    data.year = yr;
  }

  if (body.registrationNumber !== undefined) {
    if (!body.registrationNumber.trim()) {
      return NextResponse.json({ error: "Registration number cannot be empty" }, { status: 400 });
    }
    data.registrationNumber = body.registrationNumber.trim();
  }

  if (body.category !== undefined) {
    const catRaw = String(body.category).toUpperCase();
    data.category = catRaw === "CAR" ? VehicleCategory.CAR : VehicleCategory.BIKE;
  }

  if (body.seats !== undefined) {
    const s = Number(body.seats);
    if (!Number.isFinite(s) || s < 1 || s > 50) {
      return NextResponse.json({ error: "Seats must be 1–50" }, { status: 400 });
    }
    data.seats = s;
  }

  if (body.fuelType !== undefined) {
    const fuel = body.fuelType.toLowerCase();
    if (!FUEL.has(fuel)) {
      return NextResponse.json({ error: "Invalid fuelType" }, { status: 400 });
    }
    data.fuelType = fuel;
  }

  if (body.transmission !== undefined) {
    const trans = body.transmission.toLowerCase();
    if (!TRANS.has(trans)) {
      return NextResponse.json({ error: "Invalid transmission" }, { status: 400 });
    }
    data.transmission = trans;
  }

  if (body.description !== undefined) {
    data.description = body.description.trim() || null;
  }

  if (body.features !== undefined) {
    data.features = Array.isArray(body.features)
      ? body.features.map((s) => String(s).trim()).filter(Boolean)
      : [];
  }

  // Pricing
  if (body.dailyRate !== undefined) {
    const daily = Number(body.dailyRate);
    if (!Number.isFinite(daily) || daily <= 0) {
      return NextResponse.json({ error: "dailyRate must be a positive number" }, { status: 400 });
    }
    data.dailyRate = daily;
  }

  if (body.priceHourly !== undefined) {
    data.priceHourly = optionalPositiveInt(body.priceHourly);
  }

  if (body.priceWeekly !== undefined) {
    data.priceWeekly = optionalPositiveInt(body.priceWeekly);
  }

  // Documents
  if (body.vehiclePhotoUrl !== undefined) {
    if (!body.vehiclePhotoUrl.trim()) {
      return NextResponse.json({ error: "Vehicle photo is required" }, { status: 400 });
    }
    data.vehiclePhotoUrl = body.vehiclePhotoUrl;
  }

  if (body.ownershipPaperUrl !== undefined) {
    if (!body.ownershipPaperUrl.trim()) {
      return NextResponse.json({ error: "Ownership paper is required" }, { status: 400 });
    }
    data.ownershipPaperUrl = body.ownershipPaperUrl;
  }

  if (body.insurancePaperUrl !== undefined) {
    data.insurancePaperUrl = body.insurancePaperUrl || null;
  }

  // Location — re-geocode if location text changed
  if (body.location !== undefined) {
    const locationStr = body.location.trim();
    if (!locationStr) {
      return NextResponse.json({ error: "Location cannot be empty" }, { status: 400 });
    }
    data.location = locationStr;

    const ownerPin = parseOwnerMapPin(body as Record<string, unknown>);
    if (ownerPin) {
      data.latitude = ownerPin.latitude;
      data.longitude = ownerPin.longitude;
    } else if (locationStr !== existing.location) {
      // Re-geocode since location text changed and no explicit pin
      const geocoded = await geocodeLocation(locationStr);
      if (geocoded) {
        data.latitude = geocoded.latitude;
        data.longitude = geocoded.longitude;
      }
    }
  } else if (body.latitude !== undefined || body.longitude !== undefined) {
    // Owner explicitly updating map pin without changing location text
    const ownerPin = parseOwnerMapPin(body as Record<string, unknown>);
    if (ownerPin) {
      data.latitude = ownerPin.latitude;
      data.longitude = ownerPin.longitude;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await db.vehicle.update({
    where: { id },
    data,
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      dailyRate: true,
      status: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Vehicle updated successfully",
    vehicle: updated,
  });
}

/* ── PATCH — toggle isActive ─────────────────────────────────────── */

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can manage vehicles" }, { status: 403 });
  }

  const existing = await db.vehicle.findFirst({
    where: { id },
    select: { id: true, ownerId: true, isActive: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  if (existing.ownerId !== user.id) {
    return NextResponse.json({ error: "You can only manage your own vehicles" }, { status: 403 });
  }

  const body = (await request.json()) as { isActive?: boolean };

  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
  }

  const updated = await db.vehicle.update({
    where: { id },
    data: { isActive: body.isActive },
    select: {
      id: true,
      brand: true,
      model: true,
      isActive: true,
      status: true,
    },
  });

  return NextResponse.json({
    message: updated.isActive ? "Vehicle activated" : "Vehicle deactivated",
    vehicle: updated,
  });
}

/* ── DELETE — remove vehicle (only if no active bookings) ────────── */

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can delete vehicles" }, { status: 403 });
  }

  const existing = await db.vehicle.findFirst({
    where: { id },
    select: { id: true, ownerId: true, brand: true, model: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  if (existing.ownerId !== user.id) {
    return NextResponse.json({ error: "You can only delete your own vehicles" }, { status: 403 });
  }

  // Check for active bookings (PENDING or ACCEPTED)
  const activeBookings = await db.booking.count({
    where: {
      vehicleId: id,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });

  if (activeBookings > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete — this vehicle has ${activeBookings} active booking(s). Cancel or complete them first.`,
      },
      { status: 409 }
    );
  }

  await db.vehicle.delete({ where: { id } });

  return NextResponse.json({
    message: `${existing.brand} ${existing.model} has been permanently deleted`,
  });
}
