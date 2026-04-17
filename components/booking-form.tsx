'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Info } from 'lucide-react';
import type { Booking } from '@/lib/types';

interface BookingFormProps {
  vehicleId: string;
  onClose: () => void;
}

export function BookingForm({ vehicleId, onClose }: BookingFormProps) {
  const router = useRouter();
  const { currentUser, vehicles, addBooking } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiDailyRate, setApiDailyRate] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupTime: '10:00',
    pickupLocation: '',
    notes: '',
  });

  const mockVehicle = vehicles.find((v) => v.id === vehicleId);

  const loadPublicVehicle = useCallback(async () => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, { credentials: 'same-origin' });
      if (res.ok) {
        const data = (await res.json()) as { vehicle: { dailyRate: number } };
        setApiDailyRate(data.vehicle.dailyRate);
      } else {
        setApiDailyRate(null);
      }
    } catch {
      setApiDailyRate(null);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadPublicVehicle();
  }, [loadPublicVehicle]);

  const pricePerDay =
    apiDailyRate != null ? apiDailyRate : mockVehicle != null ? mockVehicle.priceDaily : 0;

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate || !pricePerDay) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * pricePerDay : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !pricePerDay) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          vehicleId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          pickupTime: formData.pickupTime,
          pickupLocation: formData.pickupLocation || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.booking?.id) {
        router.push(`/booking-confirmation/${data.booking.id}`);
        return;
      }

      if (res.status === 401) {
        setError('Please sign in to book.');
        return;
      }

      if (mockVehicle && res.status === 404) {
        const newBooking: Booking = {
          id: `booking-${Date.now()}`,
          vehicleId,
          renterId: currentUser.id,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          pickupTime: formData.pickupTime,
          totalPrice: calculateTotal(),
          status: 'pending',
          pickupLocation: formData.pickupLocation || mockVehicle.location,
          notes: formData.notes,
          createdAt: new Date(),
        };
        addBooking(newBooking);
        router.push(`/booking-confirmation/${newBooking.id}`);
        return;
      }

      setError(data.error || 'Could not submit booking');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const days =
    formData.startDate && formData.endDate
      ? Math.ceil(
          (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in duration-300">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
            <Calendar size={12} /> Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            className="h-12 rounded-xl border-2 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
            <Calendar size={12} /> End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            className="h-12 rounded-xl border-2 focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickupTime" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
          <Clock size={12} /> Pickup Time
        </Label>
        <Input
          id="pickupTime"
          type="time"
          value={formData.pickupTime}
          onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
          required
          className="h-12 rounded-xl border-2 focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickupLocation" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
          <MapPin size={12} /> Pickup point (optional)
        </Label>
        <Input
          id="pickupLocation"
          type="text"
          placeholder={mockVehicle?.location ? `Near ${mockVehicle.location}` : 'Address or landmark'}
          value={formData.pickupLocation}
          onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
          className="h-12 rounded-xl border-2 focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-xs font-bold uppercase text-muted-foreground">
          Notes (optional)
        </Label>
        <Textarea
          id="notes"
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="rounded-xl border-2"
        />
      </div>

      {days > 0 && (
        <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">
              ৳{pricePerDay} × {days} days
            </span>
            <span className="font-bold">৳{calculateTotal()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Service Fee</span>
            <span className="font-bold">৳0</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center font-black text-primary text-xl">
            <span>Total</span>
            <span>৳{calculateTotal()}</span>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-[10px] text-muted-foreground font-bold uppercase p-2 bg-muted/30 rounded-lg">
        <Info size={12} className="shrink-0" />
        <p>The owner will review your request and confirm availability.</p>
      </div>

      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          className="w-full h-14 text-lg font-black uppercase rounded-2xl shadow-xl shadow-primary/20"
          disabled={loading || days <= 0 || !pricePerDay}
        >
          {loading ? 'Sending Request...' : 'Send Booking Request'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full h-12 rounded-xl font-bold text-muted-foreground"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
