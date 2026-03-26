export interface ProductMarginLike {
  product: {
    id: string;
    name: string;
  };
  netMarginNet: number;
  netProfitNet: number;
}

export interface DashboardMarginSummary<T extends ProductMarginLike> {
  averageMargin: number;
  topProducts: T[];
  bottomProducts: T[];
}

export const getDashboardMarginSummary = <T extends ProductMarginLike>(
  products: T[],
): DashboardMarginSummary<T> => {
  const averageMargin = products.length > 0
    ? products.reduce((sum, product) => sum + product.netMarginNet, 0) / products.length
    : 0;

  const topProducts = [...products]
    .sort((a, b) => b.netMarginNet - a.netMarginNet)
    .slice(0, 3);

  const bottomProducts = [...products]
    .sort((a, b) => a.netMarginNet - b.netMarginNet)
    .slice(0, 3);

  return {
    averageMargin,
    topProducts,
    bottomProducts,
  };
};
