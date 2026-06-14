'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Filter,
  LayoutGrid,
  List,
  ListFilter,
  Map as MapIcon,
  MapPin,
  Navigation,
  Search,
  Sliders,
  Star,
  X,
} from 'lucide-react';
import { CarIcon, MotorcycleIcon } from '@/components/icons';
import { Header } from '@/components/header';
import { MapView } from '@/components/map-view';
import { MobileExplorerTabBar } from '@/components/mobile-explorer-tab-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTodayDate, getValidDateRange, withBookingDates } from '@/lib/booking-flow';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/types';

type BrowseView = 'map' | 'list';
type ListingView = 'grid' | 'list';
type TypeFilter = 'all' | 'bike' | 'car';

export default function BrowsePage() {
  const { vehicles, currentUser } = useApp();
  const router = useRouter();
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const [browseView, setBrowseView] = useState<BrowseView>('map');
  const [listingView, setListingView] = useState<ListingView>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [urlReady, setUrlReady] = useState(false);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setBrowseView(params.get('view') === 'list' ? 'list' : 'map');
      const type = params.get('type');
      setTypeFilter(type === 'bike' || type === 'car' ? type : 'all');
      const dates = getValidDateRange(params.get('start'), params.get('end'));
      setStartDate(dates.start);
      setEndDate(dates.end);
      setUrlReady(true);
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams(window.location.search);
    params.set('view', browseView);
    if (typeFilter === 'all') params.delete('type');
    else params.set('type', typeFilter);
    const dates = getValidDateRange(startDate, endDate);
    if (dates.start && dates.end) {
      params.set('start', dates.start);
      params.set('end', dates.end);
    } else {
      params.delete('start');
      params.delete('end');
    }
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    );
  }, [browseView, typeFilter, startDate, endDate, urlReady]);

  useEffect(() => {
    if (browseView !== 'map') return;
    const timer = window.setTimeout(() => mapRef.current?.invalidateSize(), 50);
    return () => window.clearTimeout(timer);
  }, [browseView]);

  const filteredVehicles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return vehicles
      .filter((vehicle) => {
        const matchesSearch =
          !query ||
          vehicle.brand.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.location.toLowerCase().includes(query);
        const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
        const matchesPrice =
          priceFilter === 'all' ||
          (priceFilter === 'budget' && vehicle.priceDaily < 1500) ||
          (priceFilter === 'mid' && vehicle.priceDaily >= 1500 && vehicle.priceDaily < 4000) ||
          (priceFilter === 'luxury' && vehicle.priceDaily >= 4000);
        return matchesSearch && matchesType && matchesPrice && vehicle.status === 'approved';
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.priceDaily - b.priceDaily;
        if (sortBy === 'price-high') return b.priceDaily - a.priceDaily;
        return b.rating - a.rating;
      });
  }, [vehicles, searchTerm, typeFilter, priceFilter, sortBy]);

  const selectedVehicle = useMemo(
    () => filteredVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [filteredVehicles, selectedVehicleId]
  );

  useEffect(() => {
    if (selectedVehicleId && !selectedVehicle) setSelectedVehicleId(null);
  }, [selectedVehicle, selectedVehicleId]);

  const openVehicle = (vehicleId: string) => {
    router.push(withBookingDates(`/vehicle/${vehicleId}`, startDate, endDate));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('rating');
    setTypeFilter('all');
    setPriceFilter('all');
    setStartDate('');
    setEndDate('');
    setSelectedVehicleId(null);
  };

  const handleStartDate = (value: string) => {
    setStartDate(value);
    if (!value || endDate <= value) setEndDate('');
  };

  const findNearMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => mapRef.current?.flyTo([coords.latitude, coords.longitude], 14),
      () => mapRef.current?.flyTo([23.8103, 90.4125], 12),
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 12_000 }
    );
  };

  const hasFilters =
    Boolean(searchTerm) ||
    typeFilter !== 'all' ||
    priceFilter !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className={cn('flex min-h-screen flex-col bg-[#F8FAFC] font-sans', currentUser && 'pb-24 md:pb-0')}>
      <Header />

      <section className="border-b bg-white py-6">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-primary">Browse vehicles</h1>
              <p className="text-sm text-muted-foreground">{filteredVehicles.length} vehicles available near you</p>
            </div>
            {browseView === 'list' && (
              <div className="flex items-center gap-2" aria-label="Listing layout">
                <button
                  type="button"
                  aria-label="Grid layout"
                  onClick={() => setListingView('grid')}
                  className={cn('rounded-xl p-2 transition-colors', listingView === 'grid' ? 'bg-primary text-white' : 'hover:bg-muted')}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  type="button"
                  aria-label="List layout"
                  onClick={() => setListingView('list')}
                  className={cn('rounded-xl p-2 transition-colors', listingView === 'list' ? 'bg-primary text-white' : 'hover:bg-muted')}
                >
                  <List size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brand, model, or location…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11 rounded-xl border-none bg-muted/50 pl-9 shadow-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'bike', 'car'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
                    typeFilter === type ? 'bg-primary text-white shadow-md' : 'bg-muted/50 hover:bg-muted'
                  )}
                >
                  {type === 'bike' && <MotorcycleIcon size={14} />}
                  {type === 'car' && <CarIcon size={14} />}
                  {type === 'all' ? 'All' : type === 'bike' ? 'Bikes' : 'Cars'}
                </button>
              ))}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-11 w-auto gap-2 rounded-xl border-none bg-muted/50 px-4 text-sm font-bold shadow-sm">
                  <Filter size={14} /><SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Budget (under ৳1,500)</SelectItem>
                  <SelectItem value="mid">Mid (৳1,500-৳4,000)</SelectItem>
                  <SelectItem value="luxury">Premium (৳4,000+)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 w-auto gap-2 rounded-xl border-none bg-muted/50 px-4 text-sm font-bold shadow-sm">
                  <Sliders size={14} /><SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="price-low">Cheapest First</SelectItem>
                  <SelectItem value="price-high">Most Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div id="rental-dates" className="mt-4 grid gap-3 rounded-2xl border border-primary/10 bg-muted/30 p-4 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
            <div className="flex items-center gap-2 pb-1 text-sm font-bold text-primary">
              <CalendarDays className="h-4 w-4 text-secondary" /> Rental period
            </div>
            <div>
              <label htmlFor="browseStartDate" className="mb-1 block text-xs font-bold text-muted-foreground">Start date</label>
              <Input
                id="browseStartDate"
                type="date"
                min={getTodayDate()}
                value={startDate}
                onChange={(event) => handleStartDate(event.target.value)}
                className="h-11 rounded-xl bg-white"
              />
            </div>
            <div>
              <label htmlFor="browseEndDate" className="mb-1 block text-xs font-bold text-muted-foreground">End date</label>
              <Input
                id="browseEndDate"
                type="date"
                min={startDate || getTodayDate()}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value > startDate ? event.target.value : '')}
                className="h-11 rounded-xl bg-white"
              />
            </div>
          </div>

          {hasFilters && (
            <button type="button" onClick={resetFilters} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      </section>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pt-5">
          <div className="grid grid-cols-2 rounded-2xl border border-primary/10 bg-white p-1 shadow-sm" role="tablist" aria-label="Browse view">
            <button
              type="button"
              role="tab"
              aria-selected={browseView === 'map'}
              onClick={() => setBrowseView('map')}
              className={cn('flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-black transition-colors', browseView === 'map' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted')}
            >
              <MapIcon size={17} /> Map
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={browseView === 'list'}
              onClick={() => setBrowseView('list')}
              className={cn('flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-black transition-colors', browseView === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted')}
            >
              <ListFilter size={17} /> Listings
            </button>
          </div>
        </div>

        {browseView === 'map' ? (
          <section className="mx-auto max-w-6xl px-4 py-5" role="tabpanel" aria-label="Map">
            {filteredVehicles.length ? (
              <div className="relative h-[68vh] min-h-[540px] overflow-hidden rounded-[2rem] border border-primary/10 bg-muted shadow-[0_24px_70px_rgba(6,62,86,0.14)] ring-1 ring-white">
                <MapView
                  vehicles={filteredVehicles}
                  selectedVehicleId={selectedVehicleId}
                  onVehicleSelect={setSelectedVehicleId}
                  mapRef={mapRef}
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-primary/10 to-transparent" />
                <div className="absolute left-4 top-4 z-30 max-w-[calc(100%-8rem)] rounded-2xl border border-white/60 bg-white/94 px-4 py-3 shadow-[0_12px_32px_rgba(6,62,86,0.14)] backdrop-blur-xl">
                  <p className="font-display text-lg font-semibold text-primary">Explore Vehicles</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-white"><CarIcon size={13} aria-hidden="true" /></span>
                      Cars
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-secondary-foreground"><MotorcycleIcon size={13} aria-hidden="true" /></span>
                      Bikes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#98A2B3]" />
                      In use
                    </span>
                  </div>
                </div>
                <div className="absolute right-4 top-4 z-30 flex flex-col items-end gap-2">
                  <div className="rounded-2xl border border-white/60 bg-white/94 px-4 py-3 text-right shadow-[0_12px_32px_rgba(6,62,86,0.14)] backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Available</p>
                    <p className="font-display text-xl font-semibold text-primary">{filteredVehicles.filter((vehicle) => vehicle.isAvailable).length}</p>
                  </div>
                  <button
                    type="button"
                    onClick={findNearMe}
                    className="flex min-h-11 items-center gap-2 rounded-full border border-primary/10 bg-primary px-4 text-xs font-black text-white shadow-[0_10px_26px_rgba(6,62,86,0.24)] transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                  >
                    <Navigation size={15} aria-hidden="true" /> Near Me
                  </button>
                </div>
                {selectedVehicle && (
                  <Card className="absolute inset-x-3 bottom-3 z-40 mx-auto max-w-xl overflow-hidden rounded-3xl border border-primary/10 bg-white/97 p-3 shadow-[0_24px_60px_rgba(6,62,86,0.24)] backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:p-4">
                    <button
                      type="button"
                      aria-label="Close vehicle preview"
                      onClick={() => setSelectedVehicleId(null)}
                      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex gap-3 sm:gap-4">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28">
                        <Image src={selectedVehicle.image} alt={`${selectedVehicle.brand} ${selectedVehicle.model}`} fill sizes="112px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2 pr-8">
                          <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full', selectedVehicle.type === 'bike' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-white')}>
                            {selectedVehicle.type === 'bike' ? <MotorcycleIcon size={14} aria-hidden="true" /> : <CarIcon size={14} aria-hidden="true" />}
                          </span>
                          <h2 className="truncate text-base font-black sm:text-lg">{selectedVehicle.brand} {selectedVehicle.model}</h2>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> {selectedVehicle.location}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge className={selectedVehicle.isAvailable ? 'border-none bg-green-100 text-green-700' : 'border-none bg-gray-100 text-gray-700'}>
                            {selectedVehicle.isAvailable ? 'Available' : 'In use'}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs font-bold"><Star size={12} className="fill-amber-500 text-amber-500" /> {selectedVehicle.rating}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="font-black text-primary">৳{selectedVehicle.priceDaily.toLocaleString()}<span className="text-xs font-medium text-muted-foreground"> / day</span></p>
                          <Button size="sm" className="rounded-xl font-black" onClick={() => openVehicle(selectedVehicle.id)}>View details</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <EmptyState onReset={resetFilters} />
            )}
          </section>
        ) : (
          <section className="mx-auto max-w-6xl px-4 py-8" role="tabpanel" aria-label="Listings">
            {filteredVehicles.length ? (
              listingView === 'grid' ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleGridCard key={vehicle.id} vehicle={vehicle} onOpen={() => openVehicle(vehicle.id)} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleListCard key={vehicle.id} vehicle={vehicle} onOpen={() => openVehicle(vehicle.id)} />
                  ))}
                </div>
              )
            ) : (
              <EmptyState onReset={resetFilters} />
            )}
          </section>
        )}
      </main>

      {currentUser ? <MobileExplorerTabBar /> : null}
    </div>
  );
}

