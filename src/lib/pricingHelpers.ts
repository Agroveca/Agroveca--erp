import { FixedCostsConfig, Product } from './supabase';

export interface FormatCosts {
  container: number;
  label: number;
}

export interface VolumeDiscount {
  level: number;
  name: string;
  minQuantity: number;
  maxQuantity: number | null;
  discountPercent: number;
  description: string;
}

export const VOLUME_DISCOUNTS: VolumeDiscount[] = [
  {
    level: 1,
    name: 'MOQ',
    minQuantity: 100,
    maxQuantity: 499,
    discountPercent: 0,
    description: 'Pedido minimo (100-499 unidades)',
  },
  {
    level: 2,
    name: 'Master',
    minQuantity: 500,
    maxQuantity: 999,
    discountPercent: 5,
    description: 'Volumen Master (500-999 unidades) - 5% desc.',
  },
  {
    level: 3,
    name: 'Pallet',
    minQuantity: 1000,
    maxQuantity: null,
    discountPercent: 10,
    description: 'Volumen Pallet (1000+ unidades) - 10% desc.',
  },
];

export const getFormatCosts = (format: string): FormatCosts => {
  const formatLower = format.toLowerCase();

  if (formatLower.includes('100')) {
    return { container: 350, label: 80 };
  }

  if (formatLower.includes('200')) {
    return { container: 450, label: 100 };
  }

  if (formatLower.includes('500') || formatLower.includes('rtu')) {
    return { container: 550, label: 150 };
  }

  return { container: 450, label: 100 };
};

export const getVolumeDiscount = (quantity: number): VolumeDiscount => {
  for (let i = VOLUME_DISCOUNTS.length - 1; i >= 0; i -= 1) {
    const discount = VOLUME_DISCOUNTS[i];
    if (quantity >= discount.minQuantity && (discount.maxQuantity === null || quantity <= discount.maxQuantity)) {
      return discount;
    }
  }

  return VOLUME_DISCOUNTS[0];
};

export const calculateFactoryCost = (
  product: Product,
  costs: FixedCostsConfig | null,
  rawMaterialCostPer100L: number,
): {
  rawMaterialCost: number;
  containerCost: number;
  labelCost: number;
  packagingCost: number;
  factoryCost: number;
} => {
  const unitsPerBatch = product.units_per_batch || 1;
  const rawMaterialCost = unitsPerBatch > 0 ? rawMaterialCostPer100L / unitsPerBatch : rawMaterialCostPer100L;
  const formatCosts = getFormatCosts(product.format);
  const containerCost = formatCosts.container;
  const labelCost = formatCosts.label;
  const packagingCost = costs?.packaging_cost || 500;
  const factoryCost = rawMaterialCost + containerCost + packagingCost + labelCost;

  return {
    rawMaterialCost,
    containerCost,
    labelCost,
    packagingCost,
    factoryCost,
  };
};
