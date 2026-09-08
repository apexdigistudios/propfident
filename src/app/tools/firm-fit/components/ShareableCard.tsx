"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import type { FirmEvaluation } from "@/lib/firm-fit/evaluator";

export function ShareableCard({ results }: { results: FirmEvaluation[] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [traderName, setTraderName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const displayName = traderName.trim() || "Propfident Trader";
  const topResults = results.slice(0, 3);
  const result = topResults[0];
  const verifiedAt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const consistency = result.maxTradeProfitRatio * 100;

  async function handleDownloadCard() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      await document.fonts.ready;
      const exportWidth = 1200;
      const exportHeight = 675;
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: exportWidth,
        height: exportHeight,
        style: {
          transform: "none",
          width: `${exportWidth}px`,
          height: `${exportHeight}px`,
          borderRadius: "0px",
          overflow: "visible",
        },
        cacheBust: true,
        filter: (node) => !(node as HTMLElement).classList?.contains("no-export"),
      });
      const link = document.createElement("a");
      link.download = `Propfident_Scorecard_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export scorecard PNG:", error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6">
      <label className="block text-sm font-semibold text-slate-200" htmlFor="trader-name">Trader name or handle</label>
      <input id="trader-name" value={traderName} onChange={(event) => setTraderName(event.target.value)} placeholder="Enter Trader Name or Handle" className="mt-2 w-full max-w-md rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500" />
      <div ref={cardRef} className="relative mx-auto mt-4 aspect-[1200/675] w-full max-w-3xl overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-950 p-8 text-white shadow-2xl shadow-purple-950/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/scorecard.png')",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-slate-950/60 backdrop-blur-[2px]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/propfidentlogo.png" alt="Propfident" className="h-8 w-8 object-contain" />
              <span className="truncate text-sm font-bold text-white">{displayName}</span>
            </div>
            <div className="text-right">
              <span className="rounded-full border border-purple-400/40 bg-purple-500/10 px-2 py-1 text-[9px] font-bold tracking-wider text-purple-200">VERIFIED MATCH</span>
              <p className="mt-1 text-[10px] font-bold tracking-[0.14em] text-slate-300">PROP MATCH™ STRATEGY MATRIX</p>
              <p className="text-[9px] text-slate-500">{verifiedAt}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3 py-4 sm:py-6">
            {topResults.map((match) => (
              <div key={match.firm.id} className="grid grid-cols-[auto_7rem_1fr_auto] items-center gap-2 text-xs sm:grid-cols-[auto_9rem_1fr_auto] sm:gap-3">
                <img src={match.firm.logo} alt="" className="h-7 w-7 rounded object-contain" />
                <span className="truncate text-slate-200">{match.firm.name}</span>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${match.matchPercentage}%` }} />
                </div>
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
        <button type="button" disabled={busy} onClick={() => { if (userEmail.trim()) void handleDownloadCard(); else setIsEmailModalOpen(true); }} className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50">
          <Download className="h-4 w-4" /> Download Scorecard (PNG)
        </button>
      </div>
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-slate-950/90 p-6 shadow-2xl shadow-purple-950/50 backdrop-blur-2xl">
            <h2 className="text-xl font-bold text-white">Unlock Your High-Res Scorecard 📊</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Enter your email to download your official Prop Match strategy breakdown and receive weekly prop firm rule updates.</p>
            <form className="mt-5 space-y-3" onSubmit={(event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; try { window.localStorage.setItem("propfident-scorecard-email", userEmail.trim()); } catch { /* Storage may be unavailable in private browsing. */ } setIsEmailModalOpen(false); void handleDownloadCard(); }}>
              <input type="email" required value={userEmail} onChange={(event) => setUserEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-purple-500/20 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none" autoFocus />
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500">Confirm &amp; Download PNG 🚀</button>
            </form>
            <button type="button" onClick={() => setIsEmailModalOpen(false)} className="mt-3 w-full py-2 text-sm text-slate-400 transition hover:text-white">Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}
