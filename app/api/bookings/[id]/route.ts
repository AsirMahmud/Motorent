import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mail";
import { getPusherServer } from "@/lib/server/pusher";

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
  action?: "CONFIRM_PICKUP" | "CONFIRM_RETURN";
  // Return settlement payload (used with CONFIRM_RETURN)
  returnCondition?: "GOOD" | "MINOR_DAMAGE" | "MAJOR_DAMAGE";
  returnNotes?: string;
  lateFee?: number;
  damageFee?: number;
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

  const existing = await db.booking.findFirst({
    where: { id },
    include: {
      vehicle: { select: { ownerId: true, brand: true, model: true } },
      renter: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (existing.vehicle.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pusher = getPusherServer();

  // ── CONFIRM PICKUP ────────────────────────────────────────────────────────
  if (body.action === "CONFIRM_PICKUP") {
    if (existing.status !== "ACCEPTED") {
      return NextResponse.json({ error: "Booking must be ACCEPTED before pickup can be confirmed" }, { status: 400 });
    }
    if (existing.pickedUpAt) {
      return NextResponse.json({ error: "Pickup already confirmed" }, { status: 400 });
    }

    const booking = await db.booking.update({
      where: { id },
      data: { pickedUpAt: new Date() },
    });

    // Notify renter via email
    await sendMail({
      to: existing.renter.email,
      subject: `Vehicle pickup confirmed — ${existing.vehicle.brand} ${existing.vehicle.model}`,
      text: `Hi ${existing.renter.fullName},\n\nThe owner has confirmed that you have picked up the ${existing.vehicle.brand} ${existing.vehicle.model}.\n\nYour rental is now active. Please return it by ${existing.endDate.toLocaleDateString()}.\n\n— MotoRent`,
    }).catch(() => {/* non-fatal */});

    // Push status change via Pusher
    if (pusher) {
      await pusher.trigger(`booking-${id}`, "status-update", {
        action: "PICKED_UP",
        pickedUpAt: booking.pickedUpAt,
      }).catch(() => {});
    }

    return NextResponse.json({ booking });
  }

  // ── CONFIRM RETURN ────────────────────────────────────────────────────────
  if (body.action === "CONFIRM_RETURN") {
    if (!existing.pickedUpAt) {
      return NextResponse.json({ error: "Pickup must be confirmed before return" }, { status: 400 });
    }
    if (existing.returnedAt) {
      return NextResponse.json({ error: "Return already confirmed" }, { status: 400 });
    }

    const lateFee = Math.max(0, body.lateFee ?? 0);
    const damageFee = Math.max(0, body.damageFee ?? 0);
    const finalAmount = existing.totalPrice + lateFee + damageFee;

    const booking = await db.booking.update({
      where: { id },
      data: {
        returnedAt: new Date(),
        status: "COMPLETED",
        returnCondition: body.returnCondition ?? "GOOD",
        returnNotes: body.returnNotes ?? null,
        lateFee,
        damageFee,
        finalAmount,
        paymentReceivedAt: new Date(),
      },
    });

    // Notify renter via email
    const extraLines: string[] = [];
    if (lateFee > 0) extraLines.push(`Late fee: ৳${lateFee.toLocaleString()}`);
    if (damageFee > 0) extraLines.push(`Damage fee: ৳${damageFee.toLocaleString()}`);

    await sendMail({
      to: existing.renter.email,
      subject: `Rental completed — ${existing.vehicle.brand} ${existing.vehicle.model}`,
      text: [
        `Hi ${existing.renter.fullName},`,
        ``,
        `The owner has confirmed the return of the ${existing.vehicle.brand} ${existing.vehicle.model}. Your rental is now complete.`,
        ``,
        `Base rental: ৳${existing.totalPrice.toLocaleString()}`,
        ...extraLines,
        `Total settled (cash): ৳${finalAmount.toLocaleString()}`,
        ``,
        `Thank you for using MotoRent!`,
        ``,
        `— MotoRent`,
      ].join("\n"),
    }).catch(() => {/* non-fatal */});

    // Push status change via Pusher
    if (pusher) {
      await pusher.trigger(`booking-${id}`, "status-update", {
        action: "RETURNED",
        returnedAt: booking.returnedAt,
        status: "COMPLETED",
        finalAmount,
      }).catch(() => {});
    }

    return NextResponse.json({ booking });
  }

  // ── ACCEPT / REJECT (existing flow) ──────────────────────────────────────
  if (!body.status || !["ACCEPTED", "REJECTED"].includes(body.status)) {
    return NextResponse.json(
      { error: "status must be ACCEPTED or REJECTED, or provide a valid action" },
      { status: 400 }
    );
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
        select: { id: true, brand: true, model: true, vehiclePhotoUrl: true, ownerId: true },
      },
      renter: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
    },
  });

  const isAccepted = body.status === "ACCEPTED";
  await sendMail({
    to: booking.renter.email,
    subject: isAccepted
      ? `Booking confirmed — ${booking.vehicle.brand} ${booking.vehicle.model}`
      : `Booking update — ${booking.vehicle.brand} ${booking.vehicle.model}`,
    text: isAccepted
      ? `Hi ${booking.renter.fullName},\n\nYour booking for ${booking.vehicle.brand} ${booking.vehicle.model} has been ACCEPTED.\n\nPickup: ${existing.pickupLocation}\nFrom: ${existing.startDate.toLocaleDateString()}\nTo: ${existing.endDate.toLocaleDateString()}\nTotal: ৳${existing.totalPrice.toLocaleString()}\n\n— MotoRent`
      : `Hi ${booking.renter.fullName},\n\nThe owner has declined your booking for ${booking.vehicle.brand} ${booking.vehicle.model}.\n\n— MotoRent`,
  });

  return NextResponse.json({ booking });
}
