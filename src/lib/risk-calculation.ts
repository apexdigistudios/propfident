/**
 * Risk Calculation Engine
 * Implements precise lot sizing and risk management formulas for Propfident
 */

export interface AssetConfig {
  id: string;
  label: string;
  stopLossPips: number;
  pipValuePerLot: number; // $ per pip per standard lot
}

export const ASSET_CONFIGS: Record<string, AssetConfig> = {
  "eur-usd": {
    id: "eur-usd",
    label: "EUR/USD",
    stopLossPips: 20,
    pipValuePerLot: 10, // $10 per pip per standard lot
  },
  "gbp-usd": {
    id: "gbp-usd",
    label: "GBP/USD",
    stopLossPips: 20,
    pipValuePerLot: 10,
  },
  "xau-usd": {
    id: "xau-usd",
    label: "XAU/USD",
    stopLossPips: 200,
    pipValuePerLot: 1, // $1 per pip per standard lot
  },
  "us30-nas100": {
    id: "us30-nas100",
    label: "US30 / NAS100",
    stopLossPips: 300,
    pipValuePerLot: 1,
  },
};

export interface RiskCalculation {
  balance: number;
  dailyMaxLossUSD: number;
  dailyMaxLossPct: number;
  maxDrawdownLimitUSD: number;
  maxDrawdownLimitPct: number;
  dollarRiskPerTrade: number;
  riskPerTradePct: number;
}

export interface LotSizingResult {
  assetId: string;
  assetLabel: string;
  stopLossPips: number;
  dollarRisk: number;
  pipValue: number;
  calculatedLots: number;
  roundedLots: number;
}

/**
 * Calculate dollar risk amounts based on balance and percentages
 */
export function calculateRisks(
  balance: number,
  dailyMaxLossPct: number,
  maxDrawdownLimitPct: number,
  riskPerTradePct: number
): RiskCalculation {
  const dailyMaxLossUSD = balance * (dailyMaxLossPct / 100);
  const maxDrawdownLimitUSD = balance * (maxDrawdownLimitPct / 100);
  const dollarRiskPerTrade = balance * (riskPerTradePct / 100);

  return {
    balance,
    dailyMaxLossUSD: Math.round(dailyMaxLossUSD * 100) / 100,
    dailyMaxLossPct,
    maxDrawdownLimitUSD: Math.round(maxDrawdownLimitUSD * 100) / 100,
    maxDrawdownLimitPct,
    dollarRiskPerTrade: Math.round(dollarRiskPerTrade * 100) / 100,
    riskPerTradePct,
  };
}

/**
 * Calculate lot size using the formula: Lot Size = Risk ($) / (SL Pips × Pip Value per Lot)
 * Rounds to 2 decimal places
 */
export function calculateLotSize(
  dollarRisk: number,
  assetId: string
): LotSizingResult {
  const asset = ASSET_CONFIGS[assetId];
  if (!asset) {
    throw new Error(`Unknown asset: ${assetId}`);
  }

  // Formula: Lot Size = Dollar Risk / (Stop Loss Pips × Pip Value per Standard Lot)
  const calculatedLots = dollarRisk / (asset.stopLossPips * asset.pipValuePerLot);
  
  // Round to 2 decimal places (minimum 0.01)
  const roundedLots = Math.max(0.01, Math.round(calculatedLots * 100) / 100);

  return {
    assetId: asset.id,
    assetLabel: asset.label,
    stopLossPips: asset.stopLossPips,
    dollarRisk: Math.round(dollarRisk * 100) / 100,
    pipValue: asset.pipValuePerLot,
    calculatedLots,
    roundedLots,
  };
}

/**
 * Calculate lot sizes for all major assets given a dollar risk amount
 */
export function calculateAllLotSizes(dollarRisk: number): LotSizingResult[] {
  return Object.keys(ASSET_CONFIGS).map((assetId) =>
    calculateLotSize(dollarRisk, assetId)
  );
}

/**
 * Get formatted currency string
 */
export function formatCurrency(value: number, decimals = 2): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Get formatted lot size string
 */
export function formatLots(value: number): string {
  return `${value.toFixed(2)} lots`;
}

/**
 * Get percentage formatted string
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}
