import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { EquityChart } from "@/components/dashboard/equity-chart";
import { AccountSelector } from "@/components/dashboard/account-selector";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { RealtimeSync } from "@/components/dashboard/realtime-sync";
import { toNumber } from "@/components/dashboard/format";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";

export const dynamic = "force-dynamic";

type Profile = {
  subscription_tier: "free" | "pro" | "elite" | string | null;
};

type PropAccount = {
  id: string;
  user_id: string;
  account_name: string;
  platform: string;
  account_number: string;
  initial_balance: string | number | null;
  current_balance: string | number | null;
  current_equity: string | number | null;
  high_water_mark: string | number | null;
  max_total_drawdown_pct: string | number | null;
  max_daily_drawdown_pct: string | number | null;
  drawdown_type: string | null;
  daily_starting_balance: string | number | null;
  is_active: boolean | null;
};

type TradeSnapshot = {
  close_time?: string | null;
  created_at?: string | null;
  pnl?: string | number | null;
};

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ account?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single<Profile>();

  const isFreeTier = (profile?.subscription_tier || "free") === "free";

  const { data: accountsResult } = await supabase
    .from("mt5_accounts")
    .select(
      "id, user_id, account_name, platform, account_number, initial_balance, current_balance, current_equity, high_water_mark, max_total_drawdown_pct, max_daily_drawdown_pct, drawdown_type, daily_starting_balance, is_active"
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const accounts = (accountsResult || []) as PropAccount[];
  const activeAccount =
    accounts.find((account) => account.id === params.account) || accounts[0] || null;

  let tradesData: TradeSnapshot[] = [];

  if (activeAccount) {
    const { data: trades } = await supabase
      .from("trades")
      .select("close_time, pnl, created_at")
      .eq("account_id", activeAccount.id)
      .order("created_at", { ascending: true });

    tradesData = (trades || []) as TradeSnapshot[];
  }

  const totalPnl = tradesData.reduce((sum, trade) => sum + toNumber(trade.pnl), 0);
  const initialBalance = toNumber(activeAccount?.initial_balance ?? 0);
  const closedTradePnl = tradesData.reduce((sum, trade) => {
    const tradePnl = toNumber(trade.pnl);
    const isClosedTrade =
      (trade as { status?: string | null }).status === "CLOSED" ||
      (trade as { status?: string | null }).status === "WIN" ||
      (trade as { status?: string | null }).status === "LOSS" ||
      Boolean((trade as { close_time?: string | null }).close_time);
    return isClosedTrade ? sum + tradePnl : sum;
  }, 0);
  const openTradePnl = tradesData.reduce((sum, trade) => {
    const tradePnl = toNumber(trade.pnl);
    const isOpenTrade =
      (trade as { status?: string | null }).status === "OPEN" ||
      (!((trade as { close_time?: string | null }).close_time) && !((trade as { status?: string | null }).status));
    return isOpenTrade ? sum + tradePnl : sum;
  }, 0);
  const calculatedBalance = initialBalance + closedTradePnl;
  const calculatedEquity = calculatedBalance + openTradePnl;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-8 text-slate-100">
      <RealtimeSync userId={user.id} />
      <WelcomeBanner />
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400">
            Real-time prop firm metrics & equity analytics
          </p>
        </div>

        <AccountSelector
          accounts={accounts.map((account) => ({
            id: account.id,
            account_name: account.account_name,
            platform: account.platform,
            account_number: account.account_number,
          }))}
          isFreeTier={isFreeTier}
        />
      </div>

      {isFreeTier && !activeAccount && (
        <UpgradeBanner message="Free Plan: Account connection is locked. Upgrade to Pro or Elite to connect your MT4/MT5 accounts." />
      )}

      {isFreeTier && activeAccount && (
        <UpgradeBanner message="Manual tracking is active. Upgrade to Pro or Elite to unlock automated live MT5 sync and trade ingestion." />
      )}

      {!activeAccount && !isFreeTier && (
        <UpgradeBanner message="No active prop account is connected yet. Connect an MT4/MT5 account to unlock live equity analytics and drawdown monitoring." />
      )}

      <MetricsGrid
        account={activeAccount}
        totalPnl={totalPnl}
        derivedBalance={calculatedBalance}
        derivedEquity={calculatedEquity}
      />

      {activeAccount ? <div className="rounded-2xl border border-purple-500/20 bg-slate-900/80 p-4 sm:p-6 shadow-2xl shadow-black/30 backdrop-blur-md">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Equity Performance Curve
            </h2>
            <p className="text-xs text-slate-400">
              Real-time reactive equity snapshots calculated from closed trades
            </p>
          </div>
          <span className="w-fit rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 font-mono text-xs text-purple-300">
            {activeAccount
              ? `${activeAccount.platform} • ${activeAccount.account_number}`
              : "No Account Connected"}
          </span>
        </div>

        <EquityChart
          initialBalance={activeAccount?.initial_balance || 0}
          trades={tradesData}
        />
      </div> : <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center shadow-xl shadow-black/20">
        <h2 className="text-lg font-semibold text-slate-200">Performance curve unavailable</h2>
        <p className="mt-2 text-sm text-slate-400">Connect your MT5 account to view live performance &amp; equity curve.</p>
      </div>}
    </div>
  );
}
