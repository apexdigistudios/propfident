import { PROP_FIRMS, type PropFirmProfile } from "@/config/firms";
import type { NormalizedTrade } from "./parser";

export type DailyDrawdownType = "static" | "equity_balance_higher" | "end_of_day" | "trailing_unrealized";
export type TotalDrawdownType = "static" | "trailing_unrealized";
export type EvaluationStatus = "PASSED" | "HIGH_RISK" | "FAILED";
export interface FirmRules { maxDailyDrawdown: number; dailyDrawdownType: DailyDrawdownType; maxTotalDrawdown: number; totalDrawdownType: TotalDrawdownType; allowNewsTrading: boolean; newsWindowMinutes: number; allowWeekendHolding: boolean; minTradingDays: number; consistencyRule: string | boolean; consistencyThreshold?: number; lotSizeCap: number | null; }
export interface FirmDefinition { id: string; name: string; logo: string; logoUrl: string; affiliateUrl: string; discountCode: string; discountPercentage: number; rules: FirmRules; }
export interface NewsEvent { start: Date; end: Date; }
export interface UserMetrics { userMaxDailyDD: number; userMaxTotalDD: number; weekendTradesCount: number; newsWindowOverlaps: number; maxTradeProfitRatio: number; overnightTradesCount: number; missingStopLossCount: number; lotStressCount: number; }
export interface FirmEvaluation extends UserMetrics { firm: FirmDefinition; matchPercentage: number; status: EvaluationStatus; breaches: string[]; }
export interface EvaluateOptions { startingBalance?: number; newsEvents?: NewsEvent[]; }

