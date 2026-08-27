"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ManualAccountInput = {
  accountName: string;
  brokerName: string;
  accountType: "evaluation" | "funded";
  initialBalance: number;
  currentEquity: number;
  dailyLoss: number;
  dailyLossMode: "$" | "%";
  overallDrawdown: number;
  overallDrawdownMode: "$" | "%";
};

export async function saveManualAccount(input: ManualAccountInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required. Please log in again." };

  const initialBalance = Number(input.initialBalance);
  const currentEquity = Number(input.currentEquity);
  if (!input.accountName.trim() || !input.brokerName.trim() || initialBalance <= 0 || currentEquity < 0) {
    return { success: false, error: "Complete the account name, broker, balance, and equity fields." };
  }

  const dailyLossPct = input.dailyLossMode === "%"
    ? Number(input.dailyLoss)
    : (Number(input.dailyLoss) / initialBalance) * 100;
  const overallDrawdownPct = input.overallDrawdownMode === "%"
    ? Number(input.overallDrawdown)
    : (Number(input.overallDrawdown) / initialBalance) * 100;

  if (!Number.isFinite(dailyLossPct) || dailyLossPct <= 0 || !Number.isFinite(overallDrawdownPct) || overallDrawdownPct <= 0) {
    return { success: false, error: "Enter valid daily loss and overall drawdown limits." };
  }

  const { data: account, error } = await supabase
    .from("mt5_accounts")
    .insert({
      user_id: user.id,
      account_name: input.accountName.trim(),
      account_number: `MANUAL-${Date.now()}`,
      account_password: null,
      broker_name: input.brokerName.trim(),
      broker_server: null,
      platform: "MT5",
      connection_type: "manual",
      connection_status: "CONNECTED",
      account_type: input.accountType,
      account_currency: "USD",
      initial_balance: initialBalance,
      balance: currentEquity,
      equity: currentEquity,
      current_balance: currentEquity,
      current_equity: currentEquity,
      high_water_mark: Math.max(initialBalance, currentEquity),
      max_total_drawdown_pct: overallDrawdownPct,
      max_daily_drawdown_pct: dailyLossPct,
      daily_starting_balance: initialBalance,
      drawdown_type: "trailing",
      is_active: true,
      is_breached: false,
    })
    .select("id")
    .single();

  if (error || !account) return { success: false, error: error?.message || "Unable to save your manual account." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account-intel");
  revalidatePath("/dashboard/prop-shield");
  revalidatePath("/dashboard/trade-assist");
  return { success: true, accountId: account.id };
}