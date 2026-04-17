'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar, MessageSquare, Star, MapPin, Map as MapIcon, Clock,
  ShieldCheck, AlertCircle, TrendingUp, History,
  Heart, Bike, Car, CheckCircle2, XCircle, Activity, DollarSign,
  ChevronRight, Timer, FileText, RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/** Returns "Xd Xh Xm" remaining or null if ended */
function useCountdown(endDate: Date) {
  const [remaining, setRemaining] = useState('');
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) {
        setEnded(true);
        setRemaining('Ended');
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setRemaining(days > 0 ? `${days}d ${hours}h ${mins}m` : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [endDate]);

  return { remaining, ended };
}

function ActiveRentalCard({ booking, vehicle }: {
  booking: { id: string; endDate: Date; startDate: Date; pickupLocation: string; pickupTime?: string; totalPrice: number; status: string; vehicleId: string };
  vehicle: { brand: string; model: string; type: string; image: string };
}) {
  const { remaining, ended } = useCountdown(booking.endDate);
  const router = useRouter();

  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
      <div className={`p-4 text-white flex items-center justify-between ${ended ? 'bg-gradient-to-r from-gray-500 to-gray-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            {vehicle.type === 'bike' ? <Bike size={18} /> : <Car size={18} />}
          </div>
          <div>
            <p className="font-black">{vehicle.brand} {vehicle.model}</p>
            <p className="text-xs opacity-80">{ended ? 'Rental ended' : 'Active Rental'}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Timer size={13} className="opacity-80" />
            <p className="font-black text-sm">{remaining}</p>
          </div>
          <p className="text-xs opacity-70">
            {ended ? 'Completed' : `Until ${new Date(booking.endDate).toLocaleDateString()}`}
          </p>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Pickup</p>
          <p className="font-bold text-sm">{booking.pickupLocation}</p>
          {booking.pickupTime && <p className="text-xs text-muted-foreground mt-0.5">{booking.pickupTime}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold gap-1.5">
            <MapPin size={13} className="text-primary" /> Track
          </Button>
          <Button size="sm" className="h-9 rounded-xl font-bold gap-1.5" onClick={() => router.push('/messages')}>
            <MessageSquare size={13} /> Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function RenterDashboardPage() {
  const router = useRouter();
  const { currentUser, bookings, vehicles, messages, bookingsLoading, refreshBookings } = useApp();

  // Trigger rental expiry check in the background
  useEffect(() => {
    fetch('/api/cron/rental-expiry').catch(() => { /* fire and forget */ });
  }, []);

  if (!currentUser) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="p-10 text-center max-w-sm rounded-3xl shadow-2xl border-none">
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-hidden />
          </div>
          <p className="text-muted-foreground font-medium">Loading your session…</p>
        </Card>
      </div>
    );
  }

  // KYC gate — show status screen if not approved
  if (currentUser.kycStatus !== 'verified') {
    const isPending = currentUser.kycStatus === 'pending';
    const isRejected = currentUser.kycStatus === 'rejected';
    const isNone = currentUser.kycStatus === 'none';

    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="p-10 text-center max-w-md rounded-3xl shadow-2xl border-none">
          {isPending && (
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Clock className="text-amber-500" size={36} />
              </div>
              <h2 className="text-2xl font-black mb-2">KYC Under Review</h2>
              <p className="text-muted-foreground mb-6">
                Your NID and driving license are being reviewed by our admin team.
                You will receive an email once approved — usually within 24 hours.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left mb-6">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="text-amber-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-amber-700 text-sm">
                    While you wait, you can browse available vehicles on the home page.
                  </p>
                </div>
              </div>
              <Button onClick={() => router.push('/')} className="w-full h-12 rounded-2xl font-black shadow-xl shadow-primary/20">
                Browse Vehicles
              </Button>
            </>
          )}

          {isRejected && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle className="text-red-500" size={36} />
              </div>
              <h2 className="text-2xl font-black mb-2">KYC Rejected</h2>
              {currentUser.verificationNote && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-left mb-4">
                  <p className="text-xs font-bold text-red-700 mb-1">Admin note:</p>
                  <p className="text-red-600 text-sm">{currentUser.verificationNote}</p>
                </div>
              )}
              <p className="text-muted-foreground mb-6 text-sm">
                Please resubmit clear images of your NID and driving license.
              </p>
              <Button onClick={() => router.push('/kyc')} className="w-full h-12 rounded-2xl font-black shadow-xl shadow-primary/20">
                Resubmit Documents
              </Button>
            </>
          )}

          {isNone && (
            <>
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <FileText className="text-primary" size={36} />
              </div>
              <h2 className="text-2xl font-black mb-2">Verify Your Identity</h2>
              <p className="text-muted-foreground mb-6">
                To book vehicles, you need to upload your NID and driving license for admin verification.
              </p>
              <Button onClick={() => router.push('/kyc')} className="w-full h-12 rounded-2xl font-black shadow-xl shadow-primary/20">
                Start Verification
              </Button>
            </>
          )}
        </Card>
      </div>
    );
  }

  const userBookings = bookings.filter(b => b.renterId === currentUser.id);
  const totalSpend = userBookings.reduce((s, b) => s + b.totalPrice, 0);
  const activeBookings = userBookings.filter(b => b.status === 'accepted');
  const pendingBookings = userBookings.filter(b => b.status === 'pending');
  const completedBookings = userBookings.filter(b => b.status === 'completed');
  const unreadMessages = messages.filter(m => m.recipientId === currentUser.id && !m.read).length;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-gray-100 text-gray-600',
    };
    const labels: Record<string, string> = {
      pending: '⏳ Pending', accepted: '✓ Confirmed', rejected: '✗ Rejected',
      completed: '★ Completed', cancelled: 'Cancelled',
    };
    return <Badge className={`${map[status] || 'bg-muted text-muted-foreground'} border-none px-3 py-1 rounded-full font-black text-xs`}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 pb-20 md:pb-12">
      <div className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">My Dashboard</h1>
                <Badge className="bg-green-500 text-white gap-1 rounded-full text-[10px]">
                  <ShieldCheck size={10} /> Verified
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Hello, <span className="font-bold text-foreground">{currentUser.name}</span> 👋 Track your rentals.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl font-bold gap-1.5"
                onClick={refreshBookings}
                disabled={bookingsLoading}
              >
                <RefreshCw size={14} className={bookingsLoading ? 'animate-spin' : ''} />
                Refresh
              </Button>
              <Button onClick={() => router.push('/')} className="h-11 px-6 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20">
                <MapIcon size={16} /> Find a Ride
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Rentals', value: activeBookings.length, icon: Activity, light: 'bg-green-50 text-green-600' },
              { label: 'Pending', value: pendingBookings.length, icon: Clock, light: 'bg-amber-50 text-amber-600' },
              { label: 'Completed', value: completedBookings.length, icon: CheckCircle2, light: 'bg-blue-50 text-blue-600' },
              { label: 'Total Spend', value: `৳${totalSpend.toLocaleString()}`, icon: DollarSign, light: 'bg-primary/10 text-primary' },
            ].map((stat, i) => (
              <Card key={i} className="p-5 rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.light}`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black italic tracking-tighter">{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Loading skeleton */}
          {bookingsLoading && (
            <div className="space-y-3 mb-6">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-muted/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Tabs */}
          {!bookingsLoading && (
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="bg-white rounded-2xl p-1.5 h-auto gap-1 shadow-sm border border-border/50">
                {[
                  { value: 'bookings', label: 'My Bookings', count: userBookings.length },
                  { value: 'active', label: 'Active', count: activeBookings.length },
                  { value: 'history', label: 'History', count: completedBookings.length },
                  { value: 'spending', label: 'Spending', count: null },
                ].map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-4 py-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-sm flex items-center gap-1.5">
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                      <span className="w-4 h-4 bg-primary/20 data-[state=active]:bg-white/20 rounded-full text-[10px] flex items-center justify-center font-black">{tab.count}</span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* All Bookings */}
              <TabsContent value="bookings" className="space-y-4 animate-in fade-in duration-300">
                {userBookings.length > 0 ? userBookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(booking => {
                  const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                  return vehicle ? (
                    <Card key={booking.id} className="p-5 rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden relative">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${booking.status === 'accepted' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-amber-500' : booking.status === 'completed' ? 'bg-blue-500' : 'bg-red-400'}`} />
                      <div className="flex gap-4 items-center pl-2">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-black text-base">{vehicle.brand} {vehicle.model}</h3>
                            {statusBadge(booking.status)}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1"><MapPin size={11} className="text-primary" />{booking.pickupLocation}</span>
                            <span className="flex items-center gap-1"><Calendar size={11} className="text-primary" />{new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-primary">৳{booking.totalPrice.toLocaleString()}</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs font-bold" onClick={() => router.push('/messages')}>
                                <MessageSquare size={13} className="mr-1" /> Owner
                              </Button>
                              <Button size="sm" className="h-8 rounded-xl text-xs font-bold" onClick={() => router.push(`/vehicle/${vehicle.id}`)}>
                                Details <ChevronRight size={13} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : null;
                }) : (
                  <Card className="p-16 text-center border-2 border-dashed border-border/40 rounded-3xl bg-white">
                    <Calendar className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-xl font-black mb-2">No Bookings Yet</h3>
                    <p className="text-muted-foreground mb-6">Explore vehicles and make your first booking!</p>
                    <Button onClick={() => router.push('/')} className="rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20">Explore Now</Button>
                  </Card>
                )}
              </TabsContent>

              {/* Active — with countdown */}
              <TabsContent value="active" className="space-y-4 animate-in fade-in duration-300">
                {activeBookings.length > 0 ? activeBookings.map(booking => {
                  const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                  return vehicle ? (
                    <ActiveRentalCard key={booking.id} booking={booking} vehicle={vehicle} />
                  ) : null;
                }) : (
                  <Card className="p-12 text-center border-none shadow-sm bg-white rounded-3xl">
                    <Activity className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="font-black text-lg">No Active Rentals</p>
                    <p className="text-muted-foreground text-sm mt-1">Your confirmed rentals will appear here.</p>
                  </Card>
                )}
              </TabsContent>

              {/* History */}
              <TabsContent value="history" className="space-y-4 animate-in fade-in duration-300">
                {completedBookings.length > 0 ? completedBookings.map(booking => {
                  const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                  const days = Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000);
                  return vehicle ? (
                    <Card key={booking.id} className="p-5 rounded-2xl border-none shadow-sm bg-white flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(booking.startDate).toLocaleDateString()} · {days} days</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-primary">৳{booking.totalPrice.toLocaleString()}</p>
                        <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-black mt-1">Completed</Badge>
                      </div>
                    </Card>
                  ) : null;
                }) : (
                  <Card className="p-12 text-center border-none shadow-sm bg-white rounded-3xl">
                    <History className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="font-black text-lg">No History Yet</p>
                    <p className="text-muted-foreground text-sm">Completed rentals will show here.</p>
                  </Card>
                )}
              </TabsContent>

              {/* Spending */}
              <TabsContent value="spending" className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Total Spend', value: `৳${totalSpend.toLocaleString()}`, sub: 'All time', icon: DollarSign, color: 'from-primary to-primary/80' },
                    { label: 'Avg per Rental', value: userBookings.length ? `৳${Math.round(totalSpend / userBookings.length).toLocaleString()}` : '৳0', sub: 'Per booking', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
                    { label: 'Total Days', value: userBookings.reduce((s, b) => s + Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86400000), 0), sub: 'Days rented', icon: Calendar, color: 'from-green-500 to-green-600' },
                  ].map((item, i) => (
                    <Card key={i} className={`p-6 rounded-2xl border-none text-white bg-gradient-to-br ${item.color} shadow-lg`}>
                      <item.icon size={20} className="mb-3 opacity-80" />
                      <p className="text-3xl font-black mb-1">{item.value}</p>
                      <p className="text-xs opacity-80 font-bold uppercase tracking-widest">{item.label}</p>
                      <p className="text-xs opacity-60 mt-0.5">{item.sub}</p>
                    </Card>
                  ))}
                </div>
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                  <div className="px-6 py-4 border-b border-border/50">
                    <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Booking Breakdown</h3>
                  </div>
                  <div className="divide-y divide-border/40">
                    {userBookings.map(booking => {
                      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                      return vehicle ? (
                        <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">{vehicle.brand} {vehicle.model}</p>
                            <p className="text-xs text-muted-foreground">{new Date(booking.startDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {statusBadge(booking.status)}
                            <span className="font-black text-primary">৳{booking.totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-2 flex justify-around items-center z-50 md:hidden">
        {[
          { icon: MapIcon, label: 'Explore', href: '/' },
          { icon: Car, label: 'Bookings', href: '/renter-dashboard', active: true },
          { icon: MessageSquare, label: 'Messages', href: '/messages', badge: unreadMessages },
          { icon: ShieldCheck, label: 'Profile', href: '/renter-dashboard' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className={`flex flex-col items-center gap-1 relative transition-colors ${item.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <item.icon size={22} />
            {'badge' in item && item.badge ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{item.badge}</span> : null}
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
