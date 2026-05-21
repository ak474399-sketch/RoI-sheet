import type { ProjectionParams, ProjectionResult, WeeklyRow } from './types';

function makeLabels(count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i === 0) out.push('首周订阅');
    else if (i === 1) out.push('次周订阅');
    else out.push(`${i + 1}周订阅`);
  }
  return out;
}

const WEEK_LABELS = makeLabels(54);

function r2(n: number): number { return Math.round(n * 100) / 100; }
function r1(n: number): number { return Math.round(n * 10) / 10; }

/** 在两行之间线性插值累计收益 */
function interpolateCumRevenue(
  rowA: WeeklyRow,
  rowB: WeeklyRow,
  frac: number
): number {
  return rowA.cumulativeRevenue + (rowB.cumulativeRevenue - rowA.cumulativeRevenue) * frac;
}

export function calculateProjection(params: ProjectionParams): ProjectionResult {
  const {
    adSpend, cpi,
    weeklySubRate, yearlySubRate,
    weeklySubPrice, yearlySubPrice,
    platformFee,
    adRevenueLTV, rebateRevenue,
    firstWeekMode,
    retentionRates,
  } = params;

  const totalUsers = adSpend / cpi;
  const weeklyUsers = totalUsers * weeklySubRate;
  const yearlyUsers = totalUsers * yearlySubRate;
  const totalPayUsers = weeklyUsers + yearlyUsers;
  const cpa = totalPayUsers > 0 ? adSpend / totalPayUsers : 0;
  const annualRevenue = yearlyUsers * yearlySubPrice * (1 - platformFee);
  const netCostExYear = adSpend - annualRevenue;

  // 确保至少 54 个续订率（W0~W53），超出部分用最后一个值填充
  const rates = [...retentionRates];
  while (rates.length < 54) {
    rates.push(rates[rates.length - 1] ?? 0.99);
  }

  // 计算 W0~W53（54 行），用于插值
  const allRows: WeeklyRow[] = [];
  let cumRevenue = 0;

  for (let N = 0; N <= 53; N++) {
    const prevSubs = N === 0 ? weeklyUsers : allRows[N - 1].subscribers;
    const subs = N === 0 ? weeklyUsers : prevSubs * rates[N];

    let weekRev = 0;
    if (N === 0) {
      if (firstWeekMode === 'direct') {
        weekRev = subs * weeklySubPrice * (1 - platformFee);
      } else if (firstWeekMode === 'intro099') {
        weekRev = subs * 0.99 * (1 - platformFee);
      }
      cumRevenue = annualRevenue + weekRev + adRevenueLTV + rebateRevenue;
    } else {
      weekRev = subs * weeklySubPrice * (1 - platformFee);
      cumRevenue += weekRev;
    }

    allRows.push({
      week: N,
      label: WEEK_LABELS[N] ?? `${N + 1}周订阅`,
      subscribers: r2(subs),
      weeklyRevenue: r1(weekRev),
      cumulativeRevenue: r1(cumRevenue),
      roiPct: r1((cumRevenue / adSpend) * 100),
    });
  }

  // 对外暴露 W0~W52（53 行），W53 仅供内部插值
  const rows = allRows.slice(0, 53);

  // ── 回本周（线性插值） ──────────────────────────────────────
  let breakEvenWeek: number | null = null;
  for (let i = 0; i < allRows.length; i++) {
    if (allRows[i].roiPct >= 100) {
      if (i === 0) {
        breakEvenWeek = 0;
      } else {
        const prev = allRows[i - 1];
        const curr = allRows[i];
        const frac = (adSpend - prev.cumulativeRevenue) /
          (curr.cumulativeRevenue - prev.cumulativeRevenue);
        breakEvenWeek = r2(i - 1 + frac);
      }
      break;
    }
  }

  // ── Day30 (Week4) / Day60 (Week8) ─────────────────────────
  const day30Roi = allRows[4]?.roiPct ?? 0;
  const day60Roi = allRows[8]?.roiPct ?? 0;

  // ── Day180 插值 180/7 ≈ 25.714 ────────────────────────────
  const d180Week = 180 / 7;
  const w180a = allRows[25]!;
  const w180b = allRows[26]!;
  const day180CumRevenue = r1(interpolateCumRevenue(w180a, w180b, d180Week - 25));
  const day180Roi = r1((day180CumRevenue / adSpend) * 100);

  // ── Day365 插值 365/7 ≈ 52.143 ───────────────────────────
  const d365Week = 365 / 7;
  const w365a = allRows[52]!;
  const w365b = allRows[53]!;
  const day365CumRevenue = r1(interpolateCumRevenue(w365a, w365b, d365Week - 52));
  const day365Roi = r1((day365CumRevenue / adSpend) * 100);

  return {
    params,
    totalUsers: Math.round(totalUsers),
    weeklyUsers: r2(weeklyUsers),
    yearlyUsers: r2(yearlyUsers),
    totalPayUsers: r2(totalPayUsers),
    cpa: r2(cpa),
    annualRevenue: r2(annualRevenue),
    netCostExYear: r2(netCostExYear),
    rows,
    day7Roi: allRows[0]?.roiPct ?? 0,
    day7RoiExYear: netCostExYear > 0
      ? r1(((allRows[0]?.cumulativeRevenue ?? 0) / netCostExYear) * 100)
      : 0,
    day30Roi,
    day60Roi,
    day180Roi,
    day365Roi,
    day180CumRevenue,
    day365CumRevenue,
    breakEvenWeek,
  };
}
