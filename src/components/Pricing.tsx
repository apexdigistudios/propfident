"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { MagicCard } from "@/components/magicui/magic-card";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import PricingComparison from "@/components/PricingComparison";

const tiers = [
  { name: "Free", description: "Start protecting one evaluation account.", monthly: 0, yearly: 0, cta: "Protect Your First Account — Free", features: ["Manual trade journal", "Dynamic lot calculator", "Static drawdown tracking", "Community support"] },
  { name: "Pro", description: "Automated protection for funded traders.", monthly: 25, yearly: 20, cta: "Start 7-day trial", recommended: true, features: ["1 MT4/MT5 MetaApi connection", "Live trailing drawdown shield", "Automated trade journal", "Telegram & email alerts", "Advanced performance metrics"] },
  { name: "Elite", description: "Multi-account control for scaling traders.", monthly: 50, yearly: 40, cta: "Choose Elite", features: ["Up to 10 MT4/MT5 connections", "Cross-account risk controls", "Advanced expectancy analytics", "Priority breach alerts", "24/7 priority support"] },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="scroll-mt-20 border-b border-slate-200 bg-white py-16 md:py-24 dark:border-purple-500/20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Plans that scale with you</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg dark:text-slate-400">Protect your first account for free. Upgrade when your funded portfolio grows.</p>
        </div>
        <div className="mt-10 flex justify-center">
          <div className="relative flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-purple-500/30 dark:bg-slate-900" role="group" aria-label="Billing interval">
            {([false, true] as const).map((value) => <button key={String(value)} type="button" aria-pressed={annual === value} onClick={() => setAnnual(value)} className={`w-24 rounded-full px-4 py-2 text-sm font-bold transition md:w-28 ${annual === value ? "bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>{value ? "Yearly" : "Monthly"}</button>)}
            <span className="absolute -right-4 -top-4 rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase text-emerald-600 md:-right-7 dark:text-emerald-400">Save 20%</span>
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-md gap-6 md:mt-14 md:gap-7 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <MagicCard
              key={tier.name}
              gradientSize={200}
              gradientColor="#4f46e5"
              className={`min-h-[520px] rounded-3xl border p-6 shadow-lg md:p-8 ${tier.recommended ? "border-purple-500 bg-white shadow-purple-500/10 dark:border-purple-500/60 dark:bg-slate-900/90" : "border-slate-200 bg-white dark:border-purple-500/30 dark:bg-slate-900/90"}`}
            >
              {tier.recommended && <span className="absolute right-6 top-6 rounded-full bg-gradient-brand px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white">Recommended</span>}
              <h3 className={`text-xl font-extrabold tracking-tighter ${tier.recommended ? "text-purple-600 dark:text-purple-400" : "text-slate-900 dark:text-white"}`}>{tier.name}</h3>
              <p className="mt-3 min-h-10 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{tier.description}</p>
              {tier.recommended && <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">7-day free trial. Cancel anytime.</p>}
              <div className="my-7 flex items-end gap-2 border-b border-slate-200 pb-7 dark:border-purple-500/20"><span className="text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl dark:text-white">${annual ? tier.yearly : tier.monthly}</span><span className="pb-1 text-sm text-slate-600 dark:text-slate-400">/ month</span></div>
              <ul className="flex-1 space-y-4">
                {tier.features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10"><Check className="h-3 w-3 text-purple-500" strokeWidth={3} /></span>{feature}</li>)}
              </ul>
              <div className="mt-8">
                <ShimmerButton
                  href="/signup"
                  className={`w-full justify-center ${!tier.recommended ? "!bg-slate-100 text-slate-900 shadow-none hover:bg-slate-200 dark:!bg-slate-800 dark:text-white" : ""}`}
                  background={tier.recommended ? undefined : "transparent"}
                >
                  {tier.cta}
                </ShimmerButton>
              </div>
            </MagicCard>
          ))}
        </div>
        <PricingComparison />
      </div>
    </section>
  );
}
