'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, XCircle, ExternalLink, FileText,
  Calendar, MapPin, AlertCircle, Car, Bike, Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type ApiBooking = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  pickupLocation: string;
  createdAt: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    vehiclePhotoUrl: string;
    location: string;
    owner: { fullName: string; email: string };
  };
};

type Renter = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  verificationStatus: string;
  verificationNote: string | null;
  verificationReviewedAt: string | null;
  nidOrPassportUrl: string | null;
  drivingLicenseUrl: string | null;
  createdAt: string;
  totalSpend: number;
  bookingsAsRenter: ApiBooking[];
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
    CANCELLED: 'bg-muted text-muted-foreground',
  };
  return (
    <Badge className={`${map[status] || 'bg-muted text-muted-foreground'} border font-bold capitalize text-xs`}>
      {status.toLowerCase()}
    </Badge>
  );
}

export default function AdminRenterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [renter, setRenter] = useState<Renter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/renters/${id}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to load renter'); return; }
      setRenter(data.renter);
    } catch {
      setError('Failed to load renter');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (status: 'APPROVED' | 'REJECTED', note?: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/renters/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      load();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !renter) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="border-red-200 bg-red-50 p-6 flex items-center gap-2 text-red-800 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error || 'Renter not found'}
        </Card>
      </div>
    );
  }

  const totalBookings = renter.bookingsAsRenter.length;
  const completedBookings = renter.bookingsAsRenter.filter(b => b.status === 'COMPLETED').length;
  const activeBookings = renter.bookingsAsRenter.filter(b => b.status === 'ACCEPTED').length;

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="font-bold gap-1.5" asChild>
            <Link href="/admin/renters"><ArrowLeft className="h-4 w-4" /> Back to Renters</Link>
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black">{renter.fullName}</h1>
                <p className="text-green-100 text-sm mt-1">{renter.email} · {renter.phone}</p>
                <p className="text-green-200 text-xs mt-1">
                  Joined {new Date(renter.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <Badge
                  className={`font-bold text-sm px-3 py-1 border ${
                    renter.verificationStatus === 'APPROVED'
                      ? 'bg-white text-green-700 border-white'
                      : renter.verificationStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}
                >
                  KYC: {renter.verificationStatus.toLowerCase()}
                </Badge>
                {renter.verificationStatus === 'PENDING' && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      className="bg-white text-green-700 hover:bg-green-50 font-bold gap-1"
                      disabled={actionLoading}
                      onClick={() => updateStatus('APPROVED')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve KYC
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/40 text-white hover:bg-white/10 font-bold gap-1"
                      disabled={actionLoading}
                      onClick={() => { setRejectNote(''); setRejectOpen(true); }}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
                {renter.verificationStatus === 'REJECTED' && (
                  <Button
                    size="sm"
                    className="bg-white text-green-700 hover:bg-green-50 font-bold"
                    disabled={actionLoading}
                    onClick={() => updateStatus('APPROVED')}
                  >
                    Re-approve KYC
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Rejection note */}
          {renter.verificationStatus === 'REJECTED' && renter.verificationNote && (
            <div className="bg-red-50 px-6 py-3 flex items-start gap-2 border-b border-red-100">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700"><span className="font-bold">Rejection reason:</span> {renter.verificationNote}</p>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            {[
              { label: 'Total Bookings', value: totalBookings },
              { label: 'Active', value: activeBookings },
              { label: 'Completed', value: completedBookings },
              { label: 'Total Spend', value: `৳${renter.totalSpend.toLocaleString()}` },
            ].map((s, i) => (
              <div key={i} className="p-4 text-center">
                <p className="text-xl font-black text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground font-bold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* KYC Documents */}
        <Card className="border-0 shadow-md p-6">
          <h2 className="font-black text-base mb-4">KYC Documents</h2>
          <div className="flex flex-wrap gap-3">
            {renter.nidOrPassportUrl ? (
              <a
                href={renter.nidOrPassportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold text-primary hover:bg-muted/80 transition-colors"
              >
                <FileText className="h-4 w-4" /> NID / Passport
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-muted-foreground border border-dashed rounded-xl">
                <FileText className="h-4 w-4" /> NID not uploaded
              </span>
            )}
            {renter.drivingLicenseUrl ? (
              <a
                href={renter.drivingLicenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold text-primary hover:bg-muted/80 transition-colors"
              >
                <FileText className="h-4 w-4" /> Driving License
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-muted-foreground border border-dashed rounded-xl">
                <FileText className="h-4 w-4" /> License not uploaded
              </span>
            )}
          </div>
          {renter.verificationReviewedAt && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Reviewed {new Date(renter.verificationReviewedAt).toLocaleString()}
            </p>
          )}
        </Card>

        {/* Booking History */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="font-black">Booking History ({totalBookings})</h2>
            <p className="text-sm text-muted-foreground mt-0.5">All rental requests made by this renter.</p>
          </div>

          {renter.bookingsAsRenter.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">No bookings yet.</div>
          ) : (
            <div className="divide-y divide-border/40">
              {renter.bookingsAsRenter.map(booking => (
                <div key={booking.id} className="p-5 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Car className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-sm">
                        {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.year})
                      </span>
                      {statusBadge(booking.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {booking.pickupLocation}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Owner: {booking.vehicle.owner.fullName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-primary">৳{booking.totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={(o) => !o && setRejectOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black">Reject KYC — {renter.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note" className="text-muted-foreground">Reason (sent by email)</Label>
            <Textarea
              id="note"
              placeholder="e.g. NID photo is blurry, please resubmit a clear scan…"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="font-bold">Cancel</Button>
            <Button
              variant="destructive"
              className="font-bold"
              onClick={async () => {
                await updateStatus('REJECTED', rejectNote || undefined);
                setRejectOpen(false);
              }}
              disabled={actionLoading}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
