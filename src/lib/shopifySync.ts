export interface ShopifySyncCandidate {
  id: string | null | undefined;
  finished_inventory?: { quantity: number | null | undefined } | Array<{ quantity: number | null | undefined }> | null;
  shopify_product_id: string | null | undefined;
  shopify_variant_id: string | null | undefined;
}

const getFinishedInventoryQuantity = (product: ShopifySyncCandidate): number | null | undefined => {
  if (Array.isArray(product.finished_inventory)) {
    return product.finished_inventory[0]?.quantity;
  }

  return product.finished_inventory?.quantity;
};

export interface ShopifyStockSyncPayload {
  product_id: string;
  quantity?: number;
}

export const isSyncableShopifyProduct = (product: ShopifySyncCandidate): boolean => {
  return Boolean(
    product.id &&
    product.shopify_product_id &&
    product.shopify_variant_id,
  );
};

export const toShopifyStockSyncPayload = (
  product: ShopifySyncCandidate,
): ShopifyStockSyncPayload | null => {
  const { id, shopify_product_id: shopifyProductId, shopify_variant_id: shopifyVariantId } = product;
  const stockQuantity = getFinishedInventoryQuantity(product);

  if (
    !id ||
    !shopifyProductId ||
    !shopifyVariantId
  ) {
    return null;
  }

  if (typeof stockQuantity === 'number' && Number.isFinite(stockQuantity)) {
    return {
      product_id: id,
      quantity: stockQuantity,
    };
  }

  return {
    product_id: id,
  };
};

export const getShopifyStockSyncPayloads = (
  products: ShopifySyncCandidate[],
): ShopifyStockSyncPayload[] => {
  return products
    .map(toShopifyStockSyncPayload)
    .filter((payload): payload is ShopifyStockSyncPayload => payload !== null);
};
