/**
 * Propfident Drawdown Risk Engine
 *
 * Calculates whether a prop firm account is approaching its breach
 * threshold based on drawdown rules configured by the trader.
 */

export interface AccountMetrics {
  initialBalance: number;
  currentBalance: number;
  currentEquity: number;
  highWaterMark: number;
  maxTotalDrawdownPct: number; // e.g., 10
  maxDailyDrawdownPct: number; // e.g., 5
  drawdownType: "static" | "trailing" | "balance_based";
}

export type DrawdownStatus = "SAFE" | "WARNING" | "CRITICAL" | "BREACHED";

export interface DrawdownResult {
  /** Minimum allowed equity before total drawdown breach */
  totalDrawdownFloor: number;
  /** Minimum allowed equity before daily drawdown breach */
  dailyDrawdownFloor: number;
  /** Dollar headroom remaining above total drawdown floor */
  headroomUSD: number;
  /** Headroom as percentage of initial balance */
  headroomPct: number;
  /** Daily drawdown headroom in USD */
  dailyHeadroomUSD: number;
  /** Daily drawdown headroom as percentage */
  dailyHeadroomPct: number;
  /** Current drawdown status level */
  status: DrawdownStatus;
  /** Whether the account has already breached */
  isBreached: boolean;
  /** Whether the daily drawdown has been breached */
  isDailyBreached: boolean;
}

/**
 * Core drawdown status calculation for a prop firm account.
 *
 * Supports static, trailing, and balance-based drawdown types.
 * Returns a full breakdown of floors, headroom, and status levels.
 */
export function calculateDrawdownStatus(
  metrics: AccountMetrics
): DrawdownResult {
  const {
    initialBalance,
    currentEquity,
    highWaterMark,
    maxTotalDrawdownPct,
    maxDailyDrawdownPct,
    drawdownType,
  } = metrics;

  // ── 1. Total Drawdown Floor ──────────────────────────────────────
  let totalDrawdownFloor = 0;

  if (drawdownType === "static") {
    // Static Drawdown is fixed relative to Initial Balance
    totalDrawdownFloor = initialBalance * (1 - maxTotalDrawdownPct / 100);
  } else if (drawdownType === "trailing") {
    // Trailing Drawdown moves up with High Water Mark
    totalDrawdownFloor =
      highWaterMark * (1 - maxTotalDrawdownPct / 100);
  } else if (drawdownType === "balance_based") {
    // Balance-based: uses current balance as anchor
    totalDrawdownFloor =
      (highWaterMark || initialBalance) *
      (1 - maxTotalDrawdownPct / 100);
  }

  // ── 2. Daily Drawdown Floor ──────────────────────────────────────
  // Daily drawdown is always calculated from today's opening balance
  // which in our model is approximated as current_balance at session start.
  // For simplicity, we use highWaterMark minus the daily % limit.
  const dailyDrawdownFloor =
    highWaterMark * (1 - maxDailyDrawdownPct / 100);

  // ── 3. Headroom Calculations ─────────────────────────────────────
  const headroomUSD = currentEquity - totalDrawdownFloor;
  const headroomPct =
    initialBalance > 0 ? (headroomUSD / initialBalance) * 100 : 0;

  const dailyHeadroomUSD = currentEquity - dailyDrawdownFloor;
  const dailyHeadroomPct =
    initialBalance > 0 ? (dailyHeadroomUSD / initialBalance) * 100 : 0;

  // ── 4. Status Determination ──────────────────────────────────────
  let status: DrawdownStatus = "SAFE";
  let isBreached = false;
  let isDailyBreached = false;

  // Total drawdown breach check
  if (currentEquity <= totalDrawdownFloor) {
    status = "BREACHED";
    isBreached = true;
  } else if (headroomPct <= 1.5) {
    status = "CRITICAL";
  } else if (headroomPct <= 3.5) {
    status = "WARNING";
  }

  // Daily drawdown breach check (overrides if more severe)
  if (currentEquity <= dailyDrawdownFloor) {
    isDailyBreached = true;
    if (status !== "BREACHED") {
      status = "CRITICAL";
    }
  } else if (dailyHeadroomPct <= 1.0) {
    if (status === "SAFE") {
      status = "WARNING";
    }
  }

  return {
    totalDrawdownFloor,
    dailyDrawdownFloor,
    headroomUSD,
    headroomPct,
    dailyHeadroomUSD,
    dailyHeadroomPct,
    status,
    isBreached,
    isDailyBreached,
  };
}

/**
 * Utility: converts a Supabase prop_accounts row to AccountMetrics.
 */
export function rowToMetrics(row: {
  initial_balance: string | number | null;
  current_balance: string | number | null;
  current_equity: string | number | null;
  high_water_mark: string | number | null;
  max_total_drawdown_pct: string | number | null;
  max_daily_drawdown_pct: string | number | null;
  drawdown_type: string | null;
}): AccountMetrics {
  return {
    initialBalance: Number(row.initial_balance) || 0,
    currentBalance: Number(row.current_balance) || 0,
    currentEquity: Number(row.current_equity) || 0,
    highWaterMark: Number(row.high_water_mark) || 0,
    maxTotalDrawdownPct: Number(row.max_total_drawdown_pct) || 10,
    maxDailyDrawdownPct: Number(row.max_daily_drawdown_pct) || 5,
    drawdownType: (row.drawdown_type as AccountMetrics["drawdownType"]) || "trailing",
  };
}
