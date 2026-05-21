'use client';

import type { ProjectionParams, ProjectionResult } from '@/lib/types';
import { InvestmentSection } from './InvestmentSection';
import { VariableSection } from './VariableSection';
import { ConversionSection } from './ConversionSection';
import { RetentionEditor } from './RetentionEditor';

interface ParamPanelProps {
  params: ProjectionParams;
  result: ProjectionResult;
  onChange: (params: ProjectionParams) => void;
}

export function ParamPanel({ params, result, onChange }: ParamPanelProps) {
  const patch = (p: Partial<ProjectionParams>) => onChange({ ...params, ...p });

  return (
    <aside className="w-[340px] shrink-0 overflow-y-auto overflow-x-visible border-r border-border bg-sidebar p-3 space-y-3 max-h-[calc(100vh-48px)]">
      <InvestmentSection
        params={params}
        derived={{ totalUsers: result.totalUsers, cpa: result.cpa }}
        onChange={patch}
      />
      <VariableSection
        params={params}
        derived={{
          weeklyUsers: result.weeklyUsers,
          w1Subs: result.rows[1]?.subscribers ?? 0,
          yearlyUsers: result.yearlyUsers,
        }}
        onChange={patch}
      />
      <RetentionEditor
        rates={params.retentionRates}
        onChange={(retentionRates) => patch({ retentionRates })}
      />
      <ConversionSection params={params} onChange={patch} />
    </aside>
  );
}
