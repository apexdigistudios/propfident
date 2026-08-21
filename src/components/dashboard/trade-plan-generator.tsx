"use client";

import { FormEvent, useState } from "react";
import { Copy, Lock, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

type Plan = {
  dailyRiskLimit: string;
  lotSizes: string;
  goldenRules: string;
  executionSchedule: string;
};

type Snapshot = {
  accountBalance: number;
  equity: number;
  freeMargin: number;
  currency: string;
  pair: string;
  pairPrice: number | null;
  maxDailyRisk: number;
  lotSize: number;
};

const inputClass = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40";
const labelClass = "text-xs font-semibold uppercase tracking-wider text-slate-400";

export function TradePlanGenerator({ isFreeTier }: { isFreeTier: boolean }) {
  const [strategy, setStrategy] = useState("Day Trading");
  const [rules, setRules] = useState("5% Daily Loss, 10% Max Drawdown, Profit Target");
  const [personalPlan, setPersonalPlan] = useState("Maximum 5 trades per day, EURUSD and GBPUSD, 0.5% risk per trade");
  const [riskPercent, setRiskPercent] = useState("0.5");
  const [stopLossPips, setStopLossPips] = useState("20");
  const [pair, setPair] = useState("EURUSD");
  const [pipValue, setPipValue] = useState("10");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch("/api/ai/trade-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy, rules, personalPlan, riskPercent: Number(riskPercent), stopLossPips: Number(stopLossPips), pair, pipValue: Number(pipValue) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to generate your plan.");
      setPlan(result.plan);
      setSnapshot(result.snapshot);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to generate your plan.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPlan() {
    if (!plan) return;
    await navigator.clipboard.writeText([
      `Daily Risk Limit\n${plan.dailyRiskLimit}`,
      `Recommended Lot Sizes\n${plan.lotSizes}`,
      `Golden Rules\n${plan.goldenRules}`,
      `Execution Schedule\n${plan.executionSchedule}`,
    ].join("\n\n"));
    setCopied(true);
  }

  if (isFreeTier) {
    return <div className="mx-auto w-full max-w-4xl rounded-2xl border border-purple-500/30 bg-slate-900/80 p-10 text-center shadow-2xl shadow-black/20 md:p-16"><Lock className="mx-auto h-12 w-12 text-purple-400" /><h1 className="mt-5 text-3xl font-bold text-white">Trade Assist V2 is locked</h1><p className="mx-auto mt-3 max-w-xl text-slate-400">Upgrade from the Free plan to build practical trading plans with risk limits and lot-size guidance.</p><Link href="/pricing" className="mt-8 inline-flex rounded-xl bg-gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:brightness-110">Upgrade to unlock</Link></div>;
  }

  return <div className="mx-auto w-full max-w-5xl space-y-8"><header><p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Trade Assist V2</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">AI Trading Plan Generator</h1><p className="mt-2 text-sm text-slate-400">Turn your prop firm rules and personal risk plan into a clear execution guide.</p></header>
    {snapshot && <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-300"><span>Live Market &amp; Account Snapshot</span><span>Equity: {snapshot.equity.toLocaleString()} {snapshot.currency}</span><span>{snapshot.pair}: {snapshot.pairPrice?.toFixed(5) || "Unavailable"}</span><span>Max Safe Lot Size: {snapshot.lotSize.toFixed(2)}</span></div>}
    <form onSubmit={generate} className="rounded-2xl border border-purple-500/20 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 md:p-8"><div className="grid gap-6 md:grid-cols-2"><label className={labelClass}>Trading Strategy<select value={strategy} onChange={(event) => setStrategy(event.target.value)} className={inputClass}><option>Scalping</option><option>Day Trading</option><option>Swing Trading</option><option>Breakouts</option></select></label><label className={labelClass}>Pair / Asset<input value={pair} onChange={(event) => setPair(event.target.value.toUpperCase())} className={inputClass} /></label><label className={labelClass}>Risk Per Trade (%)<input value={riskPercent} onChange={(event) => setRiskPercent(event.target.value)} type="number" min="0.01" max="10" step="0.01" className={inputClass} /></label><label className={labelClass}>Stop Loss (Pips)<input value={stopLossPips} onChange={(event) => setStopLossPips(event.target.value)} type="number" min="1" step="1" className={inputClass} /></label><label className={labelClass}>Pip Value ($ / Lot)<input value={pipValue} onChange={(event) => setPipValue(event.target.value)} type="number" min="0.01" step="0.01" className={inputClass} /></label></div><label className={`mt-6 block ${labelClass}`}>Prop Firm Rules &amp; Objectives<textarea value={rules} onChange={(event) => setRules(event.target.value)} rows={4} className={inputClass} /></label><label className={`mt-6 block ${labelClass}`}>Personal Risk Tolerance &amp; Plan<textarea value={personalPlan} onChange={(event) => setPersonalPlan(event.target.value)} rows={4} className={inputClass} /></label><div className="mt-6 flex flex-wrap items-center gap-4"><ShimmerButton type="submit" disabled={loading} className="px-5 py-2.5 text-sm"><Sparkles className="mr-2 h-4 w-4" />{loading ? "Building plan..." : "Generate plan"}</ShimmerButton>{plan && <button type="button" onClick={() => generate()} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"><RefreshCw className="h-4 w-4" />Regenerate</button>}</div>{error && <p className="mt-4 text-sm text-rose-400">{error}</p>}</form>
    {plan && <section className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-6 shadow-2xl shadow-black/30 md:p-8"><div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Your execution plan</p><h2 className="mt-1 text-2xl font-bold text-white">Trade with a clear edge</h2></div><button type="button" onClick={copyPlan} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy plan"}</button></div><div className="mt-6 grid gap-6 md:grid-cols-2"><PlanSection title="Daily Risk Limit" content={plan.dailyRiskLimit} /><PlanSection title="Recommended Lot Sizes" content={plan.lotSizes} /><PlanSection title="Golden Rules" content={plan.goldenRules} /><PlanSection title="Execution Schedule" content={plan.executionSchedule} /></div></section>}
  </div>;
}

function PlanSection({ title, content }: { title: string; content: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="text-sm font-bold text-purple-300">{title}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">{content}</p></div>;
}
