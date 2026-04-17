import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/server/auth';
import { RenterDashboardShell } from '@/components/renter-dashboard-shell';

export default async function RenterDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login/renter');
  }
  if (user.role === 'ADMIN') {
    redirect('/admin');
  }
  if (user.role === 'OWNER') {
    redirect('/owner-dashboard');
  }

  return <RenterDashboardShell>{children}</RenterDashboardShell>;
}
