"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { saveManualAccount } from "@/app/actions/manual-account";

type LimitMode = "$" | "%";

type ManualForm = {
  accountName: string;
  brokerName: string;
  initialBalance: string;
  currentEquity: string;
  dailyLoss: string;
  dailyLossMode: LimitMode;
  overallDrawdown: string;
  overallDrawdownMode: LimitMode;
};

const initialForm: ManualForm = {
  accountName: "",
  brokerName: "",
  initialBalance: "",
  currentEquity: "",
  dailyLoss: "",
  dailyLossMode: "%",
  overallDrawdown: "",
  overallDrawdownMode: "%",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 sm:text-sm";

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ManualForm>(key: K, value: ManualForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function activate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const result = await saveManualAccount({
      accountName: form.accountName,
      brokerName: form.brokerName,
      initialBalance: Number(form.initialBalance),
      currentEquity: Number(form.currentEquity),
      dailyLoss: Number(form.dailyLoss),
      dailyLossMode: form.dailyLossMode,
      overallDrawdown: Number(form.overallDrawdown),
      overallDrawdownMode: form.overallDrawdownMode,
    });

    if (!result.success) {
      setError(result.error || "Unable to save your account setup.");
      setSaving(false);
      return;
    }

    setCompleted(true);
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1500);
  }

  function skip() {
    setSkipping(true);
    router.replace("/dashboard");
  }

  if (completed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="h-10 w-10" strokeWidth={2.5} />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">🟢 Shield Active</p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">You&apos;re all set! 🛡️</h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">Your account parameters are saved. Redirecting to your protected dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-white sm:py-16">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />
      <div className="hero-radial absolute inset-0" aria-hidden="true" />
      <section className="relative z-10 w-full max-w-3xl rounded-2xl border border-purple-500/30 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md sm:p-8">
        <header className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span className="text-2xl font-extrabold tracking-tighter">Propfident</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">Welcome to Propfident 👋</h1>
          <p className="mt-2 text-sm text-slate-400">
            Set up your free account parameters to activate Account Intel and Prop Shield.
          </p>
        </header>

        <div className="mt-8 flex items-center gap-3 text-xs font-semibold text-slate-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"><Check className="h-4 w-4" /></span>
          <span>Step 1 of 1</span>
          <span className="h-px flex-1 bg-purple-500/30" />
          <span className="text-purple-300">Manual account setup</span>
        </div>

        <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-sm leading-relaxed text-purple-100">
          💡 Free tier includes manual tracking, Account Intel, Prop Shield drawdown alerts, and Manual Journaling. Automated live MT5 sync is unlocked on Pro.
        </div>

        {error && <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}

        <form onSubmit={activate} className="mt-7 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Account Label / Name" placeholder="My $100K FTMO Challenge" value={form.accountName} onChange={(value) => update("accountName", value)} required />
            <Field label="Prop Firm / Broker" placeholder="FTMO, Topstep, FundedNext, Apex, Custom" value={form.brokerName} onChange={(value) => update("brokerName", value)} required />
            <Field label="Initial Starting Balance ($)" type="number" value={form.initialBalance} onChange={(value) => update("initialBalance", value)} required />
            <Field label="Current Account Equity ($)" type="number" value={form.currentEquity} onChange={(value) => update("currentEquity", value)} required />
            <LimitField label="Max Daily Loss Limit" value={form.dailyLoss} mode={form.dailyLossMode} onValue={(value) => update("dailyLoss", value)} onMode={(value) => update("dailyLossMode", value)} />
            <LimitField label="Max Overall Drawdown Floor" value={form.overallDrawdown} mode={form.overallDrawdownMode} onValue={(value) => update("overallDrawdown", value)} onMode={(value) => update("overallDrawdownMode", value)} />
          </div>

          <div className="flex flex-col-reverse gap-4 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={skip} disabled={saving || skipping} className="text-sm font-semibold text-slate-400 hover:text-white disabled:opacity-50">
              {skipping ? "Opening dashboard..." : "Skip for now — Go to Dashboard"}
            </button>
            <ShimmerButton type="submit" disabled={saving || skipping} className="w-full justify-center sm:w-auto">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving account...</> : <>Activate Prop Shield &amp; Go to Dashboard <ArrowRight className="h-4 w-4" /></>}
            </ShimmerButton>
          </div>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          Free setup never asks for trading credentials. Connect MetaApi with read-only access after upgrading to Pro or Elite.
        </p>
      </section>
    </main>
  );
}

function Field({ label, placeholder, value, onChange, type = "text", required = false }: { label: string; placeholder?: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}<input type={type} inputMode={type === "number" ? "decimal" : undefined} required={required} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label>;
}

function LimitField({ label, value, mode, onValue, onMode }: { label: string; value: string; mode: LimitMode; onValue: (value: string) => void; onMode: (value: LimitMode) => void }) {
  return <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}<div className="mt-1.5 flex"><input type="number" inputMode="decimal" required min="0" step="any" value={value} onChange={(event) => onValue(event.target.value)} className={`${inputClass} mt-0 rounded-r-none`} /><select value={mode} onChange={(event) => onMode(event.target.value as LimitMode)} className="rounded-r-xl border border-l-0 border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none"><option>$</option><option>%</option></select></div></label>;
}
