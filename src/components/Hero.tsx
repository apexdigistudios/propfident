"use client";

import { ArrowRight, Plug, ShieldCheck, Star, Activity } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import EquityChart from "@/components/EquityChart";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 dark:border-purple-500/20">
      <div className="hero-radial absolute inset-0" aria-hidden="true" />
      <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 text-center md:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-white px-4 py-1.5 text-xs font-semibold text-purple-700 dark:bg-slate-900 dark:text-purple-300">
            <Activity className="h-3.5 w-3.5" strokeWidth={2.5} />
            Live risk protection for funded traders
          </div>

          <h1 className="mt-7 text-4xl font-extrabold leading-[1.06] tracking-tighter text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Never Breach Your Prop Firm Account Again.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg lg:text-xl">
            Monitor your drawdown in real time, calculate position size automatically, and journal every MT4/MT5 trade without manual entry.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <ShimmerButton href="/signup" className="w-full justify-center sm:w-auto">
              <span className="flex items-center gap-2">
                Start Protecting Your Account — Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </ShimmerButton>

            <ShimmerButton
              href="#metaapi"
              background="transparent"
              shimmerColor="rgba(168, 85, 247, 0.4)"
              className="w-full justify-center border border-purple-500/40 bg-white text-purple-700 shadow-none hover:border-purple-500 sm:w-auto dark:border-purple-500/40 dark:bg-slate-900 dark:text-purple-300"
            >
              <span className="flex items-center gap-2">
                <Plug className="h-4 w-4" strokeWidth={2.5} />
                Connect MT4/MT5
              </span>
            </ShimmerButton>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </span>
            <span>Trader count not yet verified</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-400 sm:block" />
            <span>No credit card required</span>
          </div>
        </div>

        <div className="mx-auto mt-12 w-full max-w-5xl md:mt-14">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl dark:border-purple-500/30 dark:bg-slate-900/90">
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-4 md:px-5 dark:border-purple-500/20">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="hidden text-[10px] font-medium text-slate-600 sm:block dark:text-slate-400">
          app.propfident.io / command-center
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      <div className="grid min-w-0 max-w-full gap-4 p-4 md:grid-cols-[180px_1fr] md:p-6">
        <div className="grid min-w-0 max-w-full grid-cols-3 gap-3 md:grid-cols-1">
          <Metric label="Headroom" value="$3,240" accent />
          <Metric label="Daily loss" value="1.8%" />
          <Metric label="Lot size" value="0.42" />
        </div>

        {/* Chart container */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-purple-500/20 dark:bg-slate-900/50">
          <EquityChart />
          <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 text-[10px] text-slate-600 dark:border-purple-500/20 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
            <span className="truncate">
              MetaApi connected · FTMO #40218 · Breach Buffer +$2,450
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-4 dark:border-purple-500/30 dark:bg-slate-900/90">
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label}
      </div>
      <div
        className={`mt-1 text-base font-extrabold tracking-tighter md:text-lg ${
          accent ? "text-gradient-brand" : "text-slate-900 dark:text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
