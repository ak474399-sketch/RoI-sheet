'use client';

import type { FirstWeekMode, ProjectionParams } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NumberField, PercentField } from './fields';
import { CollapsibleSection } from './CollapsibleSection';

interface VariableSectionProps {
  params: ProjectionParams;
  derived: { weeklyUsers: number; w1Subs: number; yearlyUsers: number };
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

export function VariableSection({ params, onChange, derived }: VariableSectionProps) {
  return (
    <CollapsibleSection title="产品变量" defaultOpen>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">首周计费模式</Label>
        <Select
          value={params.firstWeekMode}
          onValueChange={(v) => { if (v) onChange({ firstWeekMode: v as FirstWeekMode }); }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="intro099">0.99 首周优惠</SelectItem>
            <SelectItem value="direct">直接付费</SelectItem>
            <SelectItem value="free_trial">免费试用</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PercentField
          label="周订阅率"
          value={params.weeklySubRate}
          onChange={(weeklySubRate) => onChange({ weeklySubRate })}
        />
        <DerivedField label="首周人数" value={derived.weeklyUsers.toFixed(0)} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PercentField
          label="年订阅率"
          value={params.yearlySubRate}
          onChange={(yearlySubRate) => onChange({ yearlySubRate })}
        />
        <DerivedField label="年付费人数" value={derived.yearlyUsers.toFixed(0)} />
      </div>

      <DerivedField label="次周订阅人数 (W1)" value={derived.w1Subs.toFixed(2)} />

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="周价格"
          value={params.weeklySubPrice}
          min={0}
          step={0.01}
          onChange={(weeklySubPrice) => onChange({ weeklySubPrice })}
        />
        <NumberField
          label="年价格"
          value={params.yearlySubPrice}
          min={0}
          step={0.01}
          onChange={(yearlySubPrice) => onChange({ yearlySubPrice })}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">平台抽成</Label>
        <Select
          value={String(params.platformFee)}
          onValueChange={(v) => { if (v) onChange({ platformFee: parseFloat(v) }); }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.15">15%（小企业）</SelectItem>
            <SelectItem value="0.3">30%（标准）</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CollapsibleSection>
  );
}
