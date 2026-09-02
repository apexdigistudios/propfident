import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export default async function PropShieldPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .maybeSingle();

  const isFreeTier = (profile?.subscription_tier || "free") === "free";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 md:px-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Prop Shield</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
          Risk control center
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Keep your risk plan simple, visible, and actionable before your drawdown slips out of range.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Link
          href="/dashboard/prop-shield/quick-plan"
          className="group rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-950 p-6 transition hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-950/20"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300">
              Quick plan
            </span>
            <ArrowRight className="h-4 w-4 text-purple-300 transition group-hover:translate-x-1" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-white">Daily risk calculator</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Build a clean account plan with daily loss caps, max drawdown checks, and trade-by-trade lot sizing.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-100">
            <Sparkles className="h-4 w-4 text-purple-300" />
            Open planner
          </div>
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
              {isFreeTier ? "Locked" : "Pro feature"}
            </span>
            <ShieldCheck className="h-5 w-5 text-amber-300" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-white">AI plan review</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {isFreeTier
              ? "Upgrade for deeper trade-plan guidance, custom review notes, and AI-backed risk coaching."
              : "AI checks your account structure and points out where your plan can tighten up before volatility hits."}
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-200">
            <AlertCircle className="h-4 w-4" />
            {isFreeTier ? "Available on Pro and Elite" : "Connected to your live account plan"}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AdSlot className="mx-auto max-w-3xl" />
      </div>
    </div>
  );
}
