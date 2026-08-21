import Link from "next/link";
import { redirect } from "next/navigation";
import { Calculator } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { LotCalculatorEngine } from "@/components/dashboard/lot-calculator-engine";
import { RealtimeSync } from "@/components/dashboard/realtime-sync";
import { metricsFromAccountRow } from "@/lib/utils/drawdown";

export const dynamic = "force-dynamic";

function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function LotCalculatorPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: accounts, error } = await supabase
    .from("mt5_accounts")
    .select(
      "id, account_name, platform, account_number, current_balance, current_equity, high_water_mark, initial_balance, max_total_drawdown_pct, max_daily_drawdown_pct, drawdown_type, daily_starting_balance"
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-6 text-sm text-rose-300">
        Unable to load account data: {error.message}
      </div>
    );
  }

  const liveAccounts = (accounts || []).map((account) => {
    // Headroom derives from the centralized risk engine so the calculator's
    // safety check matches the Drawdown Shield exactly.
    const risk = metricsFromAccountRow(account);

    return {
      id: account.id,
      accountName: account.account_name,
      platform: account.platform,
      accountNumber: account.account_number,
      balance: toNumber(account.current_balance),
      equity: toNumber(account.current_equity),
      highWaterMark: risk.effectiveHWM,
      initialBalance: toNumber(account.initial_balance),
      maxTotalDrawdownPct: toNumber(account.max_total_drawdown_pct),
      maxDailyDrawdownPct: toNumber(account.max_daily_drawdown_pct),
      drawdownType: account.drawdown_type,
      headroom: Math.max(0, risk.remainingBufferUsd),
    };
  });

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6">
      <RealtimeSync userId={user.id} />
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-white">Advanced Position Sizing Engine</h1>
        <p className="text-sm text-slate-400">
          Pull live equity & drawdown headroom from your connected accounts, or size custom capital.
        </p>
      </div>

      {liveAccounts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Calculator className="mx-auto h-12 w-12 text-slate-600" />
          <h2 className="mt-4 text-lg font-bold text-slate-300">No connected accounts</h2>
          <p className="mt-2 text-sm text-slate-500">
            Connect a prop account to auto-fill equity and drawdown headroom, or size custom capital manually.
          </p>
          <Link
            href="/dashboard/account-intel/connect"
            className="mt-6 inline-flex rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-2.5 text-sm font-bold text-purple-200 transition hover:bg-purple-500/20"
          >
            Connect Account
          </Link>
        </div>
      ) : (
        <LotCalculatorEngine accounts={liveAccounts} />
      )}
    </div>
  );
}
