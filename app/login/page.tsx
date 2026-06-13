'use client';

import Link from 'next/link';
import { Bike, Shield, Car, UserCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AuthPageHeader } from '@/components/auth-page-header';

const options = [
  {
    href: '/login/renter',
    title: 'Renter',
    description: 'Sign in with Google to browse and book vehicles.',
    icon: UserCircle2,
    accent: 'bg-emerald-500',
  },
  {
    href: '/login/owner',
    title: 'Owner',
    description: 'Email and password for approved vehicle hosts.',
    icon: Car,
    accent: 'bg-primary',
  },
  {
    href: '/login/admin',
    title: 'Admin',
    description: 'Staff access to approvals and platform management.',
    icon: Shield,
    accent: 'bg-slate-900',
  },
] as const;

export default function LoginHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col font-sans">
      <AuthPageHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-2xl shadow-primary/30 mb-4">
              <Bike className="text-white" size={30} />
            </div>
            <h1 className="font-display text-4xl font-medium tracking-[-0.03em] text-primary">Sign in</h1>
            <p className="text-muted-foreground mt-2">Choose how you use MotoRent</p>
          </div>

          <div className="space-y-4">
            {options.map((opt) => (
              <Link key={opt.href} href={opt.href}>
                <Card className="p-5 rounded-2xl border border-border/60 shadow-md hover:shadow-lg hover:border-primary/30 transition-all flex items-start gap-4 group">
                  <div className={`${opt.accent} text-white p-3 rounded-xl shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                    <opt.icon size={22} />
                  </div>
                  <div className="text-left min-w-0">
                    <h2 className="font-black text-lg leading-tight group-hover:text-primary transition-colors">
                      {opt.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8 text-sm">
            Want to list your vehicle?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Apply as owner
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
