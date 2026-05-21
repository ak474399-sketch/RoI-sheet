'use client';

import { useState } from 'react';
import type { ProjectionResult } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#6366f1', '#a78bfa', '#10b981', '#f472b6'];

interface ROIChartProps {
  series: { name: string; result: ProjectionResult }[];
}

export function ROIChart({ series }: ROIChartProps) {
  const [open, setOpen] = useState(false);

  // 只展示 W0~W52
  const weeks = series[0]?.result.rows.map((r) => r.week) ?? [];
  const data = weeks.map((week) => {
    const point: Record<string, number | string> = { week };
    series.forEach((s) => {
      const row = s.result.rows[week];
      if (row) point[s.name] = row.roiPct;
    });
    return point;
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-semibold text-primary tracking-wide">
          累计 ROI 曲线
          {!open && series.length > 0 && (
            <span className="ml-2 text-muted-foreground font-normal">
              DAY365 {Math.round(series[0]!.result.day365Roi)}%
            </span>
          )}
        </span>
        <ChevronRight
          className={cn(
            'size-3.5 text-muted-foreground transition-transform duration-150',
            open && 'rotate-90'
          )}
        />
      </button>

      {open && (
        <div className="h-[180px] px-2 pb-2 border-t border-border">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 6, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) => `W${v}`}
                tickLine={false}
                axisLine={false}
                ticks={[0, 4, 8, 13, 17, 22, 26, 35, 44, 52]}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v: number) => `${v}%`}
                tickLine={false}
                axisLine={false}
                width={38}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value ?? 0}%`]}
                labelFormatter={(w) => `第 ${w} 周 (D${Number(w) * 7})`}
              />
              <ReferenceLine
                y={100}
                stroke="#ef4444"
                strokeDasharray="4 3"
                strokeOpacity={0.6}
                label={{ value: '回本', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
              />
              {series.map((s, i) => (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={COLORS[i % COLORS.length]}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
