'use client';

import type { ProjectionResult } from '@/lib/types';
import { formatUsd } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ProjectionTableProps {
  result: ProjectionResult;
}

export function ProjectionTable({ result }: ProjectionTableProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border shrink-0">
        <span className="text-xs font-medium text-primary">周预测明细</span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[72px]" />
            <col className="w-[64px]" />
            <col className="w-[72px]" />
            <col className="w-[80px]" />
            <col className="w-[48px]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <tr className="text-left">
              <th className="px-2 py-1.5 text-xs font-medium text-muted-foreground">周期</th>
              <th className="px-1 py-1.5 text-xs font-medium text-muted-foreground text-right">人数</th>
              <th className="px-1 py-1.5 text-xs font-medium text-muted-foreground text-right">周收益</th>
              <th className="px-1 py-1.5 text-xs font-medium text-muted-foreground text-right">累计</th>
              <th className="px-1 py-1.5 text-xs font-medium text-muted-foreground text-right">ROI</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr
                key={row.week}
                className={cn(
                  'border-b border-border/40 hover:bg-muted/30 transition-colors',
                  row.roiPct >= 100 && 'bg-emerald-50 dark:bg-emerald-500/10'
                )}
              >
                <td className="px-2 py-1.5 truncate">{row.label}</td>
                <td className="px-1 py-1.5 text-right font-mono tabular-nums text-xs">
                  {row.subscribers.toFixed(2)}
                </td>
                <td className="px-1 py-1.5 text-right font-mono tabular-nums text-xs">
                  {formatUsd(row.weeklyRevenue, 1)}
                </td>
                <td className="px-1 py-1.5 text-right font-mono tabular-nums text-xs">
                  {formatUsd(row.cumulativeRevenue, 1)}
                </td>
                <td
                  className={cn(
                    'px-1 py-1.5 text-right font-mono tabular-nums text-xs font-medium',
                    row.roiPct >= 100 && 'text-emerald-600 dark:text-emerald-400',
                    row.roiPct < 0 && 'text-red-500 dark:text-red-400'
                  )}
                >
                  {Math.round(row.roiPct)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
