'use client';

import { Header } from '@/components/header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] font-sans">
      <Header forcedRole="admin" />
      <div className="flex min-h-0 flex-1 flex-row">
        <AdminSidebar />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
