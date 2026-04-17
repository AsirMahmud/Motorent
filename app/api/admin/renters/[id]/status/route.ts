import { NextResponse } from "next/server";
import { VerificationStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mail";

type StatusBody = { status?: VerificationStatus; note?: string };

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await request.json()) as StatusBody;

  if (!body.status || !["APPROVED", "REJECTED", "PENDING"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await db.user.findFirst({
    where: { id, role: "GENERAL" },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Renter not found" }, { status: 404 });
  }

  const renter = await db.user.update({
    where: { id },
    data: {
      verificationStatus: body.status,
      verificationNote: body.note ?? null,
      verificationReviewedAt: new Date(),
    },
    select: { id: true, fullName: true, email: true, verificationStatus: true },
  });

  let emailSent = false;
  if (renter.verificationStatus !== "PENDING") {
    const approved = renter.verificationStatus === "APPROVED";
    const result = await sendMail({
      to: renter.email,
      subject: approved
        ? "Your MotoRent KYC was approved — you can now book vehicles!"
        : "Update on your MotoRent KYC verification",
      text: approved
        ? `Hi ${renter.fullName},\n\nCongratulations! Your identity documents have been verified and approved.\n\nYou can now log in to MotoRent and start booking vehicles.\n\n— MotoRent Team`
        : `Hi ${renter.fullName},\n\nWe were unable to approve your identity verification.${body.note ? `\n\nReason: ${body.note}` : ""}\n\nPlease resubmit clear photos of your NID and driving license by visiting your dashboard.\n\n— MotoRent Team`,
    });
    emailSent = result.sent;
  }

  return NextResponse.json({
    message: `Renter status updated to ${renter.verificationStatus}`,
    renter,
    emailSent,
  });
}
