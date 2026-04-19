'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, Car, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';

const links: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
}[] = [
  { href: '/renter-dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/home', label: 'Explore', icon: MapPin },
  { href: '/browse', label: 'Browse', icon: Car },
];

export function RenterDashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="flex w-full min-w-0 flex-col border-b border-border bg-card md:border-b-0 md:border-r md:sticky md:top-16 md:max-h-[calc(100vh-4rem)] md:self-start md:overflow-y-auto">
      <div className="flex flex-col gap-1 px-3 py-4 md:py-5">
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Bike className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Renter</p>
            <p className="truncate text-sm font-semibold leading-tight">MotoRent</p>
          </div>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {links.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:py-2.5',
                isActive(href, exact)
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
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
