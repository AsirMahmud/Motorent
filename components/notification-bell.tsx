'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Bell, CheckCheck, MessageSquare, Calendar,
  CheckCircle2, XCircle, Package, RotateCcw,
} from 'lucide-react';
import type { NotifItem } from '@/app/api/notifications/route';

// ── icon / colour maps ────────────────────────────────────────────────────
const ICON_MAP: Record<NotifItem['type'], React.ComponentType<{ size?: number; className?: string }>> = {
  booking_accepted:  CheckCircle2,
  booking_rejected:  XCircle,
  pickup_confirmed:  Package,
  return_confirmed:  RotateCcw,
  new_request:       Calendar,
  new_message:       MessageSquare,
};

const COLOR_MAP: Record<NotifItem['type'], string> = {
  booking_accepted:  'bg-green-100 text-green-700',
  booking_rejected:  'bg-red-100 text-red-700',
  pickup_confirmed:  'bg-orange-100 text-orange-700',
  return_confirmed:  'bg-blue-100 text-blue-700',
  new_request:       'bg-amber-100 text-amber-700',
  new_message:       'bg-primary/10 text-primary',
};

// ── localStorage helpers (tracks which IDs have been "seen") ─────────────
const SEEN_KEY = 'motorent_seen_notifs';

function getSeenIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
  catch { return new Set(); }
}
function persistSeen(ids: string[]) {
  try {
    const all = getSeenIds();
    ids.forEach(id => all.add(id));
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(all).slice(-300)));
  } catch { /* ignore */ }
}

// ── time helper ───────────────────────────────────────────────────────────
function fmtAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ── component ─────────────────────────────────────────────────────────────
export function NotificationBell() {
  const router = useRouter();
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unseenIds, setUnseenIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  // On first load we don't want to spam toasts for old notifications
  const firstLoad = useRef(true);

  // ── fetch + diff ─────────────────────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'same-origin' });
      if (!res.ok) return;
      const { notifications } = await res.json() as { notifications: NotifItem[] };

      const seen = getSeenIds();
      const brandNew = notifications.filter(n => !seen.has(n.id));

      // Fire toasts only on subsequent polls (not on first page load)
      if (!firstLoad.current && brandNew.length > 0) {
        brandNew.forEach(n => {
          const Icon = ICON_MAP[n.type] ?? Bell;
          toast(n.title, {
            description: n.body,
            icon: <Icon size={16} />,
            action: {
              label: 'View',
              onClick: () => router.push(n.href),
            },
            duration: 6000,
          });
        });
      }

      firstLoad.current = false;
      setItems(notifications);
      setUnseenIds(new Set(notifications.map(n => n.id).filter(id => !seen.has(id))));
    } catch { /* ignore */ }
  }, [router]);

  // ── poll every 30 s ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifs();
    pollRef.current = setInterval(fetchNotifs, 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchNotifs]);

  // ── also check immediately when tab becomes visible ──────────────────────
  useEffect(() => {
    const handle = () => { if (document.visibilityState === 'visible') fetchNotifs(); };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [fetchNotifs]);

  // ── close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // ── open / close ──────────────────────────────────────────────────────────
  function handleOpen() {
    setOpen(o => !o);
    if (!open) {
      persistSeen(items.map(n => n.id));
      setUnseenIds(new Set());
    }
  }

  function handleClick(n: NotifItem) {
    setOpen(false);
    router.push(n.href);
  }

  const unreadCount = unseenIds.size;

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell button ─────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        className="relative p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-primary"
        aria-label="Notifications"
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-[wiggle_0.4s_ease-in-out]' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 leading-none animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────────────────────────── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-border/60 z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-primary" />
              <span className="font-black text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => { persistSeen(items.map(n => n.id)); setUnseenIds(new Set()); }}
              className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          </div>

          {/* list */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border/30">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={36} className="mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-sm font-black text-muted-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground/50 mt-1">No notifications in the last 7 days</p>
              </div>
            ) : (
              items.map(n => {
                const Icon = ICON_MAP[n.type] ?? Bell;
                const colorClass = COLOR_MAP[n.type] ?? 'bg-muted text-muted-foreground';
                const isNew = unseenIds.has(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-muted/40 transition-colors ${isNew ? 'bg-blue-50/60' : ''}`}
                  >
                    {/* icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon size={16} />
                    </div>

                    {/* text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-sm leading-tight truncate">{n.title}</p>
                        {isNew && (
                          <span className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1 font-bold">{fmtAgo(n.createdAt)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* footer */}
          <div className="px-4 py-2 border-t border-border/50 bg-muted/20 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground font-bold">Last 7 days · refreshes every 30 s</p>
            <button
              onClick={() => { fetchNotifs(); }}
              className="text-[10px] font-black text-primary hover:underline"
            >
              Refresh now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
