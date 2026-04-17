import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const vehicles = await db.vehicle.findMany({
    where: { status: "PENDING" },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ vehicles });
}
