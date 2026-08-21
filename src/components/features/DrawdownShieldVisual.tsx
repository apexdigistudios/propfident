import { ShieldCheck, TrendingDown, Gauge } from "lucide-react";

export default function DrawdownShieldVisual() {
  // remaining headroom % (visual)
  const used = 32; // % of allowed drawdown consumed
  const remaining = 100 - used;

  return (
    <div className="glow-brand relative h-full w-full rounded-2xl border border-slate-200 bg-white p-6 dark:border-purple-500/30 dark:bg-slate-900/90">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
          <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Trailing Shield
          </span>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          SAFE
        </span>
      </div>

      {/* Buffer gauge */}
      <div className="mt-6 flex items-center justify-center">
        <svg viewBox="0 0 200 120" className="w-full max-w-xs" aria-label="Drawdown buffer gauge">
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <path
            d="M20,100 A80,80 0 0,1 180,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* remaining arc — ~68% of the semicircle */}
          <path
            d="M20,100 A80,80 0 0,1 148,38"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <text
            x="100"
            y="88"
            textAnchor="middle"
            className="fill-slate-900 font-extrabold dark:fill-white"
            fontSize="30"
          >
            {remaining}%
          </text>
          <text
            x="100"
            y="108"
            textAnchor="middle"
            className="fill-slate-500 font-medium dark:fill-slate-400"
            fontSize="10"
          >
            headroom remaining
          </text>
        </svg>
      </div>

      {/* Buffer bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
          <span className="text-slate-500 dark:text-slate-400">
            Trailing drawdown limit
          </span>
          <span className="text-slate-900 dark:text-white">$3,200 left</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-brand"
            style={{ width: `${remaining}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { l: "Balance", v: "$52.4k", i: <Gauge className="h-4 w-4" /> },
          { l: "Peak", v: "$54.1k", i: <TrendingDown className="h-4 w-4" /> },
          { l: "Floor", v: "$49.2k", i: <ShieldCheck className="h-4 w-4" /> },
        ].map((x) => (
          <div
            key={x.l}
            className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-purple-500/20 dark:bg-slate-900/40"
          >
            <div className="flex items-center justify-center text-purple-500">
              {x.i}
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
              {x.v}
            </div>
            <div className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">
              {x.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
