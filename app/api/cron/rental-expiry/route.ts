import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mail";

/**
 * GET /api/cron/rental-expiry
 * Finds all ACCEPTED bookings whose endDate has passed, marks them COMPLETED,
 * and sends email notifications to both the renter and the vehicle owner.
 *
 * Call this endpoint via Vercel Cron (vercel.json) or an external scheduler.
 * Protected by CRON_SECRET env var if set.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  const expired = await db.booking.findMany({
    where: {
      status: "ACCEPTED",
      endDate: { lt: now },
    },
    include: {
      renter: { select: { fullName: true, email: true } },
      vehicle: {
        select: {
          brand: true,
          model: true,
          owner: { select: { fullName: true, email: true } },
        },
      },
    },
  });

  if (expired.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const ids = expired.map((b) => b.id);

  await db.booking.updateMany({
    where: { id: { in: ids } },
    data: { status: "COMPLETED" },
  });

  const emailPromises = expired.flatMap((booking) => {
    const vehicle = `${booking.vehicle.brand} ${booking.vehicle.model}`;
    const dateRange = `${booking.startDate.toLocaleDateString()} – ${booking.endDate.toLocaleDateString()}`;

    const toRenter = sendMail({
      to: booking.renter.email,
      subject: `Your rental has ended — ${vehicle}`,
      text: `Hi ${booking.renter.fullName},\n\nYour rental of ${vehicle} has ended (${dateRange}).\n\nTotal paid: ৳${booking.totalPrice.toLocaleString()}\n\nWe hope you enjoyed your ride! Browse more vehicles on MotoRent.\n\n— MotoRent Team`,
    });

    const toOwner = booking.vehicle.owner
      ? sendMail({
          to: booking.vehicle.owner.email,
          subject: `Rental period ended — ${vehicle}`,
          text: `Hi ${booking.vehicle.owner.fullName},\n\nThe rental of your ${vehicle} by ${booking.renter.fullName} has ended (${dateRange}).\n\nEarned: ৳${booking.totalPrice.toLocaleString()}\n\nThe booking has been marked as completed. Thank you for hosting!\n\n— MotoRent Team`,
        })
      : Promise.resolve();

    return [toRenter, toOwner];
  });

  await Promise.allSettled(emailPromises);

  return NextResponse.json({ processed: expired.length, ids });
}
