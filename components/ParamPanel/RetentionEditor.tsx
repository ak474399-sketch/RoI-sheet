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
    <CollapsibleSection title="续订率 W0~W25" defaultOpen={false}>
      <p className="text-xs text-muted-foreground -mt-1">
        W0 固定 100%；W1 起为相对上周的续订率；W26 以后按最后值延伸至 Day365
      </p>
      <div className="grid grid-cols-4 gap-2">
        {displayRates.map((rate, i) => (
          <div key={i} className="space-y-0.5">
            <Label className="text-[10px] text-muted-foreground">W{i}</Label>
            <Input
              type="number"
              className="h-7 px-1.5 text-xs font-mono"
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
    </CollapsibleSection>
  );
}
