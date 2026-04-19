import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getPusherServer } from "@/lib/server/pusher";

/**
 * Receives the caller's GPS coordinates and broadcasts them on the
 * presence-map channel so other users can see a live location dot.
 */
export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { lat?: number; lng?: number };
  if (typeof body.lat !== "number" || typeof body.lng !== "number") {
    return NextResponse.json({ error: "lat and lng are required numbers" }, { status: 400 });
  }

  const pusher = getPusherServer();
  if (pusher) {
    await pusher
      .trigger("presence-map", "client-location", {
        userId: user.id,
        lat: body.lat,
        lng: body.lng,
      })
      .catch(() => {/* non-fatal */});
  }

  return NextResponse.json({ ok: true });
}
