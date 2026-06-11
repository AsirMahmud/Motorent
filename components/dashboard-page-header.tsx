import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type DashboardPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: DashboardPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-primary/10 pb-6 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="brand-eyebrow text-[11px]">{eyebrow}</p>
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-primary md:text-4xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl pt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
