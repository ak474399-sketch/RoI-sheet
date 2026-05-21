'use client';

import type { ProjectionResult } from '@/lib/types';
import { SummaryCards } from './SummaryCards';
import { ROIChart } from './ROIChart';
import { ProjectionTable } from './ProjectionTable';

interface ResultPanelProps {
  result: ProjectionResult;
  chartSeries: { name: string; result: ProjectionResult }[];
}

export function ResultPanel({ result, chartSeries }: ResultPanelProps) {
  return (
    <div className="flex-1 flex flex-col gap-2 p-3 overflow-hidden min-h-0 h-full">
      <div className="shrink-0">
        <SummaryCards result={result} />
      </div>
      <div className="shrink-0">
        <ROIChart series={chartSeries} />
      </div>
      <ProjectionTable result={result} />
    </div>
  );
}
