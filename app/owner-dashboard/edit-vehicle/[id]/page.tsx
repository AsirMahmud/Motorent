'use client';

import { useParams } from 'next/navigation';
import { OwnerEditVehicleForm } from '@/components/owner-edit-vehicle-form';

export default function EditVehiclePage() {
  const params = useParams();
  const vehicleId = params.id as string;

  return <OwnerEditVehicleForm vehicleId={vehicleId} />;
}
