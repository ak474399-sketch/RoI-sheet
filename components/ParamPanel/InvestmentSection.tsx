'use client';

import type { ProjectionParams } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberField } from './fields';
import { CollapsibleSection } from './CollapsibleSection';

interface InvestmentSectionProps {
  params: ProjectionParams;
  derived: { totalUsers: number; cpa: number };
  onChange: (patch: Partial<ProjectionParams>) => void;
}

function DerivedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input readOnly value={value} className="h-8 font-mono bg-muted/50 cursor-default" />
    </div>
  );
}

export function InvestmentSection({ params, derived, onChange }: InvestmentSectionProps) {
  return (
    <CollapsibleSection title="投放端" defaultOpen>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="买量成本"
          value={params.adSpend}
          min={0}
          step={100}
          onChange={(adSpend) => onChange({ adSpend })}
        />
        <NumberField
          label="CPI"
          value={params.cpi}
          min={0.01}
          step={0.01}
          onChange={(cpi) => onChange({ cpi })}
        />
        <DerivedField label="用户数" value={derived.totalUsers.toLocaleString()} />
        <DerivedField label="CPA" value={derived.cpa.toFixed(2)} />
      </div>
    </CollapsibleSection>
  );
}
