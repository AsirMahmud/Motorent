'use client';

import Link from 'next/link';
import { Bike } from 'lucide-react';

export function AuthPageHeader() {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-primary text-white p-2 rounded-xl shadow-md shadow-primary/20">
            <Bike size={18} />
          </div>
          <span className="font-black text-lg uppercase italic tracking-tighter">MotoRent</span>
        </Link>
        <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          Back to home
        </Link>
      </div>
    </header>
  );
}
