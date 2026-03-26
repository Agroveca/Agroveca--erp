import { describe, expect, it } from 'vitest';

import {
  IVA_RATE,
  calculateGrossFromNet,
  calculateMarginOnNet,
  calculateNetFromGross,
  calculateNetProfit,
  formatVATPercentage,
} from './taxUtils';

describe('taxUtils', () => {
  it('calculates net and vat from gross', () => {
    const breakdown = calculateNetFromGross(1190);

    expect(breakdown.gross).toBe(1190);
    expect(breakdown.net).toBeCloseTo(1000, 5);
    expect(breakdown.vat).toBeCloseTo(190, 5);
  });

  it('calculates gross and vat from net', () => {
    const breakdown = calculateGrossFromNet(1000);

    expect(breakdown.net).toBe(1000);
    expect(breakdown.gross).toBeCloseTo(1190, 5);
    expect(breakdown.vat).toBeCloseTo(190, 5);
  });

  it('formats VAT percentage from the shared IVA rate', () => {
    expect(IVA_RATE).toBe(0.19);
    expect(formatVATPercentage()).toBe('19%');
  });

  it('calculates net margin on revenue', () => {
    expect(calculateMarginOnNet(1000, 600)).toBeCloseTo(40, 5);
    expect(calculateMarginOnNet(0, 600)).toBe(0);
  });

  it('calculates net profit from revenue and costs', () => {
    expect(calculateNetProfit(1000, 600)).toBe(400);
    expect(calculateNetProfit(600, 1000)).toBe(-400);
  });
});
