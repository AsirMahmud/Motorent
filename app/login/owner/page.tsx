'use client';

import Link from 'next/link';
import { Car } from 'lucide-react';
import { AuthPageHeader } from '@/components/auth-page-header';
import { CredentialLoginForm } from '@/components/credential-login-form';

export default function OwnerLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col font-sans">
      <AuthPageHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-2xl shadow-primary/30 mb-4">
              <Car className="text-white" size={30} />
            </div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Owner sign in</h1>
            <p className="text-muted-foreground mt-1">List vehicles after admin approval</p>
          </div>

          <CredentialLoginForm
            intent="OWNER"
            title="Vehicle owner"
            subtitle="Sign in with the email and password for your approved owner account."
            redirectTo="/owner-dashboard"
          />

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Need to register?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Apply as owner
            </Link>
            {' · '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              All sign-in options
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
