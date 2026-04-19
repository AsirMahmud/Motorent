'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { InboxPanel } from '@/components/inbox-panel';
import { MobileExplorerTabBar } from '@/components/mobile-explorer-tab-bar';
import { useApp } from '@/lib/context';

export default function MessagesPage() {
  const router = useRouter();
  const { currentUser, authReady } = useApp();

  useEffect(() => {
    if (!authReady) return;
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    if (currentUser.role === 'admin') {
      router.replace('/admin/messages');
    }
  }, [authReady, currentUser, router]);

  if (!authReady || !currentUser || currentUser.role === 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/25 font-sans">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-28 pt-5 md:pb-10 md:pt-8">
        <header className="mb-4 md:mb-6">
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Messages
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Direct messages with owners and renters. Replies are synced across
            your devices.
          </p>
        </header>
        <div className="min-h-0 flex-1">
          <InboxPanel
            currentUserId={currentUser.id}
            className="h-[min(720px,calc(100dvh-12rem))] w-full rounded-2xl shadow-md md:h-[min(780px,calc(100dvh-10rem))]"
          />
        </div>
      </main>
      <MobileExplorerTabBar />
    </div>
  );
}
