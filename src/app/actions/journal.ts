"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateAccountRiskMetrics } from "@/lib/utils/drawdown";

export interface SaveJournalTradeInput {
  account_id?: string | null;
  symbol: string;
  action: string;
  open_price: number;
  close_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  volume: number;
  pnl?: number;
  status?: string;
  notes?: string;
  tags?: string[];
}

export interface SaveJournalTradeResult {
  success: boolean;
  trade?: unknown;
  error?: string;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const CLOSED_STATUSES = ["WIN", "LOSS", "BE", "CLOSED"];

function isClosedTrade(trade: {
  close_price?: number | null;
  status?: string | null;
}): boolean {
  return trade.close_price != null || CLOSED_STATUSES.includes(trade.status || "");
}

/**
 * Recomputes and persists the account's drawdown status using the
 * centralized risk engine (defense-in-depth in case the DB trigger is absent).
 */
async function syncAccountRiskStatus(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: accounts } = await supabase
    .from("mt5_accounts")
    .select("id, initial_balance, current_balance, current_equity, high_water_mark, max_total_drawdown_pct, max_daily_drawdown_pct, drawdown_type, daily_starting_balance")
    .eq("is_active", true);

  for (const account of accounts || []) {
    const num = (value: string | number | null | undefined, fallback = 0) => {
      const parsed = Number(value ?? fallback);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const risk = calculateAccountRiskMetrics({
      initial_balance: num(account.initial_balance),
      current_balance: num(account.current_balance),
      current_equity: num(account.current_equity),
      high_water_mark: num(account.high_water_mark),
      max_total_drawdown_pct: num(account.max_total_drawdown_pct, 10),
      max_daily_drawdown_pct: num(account.max_daily_drawdown_pct, 5),
      drawdown_type: account.drawdown_type || "trailing",
      daily_starting_balance: account.daily_starting_balance
        ? num(account.daily_starting_balance)
        : undefined,
    });

    await supabase
      .from("mt5_accounts")
      .update({
        drawdown_status: risk.status,
        is_breached: risk.status === "BREACHED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);
  }
}

function revalidateDashboardPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/journal");
  revalidatePath("/dashboard/prop-shield");
  revalidatePath("/dashboard/trade-assist");
}

export async function saveJournalTrade(
  data: SaveJournalTradeInput
): Promise<SaveJournalTradeResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    if (!data.symbol || !data.open_price || !data.volume) {
      return {
        success: false,
        error:
          "Missing required fields: Symbol, Open Price, or Lot Size (Volume).",
      };
    }

    const { data: trade, error } = await supabase
      .from("trades")
      .insert({
        user_id: user.id,
        account_id: data.account_id || null,
        symbol: data.symbol.toUpperCase(),
        action: data.action ? data.action.toUpperCase() : "BUY",
        open_price: Number(data.open_price),
        close_price: data.close_price ? Number(data.close_price) : null,
        stop_loss: data.stop_loss ? Number(data.stop_loss) : null,
        take_profit: data.take_profit ? Number(data.take_profit) : null,
        volume: Number(data.volume),
        pnl: data.pnl ? Number(data.pnl) : 0,
        status: data.status || "OPEN",
        notes: data.notes || "",
        tags: data.tags || [],
        open_time: new Date().toISOString(),
        close_time: data.close_price ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Trade Save Database Error:", error);
      return { success: false, error: error.message };
    }

    // ── Balance / Equity / HWM pipeline ────────────────────────────
    // A closed trade with P&L must flow into the linked prop account so
    // every risk metric recalculates downstream.
    const closed =
      data.close_price != null || CLOSED_STATUSES.includes(data.status || "");
    const pnl = Number(data.pnl || 0);

    if (data.account_id && closed) {
      const { data: account } = await supabase
        .from("mt5_accounts")
        .select("id, user_id, current_balance, current_equity, high_water_mark")
        .eq("id", data.account_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (account) {
        const newBalance = round2(
          Number(account.current_balance || 0) + pnl
        );
        const newEquity = round2(
          Number(account.current_equity || 0) + pnl
        );
        const newHwm = Math.max(
          Number(account.high_water_mark || 0),
          newEquity,
          newBalance
        );

        await supabase
          .from("mt5_accounts")
          .update({
            current_balance: newBalance,
            current_equity: newEquity,
            high_water_mark: newHwm,
            updated_at: new Date().toISOString(),
          })
          .eq("id", account.id);

        await syncAccountRiskStatus(supabase);
      }
    }

    revalidateDashboardPaths();
    return { success: true, trade };
  } catch (err) {
    console.error("Trade Save Server Action Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save trade entry.",
    };
  }
}

export async function deleteJournalTrade(
  tradeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    // 1. Fetch the trade (scoped to the owning user)
    const { data: trade, error: fetchError } = await supabase
      .from("trades")
      .select("id, account_id, pnl, status, close_price")
      .eq("id", tradeId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !trade) {
      return { success: false, error: "Trade not found." };
    }

    // 2. Delete the trade row
    const { error: deleteError } = await supabase
      .from("trades")
      .delete()
      .eq("id", tradeId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Trade Delete Error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // 3. Reverse financial impact for closed trades
    const closed = isClosedTrade(trade);
    const pnl = Number(trade.pnl || 0);

    if (trade.account_id && closed) {
      const { data: account, error: accountError } = await supabase
        .from("mt5_accounts")
        .select("id, user_id, initial_balance, current_balance, current_equity, high_water_mark")
        .eq("id", trade.account_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (account && !accountError) {
        // Subtract the deleted trade's P&L
        const newBalance = round2(
          Number(account.current_balance || 0) - pnl
        );
        const newEquity = round2(
          Number(account.current_equity || 0) - pnl
        );

        // Recalculate the High-Water Mark from the remaining closed trades
        const { data: remainingTrades } = await supabase
          .from("trades")
          .select("pnl, open_time, status, close_price")
          .eq("account_id", account.id)
          .eq("user_id", user.id)
          .order("open_time", { ascending: true });

        let replayBalance = Number(account.initial_balance || 0);
        let replayHwm = Math.max(replayBalance, newBalance);

        for (const t of remainingTrades || []) {
          if (!isClosedTrade(t)) continue;
          replayBalance = round2(replayBalance + Number(t.pnl || 0));
          if (replayBalance > replayHwm) replayHwm = replayBalance;
        }

        // HWM must never sit below the live balance
        const newHwm = Math.max(replayHwm, newBalance, newEquity);

        const { error: updateError } = await supabase
          .from("mt5_accounts")
          .update({
            current_balance: newBalance,
            current_equity: newEquity,
            high_water_mark: newHwm,
            updated_at: new Date().toISOString(),
          })
          .eq("id", account.id);

        if (updateError) {
          console.error("Account Reversal Update Error:", updateError);
        }

        // 4. Recalculate drawdown status from the fresh values
        await syncAccountRiskStatus(supabase);
      }
    }

    revalidateDashboardPaths();
    return { success: true };
  } catch (err) {
    console.error("Trade Delete Server Action Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete trade.",
    };
  }
}
