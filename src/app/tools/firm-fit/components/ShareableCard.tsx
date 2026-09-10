"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import type { FirmEvaluation } from "@/lib/firm-fit/evaluator";

export function ShareableCard({ results }: { results: FirmEvaluation[] }) {
  const [busy, setBusy] = useState(false);
  const [traderName, setTraderName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const displayName = traderName.trim() || "Propfident Trader";
  const topThreeFirms = results.filter((firm) => firm.matchPercentage >= 70).sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
  const result = topThreeFirms[0] || results[0];
  const verifiedAt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const consistency = result.maxTradeProfitRatio * 100;

  async function handleDownloadCard() {
    setBusy(true);
    try {
      const response = await fetch("/api/scorecard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxDrawdown: result.userMaxTotalDD,
          dailyDrawdown: result.userMaxDailyDD,
          passRate: Math.round(topThreeFirms.reduce((sum, firm) => sum + firm.matchPercentage, 0) / Math.max(topThreeFirms.length, 1)),
          topFirms: topThreeFirms.map((firm) => ({
            firm_name: firm.firm.name,
            account_model: firm.model.account_model,
            logo: firm.firm.logo,
            matchPercentage: firm.matchPercentage,
          })),
        }),
      });
      if (!response.ok) throw new Error("Scorecard download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Propfident_Scorecard_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
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
      <div className="relative mx-auto mt-4 aspect-[1200/675] w-full max-w-3xl overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-950 p-8 text-white shadow-2xl shadow-purple-950/30">
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
            {topThreeFirms.map((match) => (
              <div key={match.firm.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_minmax(3rem,0.8fr)_auto] items-center gap-2.5 rounded-xl px-3 py-1.5 text-xs font-semibold sm:text-sm">
                <Link href={`/prop-firms#${match.firm.id}`} className="contents">
                  <img
                    src={match.firm.logo}
                    alt={`${match.firm.name} logo`}
                    className="h-6 w-6 rounded object-contain sm:h-7 sm:w-7"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                  <span className="truncate text-slate-200 transition hover:text-purple-300">{match.firm.name} · {match.model.account_model}</span>
                </Link>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
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
        <ShimmerButton type="button" disabled={busy} onClick={() => { if (userEmail.trim()) void handleDownloadCard(); else setIsEmailModalOpen(true); }} background="rgba(124, 58, 237, 0.8)" className="w-full px-4 py-3 text-xs sm:w-auto sm:text-sm">
          <Download className="h-4 w-4" /> Download Scorecard (PNG)
        </ShimmerButton>
      </div>
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-slate-950/90 p-6 shadow-2xl shadow-purple-950/50 backdrop-blur-2xl">
            <h2 className="text-xl font-bold text-white">Unlock Your High-Res Scorecard 📊</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Enter your email to download your official Prop Match strategy breakdown and receive weekly prop firm rule updates.</p>
            <form className="mt-5 space-y-3" onSubmit={(event) => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; try { window.localStorage.setItem("propfident-scorecard-email", userEmail.trim()); } catch { /* Storage may be unavailable in private browsing. */ } setIsEmailModalOpen(false); void handleDownloadCard(); }}>
              <input type="email" required value={userEmail} onChange={(event) => setUserEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-purple-500/20 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none" autoFocus />
              <ShimmerButton type="submit" background="rgba(124, 58, 237, 0.8)" className="w-full px-4 py-3.5 text-sm">Confirm &amp; Download PNG 🚀</ShimmerButton>
            </form>
            <button type="button" onClick={() => setIsEmailModalOpen(false)} className="mt-3 w-full py-2 text-sm text-slate-400 transition hover:text-white">Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}
