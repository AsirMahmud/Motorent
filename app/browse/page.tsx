'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useApp } from '@/lib/context';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search, Sliders, Bike, Car, Star, MapPin, LayoutGrid, List, Filter, X, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MobileExplorerTabBar } from '@/components/mobile-explorer-tab-bar';

export default function BrowsePage() {
  const { vehicles, currentUser } = useApp();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [typeFilter, setTypeFilter] = useState<'all' | 'bike' | 'car'>('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(v => {
        const matchesSearch =
          v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || v.type === typeFilter;
        const matchesPrice =
          priceFilter === 'all' ||
          (priceFilter === 'budget' && v.priceDaily < 1500) ||
          (priceFilter === 'mid' && v.priceDaily >= 1500 && v.priceDaily < 4000) ||
          (priceFilter === 'luxury' && v.priceDaily >= 4000);
        return matchesSearch && matchesType && matchesPrice && v.status === 'approved';
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.priceDaily - b.priceDaily;
        if (sortBy === 'price-high') return b.priceDaily - a.priceDaily;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [vehicles, searchTerm, typeFilter, priceFilter, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('rating');
    setTypeFilter('all');
    setPriceFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasFilters = searchTerm || typeFilter !== 'all' || priceFilter !== 'all' || startDate || endDate;

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col bg-[#F8FAFC] font-sans',
        currentUser && 'pb-24 md:pb-0'
      )}
    >
      <Header />

      {/* Hero search bar */}
      <section className="bg-white border-b py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-primary">Browse vehicles</h1>
              <p className="text-muted-foreground text-sm">{filteredVehicles.length} vehicles available near you</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'hover:bg-muted'}`}>
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'hover:bg-muted'}`}>
                <List size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brand, model, or location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-11 rounded-xl border-none shadow-sm bg-muted/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'bike', 'car'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${typeFilter === t ? 'bg-primary text-white shadow-md' : 'bg-muted/50 hover:bg-muted'}`}
                >
                  {t === 'bike' && <Bike size={14} />}
                  {t === 'car' && <Car size={14} />}
                  {t === 'all' ? 'All' : t === 'bike' ? 'Bikes' : 'Cars'}
                </button>
              ))}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-11 rounded-xl border-none shadow-sm bg-muted/50 w-auto gap-2 text-sm font-bold px-4">
                  <Filter size={14} /><SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Budget (under ৳1,500)</SelectItem>
                  <SelectItem value="mid">Mid (৳1,500–৳4,000)</SelectItem>
                  <SelectItem value="luxury">Premium (৳4,000+)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 rounded-xl border-none shadow-sm bg-muted/50 w-auto gap-2 text-sm font-bold px-4">
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
              <CalendarDays className="h-4 w-4 text-secondary" />
              Rental period
            </div>
            <div>
              <label htmlFor="browseStartDate" className="mb-1 block text-xs font-bold text-muted-foreground">Start date</label>
              <Input
                id="browseStartDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-11 rounded-xl bg-white"
              />
            </div>
            <div>
              <label htmlFor="browseEndDate" className="mb-1 block text-xs font-bold text-muted-foreground">End date</label>
              <Input
                id="browseEndDate"
                type="date"
                min={startDate || new Date().toISOString().split('T')[0]}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-11 rounded-xl bg-white"
              />
            </div>
          </div>

          {hasFilters && (
            <button onClick={resetFilters} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Vehicle Grid/List */}
      <section className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {filteredVehicles.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredVehicles.map(vehicle => (
                  <Card
                    key={vehicle.id}
                    className="rounded-2xl border-none shadow-sm bg-white overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 duration-300 group cursor-pointer"
                    onClick={() => router.push(`/vehicle/${vehicle.id}`)}
                  >
                    <div className="relative h-44">
                      <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 left-3">
                        {vehicle.isAvailable
                          ? <Badge className="bg-green-500 text-white border-none text-[10px] font-black">Available</Badge>
                          : <Badge className="bg-gray-500 text-white border-none text-[10px] font-black">In Use</Badge>
                        }
                      </div>
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-xl">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-black">{vehicle.rating}</span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="p-1.5 bg-white/90 backdrop-blur rounded-xl">
                          {vehicle.type === 'bike' ? <Bike size={14} className="text-primary" /> : <Car size={14} className="text-primary" />}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-1">
                        <h3 className="font-black text-base">{vehicle.brand} {vehicle.model}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin size={11} className="text-primary" /> {vehicle.location}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {vehicle.features.slice(0, 2).map(f => (
                          <span key={f} className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold">{f}</span>
                        ))}
                        {vehicle.features.length > 2 && (
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground">+{vehicle.features.length - 2}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-primary">৳{vehicle.priceDaily.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground ml-1">/day</span>
                        </div>
                        <Button size="sm" className="h-8 rounded-xl font-black text-xs px-4 shadow-md shadow-primary/20">Book</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVehicles.map(vehicle => (
                  <Card
                    key={vehicle.id}
                    className="rounded-2xl border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => router.push(`/vehicle/${vehicle.id}`)}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0">
                        <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-black">{vehicle.brand} {vehicle.model}</h3>
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-black text-amber-700">{vehicle.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin size={11} className="text-primary" /> {vehicle.location}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {vehicle.features.slice(0, 3).map(f => (
                            <span key={f} className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-primary">৳{vehicle.priceDaily.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">per day</p>
                        <Button size="sm" className="mt-2 h-8 rounded-xl font-black text-xs px-4 shadow-md shadow-primary/20">Book Now</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-5">
                <Search size={36} className="text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-6 max-w-xs">Try different search terms or reset the filters.</p>
              <Button variant="outline" onClick={resetFilters} className="h-11 px-8 rounded-2xl font-black border-2">
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>
      {currentUser ? <MobileExplorerTabBar /> : null}
    </div>
  );
}
