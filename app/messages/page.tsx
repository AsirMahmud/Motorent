'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useRef, useEffect } from 'react';
import { MessageSquare, Send, Phone, ArrowLeft, ShieldCheck, AlertCircle, Search } from 'lucide-react';
import { Message } from '@/lib/types';

export default function MessagesPage() {
  const router = useRouter();
  const { currentUser, messages, users, addMessage } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUserId]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="p-10 text-center max-w-sm rounded-3xl shadow-2xl border-none">
            <AlertCircle className="text-amber-400 mx-auto mb-4" size={40} />
            <h2 className="text-xl font-black mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Log in to view your messages.</p>
            <Button onClick={() => router.push('/login')} className="rounded-xl px-8 h-12 font-black">Sign In</Button>
          </Card>
        </div>
      </div>
    );
  }

  // Get all unique conversations for current user
  const conversations = useMemo(() => {
    const partnerIds = new Set<string>();
    messages.forEach(m => {
      if (m.senderId === currentUser.id) partnerIds.add(m.recipientId);
      if (m.recipientId === currentUser.id) partnerIds.add(m.senderId);
    });
    return Array.from(partnerIds).map(partnerId => {
      const partner = users.find(u => u.id === partnerId);
      const convoMessages = messages.filter(m =>
        (m.senderId === currentUser.id && m.recipientId === partnerId) ||
        (m.senderId === partnerId && m.recipientId === currentUser.id)
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const lastMsg = convoMessages[convoMessages.length - 1];
      const unread = convoMessages.filter(m => m.recipientId === currentUser.id && !m.read).length;
      return { partnerId, partner, messages: convoMessages, lastMsg, unread };
    }).filter(c => c.partner).sort((a, b) =>
      new Date(b.lastMsg?.createdAt || 0).getTime() - new Date(a.lastMsg?.createdAt || 0).getTime()
    );
  }, [messages, currentUser, users]);

  const filteredConversations = conversations.filter(c =>
    !searchQuery || c.partner?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConvo = selectedUserId ? conversations.find(c => c.partnerId === selectedUserId) : null;
  const activePartner = activeConvo?.partner;
  const convoMessages = activeConvo?.messages || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      recipientId: selectedUserId,
      content: newMessage.trim(),
      read: false,
      createdAt: new Date(),
    };
    addMessage(msg);
    setNewMessage('');
  };

  // If no conversations exist, add a demo option
  const potentialPartners = users.filter(u =>
    u.id !== currentUser.id && u.role !== 'admin' &&
    !conversations.some(c => c.partnerId === u.id)
  );

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden bg-[#F8FAFC]">
      <Header />

      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full px-4 py-4 gap-4">
        {/* Sidebar */}
        <div className={`${selectedUserId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white rounded-2xl shadow-sm overflow-hidden shrink-0`}>
          <div className="p-4 border-b border-border/50">
            <h2 className="font-black text-lg mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 h-9 rounded-xl border-none bg-muted/50 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? filteredConversations.map(convo => (
              <button
                key={convo.partnerId}
                onClick={() => setSelectedUserId(convo.partnerId)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors border-b border-border/20 text-left ${selectedUserId === convo.partnerId ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-base">
                    {convo.partner?.name.charAt(0)}
                  </div>
                  {convo.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {convo.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-sm truncate">{convo.partner?.name}</p>
                    <p className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {convo.lastMsg ? new Date(convo.lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{convo.partner?.role}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.lastMsg?.content}</p>
                </div>
              </button>
            )) : (
              <div className="p-6 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="font-bold text-sm text-muted-foreground">No conversations yet</p>
              </div>
            )}

            {/* Potential new conversations */}
            {potentialPartners.length > 0 && (
              <div className="p-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-2">Start Conversation</p>
                {potentialPartners.slice(0, 3).map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-muted/30 rounded-xl transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-muted text-muted-foreground rounded-xl flex items-center justify-center font-black text-sm">{u.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedUserId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white rounded-2xl shadow-sm overflow-hidden`}>
          {selectedUserId && activePartner ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 flex items-center gap-3">
                <button onClick={() => setSelectedUserId(null)} className="md:hidden p-1.5 hover:bg-muted rounded-xl">
                  <ArrowLeft size={18} />
                </button>
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black shrink-0">
                  {activePartner.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black">{activePartner.name}</p>
                    {activePartner.kycStatus === 'verified' && <ShieldCheck size={13} className="text-green-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{activePartner.role}</p>
                </div>
                <a href={`tel:${activePartner.phone}`}>
                  <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold gap-1.5">
                    <Phone size={14} /> Call
                  </Button>
                </a>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {convoMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="font-bold text-muted-foreground">Say hello to {activePartner.name}!</p>
                    </div>
                  </div>
                ) : (
                  convoMessages.map(msg => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && (
                          <div className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-black text-xs mr-2 shrink-0 self-end mb-1">
                            {activePartner.name.charAt(0)}
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                            }`}>
                            {msg.content}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-border/50 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 h-11 rounded-xl border-none bg-muted/50 text-sm"
                />
                <Button type="submit" size="sm" className="h-11 w-11 rounded-xl p-0 shrink-0 shadow-lg shadow-primary/20" disabled={!newMessage.trim()}>
                  <Send size={16} />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-primary" />
                </div>
                <h3 className="font-black text-lg mb-2">Your Conversations</h3>
                <p className="text-muted-foreground text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
