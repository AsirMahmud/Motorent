'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapView } from '@/components/map-view';
import { useApp } from '@/lib/context';
import { useState, useMemo, useRef } from 'react';
import { Search, MapPin, Bike, Car, Star, Navigation, Shield, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { vehicles, currentUser, authReady } = useApp();
  const router = useRouter();
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const [filter, setFilter] = useState<'all' | 'bike' | 'car'>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v =>
      (filter === 'all' || v.type === filter) &&
      v.status === 'approved' &&
      (searchQuery === '' || v.brand.toLowerCase().includes(searchQuery.toLowerCase()) || v.model.toLowerCase().includes(searchQuery.toLowerCase()) || v.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [vehicles, filter, searchQuery]);

  const selectedVehicle = useMemo(() => vehicles.find(v => v.id === selectedVehicleId), [vehicles, selectedVehicleId]);

  // Auth guard — redirect to login once auth state is known
  // Show a loading state while we wait for auth check
  if (!authReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  const findNearMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.setView([coords.latitude, coords.longitude], 14);
      },
      () => {
        mapRef.current?.setView([23.8103, 90.4125], 12);
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 12_000 }
    );
  };

  return (
    <div className="h-screen bg-background flex flex-col font-sans overflow-hidden">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        <MapView
          vehicles={filteredVehicles}
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={setSelectedVehicleId}
          mapRef={mapRef}
        />

        {/* Floating Search / Filter Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40">
          <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/50">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search city, bike model..."
                className="pl-9 h-10 border-none bg-transparent focus-visible:ring-0 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-6 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1.5 text-primary font-bold shrink-0"
              onClick={findNearMe}
            >
              <Navigation size={14} /> Near Me
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 mt-3 justify-center flex-wrap">
            {(['all', 'bike', 'car'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black shadow-lg transition-all ${filter === f ? 'bg-primary text-white scale-105 shadow-primary/30' : 'bg-white text-foreground hover:bg-muted'
                  }`}
              >
                {f === 'bike' && <Bike size={13} />}
                {f === 'car' && <Car size={13} />}
                {f === 'all' ? 'All Vehicles' : f === 'bike' ? 'Bikes' : 'Cars'}
                {f !== 'all' && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-black ${filter === f ? 'bg-white/20' : 'bg-muted'}`}>
                    {filteredVehicles.filter(v => v.type === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
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
          <div className="absolute bottom-20 md:bottom-6 left-0 w-full px-4 z-40 animate-in slide-in-from-bottom duration-300">
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
                      <span className="text-xs font-bold text-amber-700">{selectedVehicle.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={11} className="text-primary" /> {selectedVehicle.location}
                    </div>
                    {selectedVehicle.isAvailable ? (
                      <Badge className="bg-green-100 text-green-700 border-none text-[10px] font-black">Available</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-none text-[10px] font-black">In Use</Badge>
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
                    <Button
                      size="sm"
                      className="rounded-xl font-black px-5 shadow-lg shadow-primary/20"
                      onClick={() => router.push(`/vehicle/${selectedVehicle.id}`)}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Vehicle list mini strip when nothing selected */
          <div className="absolute bottom-20 md:bottom-6 left-0 w-full px-3 z-30">
            <div className="max-w-full overflow-x-auto">
              <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                {filteredVehicles.slice(0, 6).map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className="bg-white rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-3 border border-border/50"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0">
                      <Image src={v.image} alt={v.model} fill className="object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm">{v.brand} {v.model}</p>
                      <p className="text-xs text-primary font-black">৳{v.priceDaily.toLocaleString()}<span className="text-muted-foreground font-medium">/day</span></p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Nav */}
        <footer className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t px-6 py-2 flex justify-around items-center z-50 md:hidden">
          {[
            { icon: MapPin, label: 'Explore', active: true, href: '/home' },
            { icon: Search, label: 'Browse', active: false, href: '/browse' },
            { icon: Car, label: 'Bookings', active: false, href: currentUser ? '/renter-dashboard' : '/login' },
            { icon: Shield, label: 'Profile', active: false, href: currentUser ? (currentUser.role === 'admin' ? '/admin' : currentUser.role === 'owner' ? '/owner-dashboard' : '/renter-dashboard') : '/login' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-1 transition-colors ${item.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
        </footer>
      </main>
    </div>
  );
}
