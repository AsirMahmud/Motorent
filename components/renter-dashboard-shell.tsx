'use client';

import { Header } from '@/components/header';

export function RenterDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header forcedRole="renter" />
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
