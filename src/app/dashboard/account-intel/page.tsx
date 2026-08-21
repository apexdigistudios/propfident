"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Trash2, ExternalLink, Server, CheckCircle, AlertCircle } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { disconnectMetaApiAccount } from "@/app/actions/metaapi";
import { Gauge, ShieldAlert, ShieldCheck, TrendingUp, Waves } from "lucide-react";
import { metricsFromAccountRow, STATUS_STYLES, type RiskMetrics } from "@/lib/utils/drawdown";

interface PropAccount {
  id: string;
  account_name: string;
  broker_name?: string | null;
  platform: string;
  account_number: string;
  current_balance: string;
  current_equity: string;
  initial_balance?: string | number | null;
  high_water_mark?: string | number | null;
  max_total_drawdown_pct?: string | number | null;
  max_daily_drawdown_pct?: string | number | null;
  drawdown_type?: string | null;
  daily_starting_balance?: string | number | null;
  account_type?: string | null;
  account_currency?: string | null;
  connection_status?: string | null;
  is_breached: boolean;
  last_synced_at: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<PropAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ subscription_tier: string } | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(profile);

      const { data: accounts } = await supabase
        .from("mt5_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setAccounts((accounts || []).filter((account) => account.connection_status === "CONNECTED"));

      setLoading(false);
    }
    loadAccounts();
  }, []);

  const subscriptionTier = profile?.subscription_tier || "free";
  const maxAccounts = subscriptionTier === "free" ? 0 : subscriptionTier === "pro" ? 3 : 999;
  const canAddMore = accounts.length < maxAccounts;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-dashed border-purple-500/30 bg-slate-900/50 p-6 text-center sm:p-12">
          <Server className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-bold text-slate-400">Connect your MT5 account to unlock Account Intel</h3>
          <p className="mt-2 text-sm text-slate-500">
            Connect your first MT4/MT5 prop firm account to start tracking drawdown and auto-journaling trades.
          </p>
          {canAddMore && (
            <Link href="/dashboard/account-intel/connect" className="mt-6 inline-block">
              <ShimmerButton className="px-6 py-3 text-sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Connect Your First Account
              </ShimmerButton>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Prop Firm Accounts</h2>
          <p className="text-sm text-slate-400">
            Manage your connected MT4/MT5 accounts ({accounts.length}/{maxAccounts})
          </p>
        </div>
        {canAddMore ? (
          <Link href="/dashboard/account-intel/connect">
            <ShimmerButton className="px-5 py-2.5 text-sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Connect Account
            </ShimmerButton>
          </Link>
        ) : (
          <Link href="/pricing">
            <ShimmerButton className="px-5 py-2.5 text-sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Upgrade to Add More
            </ShimmerButton>
          </Link>
        )}
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}

      </div>

      {accounts.length > 0 && <AccountRiskOverview accounts={accounts} />}
    </div>
  );
}

