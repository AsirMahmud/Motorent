'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatPanel } from '@/components/chat-panel';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar, Star, MapPin, Map as MapIcon, Clock,
  ShieldCheck, AlertCircle, TrendingUp, History,
  Heart, Bike, Car, CheckCircle2, XCircle, Activity, DollarSign,
  ChevronRight, Timer, FileText, RefreshCw,
} from 'lucide-react';
import { MobileExplorerTabBar } from '@/components/mobile-explorer-tab-bar';
import { RentalTimeline } from '@/components/rental-timeline';
import { InboxPanel } from '@/components/inbox-panel';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
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
  booking: {
    id: string; endDate: Date; startDate: Date; pickupLocation: string;
    pickupTime?: string; totalPrice: number; status: string; vehicleId: string;
    pickedUpAt?: Date; returnedAt?: Date; createdAt: Date;
  };
  vehicle: { brand: string; model: string; type: string; image: string };
}) {
  const { remaining, ended } = useCountdown(booking.endDate);

  // Auto-broadcast GPS for any active (accepted) booking
  useEffect(() => {
    if (booking.returnedAt) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        fetch(`/api/bookings/${booking.id}/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          credentials: 'same-origin',
        }).catch(() => {});
      },
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [booking.id, booking.returnedAt]);

  return (
    <Card className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Header bar */}
      <div className={`p-4 text-white flex items-center justify-between ${
        ended ? 'bg-gradient-to-r from-gray-500 to-gray-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            {vehicle.type === 'bike' ? <Bike size={18} /> : <Car size={18} />}
          </div>
          <div>
            <p className="font-semibold">{vehicle.brand} {vehicle.model}</p>
            <p className="text-xs opacity-80">{ended ? 'Rental ended' : 'Active Rental'}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Timer size={13} className="opacity-80" />
            <p className="text-sm font-semibold tabular-nums">{remaining}</p>
          </div>
          <p className="text-xs opacity-70">
            {ended ? 'Completed' : `Until ${new Date(booking.endDate).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      {/* GPS sharing indicator */}
      {!booking.returnedAt && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-100 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[11px] font-bold text-green-700">Your GPS is being shared with the owner</span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Pickup info */}
        <div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Pickup location</p>
          <p className="font-bold text-sm mt-0.5">{booking.pickupLocation}</p>
          {booking.pickupTime && <p className="text-xs text-muted-foreground">{booking.pickupTime}</p>}
        </div>

        {/* Full rental timeline */}
        <RentalTimeline
          createdAt={booking.createdAt}
          pickedUpAt={booking.pickedUpAt}
          returnedAt={booking.returnedAt}
          endDate={booking.endDate}
          compact={false}
        />

        {/* Chat */}
        <ChatPanel bookingId={booking.id} label="Chat with owner" />
      </div>
    </Card>
  );
}

export default function RenterDashboardPage() {
  const router = useRouter();
  const { currentUser, bookings, vehicles, bookingsLoading, refreshBookings } = useApp();

  // Location permission gate: 'checking' | 'granted' | 'denied' | 'unsupported'
  const [locationState, setLocationState] = useState<'checking' | 'granted' | 'denied' | 'unsupported'>('checking');

  // Check / request location permission on mount
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationState('unsupported');
      return;
    }
    // Use the Permissions API for a silent pre-check when available
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setLocationState('granted');
        } else if (result.state === 'denied') {
          setLocationState('denied');
        } else {
          // 'prompt' — trigger the actual browser dialog
          requestLocation();
        }
        result.onchange = () => {
          if (result.state === 'granted') setLocationState('granted');
          else if (result.state === 'denied') setLocationState('denied');
        };
      }).catch(() => requestLocation());
    } else {
      requestLocation();
    }

    function requestLocation() {
      navigator.geolocation.getCurrentPosition(
        () => setLocationState('granted'),
        () => setLocationState('denied'),
        { timeout: 10000 }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger rental expiry check in the background
  useEffect(() => {
    fetch('/api/cron/rental-expiry').catch(() => {});
  }, []);

  // Auto-refresh every 30 s so pickup/return confirmations appear without manual refresh
  useEffect(() => {
    const id = setInterval(() => {
      refreshBookings();
    }, 30_000);
    return () => clearInterval(id);
  }, [refreshBookings]);

  // ── Location gate screens ────────────────────────────────────────────────
  if (locationState === 'checking') {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="max-w-sm rounded-xl border border-border/60 bg-card p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="text-primary animate-pulse" size={36} />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Checking location…</h2>
          <p className="text-muted-foreground text-sm">Please allow location access when your browser asks.</p>
        </Card>
      </div>
    );
  }

  if (locationState === 'denied') {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="max-w-sm rounded-xl border border-border/60 bg-card p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <MapPin className="text-red-500" size={36} />
          </div>
          <h2 className="mb-2 text-2xl font-semibold">Location required</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Location access is <strong>required</strong> to use the renter dashboard. It lets the owner track the vehicle during your rental period.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">How to enable</p>
            <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
              <li>Click the <strong>lock / info icon</strong> in your browser address bar</li>
              <li>Find <strong>Location</strong> and set it to <strong>Allow</strong></li>
              <li>Reload this page</li>
            </ol>
          </div>
          <Button
            className="h-12 w-full rounded-lg font-medium shadow-sm"
            onClick={() => window.location.reload()}
          >
            I&apos;ve enabled it — reload
          </Button>
        </Card>
      </div>
    );
  }

  if (locationState === 'unsupported') {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="max-w-sm rounded-xl border border-border/60 bg-card p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <MapPin className="text-red-500" size={36} />
          </div>
          <h2 className="mb-2 text-2xl font-semibold">GPS not supported</h2>
          <p className="text-muted-foreground text-sm">
            Your browser or device does not support GPS. Please use a modern mobile browser (Chrome, Safari) to access the renter dashboard.
          </p>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="max-w-sm rounded-xl border border-border/60 bg-card p-10 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
          </div>
          <p className="font-medium text-muted-foreground">Loading your session…</p>
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
        <Card className="max-w-md rounded-xl border border-border/60 bg-card p-10 text-center shadow-sm">
          {isPending && (
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Clock className="text-amber-500" size={36} />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">KYC under review</h2>
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
              <Button onClick={() => router.push('/browse?view=list')} className="h-12 w-full rounded-lg font-medium shadow-sm">
                Browse vehicles
              </Button>
            </>
          )}

          {isRejected && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle className="text-red-500" size={36} />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">KYC rejected</h2>
              {currentUser.verificationNote && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-left mb-4">
                  <p className="text-xs font-bold text-red-700 mb-1">Admin note:</p>
                  <p className="text-red-600 text-sm">{currentUser.verificationNote}</p>
                </div>
              )}
              <p className="text-muted-foreground mb-6 text-sm">
                Please resubmit clear images of your NID and driving license.
              </p>
              <Button onClick={() => router.push('/kyc')} className="h-12 w-full rounded-lg font-medium shadow-sm">
                Resubmit documents
              </Button>
            </>
          )}

          {isNone && (
            <>
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <FileText className="text-primary" size={36} />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">Verify your identity</h2>
              <p className="text-muted-foreground mb-6">
                To book vehicles, you need to upload your NID and driving license for admin verification.
              </p>
              <Button onClick={() => router.push('/kyc')} className="h-12 w-full rounded-lg font-medium shadow-sm">
                Start verification
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
    return (
      <Badge
        className={`${map[status] || 'bg-muted text-muted-foreground'} rounded-full border-none px-3 py-1 text-xs font-medium`}
      >
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 pb-24 md:pb-12">
      <div className="flex-1">
        <div className="mx-auto max-w-5xl space-y-8">
          <DashboardPageHeader
            eyebrow="Renter hub"
            title="Dashboard"
            description={`Signed in as ${currentUser.name}. Track bookings, active rentals, and messages.`}
            actions={
              <>
                <Badge variant="secondary" className="hidden gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium sm:inline-flex">
                  <ShieldCheck size={10} /> Verified
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-lg font-medium shadow-sm"
                  onClick={refreshBookings}
                  disabled={bookingsLoading}
                >
                  <RefreshCw size={14} className={bookingsLoading ? 'animate-spin' : ''} />
                  Refresh
                </Button>
                <Button
                  onClick={() => router.push('/browse?view=map')}
                  size="sm"
                  className="h-9 gap-2 rounded-lg font-medium shadow-sm"
                >
                  <MapIcon size={16} /> Find a ride
                </Button>
              </>
            }
          />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Active rentals', value: activeBookings.length, icon: Activity, light: 'bg-green-50 text-green-600' },
              { label: 'Pending', value: pendingBookings.length, icon: Clock, light: 'bg-amber-50 text-amber-600' },
              { label: 'Completed', value: completedBookings.length, icon: CheckCircle2, light: 'bg-blue-50 text-blue-600' },
              { label: 'Total spend', value: `৳${totalSpend.toLocaleString()}`, icon: DollarSign, light: 'bg-primary/10 text-primary' },
            ].map((stat, i) => (
              <Card
                key={i}
                className="border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.light}`}>
                  <stat.icon size={20} />
                </div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{stat.value}</p>
              </Card>
            ))}
          </div>

          {/* Loading skeleton */}
          {bookingsLoading && (
            <div className="mb-6 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl border border-border/40 bg-muted/50" />
              ))}
            </div>
          )}

          {/* Tabs */}
          {!bookingsLoading && (
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="flex h-auto min-h-11 w-full flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/40 p-1 md:flex-nowrap">
                {[
                  { value: 'bookings', label: 'My Bookings', count: userBookings.length },
                  { value: 'active', label: 'Active', count: activeBookings.length },
                  { value: 'history', label: 'History', count: completedBookings.length },
                  { value: 'spending', label: 'Spending', count: null },
                  { value: 'messages', label: 'Messages', count: null },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:text-sm"
                  >
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold data-[state=active]:bg-primary/20">
                        {tab.count}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* All Bookings */}
              <TabsContent value="bookings" className="space-y-4 animate-in fade-in duration-300">
                {userBookings.length > 0 ? userBookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(booking => {
                  const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                  return vehicle ? (
                    <Card
                      key={booking.id}
                      className="group relative overflow-hidden border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${booking.status === 'accepted' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-amber-500' : booking.status === 'completed' ? 'bg-blue-500' : 'bg-red-400'}`} />
                      <div className="flex gap-4 items-center pl-2">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-semibold">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            {statusBadge(booking.status)}
                            {booking.status === 'accepted' && booking.pickedUpAt && !booking.returnedAt && (
                              <Badge className="border-none bg-green-100 text-[10px] font-medium text-green-700">
                                ✓ Picked up
                              </Badge>
                            )}
                            {booking.returnedAt && (
                              <Badge className="border-none bg-blue-100 text-[10px] font-medium text-blue-700">
                                ✓ Returned
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1"><MapPin size={11} className="text-primary" />{booking.pickupLocation}</span>
                            <span className="flex items-center gap-1"><Calendar size={11} className="text-primary" />{new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-primary tabular-nums">
                              ৳{booking.totalPrice.toLocaleString()}
                            </span>
                            <Button size="sm" className="h-8 rounded-xl text-xs font-bold" onClick={() => router.push(`/vehicle/${vehicle.id}`)}>
                              Details <ChevronRight size={13} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Timeline for accepted/active bookings */}
                      {(booking.status === 'accepted' || booking.pickedUpAt || booking.returnedAt) && (
                        <div className="mt-3 pt-3 border-t border-border/40">
                          <RentalTimeline
                            createdAt={booking.createdAt}
                            pickedUpAt={booking.pickedUpAt}
                            returnedAt={booking.returnedAt}
                            endDate={booking.endDate}
                            compact={false}
                          />
                        </div>
                      )}
                      <div className="mt-3">
                        <ChatPanel bookingId={booking.id} label="Chat with owner" />
                      </div>
                    </Card>
                  ) : null;
                }) : (
                  <Card className="rounded-xl border border-dashed border-border/60 bg-card p-16 text-center shadow-sm">
                    <Calendar className="mx-auto mb-4 h-14 w-14 text-muted-foreground/25" />
                    <h3 className="mb-2 text-xl font-semibold">No bookings yet</h3>
                    <p className="mb-6 text-muted-foreground">Explore vehicles and make your first booking.</p>
                    <Button onClick={() => router.push('/browse?view=list')} className="h-12 rounded-lg px-8 font-medium shadow-sm">
                      Explore now
                    </Button>
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
                  <Card className="rounded-xl border border-border/60 bg-card p-12 text-center shadow-sm">
                    <Activity className="mx-auto mb-3 h-12 w-12 text-muted-foreground/25" />
                    <p className="text-lg font-semibold">No active rentals</p>
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
                    <Card
                      key={booking.id}
                      className="flex items-center gap-4 border border-border/60 bg-card p-5 shadow-sm"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <Image src={vehicle.image} alt={vehicle.model} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-xs text-muted-foreground">{new Date(booking.startDate).toLocaleDateString()} · {days} days</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-primary tabular-nums">৳{booking.totalPrice.toLocaleString()}</p>
                        <Badge className="mt-1 border-none bg-blue-100 text-[10px] font-medium text-blue-700">
                          Completed
                        </Badge>
                      </div>
                    </Card>
                  ) : null;
                }) : (
                  <Card className="rounded-xl border border-border/60 bg-card p-12 text-center shadow-sm">
                    <History className="mx-auto mb-3 h-12 w-12 text-muted-foreground/25" />
                    <p className="text-lg font-semibold">No history yet</p>
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
                    <Card
                      key={i}
                      className={`rounded-xl border-0 p-6 text-white shadow-md bg-gradient-to-br ${item.color}`}
                    >
                      <item.icon size={20} className="mb-3 opacity-90" />
                      <p className="mb-1 text-3xl font-semibold tabular-nums">{item.value}</p>
                      <p className="text-xs font-medium uppercase tracking-wider opacity-90">{item.label}</p>
                      <p className="text-xs opacity-60 mt-0.5">{item.sub}</p>
                    </Card>
                  ))}
                </div>
                <Card className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                  <div className="border-b border-border/60 px-6 py-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Booking breakdown
                    </h3>
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
                            <span className="font-semibold text-primary tabular-nums">
                              ৳{booking.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </Card>
              </TabsContent>

              {/* Messages */}
              <TabsContent value="messages" className="animate-in fade-in duration-300">
                <InboxPanel currentUserId={currentUser.id} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <MobileExplorerTabBar />
    </div>
  );
}
