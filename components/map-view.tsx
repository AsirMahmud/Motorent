'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Vehicle } from '@/lib/types';

// Dhaka bounding box used as the default view when no GPS is available
const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];
const DEFAULT_ZOOM = 12;

interface MapViewProps {
  vehicles: Vehicle[];
  onVehicleSelect?: (vehicleId: string | null) => void;
  selectedVehicleId?: string | null;
  /** Expose a ref so the parent can call flyTo / locate */
  mapRef?: React.MutableRefObject<import('leaflet').Map | null>;
}

/** Spread vehicles that share the same coordinates slightly so markers don't stack. */
function jitterCoords(
  lat: number,
  lng: number,
  index: number,
  total: number
): [number, number] {
  if (total <= 1) return [lat, lng];
  const angle = (2 * Math.PI * index) / total;
  const radius = 0.002;
  return [lat + Math.sin(angle) * radius, lng + Math.cos(angle) * radius];
}

export function MapView({
  vehicles,
  onVehicleSelect,
  selectedVehicleId,
  mapRef: externalMapRef,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalMapRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map());
  const userMarkerRef = useRef<import('leaflet').CircleMarker | null>(null);
  const presenceMarkersRef = useRef<Map<string, import('leaflet').CircleMarker>>(new Map());
  const watchIdRef = useRef<number | null>(null);
  const pusherRef = useRef<import('pusher-js').default | null>(null);

  const getMap = useCallback(() => internalMapRef.current, []);

  // Expose map to parent
  useEffect(() => {
    if (externalMapRef) {
      externalMapRef.current = internalMapRef.current;
    }
  });

  // Initialise Leaflet map once
  useEffect(() => {
    if (!containerRef.current || internalMapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: DHAKA_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      internalMapRef.current = map;
      if (externalMapRef) externalMapRef.current = map;
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Destroy map on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (pusherRef.current) pusherRef.current.disconnect();
      internalMapRef.current?.remove();
      internalMapRef.current = null;
    };
  }, []);

  // Sync vehicle markers whenever the vehicle list changes
  useEffect(() => {
    const map = getMap();
    if (!map) {
      // Map not ready yet — try again shortly
      const t = setTimeout(() => {
        syncVehicleMarkers();
      }, 300);
      return () => clearTimeout(t);
    }
    syncVehicleMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, selectedVehicleId]);

  function syncVehicleMarkers() {
    const map = internalMapRef.current;
    if (!map) return;

    import('leaflet').then(({ default: L }) => {
      const existingIds = new Set(markersRef.current.keys());

      // Group vehicles by coordinate key to detect stacking
      const coordGroups = new Map<string, Vehicle[]>();
      for (const v of vehicles) {
        const key = `${v.coordinates.lat.toFixed(4)},${v.coordinates.lng.toFixed(4)}`;
        const group = coordGroups.get(key) ?? [];
        group.push(v);
        coordGroups.set(key, group);
      }

      for (const v of vehicles) {
        existingIds.delete(v.id);
        const isSelected = v.id === selectedVehicleId;

        // Colour: primary orange when selected / available, grey when not available
        const bg = isSelected ? '#ED6140' : v.isAvailable ? '#ffffff' : '#d1d5db';
        const border = isSelected ? '#ffffff' : v.isAvailable ? '#ED6140' : '#9ca3af';
        const text = isSelected ? '#ffffff' : v.isAvailable ? '#ED6140' : '#6b7280';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              background:${bg};border:2.5px solid ${border};
              border-radius:12px;padding:5px 8px;
              box-shadow:0 2px 8px rgba(0,0,0,0.18);
              display:flex;align-items:center;gap:4px;
              font-family:var(--font-manrope),sans-serif;font-weight:700;
              font-size:11px;color:${text};white-space:nowrap;
              transition:all .2s;
              ${isSelected ? 'transform:scale(1.15);' : ''}
            ">
              ${v.type === 'bike'
                ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`
                : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
              }
              ৳${v.priceDaily.toLocaleString()}
            </div>`,
          iconAnchor: [0, 0],
        });

        const coordKey = `${v.coordinates.lat.toFixed(4)},${v.coordinates.lng.toFixed(4)}`;
        const group = coordGroups.get(coordKey) ?? [v];
        const indexInGroup = group.findIndex((g) => g.id === v.id);
        const [lat, lng] = jitterCoords(v.coordinates.lat, v.coordinates.lng, indexInGroup, group.length);

        const existing = markersRef.current.get(v.id);
        if (existing) {
          existing.setIcon(icon);
          existing.setLatLng([lat, lng]);
        } else {
          const marker = L.marker([lat, lng], { icon })
            .addTo(map)
            .on('click', () => onVehicleSelect?.(v.id));
          markersRef.current.set(v.id, marker);
        }
      }

      // Remove markers for vehicles no longer in the list
      for (const id of existingIds) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    });
  }

  // GPS: watch own location → blue pulsing dot
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    const startWatch = () => {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const map = internalMapRef.current;
          if (!map) return;

          import('leaflet').then(({ default: L }) => {
            const { latitude: lat, longitude: lng } = pos.coords;

            const icon = L.divIcon({
              className: '',
              html: `<div style="
                width:16px;height:16px;
                background:#3b82f6;border:3px solid #fff;
                border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,.3);
              "></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });

            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([lat, lng]);
            } else {
              userMarkerRef.current = L.circleMarker([lat, lng], {
                radius: 0,
                opacity: 0,
                fillOpacity: 0,
              }).addTo(map);

              // Replace with custom div icon using a real Marker
              const m = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(map);
              // Store in userMarkerRef as unknown cast
              (userMarkerRef as React.MutableRefObject<unknown>).current = m;
            }

            // Broadcast own location via Pusher if available
            broadcastLocation(lat, lng);
          });
        },
        null,
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    };

    // Delay slightly to let map initialise
    const t = setTimeout(startWatch, 800);
    return () => clearTimeout(t);
  }, []);

  // Pusher presence channel for other users' locations
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    let mounted = true;

    (async () => {
      const PusherClient = (await import('pusher-js')).default;
      if (!mounted) return;

      const pusher = new PusherClient(key, {
        cluster,
        authEndpoint: '/api/pusher/auth',
      });
      pusherRef.current = pusher;

      const channel = pusher.subscribe('presence-map');

      channel.bind('client-location', (data: { userId: string; lat: number; lng: number }) => {
        const map = internalMapRef.current;
        if (!map) return;

        import('leaflet').then(({ default: L }) => {
          const icon = L.divIcon({
            className: '',
            html: `<div style="
              width:12px;height:12px;
              background:#6b7280;border:2px solid #fff;
              border-radius:50%;
            "></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          const existing = presenceMarkersRef.current.get(data.userId);
          if (existing) {
            existing.setLatLng([data.lat, data.lng]);
          } else {
            const m = L.marker([data.lat, data.lng], { icon }).addTo(map);
            (presenceMarkersRef.current as Map<string, unknown>).set(data.userId, m);
          }
        });
      });

      channel.bind('pusher:member_removed', (member: { id: string }) => {
        presenceMarkersRef.current.get(member.id)?.remove();
        presenceMarkersRef.current.delete(member.id);
      });
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        style={{ background: '#e8f4f0' }}
      />
    </>
  );
}

/** Trigger Pusher client event with own lat/lng (fire and forget). */
function broadcastLocation(lat: number, lng: number) {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  if (!key) return;
  // Use fetch to keep it simple — the Pusher channel handles the push
  fetch('/api/pusher/location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng }),
  }).catch(() => {/* ignore */});
}
