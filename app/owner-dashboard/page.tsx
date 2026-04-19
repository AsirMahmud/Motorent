'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatPanel } from '@/components/chat-panel';
import { RenterTracker } from '@/components/renter-tracker';
import { RentalTimeline } from '@/components/rental-timeline';
import { InboxPanel } from '@/components/inbox-panel';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign, Car, CheckCircle2, XCircle, Clock,
  MessageSquare, Phone, Plus, BarChart2, Calendar,
  ShieldCheck, Eye, Users, ChevronDown, ChevronUp,
  MapPin, Banknote, AlertTriangle, FileText,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { DashboardPageHeader } from '@/components/dashboard-page-header';

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
  pickedUpAt: string | null;
  returnedAt: string | null;
  renterLat: number | null;
  renterLng: number | null;
  renterLocUpdatedAt: string | null;
  // Settlement
  returnCondition: string | null;
  returnNotes: string | null;
  lateFee: number;
  damageFee: number;
  finalAmount: number | null;
  paymentReceivedAt: string | null;
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

type ReturnForm = {
  returnCondition: 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE';
  returnNotes: string;
  lateFee: number;
  damageFee: number;
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
  const [settleBooking, setSettleBooking] = useState<ApiBooking | null>(null);
  const [returnForm, setReturnForm] = useState<ReturnForm>({
    returnCondition: 'GOOD',
    returnNotes: '',
    lateFee: 0,
    damageFee: 0,
  });

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
        .reduce((s, b) => s + (b.finalAmount ?? b.totalPrice), 0),
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

  const handleAction = async (bookingId: string, action: 'CONFIRM_PICKUP') => {
    setActionId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Action failed');
        return;
      }
      await load();
    } finally {
      setActionId(null);
    }
  };

  const openSettleModal = (booking: ApiBooking) => {
    // Pre-calculate late fee based on actual return time vs endDate
    const now = new Date();
    const end = new Date(booking.endDate);
    const extraDays = Math.max(0, Math.ceil((now.getTime() - end.getTime()) / 86400000));
    const autoLateFee = extraDays > 0 ? extraDays * booking.vehicle.dailyRate : 0;
    setReturnForm({ returnCondition: 'GOOD', returnNotes: '', lateFee: autoLateFee, damageFee: 0 });
    setSettleBooking(booking);
  };

  const handleConfirmReturn = async () => {
    if (!settleBooking) return;
    setActionId(settleBooking.id);
    try {
      const res = await fetch(`/api/bookings/${settleBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'CONFIRM_RETURN', ...returnForm }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Action failed');
        return;
      }
      setSettleBooking(null);
      await load();
    } finally {
      setActionId(null);
    }
  };

  if (!currentUser || currentUser.role !== 'owner') {
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

  const settleFinalAmount = settleBooking
    ? settleBooking.totalPrice + returnForm.lateFee + returnForm.damageFee
    : 0;

  return (
    <div className="pb-20 md:pb-12 flex-1">

      {/* ── Return & Settle Modal ─────────────────────────────────────── */}
      {settleBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md space-y-5 rounded-xl border border-border/60 bg-card p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Return & settle</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settleBooking.vehicle.brand} {settleBooking.vehicle.model} · {settleBooking.renter.fullName}
                </p>
              </div>
              <button
                onClick={() => setSettleBooking(null)}
                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Vehicle condition */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle condition</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'GOOD', label: 'Good', icon: CheckCircle2, color: 'border-green-400 bg-green-50 text-green-700' },
                  { value: 'MINOR_DAMAGE', label: 'Minor damage', icon: AlertTriangle, color: 'border-amber-400 bg-amber-50 text-amber-700' },
                  { value: 'MAJOR_DAMAGE', label: 'Major damage', icon: XCircle, color: 'border-red-400 bg-red-50 text-red-700' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setReturnForm((f) => ({ ...f, returnCondition: opt.value }))}
                    className={cn(
                      'flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 text-[11px] font-bold transition-all',
                      returnForm.returnCondition === opt.value
                        ? opt.color
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >
                    <opt.icon size={16} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</p>
              <textarea
                rows={2}
                placeholder="e.g. Minor scratch on left panel…"
                value={returnForm.returnNotes}
                onChange={(e) => setReturnForm((f) => ({ ...f, returnNotes: e.target.value }))}
                className="w-full text-sm rounded-xl border border-border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Fee inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Late fee (৳)</p>
                <input
                  type="number"
                  min={0}
                  value={returnForm.lateFee}
                  onChange={(e) => setReturnForm((f) => ({ ...f, lateFee: Math.max(0, Number(e.target.value)) }))}
                  className="w-full text-sm rounded-xl border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Auto-calc from overdue days</p>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Damage fee (৳)</p>
                <input
                  type="number"
                  min={0}
                  value={returnForm.damageFee}
                  onChange={(e) => setReturnForm((f) => ({ ...f, damageFee: Math.max(0, Number(e.target.value)) }))}
                  className="w-full text-sm rounded-xl border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Payment summary */}
            <div className="rounded-2xl bg-muted/40 p-4 space-y-1.5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Banknote size={13} /> Cash Payment Summary
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base rental</span>
                <span className="font-bold">৳{settleBooking.totalPrice.toLocaleString()}</span>
              </div>
              {returnForm.lateFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-600">Late fee</span>
                  <span className="font-bold text-amber-600">+৳{returnForm.lateFee.toLocaleString()}</span>
                </div>
              )}
              {returnForm.damageFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Damage fee</span>
                  <span className="font-bold text-red-600">+৳{returnForm.damageFee.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-border/60 pt-2 mt-1 flex justify-between">
                <span className="font-semibold">Total to collect</span>
                <span className="text-lg font-semibold text-primary tabular-nums">৳{settleFinalAmount.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                <Banknote size={11} /> Collect cash before confirming
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-bold"
                onClick={() => setSettleBooking(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-1.5 rounded-xl bg-blue-600 font-medium hover:bg-blue-700"
                disabled={actionId === settleBooking.id}
                onClick={handleConfirmReturn}
              >
                <FileText size={14} />
                {actionId === settleBooking.id ? 'Saving…' : 'Confirm & Complete'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardPageHeader
          eyebrow="Owner hub"
          title="Dashboard"
          description={`Signed in as ${currentUser.name}. Manage vehicles, booking requests, and renter messages.`}
          actions={
            <Button
              size="sm"
              className="h-9 gap-2 rounded-lg font-medium shadow-sm"
              onClick={() => router.push('/owner-dashboard/add-vehicle')}
            >
              <Plus size={16} /> Add vehicle
            </Button>
          }
        />

        {error && (
          <Card className="border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">
            {error}
          </Card>
        )}

        {loading ? (
          <Card className="border border-border/60 bg-card p-12 text-center text-muted-foreground shadow-sm">
            Loading your dashboard…
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: 'Fleet', value: vehicles.length, icon: Car, color: 'bg-blue-50 text-blue-600' },
                { label: 'Listing views', value: totalViews.toLocaleString(), icon: Eye, color: 'bg-violet-50 text-violet-600' },
                { label: 'Pending requests', value: pendingRequests.length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                { label: 'Earned (approved/done)', value: `৳${earned.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
              ].map((stat, i) => (
                <Card
                  key={i}
                  className="border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{stat.value}</p>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="flex h-auto min-h-11 w-full flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
                {[
                  { value: 'requests', label: 'Renter requests', badge: pendingRequests.length },
                  { value: 'fleet', label: 'Fleet & renters', badge: vehicles.length },
                  { value: 'finance', label: 'Finance', badge: null },
                  { value: 'messages', label: 'Messages', badge: null },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:text-sm"
                  >
                    {tab.label}
                    {tab.badge !== null && tab.badge > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold">
                        {tab.badge}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="requests" className="space-y-4 animate-in fade-in duration-300">
                {pendingRequests.length === 0 && acceptedRequests.length === 0 ? (
                  <Card className="rounded-xl border border-border/60 bg-card p-12 text-center shadow-sm">
                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-200" />
                    <p className="text-lg font-semibold">No booking activity yet</p>
                    <p className="text-muted-foreground text-sm">When renters request your vehicles, they appear here for approval.</p>
                  </Card>
                ) : (
                  <>
                    {pendingRequests.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">
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
                                      <h3 className="font-semibold">
                                        {booking.vehicle.brand} {booking.vehicle.model}
                                      </h3>
                                      <Badge className="bg-amber-100 text-amber-800 border-none text-[10px] font-semibold shrink-0">
                                        Request #{n}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1 text-sm">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-semibold">
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
                                        className="h-9 rounded-xl text-xs font-semibold bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200"
                                        disabled={actionId === booking.id}
                                        onClick={() => handleDecision(booking.id, 'ACCEPTED')}
                                      >
                                        <CheckCircle2 size={13} className="mr-1" /> Approve
                                      </Button>
                                      <a href={`tel:${booking.renter.phone}`}>
                                        <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold">
                                          <Phone size={13} className="mr-1" /> Call
                                        </Button>
                                      </a>
                                    </div>
                                    <div className="mt-3">
                                      <ChatPanel bookingId={booking.id} label={`Chat with ${booking.renter.fullName}`} />
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
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-3 mt-6">
                          Active rentals ({acceptedRequests.length})
                        </p>
                        <div className="space-y-3">
                          {acceptedRequests.map((booking) => {
                            const isPickedUp = Boolean(booking.pickedUpAt);
                            const isReturned = Boolean(booking.returnedAt);
                            return (
                            <div key={booking.id} className="space-y-1.5">
                              <Card className="overflow-hidden border border-border/60 bg-card p-5 shadow-sm">
                                <div className="flex items-center gap-4">
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
                                    <h3 className="font-semibold text-sm">
                                      {booking.vehicle.brand} {booking.vehicle.model}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                      {booking.renter.fullName} · Until {new Date(booking.endDate).toLocaleDateString()}
                                    </p>
                                    {/* Rental phase badge */}
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      {isReturned ? (
                                        <Badge className="text-[10px] border bg-blue-50 text-blue-800">✓ Returned</Badge>
                                      ) : isPickedUp ? (
                                        <Badge className="text-[10px] border bg-green-50 text-green-800">✓ Picked up · Active</Badge>
                                      ) : (
                                        <Badge className="text-[10px] border bg-amber-50 text-amber-800">Awaiting pickup</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {/* Rental timeline */}
                                <div className="mt-4">
                                  <RentalTimeline
                                    createdAt={new Date(booking.createdAt)}
                                    ownerDecidedAt={booking.ownerDecidedAt ? new Date(booking.ownerDecidedAt) : null}
                                    pickedUpAt={booking.pickedUpAt ? new Date(booking.pickedUpAt) : null}
                                    returnedAt={booking.returnedAt ? new Date(booking.returnedAt) : null}
                                    endDate={new Date(booking.endDate)}
                                  />
                                </div>

                                {/* Owner action buttons */}
                                {!isReturned && (
                                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/50 flex-wrap">
                                    {!isPickedUp ? (
                                      <Button
                                        size="sm"
                                        className="h-8 rounded-xl text-xs font-semibold bg-green-500 hover:bg-green-600 gap-1 shadow-sm"
                                        disabled={actionId === booking.id}
                                        onClick={() => handleAction(booking.id, 'CONFIRM_PICKUP')}
                                      >
                                        <CheckCircle2 size={13} /> Confirm Pickup
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        className="h-8 rounded-xl text-xs font-semibold bg-blue-500 hover:bg-blue-600 gap-1 shadow-sm"
                                        disabled={actionId === booking.id}
                                        onClick={() => openSettleModal(booking)}
                                      >
                                        <Banknote size={13} /> Return & Settle
                                      </Button>
                                    )}
                                    <a href={`tel:${booking.renter.phone}`}>
                                      <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs font-bold gap-1">
                                        <Phone size={12} /> Call
                                      </Button>
                                    </a>
                                  </div>
                                )}
                                {/* Receipt strip after completion */}
                                {isReturned && booking.finalAmount != null && (
                                  <div className="mt-3 pt-3 border-t border-border/50 rounded-xl bg-blue-50 px-3 py-2.5 space-y-0.5">
                                    <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                                      <FileText size={11} /> Cash receipt
                                    </p>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>Base rental</span>
                                      <span className="font-bold text-foreground">৳{booking.totalPrice.toLocaleString()}</span>
                                    </div>
                                    {booking.lateFee > 0 && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-amber-600">Late fee</span>
                                        <span className="font-bold text-amber-600">+৳{booking.lateFee.toLocaleString()}</span>
                                      </div>
                                    )}
                                    {booking.damageFee > 0 && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-red-600">Damage fee</span>
                                        <span className="font-bold text-red-600">+৳{booking.damageFee.toLocaleString()}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-sm font-semibold pt-0.5 border-t border-blue-200 mt-1">
                                      <span>Total collected</span>
                                      <span className="text-blue-700">৳{booking.finalAmount.toLocaleString()}</span>
                                    </div>
                                    {booking.returnCondition && booking.returnCondition !== 'GOOD' && (
                                      <p className="text-[10px] text-amber-700 mt-1">
                                        Condition: {booking.returnCondition === 'MINOR_DAMAGE' ? 'Minor damage' : 'Major damage'}
                                        {booking.returnNotes ? ` — ${booking.returnNotes}` : ''}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </Card>
                              {/* Chat */}
                              <ChatPanel bookingId={booking.id} label={`Chat — ${booking.renter.fullName}`} />
                              {/* Live tracker — shown once booking is accepted */}
                              <RenterTracker
                                bookingId={booking.id}
                                renterName={booking.renter.fullName}
                                initialLat={booking.renterLat ?? undefined}
                                initialLng={booking.renterLng ?? undefined}
                                initialLocAt={booking.renterLocUpdatedAt ? new Date(booking.renterLocUpdatedAt) : undefined}
                              />
                            </div>
                            );
                          })}
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
                      <Card
                        key={v.id}
                        className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
                      >
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
                              <p className="font-semibold">
                                {v.brand} {v.model}
                              </p>
                              <Badge
                                className={cn(
                                  'text-[10px] font-semibold border-none',
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
                                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-semibold text-primary text-xs">
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
                                      <Badge variant="outline" className="text-[10px] font-semibold">
                                        #{requestNumber(v.id, b.id)}
                                      </Badge>
                                      <Badge className={cn('text-[10px] font-semibold border', statusBadgeClass(b.status))}>
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
                  <Card className="rounded-xl border border-dashed border-border/60 bg-card p-10 text-center shadow-sm">
                    <Users className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="mb-2 font-semibold">No vehicles yet</p>
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
                    <Card
                      key={i}
                      className={`rounded-xl border-0 bg-gradient-to-br p-6 text-white shadow-md ${item.gradient}`}
                    >
                      <item.icon size={20} className="mb-3 opacity-80" />
                      <p className="mb-1 text-3xl font-semibold tabular-nums">{item.value}</p>
                      <p className="text-xs opacity-80 font-bold uppercase tracking-widest">{item.label}</p>
                    </Card>
                  ))}
                </div>
                <Card className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                  <div className="border-b border-border/60 px-6 py-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Per vehicle</h3>
                  </div>
                  <div className="divide-y divide-border/40">
                    {vehicles.map((vehicle) => {
                      const vBookings = myBookingRequests.filter((b) => b.vehicleId === vehicle.id);
                      const vEarned = vBookings
                        .filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status))
                        .reduce((s, b) => s + (b.finalAmount ?? b.totalPrice), 0);
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
                                {vBookings.filter((b) => b.status === 'COMPLETED' && (b.lateFee > 0 || b.damageFee > 0)).length > 0 && (
                                  <span className="ml-1 text-amber-600 font-bold">· incl. fees</span>
                                )}
                              </p>
                            </div>
                            <p className="font-semibold text-primary">৳{vEarned.toLocaleString()}</p>
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

              <TabsContent value="messages" className="animate-in fade-in duration-300">
                <InboxPanel currentUserId={currentUser.id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-border/80 bg-white/95 px-4 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden">
        {[
          { icon: BarChart2, label: 'Dashboard', href: '/owner-dashboard', active: true },
          { icon: Car, label: 'Fleet', href: '/owner-dashboard' },
          { icon: Plus, label: 'List', href: '/owner-dashboard/add-vehicle' },
          { icon: MessageSquare, label: 'Inbox', href: '/messages' },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => router.push(item.href)}
            className={cn(
              'flex min-h-[3.25rem] min-w-0 flex-1 max-w-[5.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-all duration-200 active:scale-[0.97]',
              item.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                item.active ? 'bg-primary/10' : ''
              )}
            >
              <item.icon size={20} strokeWidth={item.active ? 2.25 : 2} />
            </span>
            <span className="max-w-full truncate text-[10px] font-semibold tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
