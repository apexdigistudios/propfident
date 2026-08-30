"use client";

import { Check } from "lucide-react";
import { MagicCard } from "@/components/magicui/magic-card";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { pricingTiers } from "@/lib/constants/pricing";

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 border-b border-slate-200 bg-white py-16 md:py-24 dark:border-purple-500/20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Always free to start</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">Powerful Risk Protection, Free Forever</h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg dark:text-slate-400">Get started with manual account tracking, live drawdown monitoring, and AI-powered risk strategies at no cost.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-lg gap-6 md:mt-14 md:gap-7 lg:max-w-2xl lg:grid-cols-2">
          <MagicCard
            gradientSize={200}
            gradientColor="#4f46e5"
            className="rounded-3xl border border-purple-500 bg-white shadow-lg shadow-purple-500/10 p-6 md:p-8 dark:border-purple-500/60 dark:bg-slate-900/90"
          >
            <span className="rounded-full bg-gradient-brand px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white">Free Forever</span>
            <h3 className="mt-4 text-2xl font-extrabold tracking-tighter text-purple-600 dark:text-purple-400">Free Plan</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Everything you need to protect and optimize your prop trading account.</p>
            <div className="my-7 flex items-end gap-2 border-b border-slate-200 pb-7 dark:border-purple-500/20"><span className="text-5xl font-extrabold tracking-tighter text-slate-900 dark:text-white">$0</span><span className="pb-1 text-sm text-slate-600 dark:text-slate-400">/ month</span></div>
            <ul className="flex-1 space-y-4">
              {pricingTiers[0].features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10"><Check className="h-3 w-3 text-purple-500" strokeWidth={3} /></span>{feature}</li>)}
            </ul>
            <div className="mt-8">
              <ShimmerButton href="/dashboard" className="w-full justify-center">
                Launch Dashboard
              </ShimmerButton>
            </div>
          </MagicCard>
          <div className="rounded-3xl border border-slate-300 bg-slate-50 p-6 md:p-8 dark:border-purple-500/20 dark:bg-slate-900/50 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Pro &amp; Unlimited</h3>
              <h4 className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Coming Soon</h4>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">We are actively expanding Propfident. Paid tiers featuring real-time AI trade coaching, multi-account sync, and deep risk telemetry will unlock soon.</p>
              <ul className="mt-6 flex-1 space-y-3">
                <li className="flex gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-purple-400">✓</span> Multi-account MetaApi sync</li>
                <li className="flex gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-purple-400">✓</span> Real-time AI trade coaching</li>
                <li className="flex gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-purple-400">✓</span> Advanced risk telemetry</li>
                <li className="flex gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-purple-400">✓</span> Priority support</li>
              </ul>
            </div>
            <button type="button" disabled className="mt-8 w-full rounded-xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-bold text-slate-500 transition dark:border-purple-500/20 dark:bg-slate-800 dark:text-slate-400" title="Coming soon">
              Stay Tuned
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
