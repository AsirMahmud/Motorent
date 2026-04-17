'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign, Car, CheckCircle2, XCircle, Clock,
  MessageSquare, Phone, Plus, BarChart2, Calendar,
  ShieldCheck, Eye, Users, ChevronDown, ChevronUp,
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type ApiVehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
  vehiclePhotoUrl: string;
  status: string;
  viewCount: number;
  registrationNumber: string;
};

type ApiRenter = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  verificationStatus: string;
};

type ApiBooking = {
  id: string;
  vehicleId: string;
  status: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  pickupLocation: string;
  createdAt: string;
  ownerDecidedAt: string | null;
  renter: ApiRenter;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    dailyRate: number;
    vehiclePhotoUrl: string;
  };
};

function statusLabel(status: string) {
  const m: Record<string, string> = {
    PENDING: 'Pending your approval',
    ACCEPTED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return m[status] || status;
}

function statusBadgeClass(status: string) {
  if (status === 'PENDING') return 'bg-amber-100 text-amber-800 border-amber-200';
  if (status === 'ACCEPTED') return 'bg-green-100 text-green-800 border-green-200';
  if (status === 'REJECTED') return 'bg-red-100 text-red-800 border-red-200';
  if (status === 'COMPLETED') return 'bg-blue-100 text-blue-800 border-blue-200';
  return 'bg-muted text-muted-foreground';
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [vRes, bRes] = await Promise.all([
        fetch('/api/vehicles', { credentials: 'same-origin' }),
        fetch('/api/bookings?scope=owner', { credentials: 'same-origin' }),
      ]);
      const vData = await vRes.json();
      const bData = await bRes.json();
      if (!vRes.ok) {
        setError(vData.error || 'Failed to load vehicles');
        return;
      }
      if (!bRes.ok) {
        setError(bData.error || 'Failed to load bookings');
        return;
      }
      setVehicles(vData.vehicles || []);
      setBookings(bData.bookings || []);
    } catch {
      setError('Network error loading dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'owner') {
      setLoading(true);
      load();
    }
  }, [currentUser?.role, load]);

  const myBookingRequests = useMemo(() => bookings, [bookings]);
  const pendingRequests = useMemo(
    () => myBookingRequests.filter((b) => b.status === 'PENDING'),
    [myBookingRequests]
  );
  const acceptedRequests = useMemo(
    () => myBookingRequests.filter((b) => b.status === 'ACCEPTED'),
    [myBookingRequests]
  );

  const earned = useMemo(
    () =>
      myBookingRequests
        .filter((b) => b.status === 'ACCEPTED' || b.status === 'COMPLETED')
        .reduce((s, b) => s + b.totalPrice, 0),
    [myBookingRequests]
  );

  const totalViews = useMemo(
    () => vehicles.reduce((s, v) => s + (v.viewCount || 0), 0),
    [vehicles]
  );

  const requestNumber = (vehicleId: string, bookingId: string) => {
    const forV = myBookingRequests
      .filter((b) => b.vehicleId === vehicleId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const idx = forV.findIndex((b) => b.id === bookingId);
    return idx >= 0 ? idx + 1 : 0;
  };

  const handleDecision = async (bookingId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setActionId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Update failed');
        return;
      }
      await load();
    } finally {
      setActionId(null);
    }
  };

  if (!currentUser || currentUser.role !== 'owner') {
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

  return (
    <div className="pb-20 md:pb-12 flex-1">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Owner Hub</h1>
            <p className="text-muted-foreground">
              Hello, <span className="font-bold text-foreground">{currentUser.name}</span> — manage listings, renters, and
              requests.
            </p>
          </div>
          <Button
            className="h-11 px-6 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20"
            onClick={() => router.push('/owner-dashboard/add-vehicle')}
          >
            <Plus size={16} /> Add vehicle
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{error}</Card>
        )}

        {loading ? (
          <Card className="p-12 text-center text-muted-foreground">Loading your dashboard…</Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Fleet', value: vehicles.length, icon: Car, color: 'bg-blue-50 text-blue-600' },
                { label: 'Listing views', value: totalViews.toLocaleString(), icon: Eye, color: 'bg-violet-50 text-violet-600' },
                { label: 'Pending requests', value: pendingRequests.length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                { label: 'Earned (approved/done)', value: `৳${earned.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
              ].map((stat, i) => (
                <Card key={i} className="p-5 rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black italic tracking-tighter">{stat.value}</p>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="bg-white rounded-2xl p-1.5 h-auto gap-1 shadow-sm border border-border/50 flex-wrap">
                {[
                  { value: 'requests', label: 'Renter requests', badge: pendingRequests.length },
                  { value: 'fleet', label: 'Fleet & renters', badge: vehicles.length },
                  { value: 'finance', label: 'Finance', badge: null },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-xl px-4 py-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md text-sm flex items-center gap-1.5"
                  >
                    {tab.label}
                    {tab.badge !== null && tab.badge > 0 && (
                      <span className="min-w-[1.25rem] h-5 px-1 bg-primary/20 rounded-full text-[10px] flex items-center justify-center font-black">
                        {tab.badge}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="requests" className="space-y-4 animate-in fade-in duration-300">
                {pendingRequests.length === 0 && acceptedRequests.length === 0 ? (
                  <Card className="p-12 text-center border-none shadow-sm bg-white rounded-3xl">
                    <CheckCircle2 className="w-12 h-12 text-green-200 mx-auto mb-3" />
                    <p className="font-black text-lg">No booking activity yet</p>
                    <p className="text-muted-foreground text-sm">When renters request your vehicles, they appear here for approval.</p>
                  </Card>
                ) : (
                  <>
                    {pendingRequests.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3">
                          Awaiting your response ({pendingRequests.length})
                        </p>
                        <div className="space-y-4">
                          {pendingRequests.map((booking) => {
                            const days = Math.ceil(
                              (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000
                            );
                            const n = requestNumber(booking.vehicleId, booking.id);
                            return (
                              <Card
                                key={booking.id}
                                className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/30 shadow-sm"
                              >
                                <div className="flex gap-4">
                                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                                    <Image
                                      src={booking.vehicle.vehiclePhotoUrl}
                                      alt=""
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h3 className="font-black">
                                        {booking.vehicle.brand} {booking.vehicle.model}
                                      </h3>
                                      <Badge className="bg-amber-100 text-amber-800 border-none text-[10px] font-black shrink-0">
                                        Request #{n}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1 text-sm">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-black">
                                          {booking.renter.fullName.charAt(0)}
                                        </div>
                                        <span className="font-bold">{booking.renter.fullName}</span>
                                      </div>
                                      {booking.renter.verificationStatus === 'APPROVED' && (
                                        <ShieldCheck size={14} className="text-green-500" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Requested {new Date(booking.createdAt).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {new Date(booking.startDate).toLocaleDateString()} –{' '}
                                      {new Date(booking.endDate).toLocaleDateString()} · {days} day(s) ·{' '}
                                      <span className="font-bold text-primary">৳{booking.totalPrice.toLocaleString()}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-3">
                                      <MapPin className="inline h-3 w-3 mr-1" />
                                      {booking.pickupLocation}
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 rounded-xl text-xs font-bold border-red-200 text-red-600 hover:bg-red-50"
                                        disabled={actionId === booking.id}
                                        onClick={() => handleDecision(booking.id, 'REJECTED')}
                                      >
                                        <XCircle size={13} className="mr-1" /> Reject
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="h-9 rounded-xl text-xs font-black bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200"
                                        disabled={actionId === booking.id}
                                        onClick={() => handleDecision(booking.id, 'ACCEPTED')}
                                      >
                                        <CheckCircle2 size={13} className="mr-1" /> Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 rounded-xl text-xs font-bold"
                                        onClick={() => router.push('/messages')}
                                      >
                                        <MessageSquare size={13} className="mr-1" /> Message
                                      </Button>
                                      <a href={`tel:${booking.renter.phone}`}>
                                        <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold">
                                          <Phone size={13} className="mr-1" /> Call
                                        </Button>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {acceptedRequests.length > 0 && (
                      <div>
                        <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-3 mt-6">
                          Active rentals ({acceptedRequests.length})
                        </p>
                        <div className="space-y-3">
                          {acceptedRequests.map((booking) => (
                            <Card key={booking.id} className="p-5 rounded-2xl border-none shadow-sm bg-white flex items-center gap-4">
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
                                <Image
                                  src={booking.vehicle.vehiclePhotoUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-black text-sm">
                                  {booking.vehicle.brand} {booking.vehicle.model}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {booking.renter.fullName} · Until {new Date(booking.endDate).toLocaleDateString()}
                                </p>
                                <Badge className="mt-1 text-[10px] border bg-green-50 text-green-800">
                                  {statusLabel(booking.status)}
                                </Badge>
                              </div>
                              <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs font-bold" onClick={() => router.push('/messages')}>
                                <MessageSquare size={12} />
                              </Button>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="fleet" className="animate-in fade-in duration-300 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Each vehicle shows <strong>listing views</strong> and every renter request with{' '}
                  <strong>status</strong> (pending → approved/rejected) and request order.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {vehicles.map((v) => {
                    const vBookings = myBookingRequests
                      .filter((b) => b.vehicleId === v.id)
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    const open = expandedVehicle === v.id;
                    return (
                      <Card key={v.id} className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                        <button
                          type="button"
                          className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                          onClick={() => setExpandedVehicle(open ? null : v.id)}
                        >
                          <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                            <Image src={v.vehiclePhotoUrl} alt="" fill className="object-cover" unoptimized />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-black">
                                {v.brand} {v.model}
                              </p>
                              <Badge
                                className={cn(
                                  'text-[10px] font-black border-none',
                                  v.status === 'APPROVED' ? 'bg-green-500 text-white' : v.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                )}
                              >
                                {v.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ৳{v.dailyRate.toLocaleString()}/day · {vBookings.length} request(s) ·{' '}
                              <span className="inline-flex items-center gap-0.5 font-bold text-foreground">
                                <Eye className="h-3 w-3" /> {v.viewCount} views
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-xl text-xs font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/vehicle/${v.id}`);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View profile
                            </Button>
                            {open ? <ChevronUp className="shrink-0" /> : <ChevronDown className="shrink-0" />}
                          </div>
                        </button>
                        {open && (
                          <div className="border-t border-border px-4 py-3 bg-muted/20">
                            {vBookings.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No renter requests for this vehicle yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {vBookings.map((b) => (
                                  <div
                                    key={b.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-white p-3 border border-border/60 text-sm"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                                        {b.renter.fullName.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-bold">{b.renter.fullName}</p>
                                        <p className="text-xs text-muted-foreground">{b.renter.email}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}{' '}
                                          · ৳{b.totalPrice.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                          Submitted {new Date(b.createdAt).toLocaleString()}
                                          {b.ownerDecidedAt && (
                                            <> · Decided {new Date(b.ownerDecidedAt).toLocaleString()}</>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <Badge variant="outline" className="text-[10px] font-black">
                                        #{requestNumber(v.id, b.id)}
                                      </Badge>
                                      <Badge className={cn('text-[10px] font-black border', statusBadgeClass(b.status))}>
                                        {statusLabel(b.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
                {vehicles.length === 0 && (
                  <Card className="p-10 text-center rounded-2xl border-dashed">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-bold mb-2">No vehicles yet</p>
                    <Button onClick={() => router.push('/owner-dashboard/add-vehicle')}>Add your first vehicle</Button>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="finance" className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {[
                    { label: 'Total from bookings', value: `৳${earned.toLocaleString()}`, icon: DollarSign, gradient: 'from-primary to-primary/80' },
                    {
                      label: 'Active (approved)',
                      value: `৳${acceptedRequests.reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}`,
                      icon: Calendar,
                      gradient: 'from-green-500 to-green-600',
                    },
                    { label: 'All requests', value: myBookingRequests.length, icon: Users, gradient: 'from-blue-500 to-blue-600' },
                  ].map((item, i) => (
                    <Card key={i} className={`p-6 rounded-2xl border-none text-white bg-gradient-to-br ${item.gradient} shadow-lg`}>
                      <item.icon size={20} className="mb-3 opacity-80" />
                      <p className="text-3xl font-black mb-1">{item.value}</p>
                      <p className="text-xs opacity-80 font-bold uppercase tracking-widest">{item.label}</p>
                    </Card>
                  ))}
                </div>
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                  <div className="px-6 py-4 border-b border-border/50">
                    <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Per vehicle</h3>
                  </div>
                  <div className="divide-y divide-border/40">
                    {vehicles.map((vehicle) => {
                      const vBookings = myBookingRequests.filter((b) => b.vehicleId === vehicle.id);
                      const vEarned = vBookings
                        .filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status))
                        .reduce((s, b) => s + b.totalPrice, 0);
                      const pct = earned > 0 ? Math.round((vEarned / earned) * 100) : 0;
                      return (
                        <div key={vehicle.id} className="px-6 py-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-bold text-sm">
                                {vehicle.brand} {vehicle.model}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {vBookings.length} request(s) · {vehicle.viewCount} views
                              </p>
                            </div>
                            <p className="font-black text-primary">৳{vEarned.toLocaleString()}</p>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-2 flex justify-around items-center z-50 md:hidden">
        {[
          { icon: BarChart2, label: 'Dashboard', href: '/owner-dashboard', active: true },
          { icon: Car, label: 'Fleet', href: '/owner-dashboard' },
          { icon: Plus, label: 'List', href: '/owner-dashboard/add-vehicle' },
          { icon: MessageSquare, label: 'Messages', href: '/messages' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className={cn('flex flex-col items-center gap-1 transition-colors', item.active ? 'text-primary' : 'text-muted-foreground')}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
