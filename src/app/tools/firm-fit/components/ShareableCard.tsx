"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import type { FirmEvaluation } from "@/lib/firm-fit/evaluator";

export function ShareableCard({ results }: { results: FirmEvaluation[] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [traderName, setTraderName] = useState("");

  const displayName = traderName.trim() || "Propfident Trader";
  const topResults = results.slice(0, 3);
  const result = topResults[0];
  const verifiedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const consistency = result.maxTradeProfitRatio * 100;

  async function downloadCard() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, canvasWidth: 1200, canvasHeight: 630 });
      const link = document.createElement("a");
      link.download = `${result.firm.id}-prop-match.png`;
      link.href = dataUrl;
      link.click();
    } finally { setBusy(false); }
  }

  return (
    <section className="mt-6">
      <label className="block text-sm font-semibold text-slate-200" htmlFor="trader-name">Trader name or handle</label>
      <input id="trader-name" value={traderName} onChange={(event) => setTraderName(event.target.value)} placeholder="Enter Trader Name or Handle" className="mt-2 w-full max-w-md rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500" />
      <div ref={cardRef} className="mx-auto mt-4 aspect-[1200/630] w-full max-w-3xl overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 via-slate-950 to-slate-950 p-5 text-white shadow-2xl shadow-purple-950/30 sm:p-8">
        <div className="flex h-full flex-col justify-between">
          <header className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/propfidentlogo.png" alt="Propfident" className="h-8 w-8 object-contain" />
              <span className="truncate text-sm font-bold text-white">{displayName}</span>
            </div>
            <div className="text-right">
              <span className="rounded-full border border-purple-400/40 bg-purple-500/10 px-2 py-1 text-[9px] font-bold tracking-wider text-purple-200">VERIFIED MATCH</span>
              <p className="mt-1 text-[10px] font-bold tracking-[0.14em] text-slate-300">PROP MATCH™ STRATEGY MATRIX</p>
              <p className="text-[9px] text-slate-500">{verifiedAt}</p>
            </div>
          </header>
          <div className="flex flex-1 flex-col justify-center gap-3 py-4 sm:py-6">
            {topResults.map((match) => (
              <div key={match.firm.id} className="grid grid-cols-[auto_7rem_1fr_auto] items-center gap-2 text-xs sm:grid-cols-[auto_9rem_1fr_auto] sm:gap-3">
                <img src={match.firm.logo} alt="" className="h-7 w-7 rounded object-contain" />
                <span className="truncate text-slate-200">{match.firm.name}</span>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${match.matchPercentage}%` }} /></div>
                <span className="font-bold text-purple-300">{match.matchPercentage}% Match</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-800/80 pt-3 text-[10px] text-slate-300 sm:text-xs">
            <span>Max DD Recorded: {result.userMaxTotalDD.toFixed(1)}%</span>
            <span>Consistency Ratio: {consistency.toFixed(0)}%</span>
            <span>Weekend Trades: {result.weekendTradesCount === 0 ? "Pass" : "Review"}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void downloadCard()} className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"><Download className="h-4 w-4" /> Download Scorecard (PNG)</button>
      </div>
    </section>
  );
}
