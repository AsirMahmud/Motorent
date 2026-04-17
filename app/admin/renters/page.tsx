'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type RenterRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  verificationStatus: string;
  verificationNote: string | null;
  createdAt: string;
  totalSpend: number;
  _count: { bookingsAsRenter: number };
};

const statusFilter = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const;

function statusBadgeVariant(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (s === 'APPROVED') return 'default';
  if (s === 'PENDING') return 'secondary';
  if (s === 'REJECTED') return 'destructive';
  return 'outline';
}

export default function AdminRentersListPage() {
  const [renters, setRenters] = useState<RenterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof statusFilter)[number]>('ALL');
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState('');
  const [rejectName, setRejectName] = useState('');
  const [rejectNote, setRejectNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = filter === 'ALL' ? '' : `?status=${filter}`;
      const res = await fetch(`/api/admin/renters${q}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to load renters'); return; }
      setRenters(data.renters || []);
    } catch {
      setError('Failed to load renters');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return renters;
    return renters.filter(r =>
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q)
    );
  }, [renters, query]);

  const updateStatus = async (id: string, status: 'APPROVED' | 'REJECTED', note?: string) => {
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

  const openReject = (id: string, name: string) => {
    setRejectId(id); setRejectName(name); setRejectNote(''); setRejectOpen(true);
  };

  const submitReject = async () => {
    await updateStatus(rejectId, 'REJECTED', rejectNote || undefined);
    setRejectOpen(false);
  };

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Renters</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All registered renters, their KYC verification status, booking count, and total spend.
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
              {statusFilter.map(s => (
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
          <Card className="border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </Card>
        )}

        <Card className="border-0 shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-muted-foreground">Loading renters…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-black">Renter</TableHead>
                  <TableHead className="font-black">Contact</TableHead>
                  <TableHead className="font-black">KYC Status</TableHead>
                  <TableHead className="font-black text-right">Bookings</TableHead>
                  <TableHead className="font-black text-right">Total Spend</TableHead>
                  <TableHead className="font-black text-center">Actions</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                      No renters match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(r => (
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
                      <TableCell className="text-right tabular-nums font-bold">{r._count.bookingsAsRenter}</TableCell>
                      <TableCell className="text-right tabular-nums font-bold text-primary">
                        ৳{r.totalSpend.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.verificationStatus === 'PENDING' && (
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              className="h-7 text-xs font-bold rounded-lg gap-0.5"
                              disabled={actionLoading}
                              onClick={() => updateStatus(r.id, 'APPROVED')}
                            >
                              <CheckCircle2 className="h-3 w-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-bold rounded-lg gap-0.5"
                              disabled={actionLoading}
                              onClick={() => openReject(r.id, r.fullName)}
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                          </div>
                        )}
                        {r.verificationStatus === 'APPROVED' && (
                          <span className="text-xs text-green-600 font-bold">Approved</span>
                        )}
                        {r.verificationStatus === 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-bold rounded-lg"
                            disabled={actionLoading}
                            onClick={() => updateStatus(r.id, 'APPROVED')}
                          >
                            Re-approve
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="font-bold gap-0" asChild>
                          <Link href={`/admin/renters/${r.id}`}>
                            View <ChevronRight className="h-4 w-4 opacity-60" />
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

      <Dialog open={rejectOpen} onOpenChange={(o) => !o && setRejectOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black">Reject KYC — {rejectName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectNote" className="text-muted-foreground">Reason (sent to renter by email)</Label>
            <Textarea
              id="rejectNote"
              placeholder="e.g. NID photo is blurry, please resubmit…"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="font-bold">Cancel</Button>
            <Button variant="destructive" className="font-bold" onClick={submitReject} disabled={actionLoading}>
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