type VehicleCardProps = {
  vehicle: Vehicle;
  onOpen: () => void;
};

function VehicleGridCard({ vehicle, onOpen }: VehicleCardProps) {
  return (
    <Card className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" onClick={onOpen}>
      <div className="relative h-44">
        <Image src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <Badge className={cn('absolute left-3 top-3 border-none text-[10px] font-black text-white', vehicle.isAvailable ? 'bg-green-500' : 'bg-gray-500')}>
          {vehicle.isAvailable ? 'Available' : 'In Use'}
        </Badge>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-white/90 px-2 py-1 backdrop-blur">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" /><span className="text-xs font-black">{vehicle.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-black">{vehicle.brand} {vehicle.model}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={11} /> {vehicle.location}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-black text-primary">৳{vehicle.priceDaily.toLocaleString()}<span className="ml-1 text-xs font-medium text-muted-foreground">/day</span></p>
          <Button size="sm" className="h-8 rounded-xl px-4 text-xs font-black">View</Button>
        </div>
      </div>
    </Card>
  );
}

function VehicleListCard({ vehicle, onOpen }: VehicleCardProps) {
  return (
    <Card className="group cursor-pointer overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all hover:shadow-md" onClick={onOpen}>
      <div className="flex items-center gap-4 p-4">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
          <Image src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} fill sizes="96px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-black">{vehicle.brand} {vehicle.model}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={11} /> {vehicle.location}</p>
          <p className="mt-2 flex items-center gap-1 text-xs font-bold"><Star size={11} className="fill-amber-500 text-amber-500" /> {vehicle.rating}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-black text-primary">৳{vehicle.priceDaily.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">per day</p>
          <Button size="sm" className="mt-2 h-8 rounded-xl px-4 text-xs font-black">View details</Button>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
        <Search size={36} className="text-muted-foreground/30" />
      </div>
      <h2 className="mb-2 text-2xl font-black">No vehicles found</h2>
      <p className="mb-6 max-w-xs text-muted-foreground">Try different search terms or reset the filters.</p>
      <Button variant="outline" onClick={onReset} className="h-11 rounded-2xl border-2 px-8 font-black">Reset filters</Button>
    </div>
  );
}
