import firms from "@/config/firms-rules.json";
import type { NormalizedTrade } from "./parser";

export type DailyDrawdownType = "static" | "equity_balance_higher" | "end_of_day" | "trailing_unrealized";
export type TotalDrawdownType = "static" | "trailing_unrealized";
export type EvaluationStatus = "PASSED" | "HIGH_RISK" | "FAILED";

export interface FirmRules {
  maxDailyDrawdown: number;
  dailyDrawdownType: DailyDrawdownType;
  maxTotalDrawdown: number;
  totalDrawdownType: TotalDrawdownType;
  allowNewsTrading: boolean;
  newsWindowMinutes: number;
  allowWeekendHolding: boolean;
  minTradingDays: number;
  consistencyRule: string | boolean;
  consistencyThreshold: number;
  lotSizeCap: number | null;
}

export interface FirmDefinition {
  id: string;
  name: string;
  logoUrl: string;
  affiliateUrl: string;
  discountCode: string;
  discountPercentage: number;
  rules: FirmRules;
}

export interface NewsEvent {
  start: Date;
  end: Date;
}

export interface UserMetrics {
  userMaxDailyDD: number;
  userMaxTotalDD: number;
  weekendTradesCount: number;
  newsWindowOverlaps: number;
  maxTradeProfitRatio: number;
}

export interface FirmEvaluation extends UserMetrics {
  firm: FirmDefinition;
  matchPercentage: number;
  status: EvaluationStatus;
  breaches: string[];
}

export interface EvaluateOptions {
  startingBalance?: number;
  newsEvents?: NewsEvent[];
}

const WEIGHTS = { drawdown: 45, news: 20, weekend: 15, consistency: 20 };

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isWeekendHolding(trade: NormalizedTrade): boolean {
  for (let time = new Date(trade.openTime); time < trade.closeTime; time.setUTCDate(time.getUTCDate() + 1)) {
    const day = time.getUTCDay();
    if (day === 0 || day === 6) return true;
  }
  return false;
}

function calculateMetrics(
  trades: NormalizedTrade[],
  startingBalance: number,
  newsEvents: NewsEvent[],
  newsWindowMinutes: number
): UserMetrics {
  const ordered = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
  const dailyPnl = new Map<string, number>();
  let cumulativePnl = 0;
  let peak = 0;
  let maxTotalLoss = 0;

  for (const trade of ordered) {
    const key = dayKey(trade.closeTime);
    dailyPnl.set(key, (dailyPnl.get(key) ?? 0) + trade.pnl);
    cumulativePnl += trade.pnl;
    peak = Math.max(peak, cumulativePnl);
    maxTotalLoss = Math.max(maxTotalLoss, peak - cumulativePnl);
  }

  const maxDailyLoss = Math.max(0, ...Array.from(dailyPnl.values()).map((value) => -value));
  const profitablePnl = ordered.filter((trade) => trade.pnl > 0).reduce((sum, trade) => sum + trade.pnl, 0);
  const maxTradeProfit = Math.max(0, ...ordered.map((trade) => trade.pnl));
  const maxTradeProfitRatio = profitablePnl > 0 ? maxTradeProfit / profitablePnl : 0;
  const weekendTradesCount = ordered.filter(isWeekendHolding).length;
  const newsWindowOverlaps = ordered.filter((trade) => newsEvents.some((event) => {
    const windowPadding = newsWindowMinutes * 60 * 1000;
    const windowStart = new Date(event.start.getTime() - windowPadding);
    const windowEnd = new Date(event.end.getTime() + windowPadding);
    return trade.openTime < windowEnd && trade.closeTime > windowStart;
  })).length;

  return {
    userMaxDailyDD: startingBalance > 0 ? (maxDailyLoss / startingBalance) * 100 : 0,
    userMaxTotalDD: startingBalance > 0 ? (maxTotalLoss / startingBalance) * 100 : 0,
    weekendTradesCount,
    newsWindowOverlaps,
    maxTradeProfitRatio,
  };
}

