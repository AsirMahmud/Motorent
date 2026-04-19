import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export type NotifItem = {
  id: string;
  type: "booking_accepted" | "booking_rejected" | "pickup_confirmed" | "return_confirmed" | "new_request" | "new_message";
  title: string;
  body: string;
  href: string;
  createdAt: string;
};

export async function GET() {
  const me = await requireAuth();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days
  const notifications: NotifItem[] = [];

  // ── RENTER notifications ─────────────────────────────────────────────────
  if (me.role === "GENERAL") {
    const bookings = await db.booking.findMany({
      where: { renterId: me.id, updatedAt: { gte: since } },
      include: { vehicle: { select: { brand: true, model: true } } },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });

    for (const b of bookings) {
      const name = `${b.vehicle.brand} ${b.vehicle.model}`;
      if (b.status === "ACCEPTED" && b.ownerDecidedAt) {
        notifications.push({
          id: `accepted-${b.id}`,
          type: "booking_accepted",
          title: "Booking Approved ✓",
          body: `${name} rental was approved by the owner.`,
          href: "/renter-dashboard",
          createdAt: b.ownerDecidedAt.toISOString(),
        });
      }
      if (b.status === "REJECTED" && b.ownerDecidedAt) {
        notifications.push({
          id: `rejected-${b.id}`,
          type: "booking_rejected",
          title: "Booking Rejected",
          body: `${name} rental request was declined.`,
          href: "/renter-dashboard",
          createdAt: b.ownerDecidedAt.toISOString(),
        });
      }
      if (b.pickedUpAt) {
        notifications.push({
          id: `pickup-${b.id}`,
          type: "pickup_confirmed",
          title: "Vehicle Picked Up 🔑",
          body: `${name} pickup confirmed by the owner.`,
          href: "/renter-dashboard",
          createdAt: b.pickedUpAt.toISOString(),
        });
      }
      if (b.returnedAt) {
        notifications.push({
          id: `returned-${b.id}`,
          type: "return_confirmed",
          title: "Return Confirmed ✓",
          body: `${name} return has been confirmed.`,
          href: "/renter-dashboard",
          createdAt: b.returnedAt.toISOString(),
        });
      }
    }
  }

  // ── OWNER notifications ──────────────────────────────────────────────────
  if (me.role === "OWNER") {
    const requests = await db.booking.findMany({
      where: {
        vehicle: { ownerId: me.id },
        status: "PENDING",
        createdAt: { gte: since },
      },
      include: {
        vehicle: { select: { brand: true, model: true } },
        renter: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    for (const b of requests) {
      notifications.push({
        id: `request-${b.id}`,
        type: "new_request",
        title: "New Booking Request 📋",
        body: `${b.renter.fullName} wants to rent your ${b.vehicle.brand} ${b.vehicle.model}.`,
        href: "/owner-dashboard",
        createdAt: b.createdAt.toISOString(),
      });
    }
  }

  // ── Unread direct messages (all roles) ───────────────────────────────────
  const unreadDMs = await db.directMessage.findMany({
    where: { toId: me.id, read: false, createdAt: { gte: since } },
    include: { from: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  for (const dm of unreadDMs) {
    notifications.push({
      id: `dm-${dm.id}`,
      type: "new_message",
      title: "New Message 💬",
      body: `${dm.from.fullName}: ${dm.body.slice(0, 60)}${dm.body.length > 60 ? "…" : ""}`,
      href: me.role === "ADMIN" ? `/admin/messages?with=${dm.fromId}` : me.role === "OWNER" ? "/owner-dashboard" : "/renter-dashboard",
      createdAt: dm.createdAt.toISOString(),
    });
  }

  // Sort newest first
  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ notifications: notifications.slice(0, 20) });
}
