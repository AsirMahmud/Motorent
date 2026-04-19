import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

/**
 * GET /api/direct-messages
 * Returns the current user's inbox: one entry per conversation partner,
 * showing the latest message, unread count, and partner info.
 */
export async function GET() {
  const me = await requireAuth();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all messages involving the current user
  const msgs = await db.directMessage.findMany({
    where: { OR: [{ fromId: me.id }, { toId: me.id }] },
    include: {
      from: { select: { id: true, fullName: true, role: true } },
      to:   { select: { id: true, fullName: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by conversation partner
  const convMap = new Map<string, {
    partner: { id: string; fullName: string; role: string };
    lastMessage: (typeof msgs)[0];
    unread: number;
  }>();

  for (const m of msgs) {
    const partner = m.fromId === me.id ? m.to : m.from;
    if (!convMap.has(partner.id)) {
      convMap.set(partner.id, { partner, lastMessage: m, unread: 0 });
    }
    if (!m.read && m.toId === me.id) {
      convMap.get(partner.id)!.unread++;
    }
  }

  const conversations = Array.from(convMap.values()).sort(
    (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
  );

  return NextResponse.json({ conversations });
}

/**
 * POST /api/direct-messages
 * Send a new direct message. Body: { toId, body }
 */
export async function POST(request: Request) {
  const me = await requireAuth();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { toId?: string; body?: string };
  if (!body.toId || !body.body?.trim()) {
    return NextResponse.json({ error: "toId and body are required" }, { status: 400 });
  }

  const recipient = await db.user.findUnique({ where: { id: body.toId }, select: { id: true } });
  if (!recipient) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  if (body.toId === me.id) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  const message = await db.directMessage.create({
    data: { fromId: me.id, toId: body.toId, body: body.body.trim() },
    include: {
      from: { select: { id: true, fullName: true, role: true } },
      to:   { select: { id: true, fullName: true, role: true } },
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
