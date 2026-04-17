'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { AuthPageHeader } from '@/components/auth-page-header';
import { CredentialLoginForm } from '@/components/credential-login-form';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col font-sans">
      <AuthPageHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/30 mb-4">
              <Shield className="text-white" size={30} />
            </div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Admin sign in</h1>
            <p className="text-muted-foreground mt-1">Internal console — authorized staff only</p>
          </div>

          <CredentialLoginForm
            intent="ADMIN"
            title="Administrator"
            subtitle="Use the email and password issued to your admin account."
            redirectTo="/admin"
          />

          <p className="text-center text-muted-foreground mt-6 text-sm">
            <Link href="/login" className="text-primary font-bold hover:underline">
              Other sign-in options
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
