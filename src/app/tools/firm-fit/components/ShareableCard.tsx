"use client";

import { useRef, useState } from "react";
import { Copy, Download, ExternalLink, Shield, Target, Timer, Zap } from "lucide-react";
import { toPng } from "html-to-image";
import type { FirmEvaluation } from "@/lib/firm-fit/evaluator";

export function ShareableCard({ result, tradeCount = 0 }: { result: FirmEvaluation; tradeCount?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [traderName, setTraderName] = useState("");

  const displayName = traderName.trim() || "Propfident Trader";
  const verifiedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const strategyFingerprint = result.maxTradeProfitRatio > 0.5
    ? "High-Impact Winner"
    : result.userMaxDailyDD <= 2
      ? "Strict Risk Disciplined"
      : tradeCount >= 40
        ? "High-Frequency Scalper"
        : "Swing Trader";
  const dailyLimit = result.firm.rules.maxDailyDrawdown * 100;
  const totalLimit = result.firm.rules.maxTotalDrawdown * 100;
  const consistency = result.maxTradeProfitRatio * 100;
  const tweetCopy = `My trading strategy scored a ${result.matchPercentage}% Pass Probability match for ${result.firm.name} on Propfident! Check your strategy rules for free:`;

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

  function shareToX() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetCopy)}&url=${encodeURIComponent("https://propfident.online/tools/prop-match")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyShareLink() {
    await navigator.clipboard.writeText("https://propfident.online/tools/prop-match");
  }

  return (
    <section className="mt-6">
      <label className="block text-sm font-semibold text-slate-200" htmlFor="trader-name">Trader name or handle</label>
      <input id="trader-name" value={traderName} onChange={(event) => setTraderName(event.target.value)} placeholder="Enter Trader Name or Handle" className="mt-2 w-full max-w-md rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500" />
      <div ref={cardRef} className="mx-auto mt-4 w-full max-w-md overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 via-slate-950 to-slate-950 p-5 text-white shadow-2xl shadow-purple-950/30">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-950/70 p-1.5 ring-1 ring-purple-500/40"><img src="/propfidentlogo.png" alt="Propfident" className="h-full w-full object-contain" /></span><span className="rounded-full border border-purple-400/40 bg-purple-500/10 px-2 py-1 text-[9px] font-bold tracking-wider text-purple-200">VERIFIED MATCH</span><img src={result.firm.logo} alt={result.firm.name} className="h-9 w-9 rounded-xl object-contain" /></div>
            <p className="col-span-3 text-center text-xs font-bold tracking-[0.18em] text-slate-300 sm:text-sm">PROP MATCH™ SCORECARD</p>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[1.05fr_1fr] items-center gap-5 py-4 sm:gap-10 sm:py-6">
            <div><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Trader</p><p className="mt-1 truncate text-xl font-bold sm:text-3xl">{displayName}</p><p className="mt-2 text-[10px] text-slate-500 sm:text-xs">Verified {verifiedAt}</p><span className="mt-5 inline-flex rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-200 sm:text-xs">{strategyFingerprint}</span></div>
            <div className="col-span-2 flex flex-col items-center gap-4"><div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full border-8 border-purple-500/50 bg-slate-950 shadow-xl shadow-purple-500/50"><span className="text-5xl font-black text-purple-300">{result.matchPercentage}%</span><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pass Probability</span></div><div className="grid w-full grid-cols-2 gap-2 text-[10px]"><p className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-2 text-slate-300"><Shield className="mb-1 h-3.5 w-3.5 text-purple-300" />Max DD Recorded<br /><b>{result.userMaxTotalDD.toFixed(1)}% / {totalLimit.toFixed(1)}%</b></p><p className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-2 text-slate-300"><Zap className="mb-1 h-3.5 w-3.5 text-purple-300" />Consistency Rating<br /><b>{Math.max(0, 100 - consistency).toFixed(0)}% Smooth</b></p><p className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-2 text-slate-300"><Timer className="mb-1 h-3.5 w-3.5 text-purple-300" />News / Weekend Safety<br /><b>{result.breaches.some((breach) => breach.includes("Weekend") || breach.includes("news")) ? "Review" : "Pass"}</b></p><p className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-2 text-slate-300"><Target className="mb-1 h-3.5 w-3.5 text-purple-300" />Recommended Firm<br /><b className="truncate">{result.firm.name}</b></p></div></div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[9px] text-slate-500 sm:text-xs"><span>Validated at propfident.online/tools/prop-match</span><span className="font-black tracking-[0.18em] text-purple-400/70">RULES FIRST</span></div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => void downloadCard()} className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 sm:text-sm"><Download className="h-4 w-4" /> Download Scorecard Image</button><button type="button" onClick={() => void copyShareLink()} className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-800 sm:text-sm"><Copy className="h-4 w-4" /> Copy Share Link</button></div>
    </section>
  );
}
