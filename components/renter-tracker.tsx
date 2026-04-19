'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RenterTrackerProps {
  bookingId: string;
  renterName: string;
  initialLat?: number;
  initialLng?: number;
  initialLocAt?: Date;
}

const POLL_INTERVAL = 10_000; // auto-refresh every 10 s without Pusher

export function RenterTracker({
  bookingId,
  renterName,
  initialLat,
  initialLng,
  initialLocAt,
}: RenterTrackerProps) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState<number | null>(initialLat ?? null);
  const [lng, setLng] = useState<number | null>(initialLng ?? null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(initialLocAt ?? null);
  const [live, setLive] = useState(false);
  const [polling, setPolling] = useState(false);
  const [ago, setAgo] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const pusherRef = useRef<import('pusher-js').default | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Latest coords for map init race: state may update before mapRef is set. */
  const coordsRef = useRef({ lat, lng });
  coordsRef.current = { lat, lng };

  // ── fetch latest location from DB ───────────────────────────────────────
  const fetchLocation = useCallback(async (silent = false) => {
    if (!silent) setPolling(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { credentials: 'same-origin' });
      if (!res.ok) return;
      const data = (await res.json()) as {
        booking: { renterLat?: number | null; renterLng?: number | null; renterLocUpdatedAt?: string | null };
      };
      if (data.booking.renterLat != null && data.booking.renterLng != null) {
        setLat(data.booking.renterLat);
        setLng(data.booking.renterLng);
        setUpdatedAt(data.booking.renterLocUpdatedAt ? new Date(data.booking.renterLocUpdatedAt) : null);
      }
    } catch { /* ignore */ }
    finally { if (!silent) setPolling(false); }
  }, [bookingId]);

  // ── "X ago" ticker ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!updatedAt) { setAgo(''); return; }
    const tick = () => {
      const s = Math.floor((Date.now() - updatedAt.getTime()) / 1000);
      if (s < 60) setAgo(`${s}s ago`);
      else if (s < 3600) setAgo(`${Math.floor(s / 60)}m ago`);
      else setAgo(`${Math.floor(s / 3600)}h ago`);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [updatedAt]);

  // ── init map when panel opens ────────────────────────────────────────────
  useEffect(() => {
    if (!open || !mapContainerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      // Fetch fresh location before map loads
      await fetchLocation(true);

      const L = (await import('leaflet')).default;
      if (cancelled || !mapContainerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const { lat: la0, lng: ln0 } = coordsRef.current;
      const center: [number, number] = la0 != null && ln0 != null ? [la0, ln0] : [23.8103, 90.4125];
      const map = L.map(mapContainerRef.current, { center, zoom: 15, zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      const { lat: la, lng: ln } = coordsRef.current;
      if (la != null && ln != null) {
        placeOrMoveMarker(L, map, la, ln);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function placeOrMoveMarker(L: typeof import('leaflet'), map: import('leaflet').Map, la: number, ln: number) {
    const icon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:24px;height:24px;">
          <div style="position:absolute;inset:0;background:rgba(237,97,64,.25);border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite;"></div>
          <div style="position:absolute;inset:3px;background:#ED6140;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.25);"></div>
        </div>
        <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    if (markerRef.current) {
      markerRef.current.setLatLng([la, ln]);
      map.panTo([la, ln]);
    } else {
      markerRef.current = L.marker([la, ln], { icon })
        .addTo(map)
        .bindPopup(`<strong>${renterName}</strong><br/>Live location`)
        .openPopup();
    }
  }

  // ── update marker when lat/lng state changes ─────────────────────────────
  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null) return;
    import('leaflet').then(({ default: L }) => {
      placeOrMoveMarker(L, mapRef.current!, lat, lng);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  // ── Pusher (optional) + DB poll while open (poll always: fixes half-configured Pusher and races) ──
  useEffect(() => {
    if (!open) return;

    pollRef.current = setInterval(() => fetchLocation(true), POLL_INTERVAL);

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    let mounted = true;
    if (key && cluster) {
      (async () => {
        const PusherClient = (await import('pusher-js')).default;
        if (!mounted) return;
        const pusher = new PusherClient(key, { cluster, authEndpoint: '/api/pusher/auth' });
        pusherRef.current = pusher;
        const channel = pusher.subscribe(`booking-${bookingId}`);
        channel.bind('renter-location', (data: { lat: number; lng: number; updatedAt: string }) => {
          setLat(data.lat);
          setLng(data.lng);
          setUpdatedAt(new Date(data.updatedAt));
          setLive(true);
        });
      })();
    }

    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      pusherRef.current?.unsubscribe(`booking-${bookingId}`);
      pusherRef.current?.disconnect();
      pusherRef.current = null;
    };
  }, [open, bookingId, fetchLocation]);

  // ── destroy map when closed ───────────────────────────────────────────────
  useEffect(() => {
    if (!open && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
      setLive(false);
    }
  }, [open]);

  return (
    <div className="rounded-2xl border border-blue-200 overflow-hidden bg-white">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-black text-blue-700">
          <MapPin size={15} />
          Track {renterName}
          {lat != null ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
              {live ? <Wifi size={9} /> : <Clock size={9} />}
              {live ? 'Live' : 'GPS active'}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              <WifiOff size={9} /> No location yet
            </span>
          )}
        </div>
        <span className="text-xs text-blue-500 font-bold">{open ? '▲ Hide' : '▼ Show map'}</span>
      </button>

      {open && (
        <>
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 border-b border-blue-100">
            {lat != null ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-bold">
                  {renterName} · {updatedAt ? `Updated ${ago}` : 'Location received'}
                </span>
                <span className="text-[10px] opacity-50 font-mono">
                  {lat.toFixed(5)}, {lng?.toFixed(5)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Waiting for renter to share location…
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-blue-600 hover:text-blue-700"
              onClick={() => fetchLocation(false)}
              disabled={polling}
            >
              <RefreshCw size={11} className={polling ? 'animate-spin' : ''} />
              {polling ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>

          {/* Map */}
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <div ref={mapContainerRef} style={{ height: 280 }} />

          {/* Bottom hint */}
          <div className="px-4 py-2 bg-muted/30 border-t border-border/40 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            {process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? (
              <><Wifi size={10} className="text-green-500" /> Pusher + DB refresh every 10 s</>
            ) : (
              <><RefreshCw size={10} /> Auto-refreshing every 10 s</>
            )}
          </div>
        </>
      )}
    </div>
  );
}
