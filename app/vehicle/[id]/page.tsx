'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/context';
import { useRouter, useParams } from 'next/navigation';
import { BookingForm } from '@/components/booking-form';
import {
  Star, MapPin, Fuel, Users, Zap, Calendar,
  DollarSign, ShieldCheck, Check, Info, ArrowLeft,
  Clock, CalendarDays, CalendarRange, Layers
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { vehicles, currentUser } = useApp();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const vehicle = vehicles.find((v) => v.id === params.id);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center rounded-3xl shadow-xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This vehicle is no longer available.
            </p>
            <Button onClick={() => router.push('/')} className="rounded-xl px-8">
              Back to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans pb-12">
      <Header />

      <div className="flex-1 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 -ml-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-[16/9] w-full bg-muted rounded-3xl overflow-hidden shadow-2xl group">
                  <Image
                    src={vehicle.images[activeImage] || vehicle.image}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold px-3 py-1 rounded-full shadow-lg border-none">
                      {vehicle.type === 'bike' ? <Bike size={14} className="mr-1 inline" /> : <Car size={14} className="mr-1 inline" />}
                      {vehicle.type.toUpperCase()}
                    </Badge>
                    {vehicle.isAvailable && (
                      <Badge className="bg-green-500 text-white font-bold px-3 py-1 rounded-full shadow-lg border-none">
                        Available
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Thumbnails */}
                {vehicle.images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {vehicle.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                      >
                        <Image src={img} alt="Thumbnail" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Basic Info */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary uppercase tracking-wider">{vehicle.brand}</span>
                      <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                      <span className="text-sm text-muted-foreground">{vehicle.year} Model</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                      {vehicle.model}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <MapPin size={18} className="text-primary" />
                      {vehicle.location}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-2xl w-fit">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                      <span className="text-xl font-black">{vehicle.rating}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-border" />
                    <span className="text-sm text-muted-foreground font-bold">{vehicle.reviewsCount} verified reviews</span>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-2xl flex flex-col gap-2 border border-border/50">
                  <Users className="text-primary" size={20} />
                  <div className="text-xs font-bold text-muted-foreground uppercase">Capacity</div>
                  <div className="font-black">{vehicle.seats} Seats</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl flex flex-col gap-2 border border-border/50">
                  <Fuel className="text-primary" size={20} />
                  <div className="text-xs font-bold text-muted-foreground uppercase">Fuel</div>
                  <div className="font-black capitalize">{vehicle.fuelType}</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl flex flex-col gap-2 border border-border/50">
                  <Zap className="text-primary" size={20} />
                  <div className="text-xs font-bold text-muted-foreground uppercase">Transmission</div>
                  <div className="font-black capitalize">{vehicle.transmission}</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl flex flex-col gap-2 border border-border/50">
                  <ShieldCheck className="text-primary" size={20} />
                  <div className="text-xs font-bold text-muted-foreground uppercase">Verified</div>
                  <div className="font-black">Listing ID: {vehicle.registrationNumber.split('-').pop()}</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Layers className="text-primary" size={24} /> Overview
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {vehicle.description || "This premium vehicle is meticulously maintained and ready for your next adventure. Whether you are commuting in the city or heading out on a scenic tour, this ride offers the perfect blend of performance and comfort."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="px-4 py-2 rounded-xl text-sm font-bold border-2 hover:bg-primary/5 transition-colors">
                      <Check className="w-3 h-3 mr-2" /> {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Security Banner */}
              <div className="bg-primary/5 border-2 border-primary/10 p-6 rounded-3xl flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl mt-1">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-black text-primary uppercase text-sm mb-1">Moto-Rent Guarantee</h4>
                  <p className="text-sm text-primary/70 font-medium">Your ride is protected. We verify every listing and offer 24/7 roadside assistance for every booking made through our platform.</p>
                </div>
              </div>
            </div>

            {/* Price & Booking Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 sticky top-24 rounded-3xl shadow-2xl border-none">
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-bold text-muted-foreground uppercase mb-4">Rental Rates</div>
                    <div className="space-y-3">
                      {vehicle.priceHourly && (
                        <div className="flex justify-between items-center p-3 rounded-2xl border-2 border-border/50 hover:border-primary/30 transition-colors">
                          <div className="flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            <span className="font-bold">Hourly</span>
                          </div>
                          <span className="font-black text-lg text-primary">৳{vehicle.priceHourly}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center p-3 rounded-2xl border-2 border-primary bg-primary/5">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={18} className="text-primary" />
                          <span className="font-bold">Daily</span>
                        </div>
                        <span className="font-black text-lg text-primary">৳{vehicle.priceDaily}</span>
                      </div>
                      {vehicle.priceWeekly && (
                        <div className="flex justify-between items-center p-3 rounded-2xl border-2 border-border/50">
                          <div className="flex items-center gap-2">
                            <CalendarRange size={18} className="text-primary" />
                            <span className="font-bold">Weekly</span>
                          </div>
                          <span className="font-black text-lg text-primary">৳{vehicle.priceWeekly}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!showBookingForm ? (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between font-bold text-sm text-muted-foreground uppercase px-2">
                        <span>Min. Booking</span>
                        <span>1 Day</span>
                      </div>
                      <Button
                        size="lg"
                        className="w-full h-16 text-xl font-black uppercase rounded-2xl shadow-xl shadow-primary/20"
                        onClick={() => {
                          if (!currentUser) router.push('/login');
                          else setShowBookingForm(true);
                        }}
                        disabled={!vehicle.isAvailable}
                      >
                        {vehicle.isAvailable ? 'Request Booking' : 'Booked Out'}
                      </Button>

                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">No payment required yet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 border-t animate-in fade-in duration-300">
                      <BookingForm vehicleId={vehicle.id} onClose={() => setShowBookingForm(false)} />
                    </div>
                  )}

                  {!showBookingForm && (
                    <div className="pt-4 flex flex-col gap-3">
                      <div className="p-4 bg-muted/50 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                          O
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Managed by</p>
                          <p className="font-black">Owner User</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full h-12 rounded-xl text-primary border-primary hover:bg-primary/5 font-bold">
                        Chat with Owner
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              <div className="p-6 bg-muted/20 border-2 border-dashed border-border rounded-3xl text-center space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Share this ride</p>
                <div className="flex justify-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors">
                    <span className="text-[10px] font-bold">FB</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors">
                    <span className="text-[10px] font-bold">WA</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors">
                    <span className="text-[10px] font-bold">TW</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-12 border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black italic text-primary uppercase tracking-tighter mb-2">Moto-Rent</h2>
            <p className="text-sm opacity-60 font-medium">The future of vehicle rentals in the palm of your hand.</p>
          </div>
          <div className="text-center md:text-right text-sm opacity-60">
            <p>&copy; 2024 Moto-Rent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Simple Bike/Car icons internal
function Bike({ size, className }: { size: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="15" cy="5" r="1" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
    </svg>
  );
}

function Car({ size, className }: { size: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}
