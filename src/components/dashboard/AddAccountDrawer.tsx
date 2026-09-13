"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const accountTypes = ["Instant Evaluation", "2-Step Challenge", "Manual Metric Entry"];

export function AddAccountDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState(accountTypes[0]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Add trading account">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" aria-label="Close account drawer" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 w-full max-w-md border-l border-purple-200 bg-white p-5 shadow-2xl shadow-slate-950/30 dark:border-purple-500/20 dark:bg-slate-950 sm:p-7">
        <div className="flex items-center justify-between"><div><p className="font-mono text-xs text-purple-700 dark:text-purple-300">ACCOUNT_SETUP / 0{step}</p><h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Add account</h2></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5" aria-label="Close"><X className="h-5 w-5" /></button></div>
        {step === 1 ? <div className="mt-8 space-y-3">{accountTypes.map((type) => <button key={type} type="button" onClick={() => setAccountType(type)} className={`flex min-h-14 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-semibold transition ${accountType === type ? "border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-500/10 dark:text-purple-200" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}>{type}<span className="font-mono text-xs text-slate-400">SELECT</span></button>)}<Button type="button" className="mt-5 w-full" onClick={() => setStep(2)}>Continue</Button></div> : <div className="mt-8 space-y-4"><p className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm text-purple-900 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200">{accountType}</p><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Account size<input className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" placeholder="$100,000" /></label><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Drawdown limit<input className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" placeholder="10%" /></label><label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Broker platform<select className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"><option>MT5</option><option>MT4</option><option>cTrader</option></select></label><div className="flex gap-3"><Button type="button" onClick={() => setStep(1)}>Back</Button><Button type="button" className="flex-1" onClick={onClose}>Save account</Button></div></div>}
      </aside>
    </div>
  );
}
