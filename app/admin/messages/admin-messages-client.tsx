'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { InboxPanel } from '@/components/inbox-panel';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

export function AdminMessagesClient() {
  const searchParams = useSearchParams();
  const withUser = searchParams.get('with') ?? undefined;
  const withName = searchParams.get('name') ?? undefined;

  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { user?: { id: string } } | null) => {
        if (d?.user?.id) setAdminId(d.user.id);
      });
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <AdminPageHeader
        title="Messages"
        description="Direct conversations with owners and renters across the platform."
      />
      {adminId ? (
        <InboxPanel
          currentUserId={adminId}
          openWithUserId={withUser}
          openWithUserName={withName}
        />
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl border border-border/60 bg-card shadow-sm">
          <div
            className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
          <span className="sr-only">Loading inbox</span>
        </div>
      )}
    </div>
  );
}
