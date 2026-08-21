import { NotebookPen, ArrowUpRight, ArrowDownRight } from "lucide-react";

const trades = [
  { pair: "EUR/USD", side: "long", rr: "2.4R", pnl: "+$420", win: true, tag: "London" },
  { pair: "XAU/USD", side: "short", rr: "1.8R", pnl: "+$310", win: true, tag: "News" },
  { pair: "GBP/USD", side: "long", rr: "-1.0R", pnl: "-$180", win: false, tag: "NY" },
  { pair: "USD/JPY", side: "short", rr: "3.1R", pnl: "+$540", win: true, tag: "Asia" },
];

export default function JournalVisual() {
  return (
    <div className="glow-brand h-full w-full rounded-2xl border border-slate-200 bg-white p-6 dark:border-purple-500/30 dark:bg-slate-900/90">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
          <NotebookPen className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Auto Journal
          </span>
        </div>
        <span className="rounded-full bg-purple-500/15 px-3 py-1 text-[10px] font-bold text-purple-600 dark:text-purple-300">
          AUTO-LOGGED
        </span>
      </div>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { l: "Win Rate", v: "72%" },
          { l: "Profit Factor", v: "2.31" },
          { l: "Avg RR", v: "2.1R" },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center dark:border-purple-500/20 dark:bg-slate-900/40"
          >
            <div className="text-lg font-extrabold text-gradient-brand">
              {s.v}
            </div>
            <div className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Trade rows */}
      <div className="mt-4 space-y-2">
        {trades.map((t, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-purple-500/20 dark:bg-slate-900/40"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={
                  "flex h-7 w-7 items-center justify-center rounded-lg " +
                  (t.side === "long"
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-rose-500/15 text-rose-500")
                }
              >
                {t.side === "long" ? (
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <ArrowDownRight className="h-4 w-4" strokeWidth={2.5} />
                )}
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.pair}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {t.tag}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {t.rr}
                  </span>
                </div>
              </div>
            </div>
            <span
              className={
                "text-sm font-bold " +
                (t.win ? "text-emerald-500" : "text-rose-500")
              }
            >
              {t.pnl}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
