"use client";

import { useEffect, useState } from "react";
import EmailCaptureModal from "@/components/EmailCaptureModal";
import { bestModelPerFirm, evaluateAllFirms, type FirmEvaluation } from "@/lib/firm-fit/evaluator";
import { parseTradeExport, type NormalizedTrade } from "@/lib/firm-fit/parser";
import { Dropzone } from "@/app/tools/firm-fit/components/Dropzone";
import { DiagnosticsModal } from "@/app/tools/firm-fit/components/DiagnosticsModal";
import { MatrixGrid } from "@/app/tools/firm-fit/components/MatrixGrid";
import { ShareableCard } from "@/app/tools/firm-fit/components/ShareableCard";

export default function PropMatchWorkspace() {
  const [trades, setTrades] = useState<NormalizedTrade[]>([]);
  const [results, setResults] = useState<FirmEvaluation[]>([]);
  const [selected, setSelected] = useState<FirmEvaluation | null>(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<0 | 1 | 2>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const matchedFirms = bestModelPerFirm(results);

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
        {!isAnalyzing && matchedFirms.length > 0 ? (
          <section className="mt-12 rounded-3xl border border-purple-900/30 bg-slate-900/70 p-4 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Your results</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Best rule matches</h2><p className="mt-2 text-sm text-slate-400">Compared {trades.length} normalized trades.</p></div><button type="button" onClick={() => setWaitlistOpen(true)} className="min-h-[42px] rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-500/20 sm:px-4 sm:text-sm">Get daily breach alerts</button></div>
            <div className="mt-5"><MatrixGrid results={matchedFirms} onDetails={setSelected} /></div>
            <ShareableCard results={matchedFirms} />
          </section>
        ) : <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-purple-900/30 bg-slate-900/70 p-6 text-center text-sm text-slate-400 backdrop-blur-xl">Your comparison will appear here after you upload a trade export.</div>}
        <EmailCaptureModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} source="prop_match_daily_alerts" />
        <DiagnosticsModal result={selected} trades={trades} onClose={() => setSelected(null)} />
      </div>
    </main>
  );
}
