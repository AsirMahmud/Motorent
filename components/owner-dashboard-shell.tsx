'use client';

import { Header } from '@/components/header';
import { OwnerDashboardSidebar } from '@/components/owner-dashboard-sidebar';

export function OwnerDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted font-sans antialiased">
      <Header forcedRole="owner" />
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)]">
        <OwnerDashboardSidebar />
        <div className="min-h-0 min-w-0 overflow-x-auto px-4 py-6 sm:px-6 md:px-8 md:py-10">
          <div className="mx-auto max-w-[1600px] md:min-h-[calc(100vh-5rem)]">{children}</div>
        </div>
      </div>
    </div>
  );
}
