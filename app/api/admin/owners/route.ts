import { NextResponse } from "next/server";
import { VerificationStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as VerificationStatus | null;

  const where = {
    role: "OWNER" as const,
    ...(status && ["PENDING", "APPROVED", "REJECTED"].includes(status)
      ? { verificationStatus: status }
      : {}),
  };

  const owners = await db.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      verificationStatus: true,
      verificationNote: true,
      verificationReviewedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { vehicles: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ owners });
}
