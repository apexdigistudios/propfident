"use client";

import { ExternalLink, ChevronDown, Target } from "lucide-react";
import { useState } from "react";
import type { FirmEvaluation } from "@/lib/firm-fit/evaluator";

interface MatrixGridProps {
  results: FirmEvaluation[];
  onDetails: (result: FirmEvaluation) => void;
}

function scoreBadge(result: FirmEvaluation) {
  return result.matchPercentage >= 80
    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
    : result.matchPercentage >= 50
      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
      : "border-rose-400/30 bg-rose-400/10 text-rose-300";
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function MatrixGrid({ results, onDetails }: MatrixGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {results.map((result) => {
        const { rules } = result.firm;
        const limit = rules.maxTotalDrawdown * 100;
        const gauge = Math.min(100, (result.userMaxTotalDD / Math.max(limit, 0.01)) * 100);
        const expanded = expandedId === result.firm.id;

        return (
          <article key={result.firm.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xl shadow-indigo-950/20 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-lg font-black text-cyan-300">{result.firm.name.slice(0, 1)}</div>
                  <h2 className="text-lg font-bold text-white">{result.firm.name}</h2>
                </div>
                <p className="mt-3 text-sm text-slate-400">{result.status.replace("_", " ")}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-lg font-black ${scoreBadge(result)}`}>{result.matchPercentage}%</span>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-400"><span>Your max DD: {result.userMaxTotalDD.toFixed(1)}%</span><span>Firm limit: {limit.toFixed(1)}%</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full ${gauge >= 80 ? "bg-rose-500" : gauge >= 50 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${gauge}%` }} /></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.breaches.slice(0, 3).map((breach) => <span key={breach} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">{breach.includes("Weekend") ? "Weekend Holding Violation" : breach.includes("Consistency") ? "Consistency Warning" : "Drawdown Risk"}</span>)}
            </div>
            <button type="button" onClick={() => setExpandedId(expanded ? null : result.firm.id)} aria-expanded={expanded} className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-left text-sm font-bold text-slate-200 transition-all hover:border-cyan-500/30 hover:bg-slate-800">
              <span className="flex items-center gap-2"><Target className="h-4 w-4 text-cyan-300" /> View Firm Rule Matrix</span><ChevronDown className={`h-4 w-4 text-cyan-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            {expanded && <div className="mt-3 grid gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
              <p><span className="text-slate-500">Daily drawdown:</span> {percent(rules.maxDailyDrawdown)} ({rules.dailyDrawdownType})</p>
              <p><span className="text-slate-500">Total drawdown:</span> {percent(rules.maxTotalDrawdown)} ({rules.totalDrawdownType})</p>
              <p><span className="text-slate-500">News trading:</span> {rules.allowNewsTrading ? "Allowed" : `Blocked within ${rules.newsWindowMinutes} minutes`}</p>
              <p><span className="text-slate-500">Weekend holding:</span> {rules.allowWeekendHolding ? "Allowed" : "Not allowed"}</p>
              <p><span className="text-slate-500">Minimum trading days:</span> {rules.minTradingDays || "None"}</p>
              <p><span className="text-slate-500">Consistency:</span> {rules.consistencyRule && rules.consistencyThreshold !== undefined ? `Single trade max ${(rules.consistencyThreshold * 100).toFixed(1)}%` : "No consistency rule"}</p>
              <p><span className="text-slate-500">Lot cap:</span> {rules.lotSizeCap === null ? "None" : rules.lotSizeCap}</p>
            </div>}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a href={result.firm.affiliateUrl} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-3 py-2.5 text-center text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-indigo-500">Get {result.firm.name} Account ({result.firm.discountPercentage}% Off) <ExternalLink className="h-3.5 w-3.5" /></a>
              <button type="button" onClick={() => onDetails(result)} className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2.5 text-xs font-bold text-slate-200 transition-all hover:border-cyan-500/30 hover:bg-slate-800">View Breach Details</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
