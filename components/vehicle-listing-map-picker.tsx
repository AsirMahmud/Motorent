'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LocateFixed, MapPin, Trash2 } from 'lucide-react';

const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];
const DEFAULT_ZOOM = 13;

export type MapPickerCoords = { lat: number; lng: number };

type VehicleListingMapPickerProps = {
  value: MapPickerCoords | null;
  onChange: (next: MapPickerCoords | null) => void;
  disabled?: boolean;
};

export function VehicleListingMapPicker({
  value,
  onChange,
  disabled = false,
}: VehicleListingMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const markerRef = useRef<import('leaflet').Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const placeOrMoveMarker = useCallback(
    (lat: number, lng: number, pan: boolean) => {
      const L = leafletRef.current;
      const map = mapRef.current;
      if (!L || !map) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const icon = L.divIcon({
          className: '',
          html: `<div style="
              width:28px;height:28px;
              background:#ED6140;border:3px solid #fff;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              box-shadow:0 2px 8px rgba(0,0,0,0.25);
              margin-top:-8px;margin-left:-8px;
            "></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        markerRef.current = L.marker([lat, lng], { icon, draggable: !disabledRef.current })
          .addTo(map)
          .on('dragend', (e: import('leaflet').DragEndEvent) => {
            const ll = (e.target as import('leaflet').Marker).getLatLng();
            onChangeRef.current({ lat: ll.lat, lng: ll.lng });
          });
      }
      if (pan) map.setView([lat, lng], Math.max(map.getZoom(), 14));
    },
    [disabled]
  );

  const placeOrMoveMarkerRef = useRef(placeOrMoveMarker);
  placeOrMoveMarkerRef.current = placeOrMoveMarker;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default as typeof import('leaflet');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (cancelled || !containerRef.current) return;

      leafletRef.current = L;
      const start: [number, number] = value ? [value.lat, value.lng] : DHAKA_CENTER;
      const map = L.map(containerRef.current, {
        center: start,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      map.on('click', (e) => {
        if (disabledRef.current) return;
        const { lat, lng } = e.latlng;
        onChangeRef.current({ lat, lng });
        placeOrMoveMarkerRef.current(lat, lng, false);
      });

      setMapReady(true);

      if (value) {
        placeOrMoveMarkerRef.current(value.lat, value.lng, false);
      }
    })();

    return () => {
      cancelled = true;
      setMapReady(false);
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map init once
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;

    if (value == null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    placeOrMoveMarker(value.lat, value.lng, false);
  }, [value, mapReady, placeOrMoveMarker]);

  const useMyLocation = () => {
    if (disabled || typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChange({ lat, lng });
        placeOrMoveMarker(lat, lng, true);
      },
      () => {
        /* permission denied or error */
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 12_000 }
    );
  };

  return (
    <div className="space-y-3">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={containerRef}
        className="relative z-0 h-56 w-full overflow-hidden rounded-xl border border-border bg-muted/30 sm:h-72"
        aria-label="Map: tap to set listing location"
        role="application"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs text-muted-foreground sm:max-w-[70%]">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Tap the map to drop a pin (drag to adjust). Renters see your vehicle at this spot on Explore. If you skip this,
          we estimate from the address field above.
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-lg font-medium"
            disabled={disabled}
            onClick={useMyLocation}
          >
            <LocateFixed className="mr-1.5 h-4 w-4" />
            My location
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 rounded-lg font-medium text-muted-foreground"
            disabled={disabled || !value}
            onClick={() => onChange(null)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Clear pin
          </Button>
        </div>
      </div>
    </div>
  );
}
