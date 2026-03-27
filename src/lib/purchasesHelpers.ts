import { PackagingInventory, Purchase } from './supabase';

export const normalizeInventoryFormat = (format: string | null | undefined) => {
  return format?.trim() || null;
};

export const findPackagingInventoryMatch = (
  inventory: PackagingInventory[],
  itemType: string,
  itemName: string,
  format: string | null | undefined,
): PackagingInventory | undefined => {
  const normalizedFormat = normalizeInventoryFormat(format);

  return inventory.find(
    (item) =>
      item.item_type === itemType &&
      item.item_name === itemName &&
      normalizeInventoryFormat(item.format) === normalizedFormat,
  );
};

export interface PurchaseMonthSummary {
  monthlyPurchases: Purchase[];
  totalVatCredit: number;
  totalSpent: number;
}

export interface PurchaseInventoryImpactPlan {
  normalizedFormat: string | null;
  packagingInventoryId: string | null;
  shouldInsertInventory: boolean;
  inventoryInsertPayload: {
    item_type: string;
    item_name: string;
    format: string | null;
    current_stock: number;
    unit_cost_net: number;
  } | null;
  inventoryUpdatePayload: {
    id: string;
    current_stock: number;
    unit_cost_net: number;
  } | null;
  movementPayload: {
    movement_type: 'entrada';
    quantity: number;
    reference_type: 'purchase';
    notes: string;
  };
}

export const getPurchaseMonthSummary = (
  purchases: Purchase[],
  referenceDate = new Date(),
): PurchaseMonthSummary => {
  const referenceMonth = referenceDate.getMonth();
  const referenceYear = referenceDate.getFullYear();

  const monthlyPurchases = purchases.filter((purchase) => {
    const purchaseDate = new Date(purchase.purchase_date);
    return purchaseDate.getMonth() === referenceMonth && purchaseDate.getFullYear() === referenceYear;
  });

  return {
    monthlyPurchases,
    totalVatCredit: monthlyPurchases.reduce((sum, purchase) => sum + purchase.vat_credit, 0),
    totalSpent: monthlyPurchases.reduce((sum, purchase) => sum + purchase.total_gross, 0),
  };
};

export const buildPurchaseInventoryImpactPlan = (
  inventory: PackagingInventory[],
  input: {
    itemType: string;
    itemName: string;
    format: string | null | undefined;
    quantity: number;
    unitCostNet: number;
    supplierName: string;
  },
): PurchaseInventoryImpactPlan => {
  const normalizedFormat = normalizeInventoryFormat(input.format);
  const existingItem = findPackagingInventoryMatch(
    inventory,
    input.itemType,
    input.itemName,
    normalizedFormat,
  );

  return {
    normalizedFormat,
    packagingInventoryId: existingItem?.id || null,
    shouldInsertInventory: !existingItem,
    inventoryInsertPayload: existingItem
      ? null
      : {
          item_type: input.itemType,
          item_name: input.itemName,
          format: normalizedFormat,
          current_stock: input.quantity,
          unit_cost_net: input.unitCostNet,
        },
    inventoryUpdatePayload: existingItem
      ? {
          id: existingItem.id,
          current_stock: existingItem.current_stock + input.quantity,
          unit_cost_net: input.unitCostNet,
        }
      : null,
    movementPayload: {
      movement_type: 'entrada',
      quantity: input.quantity,
      reference_type: 'purchase',
      notes: `Compra a ${input.supplierName}`,
    },
  };
};
