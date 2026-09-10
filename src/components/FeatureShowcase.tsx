"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Sparkles, Check, Target, UploadCloud } from "lucide-react";
import Reveal from "./Reveal";
import DrawdownShieldVisual from "./features/DrawdownShieldVisual";
import LotCalculatorVisual from "./features/LotCalculatorVisual";
import JournalVisual from "./features/JournalVisual";
import MetaApiVisual from "./features/MetaApiVisual";

type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  Visual: () => ReactElement;
  badge?: string;
  href?: string;
};

function FirmFitVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-purple-900/30 bg-slate-900/70 p-5 shadow-2xl shadow-purple-950/30 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(99,102,241,0.2),transparent_40%)]" />
      <div className="relative flex h-full flex-col justify-between gap-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">Prop Match™</p>
              <p className="mt-1 text-xs text-slate-400">Pass-probability scan</p>
            </div>
          </div>
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-300">New Feature</span>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-center gap-5">
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-8 border-purple-400/80 bg-slate-950 shadow-[0_0_35px_rgba(168,85,247,0.35),0_0_0_4px_rgba(99,102,241,0.25)]">
            <span className="text-3xl font-black text-white">92%</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">best match</span>
          </div>
          <div className="space-y-3">
            {["FTMO", "FundingPips", "Topstep"].map((firm, index) => (
              <div key={firm}>
                <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-300"><span>{firm}</span><span>{92 - index * 11}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500" style={{ width: `${92 - index * 11}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-300">
          <UploadCloud className="h-4 w-4 shrink-0 text-purple-300" /> Upload your history. Compare the rules.
        </div>
      </div>
    </div>
  );
}

const features: Feature[] = [
  {
    id: "prop-match",
    eyebrow: "✨ PROP MATCH™ ENGINE • 100% FREE",
    title: "Prop Match™",
    description:
      "Upload your MT4/MT5 trading history to instantly test your drawdown, lot sizes, and holding rules against FTMO, FundingPips, Topstep, and more—before spending a dime on a challenge.",
    bullets: [
      "🛡️ Drawdown & Rule Stress-Testing",
      "📊 Real-Time Pass Probability %",
      "⚡ Custom Shareable Scorecard",
    ],
    Visual: FirmFitVisual,
    badge: "New Feature",
    href: "/tools/prop-match",
  },
  {
    id: "drawdown-shield",
    eyebrow: "Real-time Trailing Drawdown Shield",
    title: "See your breach buffer before it disappears.",
    description:
      "A live visual gauge shows exactly how much drawdown headroom you have left before hitting your prop firm's trailing limit. The floor updates in real time as your balance climbs — so you always know your true danger zone.",
    bullets: [
      "Live trailing & static drawdown tracking",
      "Instant breach-warning alerts at custom thresholds",
      "Supports major prop-firm drawdown models.",
    ],
    Visual: DrawdownShieldVisual,
  },
  {
    id: "lot-calculator",
    eyebrow: "Dynamic Lot Size & Risk Calculator",
    title: "Perfect position sizing, calculated instantly.",
    description:
      "Enter your risk %, account capital, and stop-loss distance in pips — Propfident returns the exact lot size to trade. No spreadsheets, no mental math, no accidental over-leverage.",
    bullets: [
      "Precise lot sizing across FX, metals & indices",
      "Adjusts to your live balance automatically",
      "Keeps every trade inside your risk plan",
    ],
    Visual: LotCalculatorVisual,
  },
  {
    id: "journal",
    eyebrow: "Hands-Free Trade Journaling",
    title: "A journal that writes itself, trade by trade.",
    description:
      "Every closed position is auto-logged with entry, exit, RR ratio, and session tags. Watch your win rate, profit factor, and execution metrics build automatically — zero manual entry required.",
    bullets: [
      "Auto-tagged trades with RR & execution stats",
      "Win-rate, profit-factor & expectancy analytics",
      "Session & setup breakdowns to find your edge",
    ],
    Visual: JournalVisual,
  },
  {
    id: "metaapi",
    eyebrow: "MT4 & MT5 MetaApi Integration",
    title: "Connect your broker once. Never type a trade again.",
    description:
      "Propfident links directly to your MT4 or MT5 account through MetaApi. Trades sync the instant they close, feeding your drawdown shield, journal, and analytics in real time — completely hands-free.",
    bullets: [
      "Direct MT4 / MT5 sync via MetaApi",
      "Read-only investor credentials — no withdrawal access",
      "Real-time import the moment a trade closes",
    ],
    Visual: MetaApiVisual,
  },
];

export default function FeatureShowcase() {
  return (
    <section
      id="features"
      className="scroll-mt-28 w-full max-w-full overflow-hidden border-b border-slate-200 bg-white dark:border-purple-500/20 dark:bg-slate-950"
    >
      <div className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-16 md:px-6 md:py-24 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            Everything a funded trader needs
          </div>
          <h2 className="text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Four tools. One risk-control workflow.
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg dark:text-slate-400">
            Protect your account, size every trade correctly, and let your
            journal build itself — all synced live from your broker.
          </p>
        </div>

        {/* Alternating rows */}
        <div className="flex w-full min-w-0 max-w-full flex-col gap-16 overflow-hidden md:gap-24 lg:gap-32">
          {features.map((feature, idx) => {
            const reversed = idx % 2 === 1;
            return (
              <Reveal key={feature.id} delay={0.05}>
                <div
                  id={feature.id}
                  className="flex w-full min-w-0 max-w-full scroll-mt-24 flex-col items-center gap-8 overflow-hidden md:gap-10 lg:grid lg:grid-cols-2 lg:gap-16"
                >
                  {/* Visual */}
                  <div className={`w-full max-w-full ${reversed ? "lg:order-2" : ""}`}>
                    <div className="relative aspect-[5/4] w-full max-w-full overflow-hidden">
                      <feature.Visual />
                    </div>
                  </div>

                  {/* Text */}
                  <div className={`w-full ${reversed ? "lg:order-1" : ""}`}>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                      <span className="inline-block h-px w-8 bg-gradient-brand" />
                      {feature.eyebrow}
                      {feature.badge && <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] tracking-[0.14em] text-purple-600 shadow-lg shadow-purple-500/20 dark:text-purple-300">{feature.badge}</span>}
                    </div>
                    <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tighter text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400 lg:text-lg">
                      {feature.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {feature.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 lg:text-base">
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/15">
                            <Check className="h-3 w-3 text-purple-500" strokeWidth={3} />
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                    {feature.href && (
                      <Link href={feature.href} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center justify-center rounded-xl border border-purple-400/30 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all duration-300 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/40">
                        Run Free Strategy Match →
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
