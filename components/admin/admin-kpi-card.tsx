import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type AdminKpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: 'default' | 'amber' | 'emerald' | 'violet';
};

const accentRing: Record<NonNullable<AdminKpiCardProps['accent']>, string> = {
  default: 'from-primary/15 to-primary/5 text-primary',
  amber: 'from-amber-500/15 to-amber-500/5 text-amber-700 dark:text-amber-400',
  emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-700 dark:text-emerald-400',
  violet: 'from-violet-500/15 to-violet-500/5 text-violet-700 dark:text-violet-400',
};

export function AdminKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'default',
}: AdminKpiCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-0 shadow-md shadow-black/5 bg-gradient-to-br p-5',
        accentRing[accent]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-black tabular-nums tracking-tight">{value}</p>
          {hint ? (
            <p className="mt-1.5 text-xs text-muted-foreground leading-snug">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-white/10'
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