export function evaluateFirm(firm: FirmDefinition, trades: NormalizedTrade[], options: EvaluateOptions = {}): FirmEvaluation {
  const startingBalance = options.startingBalance ?? 100000;
  const metrics = calculateMetrics(
    trades,
    startingBalance,
    options.newsEvents ?? [],
    firm.rules.newsWindowMinutes
  );
  const breaches: string[] = [];
  let ddWeight = 0;
  let newsWeight = 0;
  let weekendWeight = 0;
  let consistencyWeight = 0;

  if (metrics.userMaxDailyDD > firm.rules.maxDailyDrawdown) {
    breaches.push(`Maximum daily drawdown was ${metrics.userMaxDailyDD.toFixed(2)}%, above the ${firm.rules.maxDailyDrawdown}% limit.`);
    ddWeight += WEIGHTS.drawdown / 2;
  } else if (metrics.userMaxDailyDD > firm.rules.maxDailyDrawdown * 0.8) {
    breaches.push(`Daily drawdown reached ${metrics.userMaxDailyDD.toFixed(2)}%, near the ${firm.rules.maxDailyDrawdown}% limit.`);
    ddWeight += WEIGHTS.drawdown / 4;
  }

  if (metrics.userMaxTotalDD > firm.rules.maxTotalDrawdown) {
    breaches.push(`Maximum total drawdown was ${metrics.userMaxTotalDD.toFixed(2)}%, above the ${firm.rules.maxTotalDrawdown}% limit.`);
    ddWeight += WEIGHTS.drawdown / 2;
  } else if (metrics.userMaxTotalDD > firm.rules.maxTotalDrawdown * 0.8) {
    breaches.push(`Total drawdown reached ${metrics.userMaxTotalDD.toFixed(2)}%, near the ${firm.rules.maxTotalDrawdown}% limit.`);
    ddWeight += WEIGHTS.drawdown / 4;
  }

  if (!firm.rules.allowWeekendHolding && metrics.weekendTradesCount > 0) {
    breaches.push(`${metrics.weekendTradesCount} trade(s) were held across Saturday or Sunday UTC.`);
    weekendWeight = WEIGHTS.weekend;
  }

  if (!firm.rules.allowNewsTrading && metrics.newsWindowOverlaps > 0) {
    breaches.push(`${metrics.newsWindowOverlaps} trade(s) overlapped a restricted news window.`);
    newsWeight = WEIGHTS.news;
  }

  if (firm.rules.consistencyRule && metrics.maxTradeProfitRatio > firm.rules.consistencyThreshold / 100) {
    breaches.push(`One trade produced ${(metrics.maxTradeProfitRatio * 100).toFixed(1)}% of total profit, above the ${firm.rules.consistencyThreshold}% consistency threshold.`);
    consistencyWeight = WEIGHTS.consistency;
  }

    const lotSizeCapBreaches = !firm.rules.lotSizeCap
    ? []
      : trades.filter((trade) => trade.lots > firm.rules.lotSizeCap!);
  if (lotSizeCapBreaches.length > 0) {
      breaches.push(`${lotSizeCapBreaches.length} trade(s) exceeded the ${firm.rules.lotSizeCap} lot cap.`);
    ddWeight += WEIGHTS.drawdown / 4;
  }

  const matchPercentage = Math.max(0, Math.round(100 - ddWeight - newsWeight - weekendWeight - consistencyWeight));
  const status: EvaluationStatus = matchPercentage >= 80 ? "PASSED" : matchPercentage >= 50 ? "HIGH_RISK" : "FAILED";
  return { firm, matchPercentage, status, breaches, ...metrics };
}

export function evaluateAllFirms(trades: NormalizedTrade[], options: EvaluateOptions = {}): FirmEvaluation[] {
  return (firms as FirmDefinition[]).map((firm) => evaluateFirm(firm, trades, options)).sort((a, b) => b.matchPercentage - a.matchPercentage);
}
