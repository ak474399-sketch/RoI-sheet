'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollapsibleSection } from './CollapsibleSection';

interface RetentionEditorProps {
  rates: number[];
  onChange: (rates: number[]) => void;
}

export function RetentionEditor({ rates, onChange }: RetentionEditorProps) {
  const displayRates = rates.length >= 26 ? rates.slice(0, 26) : [
    ...rates,
    ...Array.from({ length: 26 - rates.length }, () => rates[rates.length - 1] ?? 0.99),
  ];

  const updateRate = (index: number, pct: number) => {
    const next = [...displayRates];
    next[index] = pct / 100;
    onChange(next);
  };

  return (
    <CollapsibleSection title="续订率 W0~W25" defaultOpen>
      <p className="text-xs text-muted-foreground">
        W0 固定 100%；W1 起为相对上周续订率（非收益增长率）；W26+ 自动延续末值
      </p>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid grid-cols-4 gap-2 min-w-[280px]">
          {displayRates.map((rate, i) => (
            <div key={i} className="space-y-0.5 min-w-0">
              <Label className="text-[10px] text-muted-foreground block truncate">W{i}</Label>
              <Input
                type="number"
                className="h-7 w-full min-w-0 px-1.5 text-xs font-mono"
                value={i === 0 ? 100 : Math.round(rate * 10000) / 100}
                min={0}
                max={100}
                readOnly={i === 0}
                onChange={(e) => {
                  if (i === 0) return;
                  const n = parseFloat(e.target.value);
                  if (!Number.isNaN(n)) updateRate(i, n);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
}
