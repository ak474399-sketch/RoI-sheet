'use client';

import type { ProjectionResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProjectionTableProps {
  result: ProjectionResult;
}

export function ProjectionTable({ result }: ProjectionTableProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-border shrink-0">
        <span className="text-xs font-medium text-primary">周预测明细</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
            <tr className="text-left">
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground">周期</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">订阅人数</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">周收益</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">累计收益</th>
              <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">累计ROI</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr
                key={row.week}
                className={cn(
                  'border-b border-border/50 transition-colors',
                  'hover:bg-muted/40',
                  row.roiPct >= 100 && 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/15'
                )}
              >
                <td className="px-3 py-1.5 text-sm">{row.label}</td>
                <td className="px-3 py-1.5 text-right font-mono text-sm">
                  {row.subscribers.toFixed(2)}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-sm">
                  ¥{row.weeklyRevenue.toFixed(1)}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-sm">
                  ¥{row.cumulativeRevenue.toFixed(1)}
                </td>
                <td
                  className={cn(
                    'px-3 py-1.5 text-right font-mono text-sm font-medium',
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
