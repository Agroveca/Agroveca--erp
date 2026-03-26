import { PackagingInventory } from './supabase';

export type StockStatus = 'critical' | 'low' | 'ok';

export interface StockStatusDisplay {
  colorClass: string;
  textClass: string;
  iconName: 'alert' | 'bell' | 'package';
}

export interface NeededStockItem extends PackagingInventory {
  deficit: number;
  totalCost: number;
}

export interface StockMonitorSummary {
  criticalItems: PackagingInventory[];
  lowStockItems: PackagingInventory[];
  blockingItems: PackagingInventory[];
}

export const getStockStatus = (item: PackagingInventory): StockStatus => {
  if (item.current_stock < item.min_stock_alert) return 'critical';
  if (item.current_stock < item.optimal_stock) return 'low';
  return 'ok';
};

export const getStockStatusDisplay = (status: StockStatus): StockStatusDisplay => {
  if (status === 'critical') {
    return {
      colorClass: 'bg-red-100 text-red-800 border-red-300',
      textClass: 'text-red-600',
      iconName: 'alert',
    };
  }

  if (status === 'low') {
    return {
      colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      textClass: 'text-yellow-600',
      iconName: 'bell',
    };
  }

  return {
    colorClass: 'bg-green-100 text-green-800 border-green-300',
    textClass: 'text-green-600',
    iconName: 'package',
  };
};

export const getStockMonitorSummary = (inventory: PackagingInventory[]): StockMonitorSummary => {
  const criticalItems = inventory.filter((item) => getStockStatus(item) === 'critical');
  const lowStockItems = inventory.filter((item) => getStockStatus(item) === 'low');
  const blockingItems = criticalItems.filter((item) => item.current_stock === 0);

  return {
    criticalItems,
    lowStockItems,
    blockingItems,
  };
};

export const calculateNeededStock = (
  inventory: PackagingInventory[],
  targetUnits: number,
): NeededStockItem[] => {
  return inventory.map((item) => {
    const deficit = Math.max(0, targetUnits - item.current_stock);
    const totalCost = deficit * item.unit_cost_net * 1.19;
    return { ...item, deficit, totalCost };
  });
};

export const getTotalReplenishmentCost = (items: NeededStockItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalCost, 0);
};

export const buildPurchaseList = (items: NeededStockItem[]): string => {
  return items
    .filter((item) => item.deficit > 0)
    .map((item) => `${item.item_name} ${item.format || ''}: ${item.deficit} unidades`)
    .join('\n');
};
