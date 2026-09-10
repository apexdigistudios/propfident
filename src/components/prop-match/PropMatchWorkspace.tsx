"use client";

import { useEffect, useState } from "react";
import EmailCaptureModal from "@/components/EmailCaptureModal";
import { bestModelPerFirm, evaluateAllFirms, type FirmEvaluation } from "@/lib/firm-fit/evaluator";
import { parseTradeExport, type NormalizedTrade } from "@/lib/firm-fit/parser";
import { Dropzone } from "@/app/tools/firm-fit/components/Dropzone";
import { DiagnosticsModal } from "@/app/tools/firm-fit/components/DiagnosticsModal";
import { MatrixGrid } from "@/app/tools/firm-fit/components/MatrixGrid";
import { ShareableCard } from "@/app/tools/firm-fit/components/ShareableCard";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export default function PropMatchWorkspace() {
  const [trades, setTrades] = useState<NormalizedTrade[]>([]);
  const [results, setResults] = useState<FirmEvaluation[]>([]);
  const [selected, setSelected] = useState<FirmEvaluation | null>(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<0 | 1 | 2>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const passedModels = results.filter((result) => result.matchPercentage >= 70 || result.status === "PASSED");
  const failedModels = results.filter((result) => !passedModels.includes(result));
  const matchedFirms = bestModelPerFirm(passedModels);
  const recommendation = [...passedModels].sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
    if (b.model.rules.profit_split_percent !== a.model.rules.profit_split_percent) return b.model.rules.profit_split_percent - a.model.rules.profit_split_percent;
    return (a.model.rules.profit_target_p1_percent ?? 0) - (b.model.rules.profit_target_p1_percent ?? 0);
  })[0] ?? [...failedModels].sort((a, b) => {
    const gapA = Math.max(0, a.userMaxTotalDD - a.model.rules.max_drawdown_percent) + (a.model.rules.daily_drawdown_percent === null ? 0 : Math.max(0, a.userMaxDailyDD - a.model.rules.daily_drawdown_percent));
    const gapB = Math.max(0, b.userMaxTotalDD - b.model.rules.max_drawdown_percent) + (b.model.rules.daily_drawdown_percent === null ? 0 : Math.max(0, b.userMaxDailyDD - b.model.rules.daily_drawdown_percent));
    return gapA - gapB;
  })[0];
  const recommendationIsClosest = passedModels.length === 0 && Boolean(recommendation);
  const maxDailyDD = results[0]?.userMaxDailyDD ?? 0;
  const maxTotalDD = results[0]?.userMaxTotalDD ?? 0;

  const planDailyLimit = recommendation?.model.rules.daily_drawdown_percent ?? recommendation?.model.rules.max_drawdown_percent ?? 0;
  const planAccountSize = recommendation?.model.account_size ?? 100000;
  const dailyCushion = planAccountSize * planDailyLimit / 100;
  const riskPerTrade = dailyCushion / 3;
  const adjustmentPercent = recommendation
    ? Math.min(30, Math.max(0, Math.round((1 - recommendation.model.rules.max_drawdown_percent / Math.max(maxTotalDD, recommendation.model.rules.max_drawdown_percent)) * 100)))
    : 0;

  useEffect(() => {
    if (!isAnalyzing) return;

    const stepTimer = window.setInterval(() => {
      setAnalysisStep((step) => (step < 2 ? (step + 1) as 0 | 1 | 2 : step));
    }, 1200);
    const finishTimer = window.setTimeout(() => setIsAnalyzing(false), 3600);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(finishTimer);
    };
  }, [isAnalyzing]);

  async function handleFile(file: File) {
    const nextTrades = parseTradeExport(await file.text());
    if (!nextTrades.length) throw new Error("No trades found");
    setTrades(nextTrades);
    setResults(evaluateAllFirms(nextTrades));
    setUploadedFileName(file.name);
    setAnalysisStep(0);
    setIsAnalyzing(true);
  }

  function replaceFile() {
    setTrades([]);
    setResults([]);
    setSelected(null);
    setUploadedFileName(null);
    setIsAnalyzing(false);
  }

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-300">Prop Match™</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Find the prop firm that fits your trading.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">Upload your trade history and compare your habits with the rules of leading prop firms.</p>
          <ShimmerButton href="/prop-firms" background="rgba(124, 58, 237, 0.8)" className="mt-6 px-4 py-3 text-xs sm:text-sm">
              View Prop Rules →
          </ShimmerButton>
        </section>
        {matchedFirms.length >= 2 && <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-purple-500/40 bg-purple-500/10 px-5 py-4 text-center text-sm font-semibold text-purple-100 shadow-lg shadow-purple-900/20">🎉 Matched with {matchedFirms.length} Prop Firms! Your strategy is eligible for {matchedFirms.slice(0, 3).map((firm) => firm.firm.name).join(", ")}, and more.</div>}
        <div className="mx-auto mt-10 max-w-3xl">
          {uploadedFileName ? (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-purple-500/30 bg-slate-900/80 px-4 py-3 text-sm shadow-xl shadow-purple-950/20 backdrop-blur-xl">
              <span className="min-w-0 truncate text-slate-200">📄 Active Strategy File: <strong className="font-semibold text-white">{uploadedFileName}</strong></span>
              <button type="button" onClick={replaceFile} className="shrink-0 text-xs font-bold text-purple-300 transition hover:text-white">Replace File</button>
            </div>
          ) : <Dropzone onFile={handleFile} />}
        </div>
        {isAnalyzing && (
          <section className="mx-auto mt-10 max-w-lg rounded-2xl border border-purple-500/30 bg-slate-900/80 p-8 text-center shadow-2xl shadow-purple-950/50 backdrop-blur-2xl" aria-live="polite">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.45)]">
              <div className="absolute h-24 w-24 animate-ping rounded-full border border-purple-400/30" />
              <span className="text-3xl">{analysisStep === 0 ? "📊" : analysisStep === 1 ? "🎯" : "🚀"}</span>
            </div>
            <p className="mt-6 min-h-6 text-sm font-semibold text-purple-200 transition-opacity duration-300">
              {[
                "📊 Parsing Trade Logs & Execution Timestamps...",
                "🎯 Stress-Testing Max DD & Weekend Holding Rules...",
                "🚀 Matching Matrix Against Top Prop Firm Rule Sets...",
              ][analysisStep]}
            </p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-400 to-indigo-400 transition-[width] duration-1000 ease-out" style={{ width: `${((analysisStep + 1) / 3) * 100}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500"><span>Analyzing</span><span>{Math.round(((analysisStep + 1) / 3) * 100)}%</span></div>
          </section>
        )}
        {!isAnalyzing && passedModels.length > 0 ? (
          <section className="mt-12 rounded-3xl border border-purple-900/30 bg-slate-900/70 p-4 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Matched / Passed Models</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Best rule matches</h2><p className="mt-2 text-sm text-slate-400">Compared {trades.length} normalized trades.</p></div><button type="button" onClick={() => setWaitlistOpen(true)} className="min-h-[42px] rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-500/20 sm:px-4 sm:text-sm">Get daily breach alerts</button></div>
            {recommendation && <RecommendationCard recommendation={recommendation} closest={recommendationIsClosest} planDailyLimit={planDailyLimit} dailyCushion={dailyCushion} riskPerTrade={riskPerTrade} adjustmentPercent={adjustmentPercent} />}
            <div className="mt-5"><MatrixGrid results={matchedFirms} onDetails={setSelected} /></div>
            <ShareableCard results={matchedFirms} />
            {failedModels.length > 0 && <FailedModels results={failedModels} onDetails={setSelected} />}
          </section>
        ) : !isAnalyzing && results.length > 0 ? (
          <section className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5 text-center shadow-2xl shadow-amber-950/20 backdrop-blur-2xl sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">⚠️ STRATEGY BREACH DETECTED</p>
            <h2 className="mt-3 text-xl font-black text-white sm:text-2xl">No supported firm model passed this strategy.</h2>
            <div className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
              <p>Your strategy exceeded daily loss caps (Max Daily DD: <strong className="text-amber-200">{maxDailyDD.toFixed(1)}%</strong>).</p>
              <p>Your overall drawdown (Max DD: <strong className="text-amber-200">{maxTotalDD.toFixed(1)}%</strong>) exceeds maximum allowance across all 7 supported firms.</p>
            </div>
            <div className="mt-5 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-left text-sm leading-6 text-purple-100">
              Reduce your lot sizes by 30% or set tighter stop losses to qualify for FTMO, Topstep, or FundedNext.
            </div>
            <ShimmerButton type="button" onClick={replaceFile} background="rgba(124, 58, 237, 0.8)" className="mt-6 w-full max-w-xs px-4 py-3 text-xs sm:text-sm">
              Re-Upload Modified CSV
            </ShimmerButton>
            <div className="mt-8 text-left"><p className="text-xs font-black uppercase tracking-[0.2em] text-rose-300">Failed / Exceeded Models</p><div className="mt-3 space-y-3">{failedModels.map((result) => <div key={`${result.firm.id}-${result.model.account_model}-${result.model.account_size}`} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-200"><strong>{result.firm.name} · {result.model.account_model}</strong>{result.breaches.map((breach) => <p key={breach} className="mt-1">{breach}</p>)}</div>)}</div></div>
          </section>
        ) : <div className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-purple-900/30 bg-slate-900/70 p-4 text-center text-xs text-slate-400 backdrop-blur-xl sm:p-6 sm:text-sm">Your comparison will appear here after you upload a trade export.</div>}
        <EmailCaptureModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} source="prop_match_daily_alerts" />
        <DiagnosticsModal result={selected} trades={trades} onClose={() => setSelected(null)} />
      </div>
    </main>
  );
}

