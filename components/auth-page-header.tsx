'use client';

import Link from 'next/link';
import Image from 'next/image';

export function AuthPageHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-7">
        <Link href="/" className="rounded-xl bg-primary px-3 py-1.5 shadow-sm">
          <Image src="/White & Light Green Logo EN.svg" alt="MotoRent" width={132} height={41} className="h-8 w-auto" />
        </Link>
        <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          Back to home
        </Link>
      </div>
    </header>
  );
}
