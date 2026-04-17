import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/server/auth';
import { OwnerDashboardShell } from '@/components/owner-dashboard-shell';

export default async function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login/owner');
  }
  if (user.role === 'ADMIN') {
    redirect('/admin');
  }
  if (user.role === 'GENERAL') {
    redirect('/renter-dashboard');
  }
  if (user.role === 'OWNER' && user.verificationStatus !== 'APPROVED') {
    redirect('/login/owner');
  }

  return <OwnerDashboardShell>{children}</OwnerDashboardShell>;
}
