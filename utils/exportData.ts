import type { ProjectionResult } from '@/lib/types';

export function exportProjectionCsv(
  result: ProjectionResult,
  scenarioName: string
): void {
  const header = '周期,周订阅数,周订阅收益,累计收益,累计ROI';
  const lines = result.rows.map(
    (r) =>
      `${r.label},${r.subscribers},${r.weeklyRevenue},${r.cumulativeRevenue},${Math.round(r.roiPct)}%`
  );
  const csv = [header, ...lines].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const a = document.createElement('a');
  a.href = url;
  a.download = `roi-prediction-${scenarioName}-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
