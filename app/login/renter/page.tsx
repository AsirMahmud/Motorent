'use client';

import Link from 'next/link';
import { Bike, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AuthPageHeader } from '@/components/auth-page-header';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { getSafeReturnPath } from '@/lib/booking-flow';

export default function RenterLoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = getSafeReturnPath(params.get('callbackUrl'), '/renter-dashboard');
    await signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col font-sans">
      <AuthPageHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-2xl shadow-primary/30 mb-4">
              <Bike className="text-white" size={30} />
            </div>
            <h1 className="font-display text-4xl font-medium tracking-[-0.03em] text-primary">Renter sign in</h1>
            <p className="text-muted-foreground mt-1 text-sm">Browse and book vehicles instantly</p>
          </div>

          <Card className="p-8 rounded-3xl shadow-2xl border-none space-y-6">
            <Button
              type="button"
              size="lg"
              className="w-full h-14 rounded-xl font-black text-base shadow-xl shadow-primary/20 gap-3"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {loading ? 'Redirecting…' : 'Continue with Google'}
            </Button>

            <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  After sign-in you can <span className="font-bold text-foreground">browse all available vehicles</span> immediately.
                  To send a booking request, you will be prompted to upload your NID and driving license for a one-time admin KYC check.
                </p>
              </div>
            </div>
          </Card>

          <p className="text-center text-muted-foreground mt-6 text-sm space-x-1">
            <span>Want to list vehicles?</span>
            <Link href="/signup" className="text-primary font-bold hover:underline">Apply as owner</Link>
            <span>·</span>
            <Link href="/login" className="text-primary font-bold hover:underline">All sign-in options</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
