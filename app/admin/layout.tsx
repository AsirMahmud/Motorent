import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/server/auth';
import { AdminShell } from '@/components/admin/admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login/admin');
  }
  if (user.role !== 'ADMIN') {
    if (user.role === 'OWNER') {
      redirect('/owner-dashboard');
    }
    redirect('/renter-dashboard');
  }

  return <AdminShell>{children}</AdminShell>;
}
