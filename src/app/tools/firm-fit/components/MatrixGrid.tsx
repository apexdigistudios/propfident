"use client";

import { ExternalLink, ChevronDown, Target } from "lucide-react";
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useState } from "react";
import type { FirmEvaluation } from "@/lib/firm-fit/evaluator";

interface MatrixGridProps {
  results: FirmEvaluation[];
  recommendedId?: string;
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

export function MatrixGrid({ results, recommendedId, onDetails }: MatrixGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid max-w-full gap-3.5 overflow-x-hidden md:grid-cols-2 lg:grid-cols-3 sm:gap-4">
      {results.map((result) => {
        const { rules } = result.firm;
        const limit = rules.maxTotalDrawdown * 100;
        const gauge = Math.min(100, (result.userMaxTotalDD / Math.max(limit, 0.01)) * 100);
        const expanded = expandedId === result.firm.id;

        return (
          <article key={result.firm.id} className={`min-w-0 rounded-2xl border bg-slate-900/70 p-2.5 shadow-xl backdrop-blur-xl transition-all duration-300 sm:p-3.5 ${result.firm.id === recommendedId ? "border-purple-500/50 shadow-purple-900/30" : "border-purple-900/30 shadow-indigo-950/20 hover:border-purple-500/40"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <Link href={`/prop-firms#${result.firm.id}`} className="flex h-5 w-5 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 p-0.5 text-lg font-black text-purple-300 sm:h-6 sm:w-6">
                    <img src={result.firm.logo} alt={`${result.firm.name} logo`} className="h-full w-full object-contain" />
                  </Link>
                  <div>
                    <div className="flex items-center gap-2"><Link href={`/prop-firms#${result.firm.id}`} className="text-base font-bold text-white transition hover:text-purple-300 sm:text-lg">{result.firm.name}</Link>{result.firm.id === recommendedId && <span className="rounded-full border border-purple-400/40 bg-purple-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-200">Recommended</span>}</div>
                    <p className="mt-1 text-xs text-purple-300">{result.model.account_model} · ${result.model.account_size.toLocaleString()}</p>
                  </div>
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
              {result.breaches.slice(0, 3).map((breach) => <span key={breach} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">{breach.includes("Weekend") ? "Weekend Holding Violation" : breach.includes("Consistency") ? "Consistency Warning" : "Drawdown Risk"}</span>)}
            </div>
            <button type="button" onClick={() => setExpandedId(expanded ? null : result.firm.id)} aria-expanded={expanded} className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-left text-sm font-bold text-slate-200 transition-all hover:border-purple-500/40 hover:bg-slate-800">
              <span className="flex items-center gap-2"><Target className="h-4 w-4 text-purple-300" /> View Prop Match Rule Matrix</span><ChevronDown className={`h-4 w-4 text-purple-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            {expanded && <div className="mt-3 grid gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
              <p><span className="text-slate-500">Daily drawdown:</span> {rules.maxDailyDrawdown === null ? "No limit supplied" : `${percent(rules.maxDailyDrawdown)} (${rules.dailyDrawdownType})`}</p>
              <p><span className="text-slate-500">Total drawdown:</span> {percent(rules.maxTotalDrawdown)} ({rules.totalDrawdownType})</p>
              <p><span className="text-slate-500">Max DD strictness:</span> <strong className={result.drawdownStrictness === "trailing" ? "text-amber-300" : "text-emerald-300"}>{result.drawdownStrictness}</strong></p>
              <p><span className="text-slate-500">News trading:</span> {rules.allowNewsTrading ? "Allowed" : `Blocked within ${rules.newsWindowMinutes} minutes`}</p>
              <p><span className="text-slate-500">Weekend holding:</span> {rules.allowWeekendHolding ? "Allowed" : "Not allowed"}</p>
              <p><span className="text-slate-500">Minimum trading days:</span> {rules.minTradingDays || "None"}</p>
              <p><span className="text-slate-500">Consistency:</span> {rules.consistencyRule && rules.consistencyThreshold !== undefined ? `Single trade max ${(rules.consistencyThreshold * 100).toFixed(1)}%` : "No consistency rule"}</p>
              <p><span className="text-slate-500">Lot cap:</span> {rules.lotSizeCap === null ? "None" : rules.lotSizeCap}</p>
            </div>}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {result.matchPercentage >= 70 && <ShimmerButton href={result.firm.affiliateUrl} target="_blank" rel="noopener noreferrer" background="rgba(124, 58, 237, 0.8)" className="min-h-[42px] flex-1 px-3 py-2 text-xs sm:text-sm">Claim Special Discount at {result.firm.name} → <ExternalLink className="h-3.5 w-3.5" /></ShimmerButton>}
              <button type="button" onClick={() => onDetails(result)} className="min-h-[42px] rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-xs font-bold text-slate-200 transition-all hover:border-purple-500/40 hover:bg-slate-800 sm:text-sm">View Breach Details</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
