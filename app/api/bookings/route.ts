import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mail";

function daysBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  const d = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, d);
}

const bookingInclude = {
  vehicle: {
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      dailyRate: true,
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
      verificationStatus: true,
    },
  },
} as const;

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "owner") {
    if (user.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const bookings = await db.booking.findMany({
      where: { vehicle: { ownerId: user.id } },
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  }

  if (scope === "renter") {
    const bookings = await db.booking.findMany({
      where: { renterId: user.id },
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  }

  return NextResponse.json(
    { error: "Missing or invalid scope (owner | renter)" },
    { status: 400 }
  );
}

type PostBody = {
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
  pickupTime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  notes?: string;
};

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "Admins cannot create bookings" }, { status: 403 });
  }

  // Only GENERAL (renter) accounts require KYC approval before booking
  if (user.role === "GENERAL" && user.verificationStatus !== "APPROVED") {
    const hasSubmittedDocs = Boolean(user.nidOrPassportUrl || user.drivingLicenseUrl);
    return NextResponse.json(
      {
        error:
          user.verificationStatus === "PENDING" && hasSubmittedDocs
            ? "Your KYC is under review. You can book once admin approves your documents."
            : user.verificationStatus === "REJECTED"
              ? "Your KYC was rejected. Please resubmit your documents for review."
              : "Please submit your NID and driving license so an admin can approve your account before booking.",
        verificationStatus: user.verificationStatus,
      },
      { status: 403 }
    );
  }

  const body = (await request.json()) as PostBody;
  if (!body.vehicleId || !body.startDate || !body.endDate) {
    return NextResponse.json(
      { error: "vehicleId, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  const start = new Date(body.startDate);
  const end = new Date(body.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const vehicle = await db.vehicle.findFirst({
    where: { id: body.vehicleId, status: "APPROVED", isActive: true },
  });

  if (!vehicle) {
    return NextResponse.json(
      { error: "Vehicle not found or not available for booking" },
      { status: 404 }
    );
  }

  if (vehicle.ownerId === user.id) {
    return NextResponse.json(
      { error: "You cannot book your own vehicle" },
      { status: 400 }
    );
  }

  // Block if the vehicle is currently on an active rental
  const activeRental = await db.booking.findFirst({
    where: { vehicleId: vehicle.id, status: "ACCEPTED", returnedAt: null },
    select: { id: true, endDate: true },
  });
  if (activeRental) {
    return NextResponse.json(
      {
        error: `This vehicle is currently on an active rental and is unavailable until ${new Date(activeRental.endDate).toLocaleDateString()}.`,
      },
      { status: 409 }
    );
  }

  const days = daysBetween(start, end);
  const totalPrice = days * vehicle.dailyRate;

  const booking = await db.booking.create({
    data: {
      vehicleId: vehicle.id,
      renterId: user.id,
      startDate: start,
      endDate: end,
      pickupTime: body.pickupTime,
      totalPrice,
      status: "PENDING",
      pickupLocation: body.pickupLocation?.trim() || "As agreed with owner",
      dropoffLocation: body.dropoffLocation?.trim(),
      notes: body.notes?.trim(),
    },
    include: {
      ...bookingInclude,
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          year: true,
          dailyRate: true,
          vehiclePhotoUrl: true,
          ownerId: true,
          owner: { select: { fullName: true, email: true } },
        },
      },
    },
  });

  // Email owner about new booking request
  if (booking.vehicle.owner) {
    await sendMail({
      to: booking.vehicle.owner.email,
      subject: `New booking request — ${vehicle.brand} ${vehicle.model}`,
      text: `Hi ${booking.vehicle.owner.fullName},\n\nYou have a new booking request for your ${vehicle.brand} ${vehicle.model}.\n\nRenter: ${booking.renter.fullName}\nPickup: ${booking.pickupLocation}\nFrom: ${start.toLocaleDateString()}\nTo: ${end.toLocaleDateString()}\nTotal: ৳${totalPrice.toLocaleString()}\n\nPlease log in to your owner dashboard to accept or reject this request.\n\n— MotoRent`,
    });
  }

  return NextResponse.json({ booking }, { status: 201 });
}
