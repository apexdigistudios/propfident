/**
 * Propfident Centralized Drawdown Risk Engine
 *
 * Single source of truth for all derived account risk metrics. Every
 * dashboard surface (overview cards, header stats, drawdown shield,
 * lot calculator) derives its numbers from this helper so that any
 * change to balance/equity automatically propagates consistently.
 */

export type DrawdownType = "static" | "trailing" | "balance-based" | "balance_based";
export type RiskStatus = "SAFE" | "WARNING" | "CRITICAL" | "BREACHED";

export interface RiskMetricsInput {
  initial_balance: number;
  current_balance: number;
  current_equity: number;
  high_water_mark: number;
  max_total_drawdown_pct: number;
  max_daily_drawdown_pct: number;
  drawdown_type: DrawdownType;
  daily_starting_balance?: number;
}

export interface RiskMetrics {
  effectiveHWM: number;
  maxDrawdownFloor: number;
  dailyLossFloor: number;
  effectiveBreachFloor: number;
  totalBufferUsd: number;
  dailyBufferUsd: number;
  remainingBufferUsd: number;
  remainingBufferPct: number;
  /** Total buffer as % of initial balance */
  totalBufferPct: number;
  /** Daily buffer as % of the daily starting balance */
  dailyBufferPct: number;
  /** Floating PnL = equity - balance */
  floatingPnl: number;
  /** Approx. standard lots of adverse movement before breach at $10/pip */
  bufferInStandardLots: number;
  /** Approx. pips of adverse movement before breach at $10/pip */
  bufferInPips: number;
  /** Whether a trailing drawdown has locked at initial balance */
  trailingLocked: boolean;
  status: RiskStatus;
}

/** Standard USD value per pip for one standard lot. */
export const USD_PER_PIP_STANDARD_LOT = 10;

export function calculateAccountRiskMetrics(
  account: RiskMetricsInput
): RiskMetrics {
  const {
    initial_balance,
    current_balance,
    current_equity,
    high_water_mark,
    max_total_drawdown_pct,
    max_daily_drawdown_pct,
    drawdown_type,
    daily_starting_balance = initial_balance,
  } = account;

  // 1. Update High-Water Mark dynamically
  const effectiveHWM = Math.max(
    high_water_mark || initial_balance,
    current_equity,
    current_balance
  );

  // 2. Hard Total Floor Calculation
  let maxDrawdownFloor = 0;
  const isTrailing = drawdown_type === "trailing";
  const isBalanceBased =
    drawdown_type === "balance-based" || drawdown_type === "balance_based";

  if (isTrailing) {
    // Trailing locks at initial balance once the raw floor exceeds it
    const rawFloor = effectiveHWM * (1 - max_total_drawdown_pct / 100);
    maxDrawdownFloor = Math.min(rawFloor, initial_balance);
  } else if (isBalanceBased) {
    maxDrawdownFloor = current_balance * (1 - max_total_drawdown_pct / 100);
  } else {
    // Static
    maxDrawdownFloor = initial_balance * (1 - max_total_drawdown_pct / 100);
  }

  // 3. Daily Loss Floor Calculation
  const dailyBase = daily_starting_balance || initial_balance;
  const dailyLossFloor = dailyBase * (1 - max_daily_drawdown_pct / 100);

  // 4. Effective Breach Floor (whichever is stricter/higher)
  const effectiveBreachFloor = Math.max(maxDrawdownFloor, dailyLossFloor);

  // 5. Remaining Buffer / Headroom
  const totalBufferUsd = current_equity - maxDrawdownFloor;
  const dailyBufferUsd = current_equity - dailyLossFloor;
  const remainingBufferUsd = current_equity - effectiveBreachFloor;
  const remainingBufferPct =
    initial_balance > 0 ? (remainingBufferUsd / initial_balance) * 100 : 0;
  const totalBufferPct =
    initial_balance > 0 ? (totalBufferUsd / initial_balance) * 100 : 0;
  const dailyBufferPct = dailyBase > 0 ? (dailyBufferUsd / dailyBase) * 100 : 0;

  // 6. Risk Status Determination
  let status: RiskStatus = "SAFE";
  if (remainingBufferUsd <= 0) {
    status = "BREACHED";
  } else if (remainingBufferPct <= 1.5) {
    status = "CRITICAL";
  } else if (remainingBufferPct <= 3.5) {
    status = "WARNING";
  }

  // Derived exposure translations
  const bufferInPips =
    remainingBufferUsd > 0 ? remainingBufferUsd / USD_PER_PIP_STANDARD_LOT : 0;
  const bufferInStandardLots = bufferInPips / 100;

  return {
    effectiveHWM,
    maxDrawdownFloor,
    dailyLossFloor,
    effectiveBreachFloor,
    totalBufferUsd,
    dailyBufferUsd,
    remainingBufferUsd,
    remainingBufferPct,
    totalBufferPct,
    dailyBufferPct,
    floatingPnl: current_equity - current_balance,
    bufferInStandardLots,
    bufferInPips,
    trailingLocked:
      isTrailing && effectiveHWM * (1 - max_total_drawdown_pct / 100) >= initial_balance,
    status,
  };
}

