'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useApp } from '@/lib/context';
import { mapApiUserToAppUser } from '@/lib/map-api-user';

type Intent = 'ADMIN' | 'OWNER';

export function CredentialLoginForm({
  intent,
  title,
  subtitle,
  redirectTo,
}: {
  intent: Intent;
  title: string;
  subtitle: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, intent }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      setCurrentUser(mapApiUserToAppUser(data.user));
      router.push(redirectTo);
    } catch {
      setError('Unable to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 rounded-3xl shadow-2xl border-none space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-2xl font-black mb-1">{title}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            required
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
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Card>
  );
}
