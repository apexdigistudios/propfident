import type { SupabaseClient as SupabaseJsClient } from "@supabase/supabase-js";
import { calculateAccountRiskMetrics } from "@/lib/utils/drawdown";
import type { MetaApiDeal } from "@/lib/metaapi";

/**
 * Shared Supabase account/trade sync helpers for the MetaApi pipeline.
 *
 * Both the initial-connect backfill and the live webhook use these so that
 * P&L is applied to an account exactly once per unique deal (idempotent).
 */

export type SupabaseClient = SupabaseJsClient;

const toNum = (value: unknown, fallback = 0): number => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? n : fallback;
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

export interface AccountRef {
  id: string;
  user_id: string;
}

export interface DealSyncResult {
  /** Realized P&L carried by the deal (0 for entry-only deals). */
  pnl: number;
  /** True when a new trade row was inserted (P&L should be applied). */
  isNew: boolean;
  /** True when the deal is a realized close (not just an entry). */
  realized: boolean;
}

/**
 * Inserts or updates a trade row from a MetaApi deal, keyed by deal_id.
 * Returns whether the row is new so callers can apply P&L exactly once.
 */
export async function upsertDealAsTrade(
  supabase: SupabaseClient,
  account: AccountRef,
  deal: MetaApiDeal
): Promise<DealSyncResult> {
  const dealId = String(
    deal.id ?? deal.positionId ?? deal.orderId ?? `deal_${Date.now()}`
  );
  const action = deal.type === "DEAL_TYPE_SELL" ? "SELL" : "BUY";
  const realized = deal.entryType !== "DEAL_ENTRY_IN";
  const pnl = toNum(deal.profit);
  const price = toNum(deal.price);
  const time = deal.time ?? new Date().toISOString();
  const status = realized
    ? pnl > 0
      ? "WIN"
      : pnl < 0
        ? "LOSS"
        : "BE"
    : "OPEN";

  const { data: existing } = await supabase
    .from("trades")
    .select("id")
    .eq("deal_id", dealId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("trades")
      .update({
        symbol: deal.symbol,
        action,
        volume: toNum(deal.volume),
        open_price: price,
        close_price: realized ? price : null,
        pnl: realized ? pnl : 0,
        status: realized ? status : "OPEN",
        close_time: realized ? time : null,
      })
      .eq("id", existing.id);

    return { pnl, isNew: false, realized };
  }

  const { error } = await supabase.from("trades").insert({
    user_id: account.user_id,
    account_id: account.id,
    deal_id: dealId,
    symbol: deal.symbol,
    action,
    open_price: price,
    close_price: realized ? price : null,
    volume: toNum(deal.volume),
    pnl: realized ? pnl : 0,
    status,
    open_time: time,
    close_time: realized ? time : null,
  });

  if (error) {
    // A unique-constraint race (concurrent insert of the same deal) is not fatal;
    // the row already exists so we treat it as not-new.
    if (error.code === "23505") {
      return { pnl, isNew: false, realized };
    }
    throw new Error(error.message);
  }

  return { pnl, isNew: true, realized };
}

/**
 * Applies a realized P&L to an account's balance/equity, advances the
 * high-water mark, and recalculates the Drawdown Shield status.
 */
export async function applyRealizedPnlToAccount(
  supabase: SupabaseClient,
  accountId: string,
  pnl: number
): Promise<void> {
  if (!pnl) return;

  const { data: acct } = await supabase
    .from("mt5_accounts")
    .select("*")
    .eq("id", accountId)
    .maybeSingle();

  if (!acct) return;

  const newBalance = round2(toNum(acct.current_balance) + pnl);
  const newEquity = round2(toNum(acct.current_equity) + pnl);
  const newHwm = round2(
    Math.max(toNum(acct.high_water_mark), newEquity, newBalance)
  );

  const risk = calculateAccountRiskMetrics({
    initial_balance: toNum(acct.initial_balance),
    current_balance: newBalance,
    current_equity: newEquity,
    high_water_mark: newHwm,
    max_total_drawdown_pct: toNum(acct.max_total_drawdown_pct, 10),
    max_daily_drawdown_pct: toNum(acct.max_daily_drawdown_pct, 5),
    drawdown_type: (acct.drawdown_type as
      | "trailing"
      | "static"
      | "balance-based"
      | "balance_based") || "trailing",
    daily_starting_balance: acct.daily_starting_balance
      ? toNum(acct.daily_starting_balance)
      : undefined,
  });

  await supabase
    .from("mt5_accounts")
    .update({
      current_balance: newBalance,
      current_equity: newEquity,
      high_water_mark: newHwm,
      drawdown_status: risk.status,
      is_breached: risk.status === "BREACHED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);
}
