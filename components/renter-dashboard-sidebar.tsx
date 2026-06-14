'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';

const links: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
}[] = [
  { href: '/renter-dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/browse?view=list', label: 'Browse', icon: Car },
];

export function RenterDashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    const linkPath = href.split('?')[0];
    if (exact) return pathname === linkPath;
    return pathname === linkPath || pathname.startsWith(linkPath + '/');
  };

  return (
    <aside className="flex w-full min-w-0 flex-col border-b border-white/10 bg-primary text-white md:sticky md:top-[4.5rem] md:max-h-[calc(100vh-4.5rem)] md:self-start md:overflow-y-auto md:border-b-0 md:border-r-0">
      <div className="flex flex-col gap-1 px-3 py-4 md:py-5">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-sm">
            <Bike className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">Renter</p>
            <p className="truncate text-sm font-semibold leading-tight">MotoRent</p>
          </div>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {links.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors md:py-2.5',
                isActive(href, exact)
                  ? 'bg-secondary text-secondary-foreground shadow-sm'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
