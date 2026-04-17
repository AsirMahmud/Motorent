'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCircle,
  Car,
  ClipboardList,
  Clock,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { AdminKpiCard } from '@/components/admin/admin-kpi-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Stats = {
  totalPlatformUsers: number;
  owners: number;
  hosts: number;
  admins: number;
  pendingOwnerVerifications: number;
  pendingVehicles: number;
  totalVehicles: number;
  approvedVehicles: number;
  rejectedVehicles: number;
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to load dashboard');
        return;
      }
      setStats(data);
    } catch {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Admin overview</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Platform health, owner and customer counts, and shortcuts to verification queues.
          </p>
        </div>
        <Button variant="outline" className="shrink-0 font-bold" asChild>
          <Link href="/admin/approvals">
            Open approval queue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-28 animate-pulse bg-muted/80 border-0" />
          ))}
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </Card>
      )}

      {stats && !loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminKpiCard
              label="Owners"
              value={stats.owners}
              hint="Email sign-ups with KYC (list vehicles)"
              icon={Users}
              accent="violet"
            />
            <AdminKpiCard
              label="Customers (Google)"
              value={stats.hosts}
              hint="Google sign-in accounts (browse & book)"
              icon={UserCircle}
              accent="emerald"
            />
            <AdminKpiCard
              label="Total users"
              value={stats.totalPlatformUsers}
              hint="Owners + customers (excludes admins)"
              icon={Shield}
            />
            <AdminKpiCard
              label="Admins"
              value={stats.admins}
              hint="Console access"
              icon={ClipboardList}
              accent="amber"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AdminKpiCard
              label="Pending owner reviews"
              value={stats.pendingOwnerVerifications}
              hint="Awaiting approve or reject"
              icon={Clock}
              accent="amber"
            />
            <AdminKpiCard
              label="Pending vehicles"
              value={stats.pendingVehicles}
              hint="Listings awaiting document review"
              icon={Car}
              accent="amber"
            />
            <AdminKpiCard
              label="Approved vehicles"
              value={stats.approvedVehicles}
              hint={`${stats.totalVehicles} total · ${stats.rejectedVehicles} rejected`}
              icon={Car}
              accent="emerald"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6 shadow-md border-0 bg-white">
              <h2 className="text-lg font-black">Quick actions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Jump to verification work or browse every owner profile and their fleet.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button className="font-bold" asChild>
                  <Link href="/admin/approvals">Review pending items</Link>
                </Button>
                <Button variant="outline" className="font-bold" asChild>
                  <Link href="/admin/owners">Browse all owners</Link>
                </Button>
              </div>
            </Card>
            <Card className="p-6 shadow-md border-0 bg-white">
              <h2 className="text-lg font-black">What these numbers mean</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-bold text-foreground">Owners</span> — users who registered with email and
                  uploaded ID documents; you approve them before they can sign in and list vehicles.
                </li>
                <li>
                  <span className="font-bold text-foreground">Customers (Google)</span> — role GENERAL: sign in with
                  Google to browse and book vehicles.
                </li>
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
