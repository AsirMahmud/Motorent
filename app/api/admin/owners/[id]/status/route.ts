import { NextResponse } from "next/server";
import { VerificationStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mail";

type StatusBody = {
  status?: VerificationStatus;
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

  const existing = await db.user.findFirst({
    where: { id, role: "OWNER" },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  const user = await db.user.update({
    where: { id },
    data: {
      verificationStatus: body.status,
      verificationNote: body.note,
      verificationReviewedAt: new Date(),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      verificationStatus: true,
    },
  });

  let emailSent = false;
  if (user.verificationStatus !== "PENDING") {
    const subject =
      user.verificationStatus === "APPROVED"
        ? "Your MotoRent owner verification was approved"
        : "Update on your MotoRent owner verification";
    const text =
      user.verificationStatus === "APPROVED"
        ? `Hi ${user.fullName},\n\nYour owner account has been approved. You can sign in and list vehicles.\n\n— MotoRent`
        : `Hi ${user.fullName},\n\nYour owner verification was not approved.${body.note ? `\n\nNote from admin: ${body.note}` : ""}\n\n— MotoRent`;
    const result = await sendMail({ to: user.email, subject, text });
    emailSent = result.sent;
  }

  return NextResponse.json({
    message: `Owner status updated to ${user.verificationStatus}`,
    user,
    emailSent,
  });
}
