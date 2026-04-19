import type { ReactNode } from 'react';
import { DashboardPageHeader } from '@/components/dashboard-page-header';

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function AdminPageHeader(props: AdminPageHeaderProps) {
  return <DashboardPageHeader eyebrow="Admin console" {...props} />;
}
