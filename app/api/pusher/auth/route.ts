import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getPusherServer } from "@/lib/server/pusher";

/**
 * Pusher presence-channel auth endpoint.
 * Called automatically by pusher-js when a client tries to subscribe to a
 * presence-* or private-* channel.
 */
export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pusher = getPusherServer();
  if (!pusher) {
    return NextResponse.json({ error: "Pusher not configured" }, { status: 503 });
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channel = params.get("channel_name");

  if (!socketId || !channel) {
    return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
  }

  const authResponse = pusher.authorizeChannel(socketId, channel, {
    user_id: user.id,
    user_info: {
      name: user.fullName,
      role: user.role,
    },
  });

  return NextResponse.json(authResponse);
}
