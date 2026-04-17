'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  Bike,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type VehicleRow = {
  id: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  dailyRate: number;
  vehiclePhotoUrl: string;
  ownershipPaperUrl: string;
  insurancePaperUrl: string | null;
  status: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

type OwnerDetail = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  verificationStatus: string;
  verificationNote: string | null;
  verificationReviewedAt: string | null;
  nidOrPassportUrl: string | null;
  drivingLicenseUrl: string | null;
  ownershipPaperUrl: string | null;
  passportPhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  vehicles: VehicleRow[];
};

function DocLink({ label, href }: { label: string; href: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-primary hover:bg-muted/80"
    >
      <FileText className="h-3.5 w-3.5" />
      {label}
      <ExternalLink className="h-3 w-3 opacity-60" />
    </a>
  );
}

function vehicleStatusBadge(s: string) {
  if (s === 'APPROVED') return <Badge className="font-bold">Approved</Badge>;
  if (s === 'PENDING') return <Badge variant="secondary" className="font-bold">Pending</Badge>;
  if (s === 'REJECTED') return <Badge variant="destructive" className="font-bold">Rejected</Badge>;
  return <Badge variant="outline">{s}</Badge>;
}

export default function AdminOwnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [owner, setOwner] = useState<OwnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [vehicleRejectId, setVehicleRejectId] = useState<string | null>(null);
  const [vehicleRejectNote, setVehicleRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/owners/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Not found');
        setOwner(null);
        return;
      }
      setOwner(data.owner);
    } catch {
      setError('Failed to load owner');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const patchStatus = async (status: 'APPROVED' | 'REJECTED', note?: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/owners/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      setRejectOpen(false);
      setRejectNote('');
      load();
    } finally {
      setActionLoading(false);
    }
  };

  const patchVehicle = async (vehicleId: string, status: 'APPROVED' | 'REJECTED', note?: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/vehicles/${vehicleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      setVehicleRejectId(null);
      setVehicleRejectNote('');
      load();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="border-0 shadow-md p-12 text-center text-muted-foreground text-sm font-medium">
          Loading profile…
        </Card>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Button variant="ghost" className="font-bold -ml-2" onClick={() => router.push('/admin/owners')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to owners
        </Button>
        <Card className="border-red-200 bg-red-50 p-6 text-red-800 font-medium">{error || 'Not found'}</Card>
      </div>
    );
  }

  const canDecide = owner.verificationStatus === 'PENDING';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" className="font-bold -ml-2 mb-2" asChild>
            <Link href="/admin/owners">
              <ArrowLeft className="mr-1 h-4 w-4" /> All owners
            </Link>
          </Button>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">{owner.fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {owner.email} · {owner.phone}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-bold capitalize">
              {owner.verificationStatus.toLowerCase()}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {new Date(owner.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        {canDecide && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="font-bold"
              disabled={actionLoading}
              onClick={() => setRejectOpen(true)}
            >
              <XCircle className="mr-1.5 h-4 w-4" /> Reject
            </Button>
            <Button className="font-bold" disabled={actionLoading} onClick={() => patchStatus('APPROVED')}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve owner
            </Button>
          </div>
        )}
      </div>

      {owner.verificationNote && (
        <Card className="border-amber-200 bg-amber-50/80 p-4 text-sm">
          <span className="font-black text-amber-900">Last review note: </span>
          <span className="text-amber-950">{owner.verificationNote}</span>
        </Card>
      )}

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-5 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-muted-foreground">KYC documents</h2>
        </div>
        <div className="p-5 grid gap-3 sm:grid-cols-2">
          <DocLink label="NID / Passport" href={owner.nidOrPassportUrl} />
          <DocLink label="Driving license" href={owner.drivingLicenseUrl} />
          <DocLink label="Ownership paper" href={owner.ownershipPaperUrl} />
          <DocLink label="Passport photo" href={owner.passportPhotoUrl} />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-black mb-3 flex items-center gap-2">
          <Bike className="h-5 w-5" />
          Vehicles ({owner.vehicles.length})
        </h2>
        {owner.vehicles.length === 0 ? (
          <Card className="border-0 shadow-md p-8 text-center text-sm text-muted-foreground">
            No vehicles submitted yet.
          </Card>
        ) : (
          <div className="space-y-4">
            {owner.vehicles.map((v) => (
              <Card key={v.id} className="border-0 shadow-md overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-border/80 bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-lg">
                      {v.brand} {v.model}{' '}
                      <span className="text-muted-foreground font-bold">({v.year})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {v.registrationNumber} · ৳{v.dailyRate}/day
                    </p>
                  </div>
                  <div className="flex items-center gap-2">{vehicleStatusBadge(v.status)}</div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <DocLink label="Vehicle photo" href={v.vehiclePhotoUrl} />
                    <DocLink label="Ownership paper" href={v.ownershipPaperUrl} />
                    <DocLink label="Insurance" href={v.insurancePaperUrl} />
                  </div>
                  {v.reviewNote && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">Review note:</span> {v.reviewNote}
                    </p>
                  )}
                  {v.status === 'PENDING' && (
                    <>
                      <Separator />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-bold"
                          disabled={actionLoading}
                          onClick={() => setVehicleRejectId(v.id)}
                        >
                          Reject vehicle
                        </Button>
                        <Button
                          size="sm"
                          className="font-bold"
                          disabled={actionLoading}
                          onClick={() => patchVehicle(v.id, 'APPROVED')}
                        >
                          Approve vehicle
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black">Reject this owner?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rej-note">Optional note (emailed to user)</Label>
            <Textarea
              id="rej-note"
              rows={4}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason…"
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="font-bold" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="font-bold"
              disabled={actionLoading}
              onClick={() => patchStatus('REJECTED', rejectNote || undefined)}
            >
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!vehicleRejectId}
        onOpenChange={(o) => {
          if (!o) {
            setVehicleRejectId(null);
            setVehicleRejectNote('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black">Reject this vehicle?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="veh-rej-note">Optional note (emailed to owner)</Label>
            <Textarea
              id="veh-rej-note"
              rows={4}
              value={vehicleRejectNote}
              onChange={(e) => setVehicleRejectNote(e.target.value)}
              placeholder="Reason…"
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="font-bold"
              onClick={() => {
                setVehicleRejectId(null);
                setVehicleRejectNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="font-bold"
              disabled={actionLoading || !vehicleRejectId}
              onClick={() =>
                vehicleRejectId &&
                patchVehicle(vehicleRejectId, 'REJECTED', vehicleRejectNote || undefined)
              }
            >
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
