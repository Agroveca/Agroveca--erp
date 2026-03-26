import { describe, expect, it } from 'vitest';

import {
  buildPurchaseList,
  calculateNeededStock,
  getStockMonitorSummary,
  getStockStatus,
  getStockStatusDisplay,
  getTotalReplenishmentCost,
} from './stockMonitorHelpers';

const inventory = [
  {
    id: 'i-1',
    item_type: 'envase',
    item_name: 'Botella PET',
    format: '500cc',
    current_stock: 0,
    min_stock_alert: 10,
    optimal_stock: 50,
    unit_cost_net: 100,
    location: null,
    last_updated: '2026-03-26T00:00:00.000Z',
    created_at: '2026-03-26T00:00:00.000Z',
  },
  {
    id: 'i-2',
    item_type: 'tapa',
    item_name: 'Tapa Rosca',
    format: '500cc',
    current_stock: 20,
    min_stock_alert: 10,
    optimal_stock: 60,
    unit_cost_net: 50,
    location: null,
    last_updated: '2026-03-26T00:00:00.000Z',
    created_at: '2026-03-26T00:00:00.000Z',
  },
  {
    id: 'i-3',
    item_type: 'etiqueta',
    item_name: 'Etiqueta Frontal',
    format: '500cc',
    current_stock: 80,
    min_stock_alert: 10,
    optimal_stock: 60,
    unit_cost_net: 30,
    location: null,
    last_updated: '2026-03-26T00:00:00.000Z',
    created_at: '2026-03-26T00:00:00.000Z',
  },
];

describe('stockMonitorHelpers', () => {
  it('classifies stock status and display metadata', () => {
    expect(getStockStatus(inventory[0])).toBe('critical');
    expect(getStockStatus(inventory[1])).toBe('low');
    expect(getStockStatus(inventory[2])).toBe('ok');
    expect(getStockStatusDisplay('critical')).toEqual({
      colorClass: 'bg-red-100 text-red-800 border-red-300',
      textClass: 'text-red-600',
      iconName: 'alert',
    });
  });

  it('summarizes critical, low, and blocking items', () => {
    const summary = getStockMonitorSummary(inventory);

    expect(summary.criticalItems).toHaveLength(1);
    expect(summary.lowStockItems).toHaveLength(1);
    expect(summary.blockingItems).toHaveLength(1);
  });

  it('calculates needed stock, replenishment total, and purchase list', () => {
    const neededStock = calculateNeededStock(inventory, 100);

    expect(neededStock[0]).toMatchObject({ deficit: 100, totalCost: 11900 });
    expect(neededStock[1]).toMatchObject({ deficit: 80, totalCost: 4760 });
    expect(neededStock[2]).toMatchObject({ deficit: 20, totalCost: 714 });
    expect(getTotalReplenishmentCost(neededStock)).toBe(17374);
    expect(buildPurchaseList(neededStock)).toBe(
      'Botella PET 500cc: 100 unidades\nTapa Rosca 500cc: 80 unidades\nEtiqueta Frontal 500cc: 20 unidades',
    );
  });
});
