import { describe, expect, it } from 'vitest';

import { calculateWholesaleDistributionProductCost } from './wholesaleDistributionModuleHelpers';

describe('wholesaleDistributionModuleHelpers', () => {
  it('calculates the wholesale product cost breakdown from recipe and format costs', () => {
    expect(
      calculateWholesaleDistributionProductCost(
        {
          id: 'p1',
          name: 'Limpiador',
          product_id: 'CTP-001',
          format: '500cc RTU',
          product_type: 'rtu-gatillo',
          color: null,
          aroma: null,
          ph_target: null,
          production_unit_liters: 0.5,
          units_per_batch: 200,
          base_price: 5950,
        },
        10000,
        [
          {
            id: 'f1',
            format_name: '500cc',
            container_cost: 550,
            label_cost: 150,
            created_at: '2026-03-01',
            updated_at: '2026-03-01',
          },
        ],
        {
          id: 'cfg1',
          container_cost: 450,
          packaging_cost: 500,
          label_cost: 150,
          shipping_cost: 5000,
          updated_at: '2026-03-01',
          updated_by: null,
        },
        0.4,
      ),
    ).toEqual({
      product: {
        id: 'p1',
        name: 'Limpiador',
        product_id: 'CTP-001',
        format: '500cc RTU',
        product_type: 'rtu-gatillo',
        color: null,
        aroma: null,
        ph_target: null,
        production_unit_liters: 0.5,
        units_per_batch: 200,
        base_price: 5950,
      },
      rawMaterialCost: 50,
      containerCost: 550,
      packagingCost: 500,
      labelCost: 150,
      totalCost: 1250,
      pvpGross: 5950,
      pvpNet: 5000,
      pvpVAT: 950,
      distributorPriceGross: 3570,
      distributorPriceNet: 3000,
      distributorVAT: 570,
      ctpProfitNet: 1750,
    });
  });
});
