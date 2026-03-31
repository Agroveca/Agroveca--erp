import { describe, expect, it } from 'vitest';

import {
  getShopifyStockSyncPayloads,
  isSyncableShopifyProduct,
  toShopifyStockSyncPayload,
} from './shopifySync';

describe('shopify sync helpers', () => {
  it('accepts products with both Shopify ids even when stock must be resolved server-side', () => {
    expect(isSyncableShopifyProduct({
      id: 'p1',
      finished_inventory: { quantity: 12 },
      shopify_product_id: 'sp1',
      shopify_variant_id: 'sv1',
    })).toBe(true);

    expect(isSyncableShopifyProduct({
      id: 'p1',
      finished_inventory: { quantity: 12 },
      shopify_product_id: 'sp1',
      shopify_variant_id: null,
    })).toBe(false);

    expect(isSyncableShopifyProduct({
      id: 'p1',
      finished_inventory: { quantity: Number.NaN },
      shopify_product_id: 'sp1',
      shopify_variant_id: 'sv1',
    })).toBe(true);
  });

  it('builds the payload expected by the stock sync function', () => {
    expect(toShopifyStockSyncPayload({
      id: 'p1',
      finished_inventory: { quantity: 8 },
      shopify_product_id: 'sp1',
      shopify_variant_id: 'sv1',
    })).toEqual({
      product_id: 'p1',
      quantity: 8,
    });
  });

  it('filters out incomplete products before syncing', () => {
    expect(getShopifyStockSyncPayloads([
      {
        id: 'p1',
        finished_inventory: { quantity: 8 },
        shopify_product_id: 'sp1',
        shopify_variant_id: 'sv1',
      },
      {
        id: 'p2',
        finished_inventory: { quantity: 3 },
        shopify_product_id: 'sp2',
        shopify_variant_id: null,
      },
      {
        id: 'p3',
        finished_inventory: { quantity: undefined },
        shopify_product_id: 'sp3',
        shopify_variant_id: 'sv3',
      },
    ])).toEqual([
      {
        product_id: 'p1',
        quantity: 8,
      },
      {
        product_id: 'p3',
      },
    ]);
  });
});
