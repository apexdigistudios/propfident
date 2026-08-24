"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Link2,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const FIRMS = ["FTMO", "Topstep", "FundedNext", "Apex", "The5ers", "Custom / Retail Broker"];
const ONBOARDING_KEY = "propfident:onboarding:v1";

type Setup = {
  firm: string;
  accountSize: string;
  dailyLoss: string;
  dailyLossMode: "$" | "%";
  overallDrawdown: string;
  overallDrawdownMode: "$" | "%";
  profitTarget: string;
};

const initialSetup: Setup = {
  firm: "",
  accountSize: "",
  dailyLoss: "",
  dailyLossMode: "%",
  overallDrawdown: "",
  overallDrawdownMode: "%",
  profitTarget: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [setup, setSetup] = useState<Setup>(initialSetup);
  const [firmSearch, setFirmSearch] = useState("");
  const [connectionChoice, setConnectionChoice] = useState<"wizard" | "later">("wizard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadOnboarding() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      if (!user) {
        router.replace("/login?redirectedFrom=/onboarding");
        return;
      }

      try {
        const saved = localStorage.getItem(ONBOARDING_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { complete?: boolean; setup?: Setup };
          if (parsed.complete) {
            router.replace("/dashboard");
            return;
          }
          if (parsed.setup) setSetup({ ...initialSetup, ...parsed.setup });
        }
      } catch {
        // A stale local draft should never block onboarding.
      }
      setLoading(false);
    }

    loadOnboarding();
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const filteredFirms = FIRMS.filter((firm) =>
    firm.toLowerCase().includes(firmSearch.toLowerCase())
  );

  function updateSetup<K extends keyof Setup>(key: K, value: Setup[K]) {
    setSetup((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function validateStep() {
    if (step === 1 && !setup.firm) return "Select a prop firm or choose Custom / Retail Broker.";
    if (step === 2) {
      if (!Number.isFinite(Number(setup.accountSize)) || Number(setup.accountSize) <= 0) {
        return "Enter a valid account size.";
      }
      if (!Number.isFinite(Number(setup.dailyLoss)) || Number(setup.dailyLoss) <= 0) {
        return "Enter a valid daily loss limit.";
      }
      if (!Number.isFinite(Number(setup.overallDrawdown)) || Number(setup.overallDrawdown) <= 0) {
        return "Enter a valid overall drawdown limit.";
      }
    }
    return null;
  }

  function nextStep() {
    const problem = validateStep();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((current) => Math.min(3, current + 1));
  }

  function saveDraft(complete: boolean) {
    localStorage.setItem(
      ONBOARDING_KEY,
      JSON.stringify({ complete, setup, connectionChoice, savedAt: new Date().toISOString() })
    );
  }

  function finish() {
    const problem = validateStep();
    if (problem) {
      setError(problem);
      setStep(2);
      return;
    }
    setSaving(true);
    saveDraft(true);
    setCompleted(true);
    setTimeout(() => router.replace("/dashboard"), 1200);
  }

  function skip() {
    saveDraft(true);
    router.replace("/dashboard");
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><ShieldCheck className="h-8 w-8" /></div>
          <h1 className="mt-6 text-2xl font-bold">🛡️ Your account is protected.</h1>
          <p className="mt-2 text-sm text-slate-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-white sm:py-16">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />
      <div className="hero-radial absolute inset-0" aria-hidden="true" />
      <section className="relative z-10 w-full max-w-3xl rounded-2xl border border-purple-500/30 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand"><ShieldCheck className="h-6 w-6" /></div><span className="text-2xl font-extrabold tracking-tighter">Propfident</span></Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">Welcome to Propfident 👋</h1>
          <p className="mt-2 text-sm text-slate-400">Let&apos;s set up your first protected account in 3 quick steps.</p>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400"><span>Step {step} of 3</span><span>Account created ✓ → Setup → Protection → Dashboard</span></div>
          <div className="mt-3 flex gap-2" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? "bg-purple-500" : "bg-slate-800"}`} />)}
          </div>
        </div>

        {error && <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}

        <div className="mt-8">
          {step === 1 && <FirmStep firm={setup.firm} search={firmSearch} firms={filteredFirms} onSearch={setFirmSearch} onSelect={(firm) => updateSetup("firm", firm)} />}
          {step === 2 && <RiskStep setup={setup} updateSetup={updateSetup} />}
          {step === 3 && <ConnectionStep choice={connectionChoice} onChoice={setConnectionChoice} />}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={skip} className="text-sm font-semibold text-slate-400 hover:text-white">Skip for now — Take me to Dashboard</button>
          <div className="flex gap-3 sm:ml-auto">
            {step > 1 && <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800"><ArrowLeft className="h-4 w-4" />Back</button>}
            {step < 3 ? <ShimmerButton onClick={nextStep}><span className="flex items-center gap-2">Continue<ArrowRight className="h-4 w-4" /></span></ShimmerButton> : <ShimmerButton onClick={finish} disabled={saving}><span className="flex items-center gap-2">{saving ? "Saving..." : "Protect My Account →"}</span></ShimmerButton>}
          </div>
        </div>
      </section>
    </main>
  );
}

function FirmStep({ firm, search, firms, onSearch, onSelect }: { firm: string; search: string; firms: string[]; onSearch: (value: string) => void; onSelect: (firm: string) => void }) {
  return <div><StepHeading Icon={Search} title="Select your prop firm" description="Choose the firm whose account rules you want to protect." /><div className="relative mt-5"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search firms or broker type" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pl-10 text-sm text-white outline-none focus:border-purple-500" /></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{firms.map((option) => <button type="button" key={option} onClick={() => onSelect(option)} className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${firm === option ? "border-purple-500 bg-purple-500/15 text-purple-200" : "border-slate-700 bg-slate-950 text-slate-300 hover:border-purple-500/50"}`}>{option}{firm === option && <Check className="float-right h-4 w-4 text-purple-400" />}</button>)}</div></div>;
}

