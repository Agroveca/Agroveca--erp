import { FixedCostsConfig, FormatCost, Product } from './supabase';
import { calculateNetFromGross } from './taxUtils';
import { getWholesaleFormatCosts } from './wholesaleHelpers';

export interface WholesaleDistributionProductCost {
  product: Product;
  rawMaterialCost: number;
  containerCost: number;
  packagingCost: number;
  labelCost: number;
  totalCost: number;
  pvpGross: number;
  pvpNet: number;
  pvpVAT: number;
  distributorPriceGross: number;
  distributorPriceNet: number;
  distributorVAT: number;
  ctpProfitNet: number;
}

export const calculateWholesaleDistributionProductCost = (
  product: Product,
  rawMaterialCostPer100L: number,
  formats: FormatCost[],
  costs: FixedCostsConfig | null,
  distributorDiscount: number,
): WholesaleDistributionProductCost => {
  const unitsPerBatch = product.units_per_batch || 1;
  const rawMaterialCost = unitsPerBatch > 0 ? rawMaterialCostPer100L / unitsPerBatch : rawMaterialCostPer100L;

  const formatCostData = getWholesaleFormatCosts(product, formats, costs);
  const containerCost = formatCostData.container;
  const labelCost = formatCostData.label;
  const packagingCost = costs?.packaging_cost || 500;

  const totalCost = rawMaterialCost + containerCost + packagingCost + labelCost;

  const pvpGross = product.base_price;
  const pvpBreakdown = calculateNetFromGross(pvpGross);

  const distributorPriceGross = pvpGross * (1 - distributorDiscount);
  const distributorBreakdown = calculateNetFromGross(distributorPriceGross);

  const ctpProfitNet = distributorBreakdown.net - totalCost;

  return {
    product,
    rawMaterialCost,
    containerCost,
    packagingCost,
    labelCost,
    totalCost,
    pvpGross,
    pvpNet: pvpBreakdown.net,
    pvpVAT: pvpBreakdown.vat,
    distributorPriceGross,
    distributorPriceNet: distributorBreakdown.net,
    distributorVAT: distributorBreakdown.vat,
    ctpProfitNet,
  };
};