/** Normalizes a raw Supabase `prop_accounts` row into engine input. */
export function accountRowToRiskInput(
  row: {
    initial_balance?: string | number | null;
    current_balance?: string | number | null;
    current_equity?: string | number | null;
    high_water_mark?: string | number | null;
    max_total_drawdown_pct?: string | number | null;
    max_daily_drawdown_pct?: string | number | null;
    drawdown_type?: string | null;
    daily_starting_balance?: string | number | null;
  } | null | undefined
): RiskMetricsInput {
  const num = (value: string | number | null | undefined, fallback = 0) => {
    const parsed = Number(value ?? fallback);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  // Defensive: a null/undefined row yields a fully-zeroed, safe input
  // rather than throwing on property access.
  const safe = row ?? {};
  const initial = num(safe.initial_balance);
  const equity = num(safe.current_equity ?? safe.initial_balance);
  const balance = num(safe.current_balance);

  return {
    initial_balance: initial,
    current_balance: balance,
    current_equity: equity,
    high_water_mark: num(safe.high_water_mark ?? equity ?? balance),
    max_total_drawdown_pct: num(safe.max_total_drawdown_pct, 10),
    max_daily_drawdown_pct: num(safe.max_daily_drawdown_pct, 5),
    drawdown_type: (safe.drawdown_type as DrawdownType) || "trailing",
    daily_starting_balance: safe.daily_starting_balance
      ? num(safe.daily_starting_balance)
      : undefined,
  };
}

/** Convenience: run the engine straight from a Supabase row. */
export function metricsFromAccountRow(
  row: Parameters<typeof accountRowToRiskInput>[0]
): RiskMetrics {
  return calculateAccountRiskMetrics(accountRowToRiskInput(row));
}

/** Shared status → Tailwind class map so all surfaces color consistently. */
export const STATUS_STYLES: Record<RiskStatus, string> = {
  SAFE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  WARNING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  CRITICAL: "border-red-500/30 bg-red-500/10 text-red-400",
  BREACHED: "animate-pulse border-rose-800 bg-rose-950 text-rose-400",
};

export const STATUS_BAR_COLORS: Record<RiskStatus, string> = {
  SAFE: "bg-emerald-500",
  WARNING: "bg-amber-500",
  CRITICAL: "bg-red-500",
  BREACHED: "bg-rose-600",
};

export const STATUS_ADVICE: Record<RiskStatus, string> = {
  SAFE: "Buffer is healthy. Maintain your current risk plan and avoid oversizing.",
  WARNING:
    "Buffer is tightening. Reduce position size and avoid adding correlated exposure.",
  CRITICAL:
    "Breach is imminent. Close or hedge open risk immediately and stop trading for the session.",
  BREACHED:
    "Account floor has been violated. Trading is halted — contact your prop firm for next steps.",
};

export const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