function RecommendationCard({ recommendation, closest, planDailyLimit, dailyCushion, riskPerTrade, adjustmentPercent }: { recommendation: FirmEvaluation; closest: boolean; planDailyLimit: number; dailyCushion: number; riskPerTrade: number; adjustmentPercent: number }) {
  return <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-xl shadow-emerald-950/20 sm:p-5">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">{closest ? "Closest Match - Requires Minor Adjustment" : "Best-Fit Recommended Prop Firm"}</p>
    <h3 className="mt-2 text-xl font-black text-white">{recommendation.firm.name} · {recommendation.model.account_model}</h3>
    <p className="mt-1 text-sm text-emerald-100">{recommendation.matchPercentage}% match · {recommendation.model.rules.profit_split_percent}% profit split · {recommendation.model.rules.max_drawdown_type} max drawdown</p>
    <div className="mt-4 rounded-xl border border-purple-500/20 bg-slate-950/40 p-4 text-sm text-slate-200">
      <p className="font-bold text-purple-200">Recommended Trading Plan</p>
      <p className="mt-2">Max risk per trade: <strong>${riskPerTrade.toFixed(0)}</strong> ({(planDailyLimit / 3).toFixed(2)}% of the account).</p>
      <p className="mt-1">Daily loss cushion: <strong>${dailyCushion.toFixed(0)}</strong> ({planDailyLimit.toFixed(1)}%). Stop trading at this point.</p>
      <p className="mt-1">Target scaling & lot sizing: reduce lots by <strong>{adjustmentPercent}%</strong> when drawdown pressure increases.</p>
      <p className="mt-1 text-purple-100">Action: Reduce daily lot sizes by {Math.max(20, adjustmentPercent)}% to protect the {recommendation.model.account_model} limits.</p>
    </div>
  </div>;
}

function FailedModels({ results, onDetails }: { results: FirmEvaluation[]; onDetails: (result: FirmEvaluation) => void }) {
  return <section className="mt-10 border-t border-amber-500/20 pt-6"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Failed / Exceeded Models</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{results.map((result) => <article key={`${result.firm.id}-${result.model.account_model}-${result.model.account_size}`} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-100"><p className="font-bold text-white">{result.firm.name} · {result.model.account_model}</p>{result.breaches.map((breach) => <p key={breach} className="mt-2">{breach}</p>)}<button type="button" onClick={() => onDetails(result)} className="mt-3 text-amber-300 underline">View details</button></article>)}</div></section>;
}
