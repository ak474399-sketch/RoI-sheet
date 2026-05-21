'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  readOnly?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  readOnly,
}: NumberFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          readOnly={readOnly}
          className="font-mono h-8"
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (!Number.isNaN(n)) onChange(n);
          }}
        />
        {suffix ? (
          <span className="text-xs text-muted-foreground shrink-0">{suffix}</span>
        ) : null}
      </div>
    </div>
  );
}

interface PercentFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export function PercentField({ label, value, onChange }: PercentFieldProps) {
  const display = Math.round(value * 10000) / 100;
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={display}
          min={0}
          max={100}
          step={0.1}
          className="font-mono h-8"
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (!Number.isNaN(n)) onChange(n / 100);
          }}
        />
        <span className="text-xs text-muted-foreground">%</span>
      </div>
    </div>
  );
}
