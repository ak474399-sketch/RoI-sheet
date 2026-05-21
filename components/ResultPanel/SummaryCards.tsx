'use client';

import type { ProjectionResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SummaryCardsProps {
  result: ProjectionResult;
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: 'green' | 'red' | 'neutral';
}) {
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 flex flex-col gap-1 min-w-0">
      <p className="text-[11px] text-muted-foreground leading-none truncate">{label}</p>
      <p
        className={cn(
          'text-base font-mono font-semibold leading-none',
          highlight === 'green' && 'text-emerald-600 dark:text-emerald-400',
          highlight === 'red' && 'text-red-500 dark:text-red-400',
          (!highlight || highlight === 'neutral') && 'text-foreground'
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground leading-none">{sub}</p>}
    </div>
  );
}

function roiHighlight(pct: number): 'green' | 'red' | 'neutral' {
  if (pct >= 100) return 'green';
  if (pct < 0) return 'red';
  return 'neutral';
}

function profitHighlight(v: number): 'green' | 'red' | 'neutral' {
  if (v > 0) return 'green';
  if (v < 0) return 'red';
  return 'neutral';
}

function fmtProfit(v: number): string {
  const abs = Math.abs(v);
  const sign = v >= 0 ? '+' : '-';
  return `${sign}¥${abs.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const day180Profit = result.day180CumRevenue - result.params.adSpend;
  const day365Profit = result.day365CumRevenue - result.params.adSpend;

  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
      <MetricCard
        label="DAY365 回收"
        value={`${Math.round(result.day365Roi)}%`}
        sub={`¥${result.day365CumRevenue.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`}
        highlight={roiHighlight(result.day365Roi)}
      />
      <MetricCard
        label="DAY180 回收"
        value={`${Math.round(result.day180Roi)}%`}
        sub={`¥${result.day180CumRevenue.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`}
        highlight={roiHighlight(result.day180Roi)}
      />
      <MetricCard
        label="DAY60 回收"
        value={`${Math.round(result.day60Roi)}%`}
        highlight={roiHighlight(result.day60Roi)}
      />
      <MetricCard
        label="DAY30 回收"
        value={`${Math.round(result.day30Roi)}%`}
        highlight={roiHighlight(result.day30Roi)}
      />
      <MetricCard
        label="DAY365 毛利"
        value={fmtProfit(day365Profit)}
        highlight={profitHighlight(day365Profit)}
      />
      <MetricCard
        label="DAY180 毛利"
        value={fmtProfit(day180Profit)}
        highlight={profitHighlight(day180Profit)}
      />
    </div>
  );
}
