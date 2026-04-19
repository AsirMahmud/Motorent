'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, ArrowLeft, MessageSquare, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Role = 'GENERAL' | 'OWNER' | 'ADMIN';

type Conversation = {
  partner: { id: string; fullName: string; role: Role };
  lastMessage: { body: string; createdAt: string; fromId: string };
  unread: number;
};

type DM = {
  id: string;
  body: string;
  createdAt: string;
  fromId: string;
  from: { id: string; fullName: string; role: Role };
};

type Partner = { id: string; fullName: string; role: Role; email: string };

const ROLE_LABEL: Record<Role, string> = { GENERAL: 'Renter', OWNER: 'Owner', ADMIN: 'Admin' };
const ROLE_COLOR: Record<Role, string> = {
  GENERAL: 'bg-blue-100 text-blue-700',
  OWNER:   'bg-violet-100 text-violet-700',
  ADMIN:   'bg-primary/10 text-primary',
};

function fmtDate(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

interface InboxPanelProps {
  currentUserId: string;
  /** Pre-open a conversation immediately (e.g. from a "Message" button) */
  openWithUserId?: string;
  openWithUserName?: string;
  /** Override default fixed height (e.g. full-page layout) */
  className?: string;
}

export function InboxPanel({ currentUserId, openWithUserId, openWithUserName, className }: InboxPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(openWithUserId ?? null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<DM[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // track the highest message count we've seen, so we only toast truly new ones
  const knownMsgCount = useRef(0);

  // ── Load inbox ──────────────────────────────────────────────────────────
  const loadInbox = useCallback(async () => {
    setLoadingInbox(true);
    try {
      const res = await fetch('/api/direct-messages', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json() as { conversations: Conversation[] };
        setConversations(data.conversations);
        // If openWithUserId is set but not in list yet, add a placeholder
        if (openWithUserId && !data.conversations.find(c => c.partner.id === openWithUserId)) {
          setConversations(prev => [...prev, {
            partner: { id: openWithUserId, fullName: openWithUserName ?? '…', role: 'GENERAL' },
            lastMessage: { body: '', createdAt: new Date().toISOString(), fromId: '' },
            unread: 0,
          }]);
        }
      }
    } finally {
      setLoadingInbox(false);
    }
  }, [openWithUserId, openWithUserName]);

  useEffect(() => { loadInbox(); }, [loadInbox]);

  // ── Load thread when selectedId changes ─────────────────────────────────
  const loadThread = useCallback(async (userId: string, silent = false) => {
    if (!silent) setLoadingThread(true);
    try {
      const res = await fetch(`/api/direct-messages/${userId}`, { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json() as { messages: DM[]; partner: Partner };

        // Toast when new messages arrive during background polling
        if (silent && data.messages.length > knownMsgCount.current && knownMsgCount.current > 0) {
          const newest = data.messages[data.messages.length - 1];
          if (newest && newest.fromId !== currentUserId) {
            toast(`💬 ${data.partner?.fullName ?? 'New message'}`, {
              description: newest.body.slice(0, 80) + (newest.body.length > 80 ? '…' : ''),
              duration: 5000,
            });
          }
        }
        knownMsgCount.current = data.messages.length;

        setMessages(data.messages);
        setPartner(data.partner);
        setConversations(prev => prev.map(c =>
          c.partner.id === userId ? { ...c, unread: 0 } : c
        ));
      }
    } finally {
      if (!silent) setLoadingThread(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedId) {
      knownMsgCount.current = 0; // reset when switching conversations
      loadThread(selectedId);
    }
  }, [selectedId, loadThread]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-poll thread every 8 s (silent — toasts on new messages)
  useEffect(() => {
    if (!selectedId) return;
    pollRef.current = setInterval(() => loadThread(selectedId, true), 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedId, loadThread]);

  // ── Send ─────────────────────────────────────────────────────────────────
  async function handleSend() {
    if (!selectedId || !body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/direct-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ toId: selectedId, body: body.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { message: DM };
        setMessages(prev => [...prev, data.message]);
        setBody('');
        loadInbox();
      }
    } finally {
      setSending(false);
    }
  }

  const filteredConversations = conversations.filter(c =>
    c.partner.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'flex h-[560px] rounded-2xl border border-border/60 overflow-hidden bg-white shadow-sm',
        className
      )}
    >

      {/* Left — conversation list */}
      <div className={`flex flex-col border-r border-border/60 bg-muted/20 ${selectedId ? 'hidden md:flex md:w-64' : 'flex w-full md:w-64'}`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" />
            <span className="font-black text-sm">Messages</span>
            {totalUnread > 0 && (
              <span className="w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </div>
          <button onClick={loadInbox} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw size={13} className={loadingInbox ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border/40">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-border/60 px-3 py-1.5">
            <Search size={12} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center">
              <MessageSquare size={28} className="mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground font-bold">No conversations yet</p>
            </div>
          )}
          {filteredConversations.map(conv => (
            <button
              key={conv.partner.id}
              onClick={() => setSelectedId(conv.partner.id)}
              className={`w-full text-left px-4 py-3 border-b border-border/30 hover:bg-white transition-colors ${selectedId === conv.partner.id ? 'bg-white border-l-2 border-l-primary' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-black text-sm truncate">{conv.partner.fullName}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${ROLE_COLOR[conv.partner.role]}`}>
                      {ROLE_LABEL[conv.partner.role]}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{conv.lastMessage.body || 'Start a conversation'}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground">{conv.lastMessage.createdAt ? fmtDate(conv.lastMessage.createdAt) : ''}</span>
                  {conv.unread > 0 && (
                    <span className="w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right — thread */}
      {selectedId ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Thread header */}
          <div className="px-4 py-3 border-b border-border/60 flex items-center gap-3 bg-white">
            <button
              onClick={() => setSelectedId(null)}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            {partner && (
              <>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-primary">{partner.fullName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate">{partner.fullName}</p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${ROLE_COLOR[partner.role as Role]}`}>
                    {ROLE_LABEL[partner.role as Role]}
                  </span>
                </div>
              </>
            )}
            <button onClick={() => selectedId && loadThread(selectedId)} className="ml-auto text-muted-foreground hover:text-foreground">
              <RefreshCw size={13} className={loadingThread ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingThread && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}
            {!loadingThread && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare size={36} className="text-muted-foreground/20 mb-2" />
                <p className="text-sm font-black text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground/60">Send the first message below</p>
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.fromId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl shadow-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-muted rounded-bl-sm'}`}>
                    {!isMe && (
                      <p className="text-[10px] font-black mb-1 opacity-60">{msg.from.fullName}</p>
                    )}
                    <p className="text-sm leading-snug break-words">{msg.body}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-muted-foreground/60'}`}>
                      {fmtDate(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div className="px-4 py-3 border-t border-border/60 bg-white flex items-end gap-2">
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message… (Enter to send)"
              rows={2}
              className="flex-1 resize-none rounded-xl border border-border/60 px-3 py-2 text-sm outline-none focus:border-primary transition-colors bg-muted/30 placeholder:text-muted-foreground/50"
            />
            <Button
              size="sm"
              className="h-10 w-10 rounded-xl p-0 shrink-0 shadow-md shadow-primary/20"
              onClick={handleSend}
              disabled={!body.trim() || sending}
            >
              <Send size={15} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center p-8">
          <div>
            <MessageSquare size={48} className="mx-auto mb-3 text-muted-foreground/20" />
            <p className="font-black text-muted-foreground">Select a conversation</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Choose someone from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
