import type { User, UserRole, KYCStatus, RegistrationStatus } from '@/lib/types';

/** Shape returned by `/api/auth/me` and credential login */
export type ApiAuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  verificationStatus?: string;
  verificationNote?: string | null;
  nidOrPassportUrl?: string | null;
  drivingLicenseUrl?: string | null;
  passportPhotoUrl?: string | null;
  createdAt?: string;
};

export function mapApiUserToAppUser(api: ApiAuthUser): User {
  /** OWNER = vehicle hosts (KYC + listings); GENERAL = Google accounts (browse/book). */
  const role: UserRole =
    api.role === 'ADMIN' ? 'admin' : api.role === 'OWNER' ? 'owner' : 'renter';

  const kycStatus: KYCStatus =
    api.verificationStatus === 'APPROVED'
      ? 'verified'
      : api.verificationStatus === 'REJECTED'
        ? 'rejected'
        : api.verificationStatus === 'PENDING'
          ? 'pending'
          : 'none';

  const registrationStatus: RegistrationStatus =
    api.verificationStatus === 'APPROVED'
      ? 'approved'
      : api.verificationStatus === 'REJECTED'
        ? 'rejected'
        : 'pending';

  return {
    id: api.id,
    email: api.email,
    name: api.fullName,
    phone: api.phone,
    role,
    kycStatus,
    registrationStatus,
    nidUrl: api.nidOrPassportUrl ?? undefined,
    licenseUrl: api.drivingLicenseUrl ?? undefined,
    verificationNote: api.verificationNote ?? undefined,
    createdAt: api.createdAt ? new Date(api.createdAt) : new Date(),
  };
}
