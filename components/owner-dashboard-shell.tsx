'use client';

import { Header } from '@/components/header';

export function OwnerDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header forcedRole="owner" />
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
