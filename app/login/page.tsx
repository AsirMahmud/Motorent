'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Bike, Mail, Lock } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      if (data.user.role === 'ADMIN') router.push('/admin');
      else if (data.user.role === 'RENTER') router.push('/renter-dashboard');
      else router.push('/');
    } catch {
      setError('Unable to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Branding accent */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-2xl shadow-primary/30 mb-4">
              <Bike className="text-white" size={30} />
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Welcome Back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your MotoRent account</p>
          </div>

          <Card className="p-8 rounded-3xl shadow-2xl border-none space-y-6">
            <form onSubmit={handleCredentialLogin} className="space-y-4">
              <div>
                <h2 className="text-2xl font-black mb-1">Renter / Admin Login</h2>
                <p className="text-muted-foreground text-sm">Use email and password after approval.</p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl text-base"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl text-base"
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl">{error}</p>}

              <Button type="submit" className="w-full h-12 rounded-xl font-black text-base shadow-xl shadow-primary/20" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl font-black text-base"
              onClick={handleGoogleLogin}
            >
              Continue with Google (General User)
            </Button>
          </Card>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Want renter verification?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">Apply as Renter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
