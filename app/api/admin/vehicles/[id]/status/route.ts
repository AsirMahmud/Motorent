import { NextResponse } from "next/server";
import { VehicleStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mail";

type StatusBody = {
  status?: VehicleStatus;
  note?: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as StatusBody;

  if (!body.status || !["APPROVED", "REJECTED", "PENDING"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const vehicle = await db.vehicle.update({
    where: { id },
    data: {
      status: body.status,
      reviewNote: body.note,
      reviewedAt: new Date(),
    },
    select: {
      id: true,
      brand: true,
      model: true,
      status: true,
      owner: {
        select: {
          email: true,
        },
      },
    },
  });

  let emailSent = false;
  if (vehicle.status !== "PENDING") {
    const subject =
      vehicle.status === "APPROVED"
        ? `Vehicle approved: ${vehicle.brand} ${vehicle.model}`
        : `Vehicle review: ${vehicle.brand} ${vehicle.model}`;
    const text =
      vehicle.status === "APPROVED"
        ? `Your vehicle ${vehicle.brand} ${vehicle.model} has been approved and can go live according to your listing settings.\n\n— MotoRent`
        : `Your vehicle ${vehicle.brand} ${vehicle.model} was not approved.${body.note ? `\n\nNote: ${body.note}` : ""}\n\n— MotoRent`;
    const result = await sendMail({ to: vehicle.owner.email, subject, text });
    emailSent = result.sent;
  }

  return NextResponse.json({
    message: `Vehicle status updated to ${vehicle.status}`,
    vehicle,
    emailSent,
  });
}
