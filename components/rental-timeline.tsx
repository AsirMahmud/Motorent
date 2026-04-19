'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, Package, RotateCcw, CalendarCheck, Timer } from 'lucide-react';

interface RentalTimelineProps {
  createdAt: Date;
  ownerDecidedAt?: Date | null;
  pickedUpAt?: Date | null;
  returnedAt?: Date | null;
  endDate: Date;
  compact?: boolean;
}

function fmt(d: Date) {
  return d.toLocaleString([], {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Live countdown hook — returns { label, urgent, expired } */
function useTimeLeft(endDate: Date, active: boolean) {
  const [label, setLabel] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!active) return;

    function tick() {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) {
        setLabel('Time up');
        setExpired(true);
        setUrgent(false);
        return;
      }
      setExpired(false);
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const mins = Math.floor((diff % 3_600_000) / 60_000);
      const secs = Math.floor((diff % 60_000) / 1_000);

      if (days > 0) {
        setLabel(`${days}d ${hours}h ${mins}m left`);
        setUrgent(false);
      } else if (hours > 0) {
        setLabel(`${hours}h ${mins}m left`);
        setUrgent(hours < 2);
      } else {
        setLabel(`${mins}m ${secs}s left`);
        setUrgent(true);
      }
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate, active]);

  return { label, urgent, expired };
}

export function RentalTimeline({
  createdAt,
  ownerDecidedAt,
  pickedUpAt,
  returnedAt,
  endDate,
  compact = false,
}: RentalTimelineProps) {
  // Countdown is active only when the rental is accepted & not yet returned
  const countdownActive = Boolean(ownerDecidedAt) && !returnedAt;
  const { label: timeLeft, urgent, expired } = useTimeLeft(endDate, countdownActive);

  const steps = [
    {
      id: 'requested',
      label: 'Booking requested',
      sub: null,
      time: createdAt,
      done: true,
      color: 'text-primary bg-primary/10',
      line: 'bg-primary',
    },
    {
      id: 'approved',
      label: ownerDecidedAt ? 'Owner approved' : 'Awaiting owner approval',
      sub: null,
      time: ownerDecidedAt ?? null,
      done: Boolean(ownerDecidedAt),
      color: ownerDecidedAt ? 'text-green-600 bg-green-100' : 'text-muted-foreground bg-muted',
      line: ownerDecidedAt ? 'bg-green-400' : 'bg-border',
    },
    {
      id: 'pickedup',
      label: pickedUpAt ? 'Vehicle picked up' : 'Awaiting pickup confirmation',
      sub: null,
      time: pickedUpAt ?? null,
      done: Boolean(pickedUpAt),
      color: pickedUpAt ? 'text-orange-600 bg-orange-100' : 'text-muted-foreground bg-muted',
      line: pickedUpAt ? 'bg-orange-400' : 'bg-border',
    },
    {
      id: 'returned',
      label: returnedAt ? 'Vehicle returned' : `Return due ${fmt(endDate)}`,
      // inline time-left chip shown while rental is active
      sub: !returnedAt && countdownActive ? { label: timeLeft, urgent, expired } : null,
      time: returnedAt ?? null,
      done: Boolean(returnedAt),
      color: returnedAt
        ? 'text-blue-600 bg-blue-100'
        : expired
          ? 'text-red-600 bg-red-100'
          : urgent
            ? 'text-amber-600 bg-amber-100'
            : 'text-muted-foreground bg-muted',
      line: 'bg-border',
    },
  ];

  return (
    <div className={compact ? '' : 'bg-white rounded-2xl border border-border/60 p-4'}>
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={11} /> Rental timeline
          </p>
          {/* Big countdown pill shown in header when rental is active */}
          {countdownActive && timeLeft && (
            <span className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${
              expired
                ? 'bg-red-100 text-red-700'
                : urgent
                  ? 'bg-amber-100 text-amber-700 animate-pulse'
                  : 'bg-green-100 text-green-700'
            }`}>
              <Timer size={11} />
              {timeLeft}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={step.id} className="flex gap-3">
              {/* Icon + connector line */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step.color}`}>
                  {step.done
                    ? <CheckCircle2 size={14} />
                    : step.id === 'returned'
                      ? <RotateCcw size={14} className="opacity-50" />
                      : step.id === 'pickedup'
                        ? <Package size={14} className="opacity-50" />
                        : step.id === 'approved'
                          ? <CheckCircle2 size={14} className="opacity-50" />
                          : <CalendarCheck size={14} className="opacity-50" />}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 my-1 ${step.line}`} style={{ minHeight: 20 }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1" style={{ paddingBottom: isLast ? 0 : 16 }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-black leading-tight ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {/* Inline time-left chip on the "returned" row */}
                  {step.sub && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      step.sub.expired
                        ? 'bg-red-100 text-red-700'
                        : step.sub.urgent
                          ? 'bg-amber-100 text-amber-700 animate-pulse'
                          : 'bg-green-100 text-green-700'
                    }`}>
                      <Timer size={9} />
                      {step.sub.label}
                    </span>
                  )}
                </div>
                {step.time ? (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {fmt(step.time)}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
