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
import { CheckCircle2, ArrowLeft, Bike, Car, MapPin } from 'lucide-react';
import { useApp } from '@/lib/context';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import {
  VehicleListingMapPicker,
  type MapPickerCoords,
} from '@/components/vehicle-listing-map-picker';

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
  const [mapPin, setMapPin] = useState<MapPickerCoords | null>(null);
  const [seats, setSeats] = useState('2');
  const [fuelType, setFuelType] = useState('gasoline');
  const [transmission, setTransmission] = useState('manual');
  const [motor, setMotor] = useState('');
  const [range, setRange] = useState('');
  const [battery, setBattery] = useState('');
  const [tireSize, setTireSize] = useState('');
  const [topSpeed, setTopSpeed] = useState('');
  const [chargeTime, setChargeTime] = useState('');
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
          ...(mapPin
            ? { latitude: mapPin.lat, longitude: mapPin.lng }
            : {}),
          seats: Number(seats),
          fuelType,
          transmission,
          motor: motor.trim() || null,
          range: range.trim() || null,
          battery: battery.trim() || null,
          tireSize: tireSize.trim() || null,
          topSpeed: topSpeed.trim() || null,
          chargeTime: chargeTime.trim() || null,
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
        <Card className="w-full max-w-md rounded-xl border border-border/60 bg-card p-10 text-center shadow-sm">
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
      <div className="flex flex-1 flex-col font-sans">
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-xl border border-border/60 bg-card p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Vehicle submitted</h2>
            <p className="mb-6 text-muted-foreground">Your vehicle profile is pending admin document review.</p>
            <Button
              variant="outline"
              className="h-12 w-full rounded-lg font-medium"
              onClick={() => router.push('/owner-dashboard')}
            >
              Back to dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col font-sans">
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl space-y-6">
          <DashboardPageHeader
            eyebrow="Owner hub"
            title="List a vehicle"
            description="Add details and documents. Your listing stays pending until an admin approves it."
          />
          <Card className="rounded-xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-2 flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft size={15} /> Back
              </button>

              <div>
                <h2 className="mb-1 text-lg font-semibold tracking-tight">Vehicle details</h2>
                <p className="text-sm text-muted-foreground">
                  Pick files on your device first, then upload each to the cloud.
                </p>
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

              <div className="space-y-2 rounded-xl border border-border/60 bg-muted/10 p-4">
                <Label className="text-sm font-semibold">Map position (optional)</Label>
                <VehicleListingMapPicker value={mapPin} onChange={setMapPin} disabled={submitting || uploadBusy} />
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

              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="text-sm font-black uppercase tracking-wide text-muted-foreground">Technical details</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Motor</Label>
                    <Input placeholder="e.g. 1500W" value={motor} onChange={(e) => setMotor(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Range</Label>
                    <Input placeholder="e.g. 80 KM" value={range} onChange={(e) => setRange(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Battery</Label>
                    <Input placeholder="e.g. 72V 30Ah LiFePO4" value={battery} onChange={(e) => setBattery(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tire size</Label>
                    <Input placeholder="e.g. 12" value={tireSize} onChange={(e) => setTireSize(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Top speed</Label>
                    <Input placeholder="e.g. 75 KM/h" value={topSpeed} onChange={(e) => setTopSpeed(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Charge time</Label>
                    <Input placeholder="e.g. 6-8 hours" value={chargeTime} onChange={(e) => setChargeTime(e.target.value)} className="h-11 rounded-xl" />
                  </div>
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
                      <span className="absolute left-3 top-2.5 text-base font-bold text-muted-foreground">৳</span>
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
                      <span className="absolute left-3 top-2.5 text-base font-bold text-muted-foreground">৳</span>
                      <Input type="number" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Weekly (optional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-base font-bold text-muted-foreground">৳</span>
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
                    showPreview
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
                className="h-12 w-full rounded-lg font-medium shadow-sm"
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
