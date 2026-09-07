"use client";

import { useState } from "react";
import EmailCaptureModal from "@/components/EmailCaptureModal";
import { evaluateAllFirms, type FirmEvaluation } from "@/lib/firm-fit/evaluator";
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
  const matchedFirms = results.filter((result) => result.matchPercentage >= 80);

  async function handleFile(file: File) {
    const nextTrades = parseTradeExport(await file.text());
    if (!nextTrades.length) throw new Error("No trades found");
    setTrades(nextTrades);
    setResults(evaluateAllFirms(nextTrades));
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
        <div className="mx-auto mt-10 max-w-3xl"><Dropzone onFile={handleFile} /></div>
        {results.length > 0 ? (
          <section className="mt-12 rounded-3xl border border-purple-900/30 bg-slate-900/70 p-4 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Your results</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Best rule matches</h2><p className="mt-2 text-sm text-slate-400">Compared {trades.length} normalized trades.</p></div><button type="button" onClick={() => setWaitlistOpen(true)} className="min-h-[42px] rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-500/20 sm:px-4 sm:text-sm">Get daily breach alerts</button></div>
            <div className="mt-5"><MatrixGrid results={results} onDetails={setSelected} /></div>
            <ShareableCard results={results} />
          </section>
        ) : <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-purple-900/30 bg-slate-900/70 p-6 text-center text-sm text-slate-400 backdrop-blur-xl">Your comparison will appear here after you upload a trade export.</div>}
        <EmailCaptureModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} source="prop_match_daily_alerts" />
        <DiagnosticsModal result={selected} trades={trades} onClose={() => setSelected(null)} />
      </div>
    </main>
  );
}
