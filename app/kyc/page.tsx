'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useState } from 'react';
import { CheckCircle2, Camera, Upload, ShieldCheck, FileText } from 'lucide-react';

export default function KYCPage() {
    const router = useRouter();
    const { currentUser, updateUser } = useApp();
    const [step, setStep] = useState<'intro' | 'nid' | 'selfie' | 'success'>('intro');
    const [loading, setLoading] = useState(false);

    const progress = {
        intro: 0,
        nid: 33,
        selfie: 66,
        success: 100
    }[step];

    const handleNext = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (step === 'intro') setStep('nid');
            else if (step === 'nid') setStep('selfie');
            else if (step === 'selfie') {
                updateUser({ kycStatus: 'pending' });
                setStep('success');
            }
        }, 1000);
    };

    const handleFinish = () => {
        if (currentUser?.role === 'owner') router.push('/owner-dashboard');
        else router.push('/renter-dashboard');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Header />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-xl p-8 shadow-2xl border-t-8 border-primary rounded-3xl overflow-hidden relative">

                    <div className="absolute top-0 left-0 w-full h-2 bg-muted">
                        <Progress value={progress} className="h-full rounded-none bg-primary transition-all duration-500" />
                    </div>

                    {step === 'intro' && (
                        <div className="space-y-8 py-4 text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold">Identity Verification</h1>
                                <p className="text-muted-foreground text-lg">
                                    To ensure safety for everyone, we need to verify your identity before you can {currentUser?.role === 'owner' ? 'list vehicles' : 'book rides'}.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-4">
                                <div className="p-4 bg-muted/50 rounded-2xl flex items-start gap-4">
                                    <FileText className="w-6 h-6 text-primary shrink-0 mt-1" />
                                    <div>
                                        <p className="font-bold">National ID</p>
                                        <p className="text-sm text-muted-foreground">Upload a clear photo of your NID card.</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-2xl flex items-start gap-4">
                                    <Camera className="w-6 h-6 text-primary shrink-0 mt-1" />
                                    <div>
                                        <p className="font-bold">Selfie</p>
                                        <p className="text-sm text-muted-foreground">Take a quick photo of yourself to match ID.</p>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleNext} className="w-full h-14 text-xl rounded-2xl shadow-xl shadow-primary/20">
                                Start Verification
                            </Button>
                        </div>
                    )}

                    {step === 'nid' && (
                        <div className="space-y-8 py-4">
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-bold">Upload NID</h1>
                                <p className="text-muted-foreground text-lg">
                                    Front and back of your National ID card
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="aspect-[3/2] border-2 border-dashed border-muted-foreground/20 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer group">
                                    <div className="p-3 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors">
                                        <Upload className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="font-medium">Front Side</p>
                                </div>
                                <div className="aspect-[3/2] border-2 border-dashed border-muted-foreground/20 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer group">
                                    <div className="p-3 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors">
                                        <Upload className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="font-medium">Back Side</p>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl text-sm border border-amber-100 flex gap-3">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <p>Make sure all details on the card are clearly readable and there is no glare on the photo.</p>
                            </div>

                            <Button onClick={handleNext} disabled={loading} className="w-full h-14 text-xl rounded-2xl">
                                {loading ? 'Processing...' : 'Verify NID'}
                            </Button>
                        </div>
                    )}

                    {step === 'selfie' && (
                        <div className="space-y-8 py-4 text-center">
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-bold">Take a Selfie</h1>
                                <p className="text-muted-foreground text-lg">
                                    Look directly at the camera and ensure good lighting
                                </p>
                            </div>

                            <div className="w-64 h-64 rounded-full border-4 border-primary/20 mx-auto overflow-hidden bg-muted flex items-center justify-center relative">
                                <div className="absolute inset-0 border-4 border-primary rounded-full animate-pulse opacity-20"></div>
                                <Camera className="w-12 h-12 text-muted-foreground/30" />
                            </div>

                            <div className="space-y-4 pt-4">
                                <Button onClick={handleNext} disabled={loading} className="w-full h-14 text-xl rounded-2xl">
                                    {loading ? 'Verifying Face...' : 'Take Photo'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="space-y-8 py-8 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto scale-110">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-black text-foreground">Verification Submitted!</h1>
                                <p className="text-muted-foreground text-xl max-w-sm mx-auto">
                                    Our team will review your identity within 24 hours. You can already explore the platform!
                                </p>
                            </div>
                            <div className="pt-6">
                                <Button onClick={handleFinish} className="w-full h-16 text-2xl font-bold rounded-2xl shadow-2xl shadow-primary/30 transform hover:scale-[1.02] transition-transform">
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
