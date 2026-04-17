import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mail";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await db.booking.findFirst({
    where: { id },
    include: {
      vehicle: true,
      renter: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isRenter = booking.renterId === user.id;
  const isOwner =
    user.role === "OWNER" && booking.vehicle.ownerId === user.id;
  if (!isRenter && !isOwner && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ booking });
}

type PatchBody = {
  status?: BookingStatus;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "OWNER") {
    return NextResponse.json({ error: "Only vehicle owners can update booking status" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as PatchBody;

  if (!body.status || !["ACCEPTED", "REJECTED"].includes(body.status)) {
    return NextResponse.json(
      { error: "status must be ACCEPTED or REJECTED" },
      { status: 400 }
    );
  }

  const existing = await db.booking.findFirst({
    where: { id },
    include: {
      vehicle: { select: { ownerId: true } },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (existing.vehicle.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (existing.status !== "PENDING") {
    return NextResponse.json(
      { error: "Only pending bookings can be accepted or rejected" },
      { status: 400 }
    );
  }

  const booking = await db.booking.update({
    where: { id },
    data: {
      status: body.status,
      ownerDecidedAt: new Date(),
    },
    include: {
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          vehiclePhotoUrl: true,
          ownerId: true,
        },
      },
      renter: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Email renter about the decision
  const isAccepted = body.status === "ACCEPTED";
  await sendMail({
    to: booking.renter.email,
    subject: isAccepted
      ? `Booking confirmed — ${booking.vehicle.brand} ${booking.vehicle.model}`
      : `Booking update — ${booking.vehicle.brand} ${booking.vehicle.model}`,
    text: isAccepted
      ? `Hi ${booking.renter.fullName},\n\nGreat news! Your booking for ${booking.vehicle.brand} ${booking.vehicle.model} has been ACCEPTED by the owner.\n\nPickup: ${existing.pickupLocation}\nFrom: ${existing.startDate.toLocaleDateString()}\nTo: ${existing.endDate.toLocaleDateString()}\nTotal: ৳${existing.totalPrice.toLocaleString()}\n\nPlease coordinate with the owner for pickup details.\n\n— MotoRent`
      : `Hi ${booking.renter.fullName},\n\nUnfortunately, the owner has declined your booking request for ${booking.vehicle.brand} ${booking.vehicle.model}.\n\nYou can browse other available vehicles on MotoRent.\n\n— MotoRent`,
  });

  return NextResponse.json({ booking });
}
