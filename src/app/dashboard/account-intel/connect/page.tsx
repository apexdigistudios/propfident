"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConnectAccountWizard } from "@/components/dashboard/connect-account-wizard";
import { MagicCard } from "@/components/magicui/magic-card";
import { ManualAccountModal } from "@/components/dashboard/manual-account-modal";
import { pricingByName } from "@/lib/constants/pricing";

export default function ConnectAccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [tierLoading, setTierLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [accountCount, setAccountCount] = useState(0);
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    async function loadGateState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      const { count } = await supabase
        .from("mt5_accounts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_active", true);

      setSubscriptionTier(profile?.subscription_tier || "free");
      setAccountCount(count || 0);
      setTierLoading(false);
    }

    loadGateState();
  }, [router, supabase]);

  if (tierLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  // Free tier is hard-locked at 0 accounts
  if (subscriptionTier === "free") {
    return (
      <LockedConnectCard
        accountCount={accountCount}
        onManual={() => setManualOpen(true)}
        manualOpen={manualOpen}
        onClose={() => setManualOpen(false)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
          Link Your Trading Terminal
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Propfident automatically syncs trades, monitors drawdown, and alerts you
          before any breach occurs.
        </p>
      </div>

      <ConnectAccountWizard />

      <p className="mt-6 text-center text-xs text-slate-500">
        We only request read-only investor credentials. No withdrawal permissions
        are ever transmitted.
      </p>
    </div>
  );
}

function LockedConnectCard({ accountCount, onManual, manualOpen, onClose }: { accountCount: number; onManual: () => void; manualOpen: boolean; onClose: () => void }) {
  return (
    <div className="mx-auto max-w-3xl">
      <MagicCard
        gradientSize={220}
        gradientColor="#4f46e5"
        className="overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/90 p-4 shadow-2xl shadow-purple-950/20 sm:p-6"
      >
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="relative text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-2xl font-black tracking-tight text-white">
            MetaApi Integration Coming Soon
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            We are actively building Pro and Elite tiers with real-time MetaApi account sync, live drawdown tracking, and automated trade journaling. Get started with manual account tracking for free today.
          </p>

          <div className="mt-6 rounded-xl border border-purple-500/20 bg-slate-950/70 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Current Free Plan Status
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Connected accounts: <span className="font-bold text-white">{accountCount}</span> / Unlimited (manual)
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5 text-left">
              <p className="text-lg font-black text-white">Pro (Coming Soon)</p>
              <p className="mt-1 text-sm text-purple-200">Starting at ${pricingByName.Pro.monthly}/mo</p>
              <p className="mt-3 text-xs text-slate-400">
                Connect up to 5 accounts with full MetaApi auto-sync.
              </p>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5 text-left">
              <p className="text-lg font-black text-white">Elite (Coming Soon)</p>
              <p className="mt-1 text-sm text-purple-200">Starting at ${pricingByName.Elite.monthly}/mo</p>
              <p className="mt-3 text-xs text-slate-400">
                Unlimited accounts, cross-account risk controls, and priority support.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" disabled className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-bold text-slate-500">
              <Sparkles className="h-4 w-4" />
              Stay Tuned for Pro
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
            >
              Return to Overview
            </Link>
            <button type="button" onClick={onManual} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/20">
              <Plus className="h-4 w-4" />
              Add Manual Account
            </button>
          </div>
        </div>
      </MagicCard>
      {manualOpen && <ManualAccountModal onClose={onClose} />}
    </div>
  );
}
