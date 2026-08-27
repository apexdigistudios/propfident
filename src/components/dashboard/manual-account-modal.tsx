"use client";

import { FormEvent, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveManualAccount } from "@/app/actions/manual-account";

const inputClass = "mt-1.5 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30";

export function ManualAccountModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({ accountName: "", brokerName: "", initialBalance: "", currentEquity: "", accountType: "evaluation" as "evaluation" | "funded", dailyLoss: "5", overallDrawdown: "10" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const result = await saveManualAccount({ ...form, initialBalance: Number(form.initialBalance), currentEquity: Number(form.currentEquity), dailyLoss: Number(form.dailyLoss), dailyLossMode: "%", overallDrawdown: Number(form.overallDrawdown), overallDrawdownMode: "%" });
    if (!result.success) {
      setError(result.error || "Unable to save your manual account.");
      setSaving(false);
      return;
    }
    onClose();
    router.refresh();
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="manual-account-title">
    <div className="w-full max-w-2xl rounded-2xl border border-purple-500/30 bg-slate-900 p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Manual tracking</p><h2 id="manual-account-title" className="mt-2 text-2xl font-bold text-white">Add Manual Account</h2><p className="mt-2 text-sm text-slate-400">Enter your account details to activate dashboard risk tracking without MetaApi.</p></div><button type="button" onClick={onClose} aria-label="Close manual account form" className="rounded-lg p-2 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button></div>
      {error && <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
      <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Name / Alias<input required value={form.accountName} onChange={(event) => update("accountName", event.target.value)} placeholder="My $100K Challenge" className={inputClass} /></label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prop Firm Name<input required value={form.brokerName} onChange={(event) => update("brokerName", event.target.value)} placeholder="FTMO, Topstep, FundedNext, Custom" className={inputClass} /></label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Initial Balance<input required min="0.01" step="any" type="number" value={form.initialBalance} onChange={(event) => update("initialBalance", event.target.value)} className={inputClass} /></label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Equity<input required min="0" step="any" type="number" value={form.currentEquity} onChange={(event) => update("currentEquity", event.target.value)} className={inputClass} /></label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Type<select value={form.accountType} onChange={(event) => update("accountType", event.target.value)} className={inputClass}><option value="evaluation">Evaluation</option><option value="funded">Funded</option></select></label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Max Daily Loss (%)<input required min="0.01" step="any" type="number" value={form.dailyLoss} onChange={(event) => update("dailyLoss", event.target.value)} className={inputClass} /></label>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Max Overall Drawdown (%)<input required min="0.01" step="any" type="number" value={form.overallDrawdown} onChange={(event) => update("overallDrawdown", event.target.value)} className={inputClass} /></label>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {saving ? "Saving account..." : "Save Manual Account"}</button></div>
      </form>
    </div>
  </div>;
}