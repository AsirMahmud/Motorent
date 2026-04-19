'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, MessageSquare } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
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
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminPageHeader
        title="Owners"
        description="Every owner account, verification state, and vehicle count. Open a row for full KYC and fleet details."
      />

      <Card className="border border-border/60 bg-card p-4 shadow-sm">
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
                className="font-medium capitalize"
                onClick={() => setFilter(s)}
              >
                {s === 'ALL' ? 'All' : s.toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {error && (
        <Card className="border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">
          {error}
        </Card>
      )}

      <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm font-medium text-muted-foreground">Loading owners…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Owner
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Contact
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Vehicles
                </TableHead>
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
                  <TableRow key={r.id} className="group border-border/50 transition-colors hover:bg-muted/25">
                    <TableCell className="font-medium">{r.fullName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div>{r.email}</div>
                      <div className="text-xs">{r.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(r.verificationStatus)} className="font-medium capitalize">
                        {r.verificationStatus.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{r._count.vehicles}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="gap-0.5 font-medium" asChild>
                          <Link href={`/admin/messages?with=${r.id}&name=${encodeURIComponent(r.fullName)}`}>
                            <MessageSquare className="h-3.5 w-3.5 opacity-60" /> Message
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-0 font-medium" asChild>
                          <Link href={`/admin/owners/${r.id}`}>
                            View
                            <ChevronRight className="h-4 w-4 opacity-60" />
                          </Link>
                        </Button>
                      </div>
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
