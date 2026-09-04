"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Calculator,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  Plus,
  Server,
  Settings,
  ShieldAlert,
  Target,
  TrendingUp,
  User as UserIcon,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Toaster, toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { metricsFromAccountRow } from "@/lib/utils/drawdown";

interface Profile {
  subscription_tier: string;
  full_name?: string | null;
  email?: string | null;
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
  { label: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { label: "Account Intel", href: "/dashboard/account-intel", icon: Server },
  { label: "Prop Shield", href: "/dashboard/prop-shield", icon: ShieldAlert },
  { label: "Trade Assist", href: "/dashboard/trade-assist", icon: Calculator },
  { label: "Prop Match", href: "/tools/firm-fit", icon: Target, badge: "New" },
  { label: "Journal", href: "/dashboard/journal", icon: NotebookPen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function playWarningChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.warn("Audio Context playback failed:", err);
  }
}

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
  const [riskAlertDismissed, setRiskAlertDismissed] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const notificationFiredRef = useRef(false);
  const [riskAlert, setRiskAlert] = useState<{
    currentDailyDrawdownPct: number;
    currentOverallDrawdownPct: number;
    remainingDailyBufferUsd: number;
    dailyLossLimitUsd: number;
    totalDrawdownLimitUsd: number;
    accountBalance: number;
    accountEquity: number;
    activeViolations: string[];
    riskLevel: "Safe" | "Warning (Yellow)" | "Critical breach imminent (Red)";
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
        .select("subscription_tier, full_name, email, telegram_chat_id")
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
      setSelectedAccount((current) => current || accounts?.[0]?.id || "");
      setLoading(false);
    }

    loadData();

    const handleMetricsRefresh = () => {
      setLoading(true);
      void loadData();
    };

