import { Check } from "lucide-react";
import { pricingTiers } from "@/lib/constants/pricing";

export default function PricingComparison() {
  return (
    <div className="mt-16 md:mt-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Included in Free Plan</span>
        <h3 className="mt-3 text-2xl font-extrabold tracking-tighter text-slate-900 dark:text-white sm:text-3xl">Everything You Need to Get Started</h3>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white dark:border-purple-500/20 dark:bg-slate-900/50 p-6 md:p-8">
        <ul className="grid gap-4 md:grid-cols-2">
          {pricingTiers[0].features.map((feature) => (
            <li key={feature} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10"><Check className="h-4 w-4 text-purple-500" strokeWidth={3} /></span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
        Start free today. Advanced features including AI trade coaching and multi-account sync coming soon.
      </p>
    </div>
  );
}