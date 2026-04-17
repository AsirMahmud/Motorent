'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DocumentUploadButton } from '@/components/uploadthing-button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { User as UserIcon, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nidOrPassportUrl, setNidOrPassportUrl] = useState<string | null>(null);
  const [drivingLicenseUrl, setDrivingLicenseUrl] = useState<string | null>(null);
  const [ownershipPaperUrl, setOwnershipPaperUrl] = useState<string | null>(null);
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nidOrPassportUrl || !drivingLicenseUrl || !ownershipPaperUrl || !passportPhotoUrl) {
      setError('Please upload all required documents.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email,
          phone,
          password,
          nidOrPassportUrl,
          drivingLicenseUrl,
          ownershipPaperUrl,
          passportPhotoUrl,
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
      setLoading(false);
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
        <div className="w-full max-w-md">
          <Card className="p-8 rounded-3xl shadow-2xl border-none">
            <form className="space-y-5" onSubmit={handleSignup}>
                <div>
                  <h1 className="text-3xl font-black mb-1">Renter Verification Signup</h1>
                  <p className="text-muted-foreground">Submit your information and documents for admin review.</p>
                </div>
                <div className="space-y-2">
                  <Label>Full Name (As Per NID)</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="Your full legal name" value={name} onChange={e => setName(e.target.value)} required className="pl-10 h-12 rounded-xl text-base" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 rounded-xl text-base" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" placeholder="+880 1XXX-XXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required className="h-12 rounded-xl text-base" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 rounded-xl text-base" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'NID or Passport *', setter: setNidOrPassportUrl, value: nidOrPassportUrl },
                    { label: 'Driving License *', setter: setDrivingLicenseUrl, value: drivingLicenseUrl },
                    { label: 'Car Ownership Paper *', setter: setOwnershipPaperUrl, value: ownershipPaperUrl },
                    { label: 'Passport Size Photo *', setter: setPassportPhotoUrl, value: passportPhotoUrl },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <Label>{item.label}</Label>
                      <div
                        className={`w-full h-16 rounded-xl border-2 border-dashed flex items-center justify-center px-4 py-2 ${
                          item.value ? 'border-green-500 bg-green-50' : 'border-border hover:border-primary'
                        }`}
                      >
                        <DocumentUploadButton
                          endpoint="document"
                          content={{
                            button: item.value ? 'Replace file' : 'Upload file (image or PDF)',
                          }}
                          onUploadBegin={() => {
                            setError('');
                            setLoading(true);
                          }}
                          onClientUploadComplete={(res) => {
                            setLoading(false);
                            const url = res[0]?.url;
                            if (url) item.setter(url);
                          }}
                          onUploadError={(err) => {
                            setLoading(false);
                            setError(err.message || 'Upload failed');
                          }}
                          className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:ut-ready:bg-primary ut-button:text-sm ut-button:font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                <Button type="submit" className="w-full h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Verification Request'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account? <Link href="/login" className="text-primary font-bold">Sign in</Link>
                </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
