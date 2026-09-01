"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Calculator,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  Plus,
  Server,
  Settings,
  ShieldAlert,
  TrendingUp,
  User as UserIcon,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PwaInstallBanner from "@/components/PwaInstallBanner";
import { metricsFromAccountRow } from "@/lib/utils/drawdown";

interface Profile {
  subscription_tier: string;
  telegram_chat_id?: string | null;
}

interface PropAccount {
  id: string;
  account_name: string;
  platform: string;
  initial_balance?: string | number | null;
  current_balance?: string | number | null;
  current_equity?: string | number | null;
  high_water_mark?: string | number | null;
  max_total_drawdown_pct?: string | number | null;
  max_daily_drawdown_pct?: string | number | null;
  drawdown_type?: string | null;
  daily_starting_balance?: string | number | null;
  account_number?: string | null;
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Account Intel", href: "/dashboard/account-intel", icon: Server },
  { label: "Prop Shield", href: "/dashboard/prop-shield", icon: ShieldAlert },
  { label: "Trade Assist", href: "/dashboard/trade-assist", icon: Calculator },
  { label: "Journal", href: "/dashboard/journal", icon: NotebookPen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<PropAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [riskAlertOpen, setRiskAlertOpen] = useState(false);
  const [riskAlert, setRiskAlert] = useState<{
    currentDrawdownPct: number;
    remainingDailyBufferUsd: number;
    dailyLossLimitUsd: number;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, telegram_chat_id")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(profile);

      const { data: accounts } = await supabase
        .from("mt5_accounts")
        .select(
          "id, account_name, platform, account_number, initial_balance, current_balance, current_equity, high_water_mark, max_total_drawdown_pct, max_daily_drawdown_pct, drawdown_type, daily_starting_balance"
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setAccounts((accounts || []) as PropAccount[]);
      setSelectedAccount(accounts?.[0]?.id || "");
      setLoading(false);
    }

    loadData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const title = navItems.find((item) => {
    if (item.href === "/dashboard") return pathname === item.href;
    return pathname.startsWith(item.href);
  })?.label || "Dashboard";

  const selectedAccountData =
    accounts.find((account) => account.id === selectedAccount) || accounts[0] || null;

  useEffect(() => {
    if (!selectedAccountData) {
      setRiskAlertOpen(false);
      setRiskAlert(null);
      return;
    }

    const initialBalance = Number(selectedAccountData.initial_balance ?? 0);
    const currentBalance = Number(selectedAccountData.current_balance ?? 0);
    const currentEquity = Number(selectedAccountData.current_equity ?? 0);
    const maxDailyDrawdownPct = Number(selectedAccountData.max_daily_drawdown_pct ?? 5);
    const dailyStartingBalance = Number(
      selectedAccountData.daily_starting_balance ?? initialBalance
    );

    const metrics = metricsFromAccountRow({
      initial_balance: initialBalance,
      current_balance: currentBalance,
      current_equity: currentEquity,
      high_water_mark: Number(selectedAccountData.high_water_mark ?? currentEquity),
      max_total_drawdown_pct: Number(selectedAccountData.max_total_drawdown_pct ?? 10),
      max_daily_drawdown_pct: maxDailyDrawdownPct,
      drawdown_type: (selectedAccountData.drawdown_type as "static" | "trailing" | "balance-based") || "trailing",
      daily_starting_balance: dailyStartingBalance,
    });

    const dailyLossLimitUsd = dailyStartingBalance * (maxDailyDrawdownPct / 100);
    const currentDrawdownPct =
      initialBalance > 0 ? ((initialBalance - currentEquity) / initialBalance) * 100 : 0;
    const remainingDailyBufferUsd = Math.max(0, currentEquity - dailyLossLimitUsd);
    const shouldAlert =
      currentDrawdownPct >= 50 ||
      metrics.dailyBufferUsd <= dailyLossLimitUsd * 0.8 ||
      metrics.remainingBufferPct <= 50;

    setRiskAlertOpen(shouldAlert);
    setRiskAlert({
      currentDrawdownPct,
      remainingDailyBufferUsd,
      dailyLossLimitUsd,
    });
  }, [selectedAccountData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
          <p className="mt-4 text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-slate-950 text-white">
      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition hover:text-white md:hidden"
        aria-label="Toggle dashboard navigation"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 shrink-0 transform border-r border-slate-800 bg-slate-900/95 backdrop-blur-md transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-lg shadow-purple-600/30">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">Propfident</span>
        </div>

        <div className="border-b border-slate-800 p-4">
          <Link
            href="/dashboard/account-intel/connect"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:brightness-110"
            title="Connect a new prop firm account"
          >
            <Plus className="h-3.5 w-3.5" />
            Connect Account
          </Link>

          {accounts.length > 0 ? (
            <select
              value={selectedAccount}
              onChange={(event) => setSelectedAccount(event.target.value)}
              className="mt-3 w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-purple-500 focus:outline-none"
              aria-label="Active account selector"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account_name} · {account.platform}
                </option>
              ))}
            </select>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-800 bg-slate-950 px-3 py-2 text-center text-[11px] text-slate-500">
              No connected accounts
            </div>
          )}

          <div className="mt-3 flex justify-center">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                (profile?.subscription_tier || "free") === "free"
                  ? "bg-slate-800 text-slate-300"
                  : profile?.subscription_tier === "pro"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {profile?.subscription_tier || "free"}
            </span>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-l-2 border-purple-500 bg-purple-600/20 text-purple-300"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            title="Sign out of Propfident"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close dashboard navigation overlay"
        />
      )}

      <main className="flex min-w-0 max-w-full flex-1 flex-col overflow-hidden">
        <header className="z-20 shrink-0 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex min-w-0 h-16 items-center justify-between gap-3 px-4 pr-16 sm:px-6">
            <h1 className="min-w-0 truncate text-lg font-bold capitalize text-slate-100">
              {title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {riskAlertOpen && riskAlert && (
          <div className="fixed inset-x-4 top-20 z-40 mx-auto max-w-lg rounded-2xl border border-amber-500/40 bg-slate-900/95 p-5 shadow-2xl shadow-amber-950/30 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                  Equity Protection Alert
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">Daily guardrails are tightening</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Current Drawdown %</p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {riskAlert.currentDrawdownPct.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Daily Buffer</p>
                    <p className="mt-2 text-lg font-bold text-emerald-400">
                      ${riskAlert.remainingDailyBufferUsd.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Daily Loss Limit</p>
                    <p className="mt-2 text-lg font-bold text-amber-300">
                      ${riskAlert.dailyLossLimitUsd.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Your account is approaching a risk threshold. Reduce exposure, avoid adding correlated trades, and reset your daily plan before the buffer closes.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setRiskAlertOpen(false)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={() => setRiskAlertOpen(false)}
                    className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:brightness-110"
                  >
                    Acknowledge &amp; Set Guardrails
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col space-y-6 overflow-y-auto p-4 sm:p-5 md:p-6">
          <PwaInstallBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
