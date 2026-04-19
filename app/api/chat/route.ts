import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { getPusherServer } from "@/lib/server/pusher";

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  // Verify the caller is the renter or the vehicle owner for this booking
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { vehicle: { select: { ownerId: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isRenter = booking.renterId === user.id;
  const isOwner = booking.vehicle.ownerId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isRenter && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await db.message.findMany({
    where: { bookingId },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { bookingId?: string; body?: string };
  if (!body.bookingId?.trim()) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }
  if (!body.body?.trim()) {
    return NextResponse.json({ error: "Message body cannot be empty" }, { status: 400 });
  }

  // Verify access
  const booking = await db.booking.findUnique({
    where: { id: body.bookingId },
    include: { vehicle: { select: { ownerId: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isRenter = booking.renterId === user.id;
  const isOwner = booking.vehicle.ownerId === user.id;

  if (!isRenter && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await db.message.create({
    data: {
      bookingId: body.bookingId,
      senderId: user.id,
      body: body.body.trim(),
    },
    include: {
      sender: { select: { id: true, fullName: true, role: true } },
    },
  });

  // Broadcast via Pusher (skipped gracefully if keys are not set)
  const pusher = getPusherServer();
  if (pusher) {
    await pusher
      .trigger(`booking-${body.bookingId}`, "new-message", {
        id: message.id,
        bookingId: message.bookingId,
        senderId: message.senderId,
        senderName: message.sender.fullName,
        senderRole: message.sender.role,
        body: message.body,
        createdAt: message.createdAt,
      })
      .catch(() => {/* non-fatal */});
  }

  return NextResponse.json({ message }, { status: 201 });
}
