'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Calendar, MapPin, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { bookings, vehicles } = useApp();

  const booking = bookings.find((b) => b.id === params.id);
  const vehicle = booking ? vehicles.find((v) => v.id === booking.vehicleId) : null;

  if (!booking || !vehicle) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <Card className="p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Booking logic error</h2>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-hidden">
      <Header />

      <div className="flex-1 flex items-center justify-center p-4 py-12 relative">
        {/* Animated background circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl border-none rounded-[2.5rem] relative overflow-hidden text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 scale-110">
            <CheckCircle2 className="w-12 h-12 text-green-600 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground">
              Request Sent!
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              Your booking request is being reviewed by the owner.
            </p>
          </div>

          {/* Summary Plate */}
          <div className="bg-muted/30 p-6 rounded-3xl border-2 border-dashed border-border flex flex-col md:flex-row gap-6 text-left items-center md:items-stretch">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg">
              <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover" />
            </div>
            <div className="flex-1 space-y-4 py-1">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{vehicle.brand} {vehicle.model}</h3>
                <div className="flex items-center gap-1 text-primary font-bold text-sm">
                  <MapPin size={14} /> {vehicle.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</p>
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Calendar size={14} className="text-primary" />
                    {booking.startDate.toLocaleDateString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time</p>
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Clock size={14} className="text-primary" />
                    {booking.pickupTime || '10:00 AM'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center md:items-end md:pl-6 md:border-l border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Fee</p>
              <span className="text-3xl font-black text-primary italic">৳{booking.totalPrice}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              className="h-16 rounded-2xl font-bold border-2 text-lg flex items-center justify-center gap-3 hover:bg-muted"
              onClick={() => router.push('/messages')}
            >
              <MessageSquare className="w-5 h-5 text-primary" /> Chat with Owner
            </Button>
            <Button
              className="h-16 rounded-2xl font-black uppercase text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 "
              onClick={() => router.push('/renter-dashboard')}
            >
              Go to Bookings <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            Booking Ref: {booking.id.split('-').pop()}
          </p>
        </Card>
      </div>
    </div>
  );
}
