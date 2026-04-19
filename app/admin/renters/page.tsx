'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
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
      <div className="mx-auto max-w-6xl space-y-8">
        <AdminPageHeader
          title="Renters"
          description="All registered renters, their KYC verification status, booking count, and total spend."
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
              {statusFilter.map(s => (
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
          <Card className="flex items-center gap-2 border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </Card>
        )}

        <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-muted-foreground">Loading renters…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Renter
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contact
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    KYC status
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Bookings
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Total spend
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </TableHead>
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
                      <TableCell className="text-right tabular-nums font-medium">{r._count.bookingsAsRenter}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold text-primary">
                        ৳{r.totalSpend.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.verificationStatus === 'PENDING' && (
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              className="h-7 gap-0.5 rounded-lg text-xs font-medium"
                              disabled={actionLoading}
                              onClick={() => updateStatus(r.id, 'APPROVED')}
                            >
                              <CheckCircle2 className="h-3 w-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-0.5 rounded-lg text-xs font-medium"
                              disabled={actionLoading}
                              onClick={() => openReject(r.id, r.fullName)}
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                          </div>
                        )}
                        {r.verificationStatus === 'APPROVED' && (
                          <span className="text-xs font-medium text-emerald-700">Approved</span>
                        )}
                        {r.verificationStatus === 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-lg text-xs font-medium"
                            disabled={actionLoading}
                            onClick={() => updateStatus(r.id, 'APPROVED')}
                          >
                            Re-approve
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="gap-0.5 font-medium" asChild>
                            <Link href={`/admin/messages?with=${r.id}&name=${encodeURIComponent(r.fullName)}`}>
                              <MessageSquare className="h-3.5 w-3.5 opacity-60" /> Message
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-0 font-medium" asChild>
                            <Link href={`/admin/renters/${r.id}`}>
                              View <ChevronRight className="h-4 w-4 opacity-60" />
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

      <Dialog open={rejectOpen} onOpenChange={(o) => !o && setRejectOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-semibold">Reject KYC — {rejectName}</DialogTitle>
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
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="font-medium">
              Cancel
            </Button>
            <Button variant="destructive" className="font-medium" onClick={submitReject} disabled={actionLoading}>
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
