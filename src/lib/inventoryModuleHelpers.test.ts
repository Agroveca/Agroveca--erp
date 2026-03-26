import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PRODUCT_FORM,
  DEFAULT_RAW_MATERIAL_FORM,
  getInventorySummary,
  mapProductToForm,
  mapRawMaterialToForm,
} from './inventoryModuleHelpers';

describe('inventoryModuleHelpers', () => {
  it('provides stable default form values', () => {
    expect(DEFAULT_RAW_MATERIAL_FORM).toEqual({
      name: '',
      category: 'chemical',
      unit: 'kg',
      stock_quantity: 0,
      min_stock_alert: 0,
      current_cost: 0,
    });

    expect(DEFAULT_PRODUCT_FORM).toEqual({
      product_id: '',
      name: '',
      product_type: 'concentrado',
      format: '',
      color: '#94a3b8',
      base_price: 0,
    });
  });

  it('maps raw materials and products into editable form state', () => {
    expect(
      mapRawMaterialToForm({
        id: 'rm-1',
        name: 'Tensioactivo',
        category: 'chemical',
        unit: 'kg',
        stock_quantity: 12.5,
        min_stock_alert: 4,
        current_cost: 1800,
      }),
    ).toEqual({
      name: 'Tensioactivo',
      category: 'chemical',
      unit: 'kg',
      stock_quantity: 12.5,
      min_stock_alert: 4,
      current_cost: 1800,
    });

    expect(
      mapProductToForm({
        id: 'p-1',
        product_id: 'CTP-100',
        name: 'Limpiador Multiuso',
        product_type: 'rtu-gatillo',
        format: '',
        color: null,
        aroma: null,
        ph_target: null,
        production_unit_liters: 0.5,
        base_price: 3490,
      }),
    ).toEqual({
      product_id: 'CTP-100',
      name: 'Limpiador Multiuso',
      product_type: 'rtu-gatillo',
      format: '',
      color: '#94a3b8',
      base_price: 3490,
    });
  });

  it('summarizes inventory value, visible item count, and low stock alerts', () => {
    const rawMaterials = [
      {
        id: 'rm-1',
        name: 'Tensioactivo',
        category: 'chemical' as const,
        unit: 'kg',
        stock_quantity: 10,
        min_stock_alert: 4,
        current_cost: 1000,
      },
      {
        id: 'rm-2',
        name: 'Fragancia',
        category: 'fragrance' as const,
        unit: 'L',
        stock_quantity: 2,
        min_stock_alert: 5,
        current_cost: 3000,
      },
    ];
    const products = [
      {
        id: 'p-1',
        product_id: 'CTP-100',
        name: 'Limpiador Multiuso',
        product_type: 'rtu-gatillo' as const,
        format: '500cc',
        color: '#ffffff',
        aroma: null,
        ph_target: null,
        production_unit_liters: 0.5,
        base_price: 3490,
      },
    ];

    expect(getInventorySummary(rawMaterials, products, 'raw')).toEqual({
      totalRawMaterialValue: 16000,
      inventoryItemCount: 2,
      lowStockCount: 1,
    });

    expect(getInventorySummary(rawMaterials, products, 'finished')).toEqual({
      totalRawMaterialValue: 16000,
      inventoryItemCount: 1,
      lowStockCount: 1,
    });
  });
});
