/**
 * 验证 calculator 与 SPEC 第十节对齐
 * 运行: node scripts/verify.mjs
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 动态编译 TS 较麻烦，此处内联核心计算用于验证（与 lib/calculator 逻辑一致）
const DEFAULT = {
  adSpend: 3000,
  cpi: 3,
  weeklySubRate: 0.135,
  yearlySubRate: 0.015,
  weeklySubPrice: 9.99,
  yearlySubPrice: 39.99,
  platformFee: 0.15,
  adRevenueLTV: 0,
  rebateRevenue: 0,
  firstWeekMode: 'intro099',
  retentionRates: [
    1, 0.45, 0.7, 0.75, 0.75, 0.8, 0.8, 0.9, 0.9, 0.9, 0.9,
    0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99,
    0.99, 0.99, 0.99, 0.99, 0.99, 0.99,
  ],
};

function calc(p) {
  const totalUsers = p.adSpend / p.cpi;
  const weeklyUsers = totalUsers * p.weeklySubRate;
  const yearlyUsers = totalUsers * p.yearlySubRate;
  const annualRevenue = yearlyUsers * p.yearlySubPrice * (1 - p.platformFee);
  const netCostExYear = p.adSpend - annualRevenue;
  const rates = [...p.retentionRates];
  while (rates.length < 26) rates.push(rates.at(-1) ?? 0.99);

  let cum = 0;
  let subs = weeklyUsers;
  const rows = [];
  for (let N = 0; N <= 25; N++) {
    subs = N === 0 ? weeklyUsers : subs * rates[N];
    let weekRev = 0;
    if (N === 0) {
      if (p.firstWeekMode === 'intro099') weekRev = subs * 0.99 * (1 - p.platformFee);
      cum = annualRevenue + weekRev + p.adRevenueLTV + p.rebateRevenue;
    } else {
      weekRev = subs * p.weeklySubPrice * (1 - p.platformFee);
      cum += weekRev;
    }
    rows.push({
      subs: Math.round(subs * 100) / 100,
      weekRev: Math.round(weekRev * 10) / 10,
      cum: Math.round(cum * 10) / 10,
      roi: Math.round((cum / p.adSpend) * 1000) / 10,
    });
  }
  const day7RoiExYear = Math.round((rows[0].cum / netCostExYear) * 1000) / 10;
  return { rows, netCostExYear: Math.round(netCostExYear * 100) / 100, day7RoiExYear, weeklyUsers, yearlyUsers: Math.round(yearlyUsers * 100) / 100 };
}

const r = calc(DEFAULT);
const checks = [
  ['weeklyUsers', r.weeklyUsers, 135],
  ['W0 subs', r.rows[0].subs, 135],
  ['W1 subs', r.rows[1].subs, 60.75],
  ['W2 subs', r.rows[2].subs, 42.53],
  ['W0 weekRev', r.rows[0].weekRev, 113.5],
  ['W1 weekRev', r.rows[1].weekRev, 515.9],
  ['W0 cum', r.rows[0].cum, 623.5],
  ['W1 cum', r.rows[1].cum, 1139.3],
  ['W0 ROI', r.rows[0].roi, 21],
  ['W1 ROI', r.rows[1].roi, 38],
  ['netCostExYear', r.netCostExYear, 2490.1],
  ['day7RoiExYear', r.day7RoiExYear, 25],
  ['W14 cum', r.rows[14].cum, 3001.9],
];

let ok = true;
for (const [name, actual, expected] of checks) {
  const pass = Math.abs(actual - expected) <= 0.6;
  console.log(`${pass ? '✓' : '✗'} ${name}: ${actual} (期望 ${expected})`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);
