'use client';

import type { ProjectionParams } from '@/lib/types';
import { NumberField } from './fields';
import { CollapsibleSection } from './CollapsibleSection';

interface ConversionSectionProps {
  params: ProjectionParams;
  onChange: (patch: Partial<ProjectionParams>) => void;
}

export function ConversionSection({ params, onChange }: ConversionSectionProps) {
  return (
    <CollapsibleSection title="其他收益" defaultOpen={false}>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="广告收益（总量）"
          value={params.adRevenueLTV}
          min={0}
          step={1}
          onChange={(adRevenueLTV) => onChange({ adRevenueLTV })}
        />
        <NumberField
          label="返点收益（总量）"
          value={params.rebateRevenue}
          min={0}
          step={1}
          onChange={(rebateRevenue) => onChange({ rebateRevenue })}
        />
      </div>
    </CollapsibleSection>
  );
}
