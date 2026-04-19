import { Suspense } from 'react';
import { AdminMessagesClient } from './admin-messages-client';

function MessagesFallback() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2 border-b border-border/70 pb-6">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-48 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
      </div>
      <div className="flex h-64 items-center justify-center rounded-lg border border-border/60 bg-card">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<MessagesFallback />}>
      <AdminMessagesClient />
    </Suspense>
  );
}