const affiliateById: Record<string, string> = {
  ftmo: "https://ftmo.com/?ref=PROPFIDENT",
  topstep: "https://topstep.com/ref/PROPFIDENT",
  the5ers: "https://the5ers.com/ref/PROPFIDENT",
  alphacapital: "https://alphacapitalgroup.uk/?ref=PROPFIDENT",
  fundednext: "https://fundednext.com/?ref=PROPFIDENT",
  aquafunded: "https://aquafunded.com/?ref=PROPFIDENT",
  goatfunded: "https://goatfundedtrader.com/ref/PROPFIDENT",
};
function toFirmDefinition(profile: PropFirmProfile): FirmDefinition {
  return { ...profile, logoUrl: profile.logo, affiliateUrl: affiliateById[profile.id], discountCode: profile.id === "topstep" ? "PROPFIDENT20" : "PROPFIDENT", discountPercentage: profile.id === "topstep" ? 20 : profile.id === "the5ers" || profile.id === "goatfunded" ? 10 : 5, rules: { maxDailyDrawdown: profile.dailyDrawdown, dailyDrawdownType: profile.id === "topstep" ? "end_of_day" : "equity_balance_higher", maxTotalDrawdown: profile.maxDrawdown, totalDrawdownType: profile.id === "topstep" ? "trailing_unrealized" : "static", allowNewsTrading: profile.id !== "ftmo", newsWindowMinutes: profile.id === "ftmo" ? 2 : 0, allowWeekendHolding: profile.weekendHolding, minTradingDays: profile.id === "ftmo" ? 4 : profile.id === "topstep" ? 5 : 0, consistencyRule: Boolean(profile.consistencyLimit), consistencyThreshold: profile.consistencyLimit, lotSizeCap: profile.lotSizeCap ?? null } };
}
function isWeekendHolding(trade: NormalizedTrade) { for (let time = new Date(trade.openTime); time < trade.closeTime; time.setUTCDate(time.getUTCDate() + 1)) if (time.getUTCDay() === 0 || time.getUTCDay() === 6) return true; return false; }
function isOvernight(trade: NormalizedTrade) { return trade.openTime.toISOString().slice(0, 10) !== trade.closeTime.toISOString().slice(0, 10); }
function calculateMetrics(trades: NormalizedTrade[], startingBalance: number, newsEvents: NewsEvent[], newsWindowMinutes: number): UserMetrics {
  const ordered = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime()); const dailyPnl = new Map<string, number>(); let cumulative = 0; let peak = 0; let maxLoss = 0;
  for (const trade of ordered) { const key = trade.closeTime.toISOString().slice(0, 10); dailyPnl.set(key, (dailyPnl.get(key) ?? 0) + trade.pnl); cumulative += trade.pnl; peak = Math.max(peak, cumulative); maxLoss = Math.max(maxLoss, peak - cumulative); }
  const maxDailyLoss = Math.max(0, ...Array.from(dailyPnl.values()).map((value) => -value)); const profits = ordered.filter((trade) => trade.pnl > 0).reduce((sum, trade) => sum + trade.pnl, 0);
  const newsWindowOverlaps = ordered.filter((trade) => newsEvents.some((event) => trade.openTime < new Date(event.end.getTime() + newsWindowMinutes * 60000) && trade.closeTime > new Date(event.start.getTime() - newsWindowMinutes * 60000))).length;
  return { userMaxDailyDD: startingBalance > 0 ? maxDailyLoss / startingBalance * 100 : 0, userMaxTotalDD: startingBalance > 0 ? maxLoss / startingBalance * 100 : 0, weekendTradesCount: ordered.filter(isWeekendHolding).length, newsWindowOverlaps, maxTradeProfitRatio: profits > 0 ? Math.max(0, ...ordered.map((trade) => trade.pnl)) / profits : 0, overnightTradesCount: ordered.filter(isOvernight).length, missingStopLossCount: ordered.filter((trade) => !trade.stopLoss || trade.stopLoss <= 0).length, lotStressCount: ordered.filter((trade) => trade.lots >= 5).length };
}
export function evaluateFirm(firm: FirmDefinition, trades: NormalizedTrade[], options: EvaluateOptions = {}): FirmEvaluation {
  const metrics = calculateMetrics(trades, options.startingBalance ?? 100000, options.newsEvents ?? [], firm.rules.newsWindowMinutes); const breaches: string[] = []; let penalty = 0; const dailyLimit = firm.rules.maxDailyDrawdown * 100; const totalLimit = firm.rules.maxTotalDrawdown * 100;
  if (metrics.userMaxDailyDD > dailyLimit) { breaches.push(`Daily DD breach: ${metrics.userMaxDailyDD.toFixed(1)}% vs ${dailyLimit.toFixed(1)}% limit.`); penalty += 30; } else if (metrics.userMaxDailyDD > dailyLimit * 0.8) { breaches.push(`Daily DD warning: ${metrics.userMaxDailyDD.toFixed(1)}% of ${dailyLimit.toFixed(1)}% limit.`); penalty += 10; }
  if (metrics.userMaxTotalDD > totalLimit) { breaches.push(`Max DD breach: ${metrics.userMaxTotalDD.toFixed(1)}% vs ${totalLimit.toFixed(1)}% limit.`); penalty += 30; } else if (metrics.userMaxTotalDD > totalLimit * 0.8) { breaches.push(`Max DD warning: ${metrics.userMaxTotalDD.toFixed(1)}% of ${totalLimit.toFixed(1)}% limit.`); penalty += 10; }
  if (!firm.rules.allowWeekendHolding && metrics.weekendTradesCount > 0) { breaches.push(`Weekend holding: ${metrics.weekendTradesCount} trade(s) crossed Saturday or Sunday UTC.`); penalty += 15; }
  if (firm.id === "ftmo" && metrics.newsWindowOverlaps > 0) { breaches.push(`FTMO Standard news risk: ${metrics.newsWindowOverlaps} trade(s) overlapped the high-impact news window.`); penalty += 15; }
  if (firm.id === "topstep" && metrics.overnightTradesCount > 0) { breaches.push(`Topstep overnight hold: ${metrics.overnightTradesCount} trade(s) crossed a session boundary.`); penalty += 15; }
  if (firm.id === "the5ers" && metrics.missingStopLossCount > 0) { breaches.push(`Stop-loss breach: ${metrics.missingStopLossCount} trade(s) have no explicit stop-loss.`); penalty += 25; }
  if (firm.id === "goatfunded" && metrics.lotStressCount > 0) { breaches.push(`Lot-size stress: ${metrics.lotStressCount} trade(s) used 5 or more lots.`); penalty += 15; }
  if (firm.rules.lotSizeCap !== null) { const overCap = trades.filter((trade) => trade.lots > firm.rules.lotSizeCap!).length; if (overCap > 0) { breaches.push(`Lot cap breach: ${overCap} trade(s) exceeded ${firm.rules.lotSizeCap} lots.`); penalty += 20; } }
  const matchPercentage = Math.max(0, Math.min(100, Math.round(100 - penalty))); return { firm, matchPercentage, status: matchPercentage >= 80 ? "PASSED" : matchPercentage >= 50 ? "HIGH_RISK" : "FAILED", breaches, ...metrics };
}
export function evaluateAllFirms(trades: NormalizedTrade[], options: EvaluateOptions = {}) { return PROP_FIRMS.map((profile) => evaluateFirm(toFirmDefinition(profile), trades, options)).sort((a, b) => b.matchPercentage - a.matchPercentage); }
