'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [renters, setRenters] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const loadPending = async () => {
    setLoading(true);
    setError('');
    try {
      const [renterRes, vehicleRes] = await Promise.all([
        fetch('/api/admin/renters/pending'),
        fetch('/api/admin/vehicles/pending'),
      ]);
      const renterData = await renterRes.json();
      const vehicleData = await vehicleRes.json();
      if (!renterRes.ok || !vehicleRes.ok) {
        setError(renterData.error || vehicleData.error || 'Unable to load pending requests');
        setLoading(false);
        return;
      }
      setRenters(renterData.renters || []);
      setVehicles(vehicleData.vehicles || []);
    } catch {
      setError('Failed to load admin queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const updateRenterStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await fetch(`/api/admin/renters/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadPending();
  };

  const updateVehicleStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await fetch(`/api/admin/vehicles/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadPending();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />
      <div className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black">Admin Verification Queue</h1>
            <Button onClick={() => router.push('/')}>Home</Button>
          </div>

          {loading && <Card className="p-6">Loading pending requests...</Card>}
          {error && (
            <Card className="p-6 flex items-center gap-2 text-red-600">
              <AlertCircle size={16} /> {error}
            </Card>
          )}

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-black">Pending Renter Verification</h2>
            {renters.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending renters.</p>
            ) : renters.map((renter) => (
              <div key={renter.id} className="border rounded-xl p-4 space-y-2">
                <p className="font-bold">{renter.fullName}</p>
                <p className="text-sm text-muted-foreground">{renter.email} · {renter.phone}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a href={renter.nidOrPassportUrl} target="_blank" className="underline">NID/Passport</a>
                  <a href={renter.drivingLicenseUrl} target="_blank" className="underline">Driving License</a>
                  <a href={renter.ownershipPaperUrl} target="_blank" className="underline">Ownership Paper</a>
                  <a href={renter.passportPhotoUrl} target="_blank" className="underline">Passport Photo</a>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateRenterStatus(renter.id, 'REJECTED')}>
                    <XCircle size={14} className="mr-1" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => updateRenterStatus(renter.id, 'APPROVED')}>
                    <CheckCircle2 size={14} className="mr-1" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-black">Pending Vehicle Approval</h2>
            {vehicles.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending vehicles.</p>
            ) : vehicles.map((vehicle) => (
              <div key={vehicle.id} className="border rounded-xl p-4 space-y-2">
                <p className="font-bold">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                <p className="text-sm text-muted-foreground">
                  Owner: {vehicle.owner.fullName} · Reg: {vehicle.registrationNumber} · Rate: {vehicle.dailyRate}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a href={vehicle.vehiclePhotoUrl} target="_blank" className="underline">Vehicle Photo</a>
                  <a href={vehicle.ownershipPaperUrl} target="_blank" className="underline">Ownership Paper</a>
                  {vehicle.insurancePaperUrl ? <a href={vehicle.insurancePaperUrl} target="_blank" className="underline">Insurance Paper</a> : null}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateVehicleStatus(vehicle.id, 'REJECTED')}>
                    <XCircle size={14} className="mr-1" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => updateVehicleStatus(vehicle.id, 'APPROVED')}>
                    <CheckCircle2 size={14} className="mr-1" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
