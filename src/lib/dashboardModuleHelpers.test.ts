import { describe, expect, it } from 'vitest';

import { getDashboardMarginSummary } from './dashboardModuleHelpers';

describe('dashboardModuleHelpers', () => {
  it('returns zero average and empty slices when there are no products', () => {
    expect(getDashboardMarginSummary([])).toEqual({
      averageMargin: 0,
      topProducts: [],
      bottomProducts: [],
    });
  });

  it('builds average, top, and bottom product margin slices', () => {
    const products = [
      { product: { id: 'p1', name: 'A' }, netMarginNet: 80, netProfitNet: 1000 },
      { product: { id: 'p2', name: 'B' }, netMarginNet: 40, netProfitNet: 500 },
      { product: { id: 'p3', name: 'C' }, netMarginNet: 60, netProfitNet: 800 },
      { product: { id: 'p4', name: 'D' }, netMarginNet: 20, netProfitNet: 200 },
    ];

    expect(getDashboardMarginSummary(products)).toEqual({
      averageMargin: 50,
      topProducts: [products[0], products[2], products[1]],
      bottomProducts: [products[3], products[1], products[2]],
    });
  });
});