function RiskStep({ setup, updateSetup }: { setup: Setup; updateSetup: <K extends keyof Setup>(key: K, value: Setup[K]) => void }) {
  return <div><StepHeading Icon={BarChart3} title="Set your account risk parameters" description="These values guide your risk view. You can refine them later in the dashboard." /><div className="mt-5 grid gap-4 sm:grid-cols-2"><NumberField label="Account Size ($)" value={setup.accountSize} onChange={(value) => updateSetup("accountSize", value)} /><LimitField label="Max Daily Loss" value={setup.dailyLoss} mode={setup.dailyLossMode} onValue={(value) => updateSetup("dailyLoss", value)} onMode={(value) => updateSetup("dailyLossMode", value)} /><LimitField label="Max Overall Drawdown" value={setup.overallDrawdown} mode={setup.overallDrawdownMode} onValue={(value) => updateSetup("overallDrawdown", value)} onMode={(value) => updateSetup("overallDrawdownMode", value)} /><NumberField label="Profit Target (Optional)" value={setup.profitTarget} onChange={(value) => updateSetup("profitTarget", value)} /></div></div>;
}

function ConnectionStep({ choice, onChoice }: { choice: "wizard" | "later"; onChoice: (choice: "wizard" | "later") => void }) {
  return <div><StepHeading Icon={Link2} title="Connect with read-only access" description="You can connect now or finish setup later from Account Intel." /><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className={`rounded-xl border p-4 text-left ${choice === "wizard" ? "border-purple-500 bg-purple-500/15" : "border-slate-700 bg-slate-950"}`}><button type="button" onClick={() => onChoice("wizard")} className="w-full text-left"><p className="font-bold">Use MetaApi connection wizard</p><p className="mt-1 text-xs text-slate-400">Enter your MT4/MT5 read-only investor credentials securely.</p></button><Link href="/dashboard/account-intel/connect" className="mt-3 inline-flex text-xs font-bold text-purple-300 hover:underline">Open connection wizard <ArrowRight className="ml-1 h-3 w-3" /></Link></div><button type="button" onClick={() => onChoice("later")} className={`rounded-xl border p-4 text-left ${choice === "later" ? "border-purple-500 bg-purple-500/15" : "border-slate-700 bg-slate-950"}`}><p className="font-bold">I&apos;ll connect later</p><p className="mt-1 text-xs text-slate-400">Go to your dashboard without connecting an account now.</p></button></div><div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-xs font-semibold text-emerald-300">🔒 Read-only access. Zero withdrawal or trade execution authority.</div></div>;
}

function StepHeading({ Icon, title, description }: { Icon: typeof Search; title: string; description: string }) { return <div><Icon className="h-6 w-6 text-purple-400" /><h2 className="mt-4 text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-slate-400">{description}</p></div>; }
function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}<input type="number" min="0" step="any" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base font-normal text-white outline-none focus:border-purple-500 sm:text-sm" /></label>; }
function LimitField({ label, value, mode, onValue, onMode }: { label: string; value: string; mode: "$" | "%"; onValue: (value: string) => void; onMode: (value: "$" | "%") => void }) { return <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}<div className="mt-1.5 flex"><input type="number" min="0" step="any" value={value} onChange={(event) => onValue(event.target.value)} className="w-full rounded-l-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base font-normal text-white outline-none focus:border-purple-500 sm:text-sm" /><select value={mode} onChange={(event) => onMode(event.target.value as "$" | "%")} className="rounded-r-xl border border-l-0 border-slate-700 bg-slate-900 px-3 text-sm text-white outline-none"><option>$</option><option>%</option></select></div></label>; }