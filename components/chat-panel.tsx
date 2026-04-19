'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

type ChatMessage = {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: string;
};

interface ChatPanelProps {
  bookingId: string;
  /** Label shown in the collapsed header */
  label?: string;
}

const POLL_INTERVAL = 5000;

export function ChatPanel({ bookingId, label = 'Chat with other party' }: ChatPanelProps) {
  const { currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pusherRef = useRef<import('pusher-js').default | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);
  const lastCountRef = useRef(0);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?bookingId=${bookingId}`, { credentials: 'same-origin' });
      if (!res.ok) return;
      const data = (await res.json()) as {
        messages: Array<{
          id: string;
          bookingId: string;
          senderId: string;
          body: string;
          createdAt: string;
          sender: { id: string; fullName: string; role: string };
        }>;
      };
      const mapped: ChatMessage[] = data.messages.map((m) => ({
        id: m.id,
        bookingId: m.bookingId,
        senderId: m.senderId,
        senderName: m.sender.fullName,
        senderRole: m.sender.role,
        body: m.body,
        createdAt: m.createdAt,
      }));
      setMessages(mapped);

      if (!open && mapped.length > lastCountRef.current) {
        setUnread((u) => u + mapped.length - lastCountRef.current);
      }
      lastCountRef.current = mapped.length;
    } catch {
      // network error — silently skip
    }
  }, [bookingId, open]);

  // Initial load
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));
    setUnread(0);
  }, [open, fetchMessages]);

  // Pusher real-time or polling fallback
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (pusherKey && pusherCluster) {
      // Real-time via Pusher
      let mounted = true;
      (async () => {
        const PusherClient = (await import('pusher-js')).default;
        if (!mounted) return;

        const pusher = new PusherClient(pusherKey, {
          cluster: pusherCluster,
          authEndpoint: '/api/pusher/auth',
        });
        pusherRef.current = pusher;

        const channel = pusher.subscribe(`booking-${bookingId}`);
        channelRef.current = channel;

        channel.bind('new-message', (data: ChatMessage) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
          lastCountRef.current += 1;
          if (!open) setUnread((u) => u + 1);
        });
      })();

      return () => {
        mounted = false;
        channelRef.current?.unbind_all();
        pusherRef.current?.unsubscribe(`booking-${bookingId}`);
        pusherRef.current?.disconnect();
      };
    } else {
      // Fallback: poll every 5 s
      pollRef.current = setInterval(fetchMessages, POLL_INTERVAL);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [bookingId, fetchMessages, open]);

  // Auto-scroll to bottom when messages change and panel is open
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      bookingId,
      senderId: currentUser?.id ?? '',
      senderName: currentUser?.name ?? 'You',
      senderRole: currentUser?.role ?? 'renter',
      body: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, body: optimistic.body }),
        credentials: 'same-origin',
      });
      if (res.ok) {
        const data = (await res.json()) as { message: { id: string; createdAt: string } };
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id ? { ...m, id: data.message.id, createdAt: data.message.createdAt } : m
          )
        );
        lastCountRef.current += 1;
      }
    } catch {
      // Revert optimistic update on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-white shadow-md">
      {/* Header / Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/5 hover:bg-secondary/10 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-black text-secondary">
          <MessageSquare size={16} />
          {label}
          {unread > 0 && !open && (
            <span className="ml-1 bg-primary text-white text-[10px] font-black rounded-full px-1.5 py-0.5">
              {unread}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="flex flex-col" style={{ height: '320px' }}>
          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-muted-foreground" size={20} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <MessageSquare size={28} className="opacity-30" />
                <p className="text-xs font-medium">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMine = m.senderId === currentUser?.id;
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                      isMine
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      {!isMine && (
                        <p className="text-[10px] font-black opacity-60 mb-0.5 capitalize">
                          {m.senderRole === 'OWNER' ? 'Owner' : m.senderRole === 'ADMIN' ? 'Admin' : 'Renter'}
                        </p>
                      )}
                      <p className="text-sm leading-snug">{m.body}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="px-3 py-2 border-t flex gap-2 items-center bg-background">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message…"
              className="flex-1 h-9 rounded-xl text-sm"
              disabled={sending}
            />
            <Button
              size="sm"
              className="h-9 w-9 p-0 rounded-xl"
              onClick={sendMessage}
              disabled={sending || !input.trim()}
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
