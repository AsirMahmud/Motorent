'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useRef, useState } from 'react';
import { CheckCircle2, ShieldCheck, FileCheck2, AlertCircle } from 'lucide-react';
import { OwnerDocumentField } from '@/components/owner-document-field';
import { mapApiUserToAppUser } from '@/lib/map-api-user';
import { getSafeReturnPath } from '@/lib/booking-flow';

export default function KYCPage() {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useApp();
  const [nidUrl, setNidUrl] = useState<string | null>(currentUser?.nidUrl ?? null);
  const [nidName, setNidName] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(currentUser?.licenseUrl ?? null);
  const [licenseName, setLicenseName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const uploadCountRef = useRef(0);

  const setUploadBusyTracked = (busy: boolean) => {
    if (busy) uploadCountRef.current += 1;
    else uploadCountRef.current = Math.max(0, uploadCountRef.current - 1);
    setUploadBusy(uploadCountRef.current > 0);
  };

  const allReady = nidUrl && licenseUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allReady) { setError('Please upload both documents.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nidOrPassportUrl: nidUrl, drivingLicenseUrl: licenseUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit documents.'); return; }
      setCurrentUser(mapApiUserToAppUser(data.user));
      setDone(true);
    } catch {
      setError('Unable to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isResubmit = currentUser?.kycStatus === 'rejected';
  const getReturnPath = () => {
    const params = new URLSearchParams(window.location.search);
    return getSafeReturnPath(params.get('callbackUrl'), '/renter-dashboard');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-md p-10 text-center rounded-3xl shadow-2xl border-none">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <h2 className="text-3xl font-black mb-2">Documents Submitted!</h2>
            <p className="text-muted-foreground mb-4 text-lg">
              Our team will review within 24 hours.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <p className="text-amber-700 text-sm">
                  You will receive an email notification once your KYC is approved or if
                  any documents need resubmission.
                </p>
              </div>
            </div>
            <Button
              className="w-full h-12 rounded-2xl font-black"
              onClick={() => router.push(getReturnPath())}
            >
              Continue
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg p-8 shadow-2xl rounded-3xl border-none">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black">
              {isResubmit ? 'Resubmit Documents' : 'Identity Verification'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">
              {isResubmit
                ? 'Your previous documents were rejected. Please upload clearer images.'
                : 'Upload your NID and driving license to start booking vehicles.'}
            </p>
          </div>

          {isResubmit && currentUser.verificationNote && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-bold text-red-800 text-sm">Admin note:</p>
                <p className="text-red-700 text-sm">{currentUser.verificationNote}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OwnerDocumentField
                step={1}
                title="NID or Passport"
                hint="Clear photo or scan of your government ID."
                url={nidUrl}
                fileName={nidName}
                onUploaded={(url, name) => { setNidUrl(url); setNidName(name); }}
                onClear={() => { setNidUrl(null); setNidName(null); }}
                onError={setError}
                onBusy={setUploadBusyTracked}
                disabled={submitting}
              />
              <OwnerDocumentField
                step={2}
                title="Driving License"
                hint="Valid license for the vehicle class you want to rent."
                url={licenseUrl}
                fileName={licenseName}
                onUploaded={(url, name) => { setLicenseUrl(url); setLicenseName(name); }}
                onClear={() => { setLicenseUrl(null); setLicenseName(null); }}
                onError={setError}
                onBusy={setUploadBusyTracked}
                disabled={submitting}
              />
            </div>

            {allReady && (
              <p className="flex items-center gap-1.5 text-xs font-bold text-green-700">
                <FileCheck2 size={14} /> Both documents ready
              </p>
            )}

            {error && (
              <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-13 rounded-xl font-black text-base shadow-lg shadow-primary/20"
              disabled={submitting || uploadBusy || !allReady}
            >
              {submitting ? 'Submitting…' : uploadBusy ? 'Uploading…' : 'Submit for Verification'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