function AccountRiskOverview({ accounts }: { accounts: PropAccount[] }) {
  const active = accounts[0];
  const metrics = metricsFromAccountRow({
    initial_balance: active.initial_balance ?? active.current_balance,
    current_balance: active.current_balance,
    current_equity: active.current_equity,
    high_water_mark: active.high_water_mark ?? active.current_equity,
    max_total_drawdown_pct: active.max_total_drawdown_pct ?? 10,
    max_daily_drawdown_pct: active.max_daily_drawdown_pct ?? 5,
    drawdown_type: active.drawdown_type ?? "trailing",
    daily_starting_balance: active.daily_starting_balance ?? null,
  });
  const totalLimit = Number(active.max_total_drawdown_pct ?? 10);
  const dailyLimit = Number(active.max_daily_drawdown_pct ?? 5);
  const totalUsed = Math.max(0, Math.min(100, 100 - (metrics.totalBufferPct / (totalLimit || 1)) * 100));
  const dailyUsed = Math.max(0, Math.min(100, 100 - (metrics.dailyBufferPct / (dailyLimit || 1)) * 100));

  return (
    <section id="shield" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Account Risk Intel</h2>
        <p className="text-sm text-slate-400">Live drawdown tracking, limit thresholds, and risk meters for {active.account_name}.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <RiskKpi label="Current Equity" value={usd(active.current_equity)} Icon={TrendingUp} />
        <RiskKpi label="High-Water Mark" value={usd(metrics.effectiveHWM)} Icon={Waves} accent="text-purple-300" />
        <RiskKpi label="Breach Floor" value={usd(metrics.effectiveBreachFloor)} Icon={ShieldAlert} accent="text-rose-400" />
        <RiskKpi label="Shield Buffer" value={usd(metrics.remainingBufferUsd)} Icon={ShieldCheck} accent={metrics.status === "SAFE" ? "text-emerald-400" : "text-red-400"} />
      </div>
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Gauge className="h-5 w-5 text-purple-400" /><h3 className="text-lg font-bold text-white">Proximity to Breach Floor</h3></div><span className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${STATUS_STYLES[metrics.status]}`}>{metrics.status}</span></div>
          <p className="mt-6 font-mono text-5xl font-black text-white">{metrics.remainingBufferPct.toFixed(2)}%</p>
          <p className="mt-1 font-mono text-sm text-slate-400">{usd(metrics.remainingBufferUsd)} until breach at {usd(metrics.effectiveBreachFloor)}</p>
          <RiskBar value={Math.max(0, Math.min(100, (metrics.remainingBufferPct / (totalLimit || 1)) * 100))} tone={metrics.status === "SAFE" ? "bg-emerald-500" : metrics.status === "WARNING" ? "bg-amber-500" : "bg-red-500"} />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-purple-400" /><h3 className="text-lg font-bold text-white">Limit Thresholds</h3></div>
          <RiskRule label="Max Total Drawdown" limit={totalLimit} used={totalUsed} floor={metrics.maxDrawdownFloor} buffer={metrics.totalBufferUsd} />
          <RiskRule label="Max Daily Drawdown" limit={dailyLimit} used={dailyUsed} floor={metrics.dailyLossFloor} buffer={metrics.dailyBufferUsd} />
        </div>
      </div>
    </section>
  );
}

function usd(value: string | number) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function RiskKpi({ label, value, Icon, accent = "text-white" }: { label: string; value: string; Icon: typeof TrendingUp; accent?: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-black/20"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span><div className="mt-4 flex items-end justify-between gap-3"><p className={`truncate font-mono text-2xl font-black ${accent}`}>{value}</p><Icon className="h-5 w-5 text-slate-600" /></div></div>;
}

function RiskBar({ value, tone }: { value: number; tone: string }) {
  return <div className="mt-6 h-4 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950"><div className={`h-full transition-all duration-500 ${tone}`} style={{ width: `${value}%` }} /></div>;
}

function RiskRule({ label, limit, used, floor, buffer }: { label: string; limit: number; used: number; floor: number; buffer: number }) {
  return <div className="mt-6"><div className="flex items-center justify-between gap-2"><h4 className="text-sm font-bold text-white">{label}</h4><span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-[11px] text-slate-300">{limit.toFixed(2)}%</span></div><RiskBar value={used} tone={buffer <= 0 ? "bg-red-500" : buffer < 1000 ? "bg-amber-500" : "bg-emerald-500"} /><div className="mt-2 flex justify-between font-mono text-[11px] text-slate-500"><span>Floor {usd(floor)}</span><span>Remaining {usd(buffer)}</span></div></div>;
}

function AccountCard({ account }: { account: PropAccount }) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const [now] = useState(() => Date.now());

  const isSynced =
    account.last_synced_at &&
    new Date(account.last_synced_at) > new Date(now - 5 * 60 * 1000);

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect ${account.account_name}? This will stop live syncing.`)) return;
    setDisconnecting(true);
    const result = await disconnectMetaApiAccount(account.id);
    setDisconnecting(false);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <div className="group rounded-2xl border border-purple-500/20 bg-slate-900/80 p-4 transition-all hover:border-purple-500/40 sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-lg shadow-purple-600/30">
            <Server className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-white">{account.account_name}</h3>
            <p className="text-xs text-slate-400">
              {account.platform} • {account.broker_name || "Unknown Broker"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start">
          {isSynced ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
              <CheckCircle className="h-3 w-3" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
              <AlertCircle className="h-3 w-3" />
              Sync Delayed
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400">Account Number</p>
          <p className="font-mono text-sm text-white">{account.account_number}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Current Balance</p>
          <p className="text-sm font-bold text-white">${parseFloat(account.current_balance).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Current Equity</p>
          <p className="text-sm font-bold text-white">${parseFloat(account.current_equity).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Status</p>
          <p className={`text-sm font-bold ${account.is_breached ? "text-red-400" : "text-emerald-400"}`}>
            {account.is_breached ? "BREACHED" : "ACTIVE"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="#shield"
          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Drawdown
        </Link>
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {disconnecting ? "Disconnecting..." : "Disconnect"}
        </button>
      </div>
    </div>
  );
}
