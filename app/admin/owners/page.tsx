'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type OwnerRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  verificationStatus: string;
  verificationNote: string | null;
  verificationReviewedAt: string | null;
  createdAt: string;
  _count: { vehicles: number };
};

const statusFilter = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const;

function statusBadgeVariant(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (s === 'APPROVED') return 'default';
  if (s === 'PENDING') return 'secondary';
  if (s === 'REJECTED') return 'destructive';
  return 'outline';
}

export default function AdminOwnersListPage() {
  const [owners, setOwners] = useState<OwnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof statusFilter)[number]>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = filter === 'ALL' ? '' : `?status=${filter}`;
      const res = await fetch(`/api/admin/owners${q}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load owners');
        return;
      }
      setOwners(data.owners || []);
    } catch {
      setError('Failed to load owners');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return owners;
    return owners.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
    );
  }, [owners, query]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">Owners</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every owner account, verification state, and vehicle count. Open a row for full KYC and fleet details.
        </p>
      </div>

      <Card className="border-0 shadow-md p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone…"
              className="pl-9 font-medium"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilter.map((s) => (
              <Button
                key={s}
                variant={filter === s ? 'default' : 'outline'}
                size="sm"
                className="font-bold capitalize"
                onClick={() => setFilter(s)}
              >
                {s === 'ALL' ? 'All' : s.toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{error}</Card>
      )}

      <Card className="border-0 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm font-medium text-muted-foreground">Loading owners…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-black">Owner</TableHead>
                <TableHead className="font-black">Contact</TableHead>
                <TableHead className="font-black">Status</TableHead>
                <TableHead className="font-black text-right">Vehicles</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    No owners match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="group">
                    <TableCell className="font-bold">{r.fullName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div>{r.email}</div>
                      <div className="text-xs">{r.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(r.verificationStatus)} className="font-bold capitalize">
                        {r.verificationStatus.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{r._count.vehicles}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="font-bold gap-0" asChild>
                        <Link href={`/admin/owners/${r.id}`}>
                          View
                          <ChevronRight className="h-4 w-4 opacity-60" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
