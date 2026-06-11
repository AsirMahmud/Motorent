'use client';

import { MapPin, Search, MessageSquare, Calendar } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type ItemKey = 'explore' | 'browse' | 'trips' | 'messages';

export function MobileExplorerTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, messages } = useApp();

  const inboxBadge =
    currentUser &&
    messages.filter((m) => m.recipientId === currentUser.id && !m.read).length;

  const tripsHref = !currentUser
    ? '/login'
    : currentUser.role === 'owner'
      ? '/owner-dashboard'
      : currentUser.role === 'admin'
        ? '/admin'
        : '/renter-dashboard';

  const messagesHref = !currentUser
    ? '/login'
    : currentUser.role === 'admin'
      ? '/admin/messages'
      : '/messages';

  const items: { key: ItemKey; label: string; icon: LucideIcon; href: string }[] = [
    { key: 'explore', label: 'Explore', icon: MapPin, href: '/home' },
    { key: 'browse', label: 'Browse', icon: Search, href: '/browse' },
    {
      key: 'trips',
      label: currentUser?.role === 'owner' ? 'Dashboard' : 'Bookings',
      icon: Calendar,
      href: tripsHref,
    },
    { key: 'messages', label: 'Inbox', icon: MessageSquare, href: messagesHref },
  ];

  const activeKey: ItemKey =
    pathname === '/messages' || pathname.startsWith('/admin/messages')
      ? 'messages'
      : pathname.startsWith('/browse')
        ? 'browse'
        : pathname === '/home'
          ? 'explore'
          : 'trips';

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/80 bg-white/95 backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                'flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-all duration-200 active:scale-[0.97]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                  active ? 'bg-primary/10' : 'bg-transparent'
                )}
              >
                <item.icon
                  size={20}
                  strokeWidth={active ? 2.25 : 2}
                  className={cn(active && 'text-primary')}
                />
                {item.key === 'messages' && inboxBadge ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white shadow-sm">
                    {inboxBadge > 9 ? '9+' : inboxBadge}
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  'max-w-full truncate text-[10px] font-semibold tracking-tight',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
