'use client';

import dynamic from 'next/dynamic';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/context';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, MapPin, Bike, Car, Star, Navigation, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MobileExplorerTabBar } from '@/components/mobile-explorer-tab-bar';
import type { Map as LeafletMap } from 'leaflet';

// Dynamic import — Leaflet requires the browser DOM
const MapView = dynamic(
  () => import('@/components/map-view').then((m) => ({ default: m.MapView })),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-[#e8f4f0]" /> }
);

export default function Home() {
  const { vehicles, currentUser, authReady } = useApp();
  const router = useRouter();
  const leafletMapRef = useRef<LeafletMap | null>(null);

  // All hooks declared unconditionally before any conditional return
  const [filter, setFilter] = useState<'all' | 'bike' | 'car'>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v =>
      (filter === 'all' || v.type === filter) &&
      v.status === 'approved' &&
      (searchQuery === '' ||
        v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [vehicles, filter, searchQuery]);

  const selectedVehicle = useMemo(
    () => vehicles.find(v => v.id === selectedVehicleId),
    [vehicles, selectedVehicleId]
  );

  // Auth guard
  useEffect(() => {
    if (authReady && !currentUser) {
      router.replace('/login');
    }
  }, [authReady, currentUser, router]);

  if (!authReady || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  function handleNearMe() {
    if (!leafletMapRef.current) return;
    leafletMapRef.current.locate({ setView: true, maxZoom: 15 });
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Real Leaflet map — fills the entire main area */}
        <MapView
          vehicles={filteredVehicles}
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={setSelectedVehicleId}
          mapRef={leafletMapRef}
        />

        {/* Floating Search / Filter Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-border/60 bg-white/95 p-2 shadow-lg backdrop-blur-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search city, bike model..."
                className="h-10 border-none bg-transparent pl-9 text-sm focus-visible:ring-0"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-6 w-px bg-border/80" />
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 rounded-xl font-semibold text-primary hover:bg-primary/5"
              onClick={handleNearMe}
            >
              <Navigation size={14} /> Near me
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="pointer-events-auto mt-3 flex flex-wrap justify-center gap-2">
            {(['all', 'bike', 'car'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-md transition-all duration-200 active:scale-[0.98] ${
                  filter === f
                    ? 'bg-primary text-primary-foreground shadow-primary/25'
                    : 'bg-white/95 text-foreground shadow-sm hover:bg-muted/80'
                }`}
              >
                {f === 'bike' && <Bike size={13} />}
                {f === 'car' && <Car size={13} />}
                {f === 'all' ? 'All Vehicles' : f === 'bike' ? 'Bikes' : 'Cars'}
                {f !== 'all' && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    filter === f ? 'bg-white/20' : 'bg-muted'
                  }`}>
                    {filteredVehicles.filter(v => v.type === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-2 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-xl flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase">Available</p>
              <p className="text-base font-black">{filteredVehicles.filter(v => v.isAvailable).length} Vehicles</p>
            </div>
          </div>
        </div>

        {/* Selected Vehicle Bottom Sheet */}
        {selectedVehicle ? (
          <div className="absolute bottom-[5.75rem] md:bottom-6 left-0 w-full px-4 z-40 animate-in slide-in-from-bottom duration-300">
            <Card className="max-w-lg mx-auto p-4 rounded-3xl shadow-2xl border-none relative overflow-hidden">
              <button
                onClick={() => setSelectedVehicleId(null)}
                className="absolute top-3 right-3 w-7 h-7 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X size={14} />
              </button>
              <div className="flex gap-4">
                <div className="w-28 h-28 rounded-2xl overflow-hidden relative shrink-0">
                  <Image src={selectedVehicle.image} alt={selectedVehicle.model} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1 pr-6">
                    <h3 className="text-lg font-black truncate">{selectedVehicle.brand} {selectedVehicle.model}</h3>
                  </div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold text-amber-700">{selectedVehicle.rating || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={11} className="text-primary" /> {selectedVehicle.location}
                    </div>
                    {selectedVehicle.isOnRental ? (
                      <Badge className="bg-orange-100 text-orange-700 border-none text-[10px] font-black">🔴 On Rental</Badge>
                    ) : selectedVehicle.isAvailable ? (
                      <Badge className="bg-green-100 text-green-700 border-none text-[10px] font-black">Available</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-none text-[10px] font-black">Unavailable</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedVehicle.features.slice(0, 3).map(f => (
                      <span key={f} className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold">{f}</span>
                    ))}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xl font-black text-primary">৳{selectedVehicle.priceDaily.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ day</span>
                    </div>
                    {selectedVehicle.isOnRental ? (
                      <div className="text-right">
                        <Button
                          size="sm"
                          className="rounded-xl font-black px-5 opacity-50 cursor-not-allowed"
                          disabled
                        >
                          On Rental
                        </Button>
                        <p className="text-[10px] text-muted-foreground mt-1">Currently unavailable</p>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="rounded-xl font-black px-5 shadow-lg shadow-primary/20"
                        onClick={() => router.push(`/vehicle/${selectedVehicle.id}`)}
                      >
                        Book Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Vehicle list mini strip when nothing selected */
          <div className="absolute bottom-[5.75rem] md:bottom-6 left-0 w-full px-3 z-30">
            <div className="max-w-full overflow-x-auto">
              <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                {filteredVehicles.slice(0, 6).map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`bg-white rounded-2xl p-3 shadow-xl transition-all flex items-center gap-3 border relative overflow-hidden ${
                      v.isOnRental
                        ? 'opacity-60 border-orange-200 cursor-pointer'
                        : 'hover:shadow-2xl hover:scale-105 border-border/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0">
                      <Image src={v.image} alt={v.model} fill className="object-cover" />
                      {v.isOnRental && (
                        <div className="absolute inset-0 bg-orange-500/40 flex items-center justify-center">
                          <span className="text-[8px] font-black text-white bg-orange-600 px-1 rounded">ON RENTAL</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm">{v.brand} {v.model}</p>
                      {v.isOnRental ? (
                        <p className="text-[10px] text-orange-600 font-black">Currently on rental</p>
                      ) : (
                        <p className="text-xs text-primary font-black">৳{v.priceDaily.toLocaleString()}<span className="text-muted-foreground font-medium">/day</span></p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <MobileExplorerTabBar />
      </main>
    </div>
  );
}
