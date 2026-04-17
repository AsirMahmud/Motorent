'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Bike,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links: { href: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; exact?: boolean }[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/approvals', label: 'Approvals', icon: ClipboardCheck },
  { href: '/admin/owners', label: 'Owners', icon: Users },
  { href: '/admin/renters', label: 'Renters', icon: UserCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-white/90 backdrop-blur sm:w-56 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-2 px-3 pt-5 pb-4">
        <div className="flex items-center gap-2 px-2 pb-4 mb-1 border-b border-border/80">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/25">
            <Bike className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-tight leading-none">Admin</p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">MotoRent</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors',
                isActive(href, exact)
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
