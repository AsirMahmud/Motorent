import Pusher from "pusher";

let _pusher: Pusher | null = null;

/**
 * Returns a singleton Pusher server instance.
 * Returns null if the required env vars are not set (graceful no-op).
 */
export function getPusherServer(): Pusher | null {
  if (_pusher) return _pusher;

  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    return null;
  }

  _pusher = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });

  return _pusher;
}
