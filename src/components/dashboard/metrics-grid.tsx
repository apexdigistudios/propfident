import { Activity, ShieldCheck, TrendingUp, Wallet, Waves } from "lucide-react";
import { toNumber, usdFormatter } from "./format";
import { metricsFromAccountRow, STATUS_STYLES } from "@/lib/utils/drawdown";

type AccountMetrics = {
  initial_balance?: string | number | null;
  current_balance?: string | number | null;
  current_equity?: string | number | null;
  high_water_mark?: string | number | null;
  max_total_drawdown_pct?: string | number | null;
  max_daily_drawdown_pct?: string | number | null;
  drawdown_type?: string | null;
  daily_starting_balance?: string | number | null;
} | null;

export function MetricsGrid({
  account,
  totalPnl,
}: {
  account: AccountMetrics;
  totalPnl: number;
}) {
  const currentBalance = toNumber(account?.current_balance);
  const currentEquity = toNumber(account?.current_equity);

  // All derived risk values come from the centralized engine so every
  // surface stays in sync when balance/equity changes.
  const risk = account
    ? metricsFromAccountRow({
        initial_balance: account.initial_balance ?? 0,
        current_balance: account.current_balance ?? 0,
        current_equity: account.current_equity ?? 0,
        high_water_mark: account.high_water_mark ?? 0,
        max_total_drawdown_pct: account.max_total_drawdown_pct ?? 10,
        max_daily_drawdown_pct: account.max_daily_drawdown_pct ?? 5,
        drawdown_type: account.drawdown_type ?? "trailing",
        daily_starting_balance: account.daily_starting_balance ?? null,
      })
    : null;

  const metrics = [
    {
      label: "Current Balance",
      value: usdFormatter.format(currentBalance),
      helper: "Closed-trade balance",
      Icon: Wallet,
      tone: "text-slate-100",
    },
    {
      label: "Current Equity",
      value: usdFormatter.format(currentEquity),
      helper: "Live account equity",
      Icon: Activity,
      tone: "text-slate-100",
    },
    {
      label: "Total PnL",
      value: usdFormatter.format(totalPnl),
      helper: "From closed trades",
      Icon: TrendingUp,
      tone: totalPnl >= 0 ? "text-emerald-400" : "text-rose-400",
    },
    {
      label: "High Water Mark",
      value: usdFormatter.format(risk?.effectiveHWM ?? 0),
      helper: risk?.trailingLocked ? "Trailing locked" : "Peak balance/equity",
      Icon: Waves,
      tone: "text-purple-300",
    },
    {
      label: "Drawdown Buffer Remaining",
      value: usdFormatter.format(Math.max(0, risk?.remainingBufferUsd ?? 0)),
      helper: risk
        ? `${risk.remainingBufferPct.toFixed(2)}% · floor ${usdFormatter.format(risk.effectiveBreachFloor)}`
        : "No account connected",
      Icon: ShieldCheck,
      tone:
        !risk || risk.remainingBufferUsd <= 0
          ? "text-slate-500"
          : risk.status === "SAFE"
            ? "text-emerald-400"
            : risk.status === "WARNING"
              ? "text-amber-400"
              : "text-red-400",
    },
  ];

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map(({ label, value, helper, Icon, tone }) => (
        <div
          key={label}
          className="flex min-h-[148px] min-w-0 flex-col rounded-2xl border border-purple-500/20 bg-slate-900/90 p-5 shadow-xl shadow-black/20 backdrop-blur-md md:p-6"
        >
          <div className="flex min-w-0 items-start justify-between gap-4">
            <p className="min-w-0 flex-1 text-xs font-medium uppercase leading-snug tracking-[0.16em] text-slate-400">
              {label}
            </p>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-300">
              <Icon className="h-5 w-5" />
            </span>
          </div>
          {/* Fluid value — wraps long currency strings instead of clipping */}
          <p className={`mt-4 break-words font-mono text-xl font-bold leading-tight tracking-tight md:text-2xl lg:text-3xl ${tone}`}>
            {value}
          </p>
          <p className="mt-3 break-words text-xs leading-relaxed text-slate-500">{helper}</p>
        </div>
      ))}

      {risk && (
        <div className="sr-only" aria-live="polite">
          Shield status {risk.status}
        </div>
      )}
    </section>
  );
}

export function StatusPill({ status }: { status: keyof typeof STATUS_STYLES }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-xs font-bold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
