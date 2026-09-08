import firmModels from "@/data/firmRules.json";
import type { PropFirmModel } from "@/types/firm";
import type { NormalizedTrade } from "./parser";

export type EvaluationStatus = "PASSED" | "HIGH_RISK" | "FAILED";
export type DailyDrawdownType = "static" | "equity_balance_higher" | "end_of_day" | "trailing_unrealized";
export type TotalDrawdownType = "static" | "trailing_unrealized";

export interface FirmRules {
  maxDailyDrawdown: number | null;
  dailyDrawdownType: DailyDrawdownType;
  maxTotalDrawdown: number;
  totalDrawdownType: TotalDrawdownType;
  allowNewsTrading: boolean;
  newsWindowMinutes: number;
  allowWeekendHolding: boolean;
  minTradingDays: number;
  consistencyRule: boolean;
  consistencyThreshold?: number;
  lotSizeCap: number | null;
}

export interface FirmDefinition {
  id: string;
  name: string;
  logo: string;
  logoUrl: string;
  affiliateUrl: string;
  discountCode: string;
  discountPercentage: number;
  rules: FirmRules;
}

export interface UserMetrics {
  userMaxDailyDD: number;
  userMaxTotalDD: number;
  weekendTradesCount: number;
  newsWindowOverlaps: number;
  maxTradeProfitRatio: number;
  overnightTradesCount: number;
  missingStopLossCount: number;
  lotStressCount: number;
}

export interface FirmEvaluation extends UserMetrics {
  firm: FirmDefinition;
  model: PropFirmModel;
  matchPercentage: number;
  status: EvaluationStatus;
  breaches: string[];
  maxDrawdownPass: boolean;
  dailyDrawdownPass: boolean;
  drawdownStrictness: "static" | "trailing" | "other";
}

export interface NewsEvent { start: Date; end: Date; }
export interface EvaluateOptions { startingBalance?: number; newsEvents?: NewsEvent[]; }

const affiliateById: Record<string, string> = {
  ftmo: "https://ftmo.com/?ref=PROPFIDENT",
  topstep: "https://topstep.com/ref/PROPFIDENT",
  the5ers: "https://the5ers.com/ref/PROPFIDENT",
  alphacapital: "https://alphacapitalgroup.uk/?ref=PROPFIDENT",
  fundednext: "https://fundednext.com/?ref=PROPFIDENT",
  aquafunded: "https://aquafunded.com/?ref=PROPFIDENT",
  goatfundedtrader: "https://goatfundedtrader.com/ref/PROPFIDENT",
};

const logoById: Record<string, string> = {
  ftmo: "/logos/ftmo-logo.png",
  topstep: "/logos/topstep-logo.png",
  the5ers: "/logos/5ers-Logo.png",
  alphacapital: "/logos/Alpha-Capital-prop-firm-logo.webp",
  fundednext: "/logos/fundednext-logo.webp",
  aquafunded: "/logos/aqua-funded-logo.webp",
  goatfundedtrader: "/logos/Goat-Funded-Trader-logo.jpg",
};

function firmId(name: string) {
  return name.toLowerCase().replace(/the 5%ers/g, "the5ers").replace(/[^a-z0-9]+/g, "").replace(/^the5ers$/, "the5ers");
}

function isWeekendHolding(trade: NormalizedTrade) {
  for (let time = new Date(trade.openTime); time < trade.closeTime; time.setUTCDate(time.getUTCDate() + 1)) {
    if (time.getUTCDay() === 0 || time.getUTCDay() === 6) return true;
  }
  return false;
}

function isOvernight(trade: NormalizedTrade) {
  return trade.openTime.toISOString().slice(0, 10) !== trade.closeTime.toISOString().slice(0, 10);
}

function calculateMetrics(trades: NormalizedTrade[], startingBalance: number): UserMetrics {
  const ordered = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
  const dailyPnl = new Map<string, number>();
  let cumulative = 0;
  let peak = 0;
  let maxLoss = 0;
  for (const trade of ordered) {
    const key = trade.closeTime.toISOString().slice(0, 10);
    dailyPnl.set(key, (dailyPnl.get(key) ?? 0) + trade.pnl);
    cumulative += trade.pnl;
    peak = Math.max(peak, cumulative);
    maxLoss = Math.max(maxLoss, peak - cumulative);
  }
  const maxDailyLoss = Math.max(0, ...Array.from(dailyPnl.values()).map((value) => -value));
  const profits = ordered.filter((trade) => trade.pnl > 0).reduce((sum, trade) => sum + trade.pnl, 0);
  return {
    userMaxDailyDD: startingBalance > 0 ? (maxDailyLoss / startingBalance) * 100 : 0,
    userMaxTotalDD: startingBalance > 0 ? (maxLoss / startingBalance) * 100 : 0,
    weekendTradesCount: ordered.filter(isWeekendHolding).length,
    newsWindowOverlaps: 0,
    maxTradeProfitRatio: profits > 0 ? Math.max(0, ...ordered.map((trade) => trade.pnl)) / profits : 0,
    overnightTradesCount: ordered.filter(isOvernight).length,
    missingStopLossCount: ordered.filter((trade) => !trade.stopLoss || trade.stopLoss <= 0).length,
    lotStressCount: ordered.filter((trade) => trade.lots >= 5).length,
  };
}

