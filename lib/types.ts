export type FirstWeekMode = 'direct' | 'intro099' | 'free_trial';

export interface ProjectionParams {
  adSpend: number;
  cpi: number;
  weeklySubRate: number;
  yearlySubRate: number;
  weeklySubPrice: number;
  yearlySubPrice: number;
  platformFee: number;
  adRevenueLTV: number;
  rebateRevenue: number;
  firstWeekMode: FirstWeekMode;
  retentionRates: number[];
}

export interface WeeklyRow {
  week: number;
  label: string;
  subscribers: number;
  weeklyRevenue: number;
  cumulativeRevenue: number;
  roiPct: number;
}

export interface ProjectionResult {
  params: ProjectionParams;
  totalUsers: number;
  weeklyUsers: number;
  yearlyUsers: number;
  totalPayUsers: number;
  cpa: number;
  annualRevenue: number;
  netCostExYear: number;
  /** W0~W52 (53 行) */
  rows: WeeklyRow[];
  day7Roi: number;
  day7RoiExYear: number;
  day30Roi: number;
  day60Roi: number;
  day180Roi: number;
  day365Roi: number;
  /** 插值到 Day180 的累计收益（用于毛利计算） */
  day180CumRevenue: number;
  /** 插值到 Day365 的累计收益（用于毛利计算） */
  day365CumRevenue: number;
  breakEvenWeek: number | null;
}

export interface Scenario {
  id: string;
  name: string;
  params: ProjectionParams;
  result: ProjectionResult;
}
