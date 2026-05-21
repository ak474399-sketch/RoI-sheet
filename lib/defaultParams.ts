import type { ProjectionParams } from './types';

export const DEFAULT_PARAMS: ProjectionParams = {
  adSpend: 3000,
  cpi: 3.00,
  weeklySubRate: 0.135,
  yearlySubRate: 0.015,
  weeklySubPrice: 9.99,
  yearlySubPrice: 39.99,
  platformFee: 0.15,
  adRevenueLTV: 0,
  rebateRevenue: 0,
  firstWeekMode: 'intro099',
  retentionRates: [
    1.00, 0.45, 0.70, 0.75, 0.75,
    0.80, 0.80, 0.90, 0.90, 0.90,
    0.90, 0.99, 0.99, 0.99, 0.99,
    0.99, 0.99, 0.99, 0.99, 0.99,
    0.99, 0.99, 0.99, 0.99, 0.99,
    0.99,
  ],
};
