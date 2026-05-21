'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-semibold text-primary tracking-wide">{title}</span>
        <ChevronRight
          className={cn(
            'size-3.5 text-muted-foreground transition-transform duration-150',
            open && 'rotate-90'
          )}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-border grid gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
