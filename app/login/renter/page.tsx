'use client';

import Link from 'next/link';
import { Bike, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AuthPageHeader } from '@/components/auth-page-header';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { mapApiUserToAppUser } from '@/lib/map-api-user';

export default function RenterLoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/renter-dashboard' });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, intent: 'RENTER' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      setCurrentUser(mapApiUserToAppUser(data.user));
      router.push('/renter-dashboard');
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Renter sign in</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to browse and book vehicles</p>
          </div>

          <Card className="p-8 rounded-3xl shadow-2xl border-none space-y-6">
            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <h2 className="text-base font-black mb-0.5">Email & password</h2>
                <p className="text-xs text-muted-foreground">For accounts created with the renter signup form.</p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="pl-10 h-12 rounded-xl text-base"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pl-10 h-12 rounded-xl text-base"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-black text-base shadow-xl shadow-primary/20"
                disabled={loading || !email || !password}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-bold text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Sign in with Google (no password needed)</p>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl font-black text-base"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? 'Redirecting…' : 'Continue with Google'}
              </Button>
            </div>
          </Card>

          <p className="text-center text-muted-foreground mt-6 text-sm space-x-2">
            <span>New renter?</span>
            <Link href="/signup/renter" className="text-primary font-bold hover:underline">Sign up with KYC</Link>
            <span>·</span>
            <Link href="/login" className="text-primary font-bold hover:underline">All sign-in options</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