    window.addEventListener("dashboard-metrics-refresh", handleMetricsRefresh);
    return () => {
      window.removeEventListener("dashboard-metrics-refresh", handleMetricsRefresh);
    };
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
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedAccountData) {
      setRiskAlertOpen(false);
      setRiskAlert(null);
      notificationFiredRef.current = false;
      return;
    }

    const initialBalance = Number(selectedAccountData.initial_balance ?? 0);
    const currentBalance = Number(selectedAccountData.current_balance ?? 0);
    const currentEquity = Number(selectedAccountData.current_equity ?? 0);
    const maxDailyDrawdownPct = Number(selectedAccountData.max_daily_drawdown_pct ?? 5);
    const maxTotalDrawdownPct = Number(selectedAccountData.max_total_drawdown_pct ?? 10);
    const dailyStartingBalance = Number(
      selectedAccountData.daily_starting_balance ?? initialBalance
    );

    const metrics = metricsFromAccountRow({
      initial_balance: initialBalance,
      current_balance: currentBalance,
      current_equity: currentEquity,
      high_water_mark: Number(selectedAccountData.high_water_mark ?? currentEquity),
      max_total_drawdown_pct: maxTotalDrawdownPct,
      max_daily_drawdown_pct: maxDailyDrawdownPct,
      drawdown_type: (selectedAccountData.drawdown_type as "static" | "trailing" | "balance-based") || "trailing",
      daily_starting_balance: dailyStartingBalance,
    });

    const dailyLossLimitUsd = dailyStartingBalance * (maxDailyDrawdownPct / 100);
    const totalDrawdownLimitUsd = initialBalance * (maxTotalDrawdownPct / 100);
    const dailyLossUsd = Math.max(0, dailyStartingBalance - currentEquity);
    const overallLossUsd = Math.max(0, initialBalance - currentEquity);

    const currentDailyDrawdownPct =
      dailyLossLimitUsd > 0 ? (dailyLossUsd / dailyLossLimitUsd) * 100 : 0;
    const currentOverallDrawdownPct =
      initialBalance > 0 ? (overallLossUsd / initialBalance) * 100 : 0;

    const remainingDailyBufferUsd = Math.max(0, dailyLossLimitUsd - dailyLossUsd);
    const activeViolations: string[] = [];

    if (currentDailyDrawdownPct >= 80) {
      activeViolations.push("Daily loss >= 80% of daily max loss");
    }
    if (currentOverallDrawdownPct >= maxTotalDrawdownPct * 0.85) {
      activeViolations.push("Overall loss >= 85% of max total drawdown");
    }

    const riskLevel: "Safe" | "Warning (Yellow)" | "Critical breach imminent (Red)" =
      activeViolations.length === 0
        ? "Safe"
        : currentDailyDrawdownPct >= 100 || currentOverallDrawdownPct >= maxTotalDrawdownPct
          ? "Critical breach imminent (Red)"
          : "Warning (Yellow)";

    const thresholdReached = currentDailyDrawdownPct >= 80 || currentOverallDrawdownPct >= maxTotalDrawdownPct * 0.85;
    const shouldAlert = !riskAlertDismissed && thresholdReached;

    if (!thresholdReached) {
      notificationFiredRef.current = false;
    } else if (!notificationFiredRef.current) {
      notificationFiredRef.current = true;
      if (currentDailyDrawdownPct >= 80) {
        toast.error("⚠️ CRITICAL RISK WARNING: 80% Daily Loss Limit Reached!", {
          description: "Pause trading immediately to protect your account equity.",
          duration: 8000,
        });
      } else {
        toast.error("⚠️ CRITICAL RISK WARNING: Total Drawdown Threshold Reached!", {
          description: "Reduce exposure immediately to avoid breaching your account limit.",
          duration: 8000,
        });
      }

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("🚨 Propfident Equity Shield Alert", {
          body: currentDailyDrawdownPct >= 80
            ? `Warning: You have reached ${currentDailyDrawdownPct.toFixed(1)}% of your daily max loss limit!`
            : `Warning: You have reached ${currentOverallDrawdownPct.toFixed(1)}% of your max total drawdown limit!`,
          icon: "/favicon.ico",
        });
      }

      playWarningChime();
    }

    setRiskAlertOpen(shouldAlert);
    setRiskAlert({
      currentDailyDrawdownPct,
      currentOverallDrawdownPct,
      remainingDailyBufferUsd,
      dailyLossLimitUsd,
      totalDrawdownLimitUsd,
      accountBalance: currentBalance,
      accountEquity: currentEquity,
      activeViolations,
      riskLevel,
    });
  }, [riskAlertDismissed, selectedAccountData]);

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
      <Toaster richColors closeButton theme="dark" position="top-right" />
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
          <Logo width={36} height={36} />
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
                <span className="min-w-0 flex-1">{item.label}</span>
                {"badge" in item && item.badge && (
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-300">
                    {item.badge}
                  </span>
                )}
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
              <div className="flex items-center gap-3">
                <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 px-3 py-1.5 text-xs text-purple-200 transition-all hover:bg-purple-900/50" onClick={() => window.dispatchEvent(new Event("pwa-install-request"))}>
                  <Download className="h-4 w-4 text-purple-400" />
                  Install App
                </button>
                <Link href="/dashboard/profile" aria-label="Open your profile" className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-500/40 bg-purple-600/30 font-semibold text-purple-200 transition hover:bg-purple-600/50">
                  {profile?.full_name || profile?.email ? (profile.full_name || profile.email || "?").trim().charAt(0).toUpperCase() : <UserIcon className="h-5 w-5 text-purple-300" />}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {riskAlertOpen && riskAlert && (
          <div className="fixed inset-x-4 top-20 z-40 mx-auto max-w-2xl rounded-2xl border border-red-500/50 bg-gradient-to-r from-rose-950/90 via-amber-950/80 to-slate-900/95 p-5 shadow-[0_0_0_1px_rgba(251,146,60,0.25),0_25px_80px_rgba(127,29,29,0.45)] backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full border border-red-400/50 bg-red-500/15 shadow-[0_0_18px_rgba(248,113,113,0.5)] animate-pulse">
                <AlertTriangle className="h-5 w-5 text-red-200" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-200">
                    Active risk monitor
                  </p>
                  <span className="rounded-full border border-red-400/40 bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200 animate-pulse">
                    Alert
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-white">Drawdown threshold reached</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Balance</p>
                    <p className="mt-2 text-base font-bold text-white">
                      ${riskAlert.accountBalance.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Equity</p>
                    <p className="mt-2 text-base font-bold text-amber-300">
                      ${riskAlert.accountEquity.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Daily Buffer</p>
                    <p className="mt-2 text-base font-bold text-emerald-400">
                      ${riskAlert.remainingDailyBufferUsd.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Current Daily Drawdown %</p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {riskAlert.currentDailyDrawdownPct.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Current Overall Drawdown %</p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {riskAlert.currentOverallDrawdownPct.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Active Violations / Risk Level</p>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${riskAlert.riskLevel === "Safe" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : riskAlert.riskLevel === "Warning (Yellow)" ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
                      {riskAlert.riskLevel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {riskAlert.activeViolations.length > 0
                      ? riskAlert.activeViolations.join(" • ")
                      : "No active drawdown violations"}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Daily loss is at {riskAlert.currentDailyDrawdownPct.toFixed(1)}% of the daily cap and overall drawdown is at {riskAlert.currentOverallDrawdownPct.toFixed(1)}% of the total cap. Reduce size immediately and pause additional exposure.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setRiskAlertDismissed(true);
                      setRiskAlertOpen(false);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Acknowledge Risk
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountLocked(true)}
                    className="rounded-lg bg-gradient-to-r from-red-600 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:brightness-110"
                  >
                    Lock Account / Pause Trading
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {accountLocked && (
          <div className="mx-4 mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-lg shadow-red-950/20 md:mx-6">
            Trading lock is active: new trade entries are paused and lot-size copy actions will warn before continuing until risk returns to a safe range.
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col space-y-6 overflow-y-auto p-4 sm:p-5 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
