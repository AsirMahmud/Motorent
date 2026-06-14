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

function createVehicleMarkerHtml(vehicle: Vehicle, isSelected: boolean) {
  const vehicleIcon = vehicle.type === 'bike'
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.5" cy="16.5" r="3" /><circle cx="18.5" cy="16.5" r="3" /><path d="M18.5 16.5L16 8.5M16 8.5L14 5.5M16 8.5h-2.5" /><path d="M5.5 16.5h3.5l3-5.5h4L18.5 16.5" /><path d="M6 13.5c1.5-2 4-2.5 6-1.5M7.5 11h3.5" /></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 15h3.5a2.5 2.5 0 0 1 4 0h5a2.5 2.5 0 0 1 4 0H22v-2.5c0-1.2-.8-2.2-2-2.5l-3.5-1.5-3.5-2.5H8L5 8.5c-1 .5-1.8 1.5-1.8 2.8V15z" /><circle cx="7.5" cy="15" r="2" /><circle cx="16.5" cy="15" r="2" /><path d="M8.5 7h4l2 2.5H6.5L8.5 7z" /></svg>`;

  return `
    <div class="motorent-marker ${isSelected ? 'is-selected' : ''} ${vehicle.type === 'bike' ? 'is-bike' : 'is-car'} ${vehicle.isAvailable ? '' : 'is-unavailable'}">
      <span class="motorent-marker-icon">
        ${vehicleIcon}
      </span>
      <span class="motorent-marker-price">&#2547;${vehicle.priceDaily.toLocaleString()}</span>
      <span class="motorent-marker-tip"></span>
    </div>`;
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

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: DHAKA_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

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

        const icon = L.divIcon({
          className: 'motorent-marker-shell',
          html: createVehicleMarkerHtml(v, isSelected),
          iconSize: [0, 0],
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
    <div
      ref={containerRef}
      className="motorent-map absolute inset-0 z-0 bg-[linear-gradient(135deg,#e8f4f0_0%,#dde9f5_50%,#e5ede8_100%)]"
    />
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
