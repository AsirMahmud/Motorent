'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DocumentUploadButton } from '@/components/uploadthing-button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, DollarSign, ArrowLeft, FileText, Upload } from 'lucide-react';

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState<string | null>(null);
  const [ownershipPaperUrl, setOwnershipPaperUrl] = useState<string | null>(null);
  const [insurancePaperUrl, setInsurancePaperUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError('');
    if (!brand || !model || !year || !registrationNumber || !dailyRate || !vehiclePhotoUrl || !ownershipPaperUrl) {
      setError('Please fill all required fields and upload required documents.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          year: Number(year),
          registrationNumber,
          dailyRate: Number(dailyRate),
          vehiclePhotoUrl,
          ownershipPaperUrl,
          insurancePaperUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Submission failed');
        return;
      }
      setDone(true);
    } catch {
      setError('Submission failed. Please try again.');
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
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <h2 className="text-3xl font-black mb-2">Vehicle Submitted!</h2>
            <p className="text-muted-foreground mb-6">Your vehicle profile is pending admin document review.</p>
            <Button variant="outline" className="w-full rounded-xl h-12 font-black" onClick={() => router.push('/renter-dashboard')}>
              Dashboard
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
        <div className="w-full max-w-lg">
          <Card className="p-8 rounded-3xl shadow-2xl border-none">
            <div className="space-y-5">
              <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-bold mb-2 transition-colors">
                <ArrowLeft size={15} /> Back
              </button>

              <div>
                <h2 className="text-2xl font-black mb-1">Create Vehicle Profile</h2>
                <p className="text-muted-foreground text-sm">Approved renter can submit vehicle for admin review.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Brand *</Label>
                  <Input placeholder="e.g. Toyota" value={brand} onChange={e => setBrand(e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Model *</Label>
                  <Input placeholder="e.g. Premio" value={model} onChange={e => setModel(e.target.value)} className="h-11 rounded-xl" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Year *</Label>
                <Input type="number" value={year} onChange={e => setYear(e.target.value)} className="h-11 rounded-xl" min="2000" max="2030" />
              </div>

              <div className="space-y-1.5">
                <Label>Registration Number *</Label>
                <Input placeholder="e.g. DHAKA-METRO-LA-12-3456" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} className="h-11 rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label>Daily Rate *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="number" value={dailyRate} onChange={e => setDailyRate(e.target.value)} className="pl-9 h-11 rounded-xl" />
                </div>
              </div>

              {[
                { label: 'Vehicle Photo *', setter: setVehiclePhotoUrl, value: vehiclePhotoUrl, icon: Upload },
                { label: 'Ownership Paper *', setter: setOwnershipPaperUrl, value: ownershipPaperUrl, icon: FileText },
                { label: 'Insurance Paper (Optional)', setter: setInsurancePaperUrl, value: insurancePaperUrl, icon: FileText },
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <Label className="flex items-center gap-1.5">
                    <item.icon size={14} />
                    {item.label}
                  </Label>
                  <div
                    className={`w-full h-16 rounded-xl border-2 border-dashed flex items-center justify-center px-4 py-2 ${
                      item.value ? 'border-green-500 bg-green-50' : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <DocumentUploadButton
                      endpoint="document"
                      content={{
                        button: item.value ? 'Replace file' : 'Upload (image or PDF)',
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

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <Button className="w-full h-12 rounded-xl font-black shadow-xl shadow-primary/20" disabled={loading} onClick={handleSubmit}>
                {loading ? 'Submitting for Review...' : 'Submit for Admin Review →'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
