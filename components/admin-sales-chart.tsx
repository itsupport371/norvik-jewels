'use client';

import { useState } from 'react';

// Dashboard "Sales Overview" chart (10 Oct 2026). Bar chart, not a line —
// per the dataviz guidance this project follows, a line/area chart needs a
// full crosshair+tooltip layer, while discrete per-day magnitude (which is
// exactly what this is — one paid-orders total per day) is a bar chart's
// job, and a per-bar hover tooltip is the simpler, correct default for
// that form. Single series, single hue (antiquegold) — this is a magnitude
// encoding, not a categorical one, so there's no multi-hue palette to
// validate here.
export default function AdminSalesChart({
  data,
  currency,
}: {
  data: { label: string; shortLabel: string; value: number }[];
  currency: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div>
      <div className="flex h-[150px] items-end gap-1.5 sm:gap-2">
        {data.map((d, i) => {
          const heightPct = Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0);
          const active = hoverIndex === i;
          return (
            <div
              key={d.label}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div
                className={
                  'w-full rounded-t-[3px] transition-colors ' + (active ? 'bg-antiquegold' : 'bg-antiquegold/35 group-hover:bg-antiquegold/60')
                }
                style={{ height: `${heightPct}%`, minHeight: d.value > 0 ? 3 : 1 }}
              />
              {d.value === 0 && <div className="absolute bottom-0 h-px w-full bg-line" />}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {data.map((d, i) => (
          <div key={d.label} className="flex-1 text-center text-[9px] uppercase tracking-[0.04em] text-muted">
            {i % Math.max(Math.ceil(data.length / 7), 1) === 0 ? d.shortLabel : ''}
          </div>
        ))}
      </div>

      <div className="mt-2 h-[18px] text-center text-[12px] text-charcoal">
        {hovered ? (
          <>
            <span className="font-medium text-ink">{hovered.label}</span>
            {' — '}
            {currency}
            {hovered.value.toLocaleString('en-IN')}
          </>
        ) : (
          <span className="text-muted">Hover a bar for that day&apos;s sales</span>
        )}
      </div>
    </div>
  );
}
