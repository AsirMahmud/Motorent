'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OwnerDocumentField } from '@/components/owner-document-field';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { CheckCircle2, DollarSign, ArrowLeft, Bike, Car, MapPin } from 'lucide-react';
import { useApp } from '@/lib/context';

type DocKey = 'photo' | 'ownership' | 'insurance';

const initialDocs: Record<DocKey, { url: string | null; name: string | null }> = {
  photo: { url: null, name: null },
  ownership: { url: null, name: null },
  insurance: { url: null, name: null },
};

export function OwnerAddVehicleForm() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const uploadCountRef = useRef(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const [category, setCategory] = useState<'BIKE' | 'CAR'>('BIKE');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState('2');
  const [fuelType, setFuelType] = useState('gasoline');
  const [transmission, setTransmission] = useState('manual');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [priceHourly, setPriceHourly] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [priceWeekly, setPriceWeekly] = useState('');
  const [docs, setDocs] = useState(initialDocs);

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

  const handleSubmit = async () => {
    setError('');
    if (
      !brand ||
      !model ||
      !year ||
      !registrationNumber ||
      !location.trim() ||
      !dailyRate ||
      !description.trim() ||
      description.trim().length < 20 ||
      !docs.photo.url ||
      !docs.ownership.url
    ) {
      setError(
        'Please fill all required fields (including a short overview of at least 20 characters), set seats & specs, and upload required documents.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          category,
          brand,
          model,
          year: Number(year),
          registrationNumber,
          location: location.trim(),
          seats: Number(seats),
          fuelType,
          transmission,
          description: description.trim(),
          features: featuresText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          priceHourly: priceHourly.trim() === '' ? null : Number(priceHourly),
          dailyRate: Number(dailyRate),
          priceWeekly: priceWeekly.trim() === '' ? null : Number(priceWeekly),
          vehiclePhotoUrl: docs.photo.url,
          ownershipPaperUrl: docs.ownership.url,
          insurancePaperUrl: docs.insurance.url,
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
      setSubmitting(false);
    }
  };

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="flex flex-1 items-center justify-center p-4 py-16">
        <Card className="w-full max-w-md p-10 text-center rounded-3xl shadow-2xl border-none">
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-hidden />
          </div>
          <p className="text-muted-foreground font-medium">Loading your session…</p>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10 font-sans">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-10 text-center rounded-3xl shadow-2xl border-none">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <h2 className="text-3xl font-black mb-2">Vehicle Submitted!</h2>
            <p className="text-muted-foreground mb-6">Your vehicle profile is pending admin document review.</p>
            <Button variant="outline" className="w-full rounded-xl h-12 font-black" onClick={() => router.push('/owner-dashboard')}>
              Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10 font-sans">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <Card className="p-6 sm:p-8 rounded-3xl shadow-2xl border-none">
            <div className="space-y-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-bold mb-2 transition-colors"
              >
                <ArrowLeft size={15} /> Back
              </button>

              <div>
                <h2 className="text-2xl font-black mb-1">Create Vehicle Profile</h2>
                <p className="text-muted-foreground text-sm">Pick files on your device first, then upload each to the cloud.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Brand *</Label>
                  <Input placeholder="e.g. Toyota" value={brand} onChange={(e) => setBrand(e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Model *</Label>
                  <Input placeholder="e.g. Premio" value={model} onChange={(e) => setModel(e.target.value)} className="h-11 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Year *</Label>
                  <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="h-11 rounded-xl" min="1990" max="2035" />
                </div>
                <div className="space-y-1.5">
                  <Label>Vehicle type *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as 'BIKE' | 'CAR')}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIKE">
                        <span className="flex items-center gap-2">
                          <Bike size={16} /> Bike
                        </span>
                      </SelectItem>
                      <SelectItem value="CAR">
                        <span className="flex items-center gap-2">
                          <Car size={16} /> Car
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Registration number *</Label>
                <Input
                  placeholder="e.g. DHAKA-METRO-LA-12-3456"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" /> Pickup / listing area *
                </Label>
                <Input
                  placeholder="e.g. Banani, Dhaka"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label>Seats *</Label>
                  <Input type="number" min={1} max={50} value={seats} onChange={(e) => setSeats(e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fuel *</Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-2">
                  <Label>Transmission *</Label>
                  <Select value={transmission} onValueChange={setTransmission}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Overview *</Label>
                <Textarea
                  placeholder="Describe the vehicle for renters (same as the public listing overview)…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] rounded-xl resize-y"
                />
                <p className="text-xs text-muted-foreground">At least 20 characters. Shown on the vehicle details page.</p>
              </div>

              <div className="space-y-1.5">
                <Label>Features (optional)</Label>
                <Input
                  placeholder="Comma-separated, e.g. ABS, Fuel Injection, Digital Meter"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="text-sm font-black uppercase tracking-wide text-muted-foreground">Rental rates (৳)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Hourly (optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min={0}
                        value={priceHourly}
                        onChange={(e) => setPriceHourly(e.target.value)}
                        className="pl-9 h-11 rounded-xl"
                        placeholder="—"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Daily *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Weekly (optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min={0}
                        value={priceWeekly}
                        onChange={(e) => setPriceWeekly(e.target.value)}
                        className="pl-9 h-11 rounded-xl"
                        placeholder="—"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-sm font-black uppercase tracking-wide text-muted-foreground">Documents</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <OwnerDocumentField
                    step={1}
                    title="Vehicle photo"
                    hint="Clear exterior shot."
                    url={docs.photo.url}
                    fileName={docs.photo.name}
                    onUploaded={(url, name) => setDoc('photo', url, name)}
                    onClear={() => clearDoc('photo')}
                    onError={setError}
                    onBusy={setUploadBusyTracked}
                    disabled={submitting}
                  />
                  <OwnerDocumentField
                    step={2}
                    title="Ownership paper"
                    hint="Proof of ownership."
                    url={docs.ownership.url}
                    fileName={docs.ownership.name}
                    onUploaded={(url, name) => setDoc('ownership', url, name)}
                    onClear={() => clearDoc('ownership')}
                    onError={setError}
                    onBusy={setUploadBusyTracked}
                    disabled={submitting}
                  />
                  <div className="sm:col-span-2">
                    <OwnerDocumentField
                      step={3}
                      title="Insurance (optional)"
                      hint="Policy document if you have one."
                      url={docs.insurance.url}
                      fileName={docs.insurance.name}
                      onUploaded={(url, name) => setDoc('insurance', url, name)}
                      onClear={() => clearDoc('insurance')}
                      onError={setError}
                      onBusy={setUploadBusyTracked}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <Button
                className="w-full h-12 rounded-xl font-black shadow-xl shadow-primary/20"
                disabled={submitting || uploadBusy}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting…' : uploadBusy ? 'Uploading…' : 'Submit for Admin Review →'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
