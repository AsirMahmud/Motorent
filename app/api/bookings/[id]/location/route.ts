import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { getPusherServer } from "@/lib/server/pusher";

/**
 * POST /api/bookings/[id]/location
 * Renter broadcasts their GPS coordinates for an active booking.
 * - Saves to DB as the last known location (owner can see even without Pusher).
 * - Triggers a Pusher event on the booking channel for real-time tracking.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { lat?: number; lng?: number };

  if (typeof body.lat !== "number" || typeof body.lng !== "number") {
    return NextResponse.json({ error: "lat and lng are required numbers" }, { status: 400 });
  }

  const booking = await db.booking.findFirst({
    where: { id },
    select: { renterId: true, status: true, pickedUpAt: true, vehicle: { select: { ownerId: true } } },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.renterId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status !== "ACCEPTED") return NextResponse.json({ error: "Booking is not active" }, { status: 400 });

  // Persist last known location
  await db.booking.update({
    where: { id },
    data: {
      renterLat: body.lat,
      renterLng: body.lng,
      renterLocUpdatedAt: new Date(),
    },
  });

  // Real-time broadcast via Pusher
  const pusher = getPusherServer();
  if (pusher) {
    await pusher
      .trigger(`booking-${id}`, "renter-location", {
        bookingId: id,
        lat: body.lat,
        lng: body.lng,
        updatedAt: new Date().toISOString(),
      })
      .catch(() => {/* non-fatal */});
  }

  return NextResponse.json({ ok: true });
}
