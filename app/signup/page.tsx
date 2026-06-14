'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OwnerDocumentField } from '@/components/owner-document-field';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { User as UserIcon, CheckCircle2, ShieldCheck, FileCheck2 } from 'lucide-react';

type DocKey = 'nid' | 'license' | 'ownership' | 'photo';

const initialDocs: Record<DocKey, { url: string | null; name: string | null }> = {
  nid: { url: null, name: null },
  license: { url: null, name: null },
  ownership: { url: null, name: null },
  photo: { url: null, name: null },
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [docs, setDocs] = useState(initialDocs);
  const [submitting, setSubmitting] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const uploadCountRef = useRef(0);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const setUploadBusyTracked = (busy: boolean) => {
    if (busy) uploadCountRef.current += 1;
    else uploadCountRef.current = Math.max(0, uploadCountRef.current - 1);
    setUploadBusy(uploadCountRef.current > 0);
  };

  const setDoc = (key: DocKey, url: string, fileName: string) => {
    setDocs((prev) => ({ ...prev, [key]: { url, name: fileName } }));
  };

  const clearDoc = (key: DocKey) => {
    setDocs((prev) => ({ ...prev, [key]: { url: null, name: null } }));
  };

  const allDocsReady =
    docs.nid.url && docs.license.url && docs.ownership.url && docs.photo.url;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!allDocsReady) {
      setError('Please upload all four required documents.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email,
          phone,
          password,
          nidOrPassportUrl: docs.nid.url,
          drivingLicenseUrl: docs.license.url,
          ownershipPaperUrl: docs.ownership.url,
          passportPhotoUrl: docs.photo.url,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      setDone(true);
    } catch {
      setError('Unable to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-10 text-center rounded-3xl shadow-2xl border-none">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <h2 className="text-3xl font-black mb-2">You&apos;re Registered!</h2>
            <p className="text-muted-foreground mb-2 text-lg">Your account is under review.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-bold text-amber-800 text-sm">Verification Pending</p>
                  <p className="text-amber-700 text-xs mt-1">Admin will review your NID/passport, driving license, ownership paper, and photo. You will be notified by email after approval/rejection.</p>
                </div>
              </div>
            </div>
            <Button className="w-full h-12 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <Card className="p-6 sm:p-8 rounded-3xl shadow-2xl border-none">
            <form className="space-y-8" onSubmit={handleSignup}>
              <div>
                <h1 className="text-3xl font-black mb-1">Sign up as Owner</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Sign up as an owner to list your vehicles for booking.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-wide text-muted-foreground">Your details</h2>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name (as on NID)</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your full legal name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 h-12 rounded-xl text-base"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+880 1XXX-XXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="h-12 rounded-xl text-base"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-8">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wide text-muted-foreground">Verification documents</h2>
                    <p className="mt-1 text-sm text-muted-foreground">All four are required. You’ll see the file name after each upload.</p>
                  </div>
                  {allDocsReady ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                      <FileCheck2 className="h-3.5 w-3.5" />
                      All set
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <OwnerDocumentField
                    step={1}
                    title="NID or passport"
                    hint="Government ID (scan or clear photo)."
                    url={docs.nid.url}
                    fileName={docs.nid.name}
                    onUploaded={(url, fileName) => setDoc('nid', url, fileName)}
                    onClear={() => clearDoc('nid')}
                    onError={setError}
                    onBusy={setUploadBusyTracked}
                    disabled={submitting}
                  />
                  <OwnerDocumentField
                    step={2}
                    title="Driving license"
                    hint="Valid license for the vehicle class you’ll rent."
                    url={docs.license.url}
                    fileName={docs.license.name}
                    onUploaded={(url, fileName) => setDoc('license', url, fileName)}
                    onClear={() => clearDoc('license')}
                    onError={setError}
                    onBusy={setUploadBusyTracked}
                    disabled={submitting}
                  />
                  <OwnerDocumentField
                    step={3}
                    title="Car ownership paper"
                    hint="Proof you own the vehicle(s) you list."
                    url={docs.ownership.url}
                    fileName={docs.ownership.name}
                    onUploaded={(url, fileName) => setDoc('ownership', url, fileName)}
                    onClear={() => clearDoc('ownership')}
                    onError={setError}
                    onBusy={setUploadBusyTracked}
                    disabled={submitting}
                  />
                  <OwnerDocumentField
                    step={4}
                    title="Passport-size photo"
                    hint="Recent photo, plain background."
                    url={docs.photo.url}
                    fileName={docs.photo.name}
                    onUploaded={(url, fileName) => setDoc('photo', url, fileName)}
                    onClear={() => clearDoc('photo')}
                    onError={setError}
                    onBusy={setUploadBusyTracked}
                    disabled={submitting}
                  />
                </div>
              </div>

              {error ? <p className="text-red-600 text-sm font-medium">{error}</p> : null}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20"
                disabled={submitting || uploadBusy}
              >
                {submitting ? 'Submitting…' : uploadBusy ? 'Uploading…' : 'Submit verification request'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-bold">
                  Sign in
                </Link>
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
