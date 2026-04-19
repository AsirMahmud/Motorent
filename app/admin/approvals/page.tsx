'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

type PendingOwner = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nidOrPassportUrl: string | null;
  drivingLicenseUrl: string | null;
  ownershipPaperUrl: string | null;
  passportPhotoUrl: string | null;
  createdAt: string;
};

type PendingVehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  dailyRate: number;
  vehiclePhotoUrl: string;
  ownershipPaperUrl: string;
  insurancePaperUrl: string | null;
  owner: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    verificationStatus: string;
  };
};

function DocLinks(props: {
  items: { label: string; href: string | null }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {props.items.map(
        (item) =>
          item.href && (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-background px-2.5 py-1.5 text-xs font-medium text-primary shadow-sm hover:bg-muted/60"
            >
              <FileText className="h-3.5 w-3.5" />
              {item.label}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          )
      )}
    </div>
  );
}

export default function AdminApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [owners, setOwners] = useState<PendingOwner[]>([]);
  const [vehicles, setVehicles] = useState<PendingVehicle[]>([]);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<
    { type: 'owner' | 'vehicle'; id: string } | null
  >(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [pendingRenters, setPendingRenters] = useState<PendingOwner[]>([]);

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ownerRes, vehicleRes, renterRes] = await Promise.all([
        fetch('/api/admin/owners/pending'),
        fetch('/api/admin/vehicles/pending'),
        fetch('/api/admin/renters?status=PENDING'),
      ]);
      const ownerData = await ownerRes.json();
      const vehicleData = await vehicleRes.json();
      const renterData = await renterRes.json();
      if (!ownerRes.ok || !vehicleRes.ok) {
        setError(ownerData.error || vehicleData.error || 'Unable to load pending requests');
        return;
      }
      setOwners(ownerData.owners || []);
      setVehicles(vehicleData.vehicles || []);
      setPendingRenters(renterData.renters || []);
    } catch {
      setError('Failed to load admin queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const closeReject = () => {
    setRejectOpen(false);
    setRejectTarget(null);
    setRejectNote('');
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      if (rejectTarget.type === 'owner') {
        // Check if this is a renter reject (pendingRenters list contains this id)
        const isRenter = pendingRenters.some(r => r.id === rejectTarget.id);
        const endpoint = isRenter
          ? `/api/admin/renters/${rejectTarget.id}/status`
          : `/api/admin/owners/${rejectTarget.id}/status`;
        await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'REJECTED', note: rejectNote || undefined }),
        });
      } else {
        await fetch(`/api/admin/vehicles/${rejectTarget.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'REJECTED', note: rejectNote || undefined }),
        });
      }
      closeReject();
      loadPending();
    } finally {
      setActionLoading(false);
    }
  };

  const approveOwner = async (id: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/owners/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      loadPending();
    } finally {
      setActionLoading(false);
    }
  };

  const approveRenter = async (id: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/renters/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      loadPending();
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectRenter = (id: string) => {
    setRejectTarget({ type: 'owner', id }); // reuse owner type for the dialog
    setRejectOpen(true);
  };

  const approveVehicle = async (id: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/vehicles/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      loadPending();
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectOwner = (id: string) => {
    setRejectTarget({ type: 'owner', id });
    setRejectOpen(true);
  };

  const openRejectVehicle = (id: string) => {
    setRejectTarget({ type: 'vehicle', id });
    setRejectOpen(true);
  };

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8">
        <AdminPageHeader
          title="Approval queue"
          description="Approve or reject renter and owner KYC and vehicle listings. Rejections can include a short note emailed to the user."
        />

        {loading && (
          <Card className="border border-border/60 bg-card p-10 text-center text-sm font-medium text-muted-foreground shadow-sm">
            Loading…
          </Card>
        )}
        {error && (
          <Card className="flex items-center gap-2 border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </Card>
        )}

        {!loading && !error && (
          <Tabs defaultValue="renters" className="w-full">
            <TabsList className="grid h-11 w-full max-w-xl grid-cols-3 rounded-lg border border-border/60 bg-muted/40 p-1">
              <TabsTrigger value="renters" className="rounded-md text-xs font-semibold sm:text-sm">
                Renters ({pendingRenters.length})
              </TabsTrigger>
              <TabsTrigger value="owners" className="rounded-md text-xs font-semibold sm:text-sm">
                Owners ({owners.length})
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="rounded-md text-xs font-semibold sm:text-sm">
                Vehicles ({vehicles.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Renters tab */}
            <TabsContent value="renters" className="mt-4 space-y-4">
              {pendingRenters.length === 0 ? (
                <Card className="border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
                  No pending renter KYC submissions.
                </Card>
              ) : (
                pendingRenters.map((renter) => (
                  <Card key={renter.id} className="overflow-hidden border border-border/60 bg-card shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-border/60 bg-muted/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold tracking-tight">{renter.fullName}</p>
                        <p className="text-sm text-muted-foreground">{renter.email} · {renter.phone}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {new Date(renter.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 shrink-0 font-medium sm:mt-0" asChild>
                        <Link href={`/admin/renters/${renter.id}`}>Full profile</Link>
                      </Button>
                    </div>
                    <div className="px-5 py-4 space-y-4">
                      <DocLinks
                        items={[
                          { label: 'NID / Passport', href: renter.nidOrPassportUrl },
                          { label: 'Driving license', href: renter.drivingLicenseUrl },
                        ]}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-medium"
                          disabled={actionLoading}
                          onClick={() => openRejectRenter(renter.id)}
                        >
                          <XCircle className="mr-1.5 h-4 w-4" /> Reject
                        </Button>
                        <Button size="sm" className="font-medium" disabled={actionLoading} onClick={() => approveRenter(renter.id)}>
                          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve KYC
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="owners" className="mt-4 space-y-4">
              {owners.length === 0 ? (
                <Card className="border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
                  No pending owner verifications.
                </Card>
              ) : (
                owners.map((owner) => (
                  <Card key={owner.id} className="overflow-hidden border border-border/60 bg-card shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-border/60 bg-muted/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold tracking-tight">{owner.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {owner.email} · {owner.phone}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {new Date(owner.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 shrink-0 font-medium sm:mt-0" asChild>
                        <Link href={`/admin/owners/${owner.id}`}>Full profile</Link>
                      </Button>
                    </div>
                    <div className="px-5 py-4 space-y-4">
                      <DocLinks
                        items={[
                          { label: 'NID / Passport', href: owner.nidOrPassportUrl },
                          { label: 'Driving license', href: owner.drivingLicenseUrl },
                          { label: 'Ownership paper', href: owner.ownershipPaperUrl },
                          { label: 'Passport photo', href: owner.passportPhotoUrl },
                        ]}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-medium"
                          disabled={actionLoading}
                          onClick={() => openRejectOwner(owner.id)}
                        >
                          <XCircle className="mr-1.5 h-4 w-4" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="font-medium"
                          disabled={actionLoading}
                          onClick={() => approveOwner(owner.id)}
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="vehicles" className="mt-4 space-y-4">
              {vehicles.length === 0 ? (
                <Card className="border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
                  No pending vehicles.
                </Card>
              ) : (
                vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="overflow-hidden border border-border/60 bg-card shadow-sm">
                    <div className="border-b border-border/60 bg-muted/25 px-5 py-4">
                      <p className="text-lg font-semibold tracking-tight">
                        {vehicle.brand} {vehicle.model}{' '}
                        <span className="font-medium text-muted-foreground">({vehicle.year})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reg: {vehicle.registrationNumber} · ৳{vehicle.dailyRate}/day
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold text-foreground">Owner:</span>{' '}
                        {vehicle.owner.fullName} · {vehicle.owner.email}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="font-medium" asChild>
                          <Link href={`/admin/owners/${vehicle.owner.id}`}>Owner profile</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="px-5 py-4 space-y-4">
                      <DocLinks
                        items={[
                          { label: 'Vehicle photo', href: vehicle.vehiclePhotoUrl },
                          { label: 'Ownership paper', href: vehicle.ownershipPaperUrl },
                          { label: 'Insurance', href: vehicle.insurancePaperUrl },
                        ]}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-medium"
                          disabled={actionLoading}
                          onClick={() => openRejectVehicle(vehicle.id)}
                        >
                          <XCircle className="mr-1.5 h-4 w-4" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="font-medium"
                          disabled={actionLoading}
                          onClick={() => approveVehicle(vehicle.id)}
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={(o) => !o && closeReject()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-semibold">
              Reject {rejectTarget?.type === 'vehicle' ? 'vehicle' : 'owner profile'}?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note" className="text-muted-foreground">
              Optional note (sent by email)
            </Label>
            <Textarea
              id="note"
              placeholder="Reason for rejection…"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeReject} className="font-medium">
              Cancel
            </Button>
            <Button variant="destructive" className="font-medium" onClick={submitReject} disabled={actionLoading}>
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