function toDefinition(model: PropFirmModel): FirmDefinition {
  const id = firmId(model.firm_name);
  const dailyType = model.rules.daily_drawdown_type.includes("trailing") || model.rules.daily_drawdown_type.includes("eod") ? "end_of_day" : "equity_balance_higher";
  const totalType = model.rules.max_drawdown_type.includes("trailing") ? "trailing_unrealized" : "static";
  const weekendAllowed = model.rules.weekend_holding === true || typeof model.rules.weekend_holding === "string";
  const newsAllowed = model.rules.news_trading === true || typeof model.rules.news_trading === "string";
  return {
    id,
    name: model.firm_name,
    logo: logoById[id] ?? "/propfidentlogo.png",
    logoUrl: logoById[id] ?? "/propfidentlogo.png",
    affiliateUrl: affiliateById[id] ?? "#",
    discountCode: "PROPFIDENT",
    discountPercentage: id === "topstep" ? 20 : id === "the5ers" || id === "goatfundedtrader" ? 10 : 5,
    rules: {
      maxDailyDrawdown: model.rules.daily_drawdown_percent,
      dailyDrawdownType: dailyType,
      maxTotalDrawdown: model.rules.max_drawdown_percent,
      totalDrawdownType: totalType,
      allowNewsTrading: newsAllowed,
      newsWindowMinutes: 0,
      allowWeekendHolding: weekendAllowed,
      minTradingDays: typeof model.rules.min_trading_days_p1 === "number" ? model.rules.min_trading_days_p1 : 0,
      consistencyRule: model.rules.copy_trading.includes("prohibited"),
      lotSizeCap: null,
    },
  };
}

export function evaluateFirm(model: PropFirmModel, trades: NormalizedTrade[], options: EvaluateOptions = {}): FirmEvaluation {
  const metrics = calculateMetrics(trades, options.startingBalance ?? model.account_size);
  const definition = toDefinition(model);
  const maxDrawdownPass = metrics.userMaxTotalDD <= model.rules.max_drawdown_percent;
  const dailyDrawdownPass = model.rules.daily_drawdown_percent === null || metrics.userMaxDailyDD <= model.rules.daily_drawdown_percent;
  const breaches: string[] = [];
  if (!maxDrawdownPass) breaches.push(`Max drawdown breach: ${metrics.userMaxTotalDD.toFixed(1)}% vs ${model.rules.max_drawdown_percent}% limit.`);
  if (!dailyDrawdownPass) breaches.push(`Daily drawdown breach: ${metrics.userMaxDailyDD.toFixed(1)}% vs ${model.rules.daily_drawdown_percent}% limit.`);
  if (!definition.rules.allowWeekendHolding && metrics.weekendTradesCount > 0) breaches.push(`Weekend holding is not allowed for ${model.account_model}.`);
  const weekendPass = definition.rules.allowWeekendHolding || metrics.weekendTradesCount === 0;
  const matchPercentage = maxDrawdownPass && dailyDrawdownPass && weekendPass ? 100 : Math.max(0, 100 - breaches.length * 30);
  const drawdownStrictness = model.rules.max_drawdown_type.includes("static") ? "static" : model.rules.max_drawdown_type.includes("trailing") ? "trailing" : "other";
  return { ...metrics, firm: definition, model, maxDrawdownPass, dailyDrawdownPass, drawdownStrictness, matchPercentage, status: matchPercentage >= 80 ? "PASSED" : matchPercentage >= 50 ? "HIGH_RISK" : "FAILED", breaches };
}

export function evaluateAllFirms(trades: NormalizedTrade[], options: EvaluateOptions = {}) {
  return (firmModels as PropFirmModel[]).map((model) => evaluateFirm(model, trades, options)).sort((a, b) => b.matchPercentage - a.matchPercentage);
}

export function bestModelPerFirm(results: FirmEvaluation[]) {
  const best = new Map<string, FirmEvaluation>();
  for (const result of results.filter((item) => item.status === "PASSED")) {
    const current = best.get(result.firm.id);
    if (!current || result.model.rules.profit_split_percent > current.model.rules.profit_split_percent || (result.model.rules.profit_split_percent === current.model.rules.profit_split_percent && (result.model.rules.profit_target_p1_percent ?? 0) < (current.model.rules.profit_target_p1_percent ?? 0))) best.set(result.firm.id, result);
  }
  return [...best.values()];
}
