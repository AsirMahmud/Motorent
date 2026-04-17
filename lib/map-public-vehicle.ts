import type { Vehicle } from './types';

/** Shape returned by GET /api/vehicles/[id] (public approved listing) */
export type PublicVehicleApi = {
  id: string;
  ownerId: string;
  category: 'BIKE' | 'CAR';
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  location: string;
  seats: number;
  fuelType: string;
  transmission: string;
  description: string | null;
  features: string[];
  dailyRate: number;
  priceHourly: number | null;
  priceWeekly: number | null;
  vehiclePhotoUrl: string;
  viewCount: number;
  /** Omitted in older clients; defaults to APPROVED in the mapper. */
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote?: string | null;
  owner?: {
    id: string;
    fullName: string;
    verificationStatus: string;
  };
};

const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 };

export function mapPublicVehicleApiToVehicle(v: PublicVehicleApi): Vehicle {
  const listingStatus = v.status ?? 'APPROVED';
  const img = v.vehiclePhotoUrl;
  return {
    id: v.id,
    ownerId: v.ownerId,
    type: v.category === 'CAR' ? 'car' : 'bike',
    brand: v.brand,
    model: v.model,
    year: v.year,
    image: img,
    images: [img],
    priceHourly: v.priceHourly ?? undefined,
    priceDaily: v.dailyRate,
    priceWeekly: v.priceWeekly ?? undefined,
    transmission: v.transmission === 'automatic' ? 'automatic' : 'manual',
    fuelType:
      v.fuelType === 'diesel' || v.fuelType === 'electric' || v.fuelType === 'hybrid'
        ? v.fuelType
        : 'gasoline',
    seats: v.seats,
    features: v.features?.length ? v.features : [],
    rating: 0,
    reviewsCount: 0,
    location: v.location,
    coordinates: DHAKA_CENTER,
    isAvailable: listingStatus === 'APPROVED',
    status:
      listingStatus === 'REJECTED'
        ? 'rejected'
        : listingStatus === 'PENDING'
          ? 'pending'
          : 'approved',
    registrationNumber: v.registrationNumber,
    description: v.description?.trim() || '',
    createdAt: new Date(),
  };
}
