'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { calculateProjection } from '@/lib/calculator';
import { DEFAULT_PARAMS } from '@/lib/defaultParams';
import type { ProjectionParams, Scenario } from '@/lib/types';
import { ParamPanel } from '@/components/ParamPanel';
import { ResultPanel } from '@/components/ResultPanel';
import { ROIChart } from '@/components/ResultPanel/ROIChart';
import { ProjectionTable } from '@/components/ResultPanel/ProjectionTable';
import { CompareView } from '@/components/ScenarioManager/CompareView';
import { exportProjectionCsv } from '@/utils/exportData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, GitCompare, Moon, Plus, Sun, X } from 'lucide-react';

function createScenario(name: string, params?: ProjectionParams): Scenario {
  const p = params ?? structuredClone(DEFAULT_PARAMS);
  const result = calculateProjection(p);
  return { id: crypto.randomUUID(), name, params: p, result };
}

const SCENARIO_NAMES = ['方案A', '方案B', '方案C', '方案D'];

export default function Home() {
  const initialScenario = useMemo(() => createScenario('方案A'), []);
  const [scenarios, setScenarios] = useState<Scenario[]>(() => [initialScenario]);
  const [activeId, setActiveId] = useState<string>(initialScenario.id);
  const [compareMode, setCompareMode] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];

  const updateScenarioParams = useCallback(
    (id: string, params: ProjectionParams) => {
      setScenarios((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, params, result: calculateProjection(params) } : s
        )
      );
    },
    []
  );

  const addScenario = () => {
    if (scenarios.length >= 4) return;
    const name = SCENARIO_NAMES[scenarios.length] ?? `方案${scenarios.length + 1}`;
    const next = createScenario(name, structuredClone(active.params));
    setScenarios((prev) => [...prev, next]);
    setActiveId(next.id);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    setScenarios((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? '');
      return next;
    });
  };

  const chartSeries = useMemo(() => {
    if (compareMode) return scenarios.map((s) => ({ name: s.name, result: s.result }));
    return [{ name: active.name, result: active.result }];
  }, [compareMode, scenarios, active]);

  if (!active) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="h-12 shrink-0 border-b border-border bg-card flex items-center justify-between px-4 gap-3">
        <h1 className="text-sm font-semibold text-primary shrink-0">
          IAP 订阅 ROI 预测器
        </h1>

        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          <Tabs value={activeId} onValueChange={(v) => v && setActiveId(v)} className="min-w-0">
            <TabsList className="h-7">
              {scenarios.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className="h-6 text-xs gap-1">
                  {s.name}
                  {scenarios.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="删除方案"
                      className="ml-0.5 opacity-50 hover:opacity-100 cursor-pointer rounded"
                      onClick={(e) => { e.stopPropagation(); removeScenario(s.id); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); removeScenario(s.id); } }}
                    >
                      <X className="size-3" />
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {scenarios.length < 4 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={addScenario}>
              <Plus className="size-3" />
              新增方案
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant={compareMode ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setCompareMode((v) => !v)}
          >
            <GitCompare className="size-3" />
            对比
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => exportProjectionCsv(active.result, active.name)}
          >
            <Download className="size-3" />
            导出
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsDark((v) => !v)}
            aria-label="切换主题"
          >
            {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {!compareMode && (
          <ParamPanel
            params={active.params}
            result={active.result}
            onChange={(params) => updateScenarioParams(active.id, params)}
          />
        )}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {compareMode ? (
            <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
              <ROIChart series={chartSeries} />
              <CompareView scenarios={scenarios} />
              <ProjectionTable result={active.result} />
            </div>
          ) : (
            <ResultPanel result={active.result} chartSeries={chartSeries} />
          )}
        </main>
      </div>
    </div>
  );
}
