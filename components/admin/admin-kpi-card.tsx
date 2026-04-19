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
        'relative overflow-hidden border border-border/60 bg-gradient-to-br p-5 shadow-sm',
        accentRing[accent]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
          {hint ? <p className="mt-2 text-xs leading-snug text-muted-foreground">{hint}</p> : null}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/80'
          )}
        >
          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
