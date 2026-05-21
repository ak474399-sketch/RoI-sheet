'use client';

import type { Scenario } from '@/lib/types';
import { SummaryCards } from '@/components/ResultPanel/SummaryCards';

interface CompareViewProps {
  scenarios: Scenario[];
}

export function CompareView({ scenarios }: CompareViewProps) {
  if (scenarios.length < 2) {
    return (
      <p className="text-sm text-muted-foreground px-1">
        请至少添加 2 个方案以启用对比视图
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {scenarios.slice(0, 2).map((s) => (
        <div key={s.id} className="space-y-2">
          <h3 className="text-xs font-medium text-primary">{s.name}</h3>
          <SummaryCards result={s.result} />
        </div>
      ))}
    </div>
  );
}
