import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

/**
 * GET /api/direct-messages/[userId]
 * Returns the full message thread between the current user and userId.
 * Also marks all unread messages from userId as read.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const me = await requireAuth();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;

  // Mark incoming messages as read
  await db.directMessage.updateMany({
    where: { fromId: userId, toId: me.id, read: false },
    data: { read: true },
  });

  const messages = await db.directMessage.findMany({
    where: {
      OR: [
        { fromId: me.id, toId: userId },
        { fromId: userId, toId: me.id },
      ],
    },
    include: {
      from: { select: { id: true, fullName: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const partner = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, role: true, email: true },
  });

  return NextResponse.json({ messages, partner });
}
