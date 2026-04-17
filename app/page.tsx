'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/context';
import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Bike, Car, Star, Navigation, Shield, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { vehicles, currentUser, authReady } = useApp();
  const router = useRouter();

  // Auth guard — redirect to login once auth state is known
  useEffect(() => {
    if (authReady && !currentUser) {
      router.replace('/login');
    }
  }, [authReady, currentUser, router]);

  // Show a loading state while we wait for auth check
  if (!authReady || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
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

  // Map marker positions (simulate for demo)
  const markerPositions = useMemo(() => {
    return filteredVehicles.map((v, i) => ({
      ...v,
      top: `${20 + (i % 4) * 18 + Math.sin(i) * 5}%`,
      left: `${15 + (i % 5) * 16 + Math.cos(i) * 4}%`,
    }));
  }, [filteredVehicles]);

  return (
    <div className="h-screen bg-background flex flex-col font-sans overflow-hidden">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8f4f0 0%, #dde9f5 50%, #e5ede8 100%)' }}>
          {/* Grid pattern for map-like feel */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `repeating-linear-gradient(0deg, #94a3b8 0px, transparent 1px, transparent 60px, #94a3b8 60px),
              repeating-linear-gradient(90deg, #94a3b8 0px, transparent 1px, transparent 60px, #94a3b8 60px)`,
          }} />
          {/* Road-like lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-[30%] left-0 right-0 h-8 bg-gray-400 rounded" style={{ transform: 'rotate(-2deg)' }} />
            <div className="absolute top-[55%] left-0 right-0 h-12 bg-gray-400 rounded" style={{ transform: 'rotate(1deg)' }} />
            <div className="absolute top-0 bottom-0 left-[25%] w-10 bg-gray-400 rounded" style={{ transform: 'rotate(-1deg)' }} />
            <div className="absolute top-0 bottom-0 left-[60%] w-8 bg-gray-400 rounded" />
          </div>
          {/* Area blocks */}
          <div className="absolute top-[15%] left-[30%] w-32 h-20 bg-green-200/40 rounded-xl border border-green-300/30" />
          <div className="absolute top-[40%] left-[55%] w-24 h-16 bg-blue-200/30 rounded-xl border border-blue-300/30" />
          <div className="absolute top-[60%] left-[10%] w-28 h-20 bg-amber-100/40 rounded-xl border border-amber-300/30" />
          <div className="absolute top-[20%] left-[65%] w-36 h-24 bg-purple-100/30 rounded-xl border border-purple-300/30" />
        </div>

        {/* Vehicle Markers */}
        {markerPositions.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => setSelectedVehicleId(selectedVehicleId === vehicle.id ? null : vehicle.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20 ${selectedVehicleId === vehicle.id ? 'scale-125 z-50' : 'scale-100 hover:scale-110'
              }`}
            style={{ top: vehicle.top, left: vehicle.left }}
          >
            <div className={`relative p-2.5 rounded-2xl shadow-xl border-2 ${selectedVehicleId === vehicle.id
              ? 'bg-primary border-white'
              : vehicle.isAvailable ? 'bg-white border-primary' : 'bg-gray-200 border-gray-400'
              }`}>
              {vehicle.type === 'bike'
                ? <Bike size={20} className={selectedVehicleId === vehicle.id ? 'text-white' : vehicle.isAvailable ? 'text-primary' : 'text-gray-500'} />
                : <Car size={20} className={selectedVehicleId === vehicle.id ? 'text-white' : vehicle.isAvailable ? 'text-primary' : 'text-gray-500'} />
              }
              {!vehicle.isAvailable && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className={`mt-1 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-md text-center ${selectedVehicleId === vehicle.id ? 'bg-primary text-white' : 'bg-white text-foreground'
              }`}>
              ৳{vehicle.priceDaily.toLocaleString()}
            </div>
          </button>
        ))}

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
            <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-primary font-bold shrink-0">
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
            { icon: MapPin, label: 'Explore', active: true, href: '/' },
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
