import { Plug, Check, RefreshCw, Server } from "lucide-react";

export default function MetaApiVisual() {
  return (
    <div className="glow-brand relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 dark:border-purple-500/30 dark:bg-slate-900/90">
      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
        <Plug className="h-5 w-5" strokeWidth={2.5} />
        <span className="text-xs font-bold uppercase tracking-wider">
          MetaApi Sync
        </span>
      </div>

      {/* Connection diagram */}
      <div className="mt-8 flex items-center justify-between gap-2">
        {/* Terminal node */}
        <ConnNode
          title="MT4 / MT5"
          subtitle="Terminal"
          icon={<Server className="h-6 w-6" strokeWidth={2} />}
        />

        {/* animated link */}
        <div className="relative flex-1">
          <div className="h-0.5 w-full rounded bg-gradient-brand opacity-70" />
          <div className="absolute -top-2.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lg shadow-purple-600/40">
            <RefreshCw className="h-3 w-3" strokeWidth={2.5} />
          </div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            via MetaApi
          </span>
        </div>

        {/* Propfident node */}
        <ConnNode
          title="Propfident"
          subtitle="Dashboard"
          highlight
          icon={<Plug className="h-6 w-6" strokeWidth={2} />}
        />
      </div>

      {/* Sync checklist */}
      <div className="mt-10 space-y-2.5">
        {[
          "Read-only broker credentials — investor password supported",
          "Trades auto-imported the instant they close",
          "Supports 40+ prop firms & retail brokers",
          "Bank-grade encryption, no withdrawal access",
        ].map((line) => (
          <div
            key={line}
            className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-purple-500/20 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
              <Check className="h-2.5 w-2.5 text-emerald-500" strokeWidth={3} />
            </span>
            {line}
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 dark:bg-emerald-500/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-slate-900 dark:text-white">
            Connected — FTMO #40218
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
          synced 3s ago
        </span>
      </div>
    </div>
  );
}

function ConnNode({
  title,
  subtitle,
  icon,
  highlight,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className={
          "flex h-16 w-16 items-center justify-center rounded-2xl " +
          (highlight
            ? "bg-gradient-brand text-white shadow-lg shadow-purple-600/30"
            : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-purple-500/30 dark:bg-slate-900/50 dark:text-slate-300")
        }
      >
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-slate-900 dark:text-white">
          {title}
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
