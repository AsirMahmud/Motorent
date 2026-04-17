export type UserRole = 'renter' | 'owner' | 'admin';
export type KYCStatus = 'none' | 'pending' | 'verified' | 'rejected';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone: string;
  role: UserRole;
  kycStatus: KYCStatus;
  registrationStatus: RegistrationStatus;
  nidUrl?: string;
  licenseUrl?: string;
  address?: string;
  verificationNote?: string;
  createdAt: Date;
};

export type VehicleType = 'bike' | 'car';
export type VehicleStatus = 'pending' | 'approved' | 'rejected';

export type Vehicle = {
  id: string;
  ownerId: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  image: string;
  images: string[];
  priceHourly?: number;
  priceDaily: number;
  priceWeekly?: number;
  priceMonthly?: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  features: string[];
  rating: number;
  reviewsCount: number;
  location: string;
  coordinates: { lat: number; lng: number };
  isAvailable: boolean;
  status: VehicleStatus;
  registrationNumber: string;
  description: string;
  documentUrl?: string;
  createdAt: Date;
};

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export type Booking = {
  id: string;
  vehicleId: string;
  renterId: string;
  startDate: Date;
  endDate: Date;
  pickupTime?: string;
  totalPrice: number;
  status: BookingStatus;
  pickupLocation: string;
  dropoffLocation?: string;
  notes?: string;
  createdAt: Date;
};

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: Date;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  messages: Message[];
};
