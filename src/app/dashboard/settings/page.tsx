"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, CreditCard, Loader2, User } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

type ProfileState = {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  telegram_chat_id: string;
  telegram_alerts_enabled: boolean;
};

export default function SettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileState | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, subscription_tier, telegram_chat_id, telegram_alerts_enabled")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        id: user.id,
        email: data?.email || user.email || "",
        full_name: data?.full_name || "",
        subscription_tier: data?.subscription_tier || "free",
        telegram_chat_id: data?.telegram_chat_id || "",
        telegram_alerts_enabled: data?.telegram_alerts_enabled ?? true,
      });
      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        telegram_chat_id: profile.telegram_chat_id || null,
        telegram_alerts_enabled: profile.telegram_alerts_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-400">Manage your account preferences and subscription.</p>
      </div>

      <div className="flex min-w-0 gap-2 overflow-x-auto border-b border-purple-500/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-purple-500 text-purple-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-purple-500/20 bg-slate-900/80 p-4 sm:p-6">
        {activeTab === "profile" && profile && (
          <ProfileTab profile={profile} setProfile={setProfile} />
        )}
        {activeTab === "alerts" && profile && (
          <AlertsTab profile={profile} setProfile={setProfile} />
        )}
        {activeTab === "billing" && profile && <BillingTab profile={profile} />}
      </div>

      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-purple-500/30 bg-slate-900 p-4 shadow-xl transition-all ${
          saved ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <Check className="h-5 w-5 text-emerald-400" />
        <span className="text-sm font-semibold text-white">Changes saved successfully!</span>
      </div>

      <div className="flex justify-stretch sm:justify-end">
        <ShimmerButton onClick={handleSave} className="w-full justify-center px-6 py-3 text-sm sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              Save Changes
            </>
          )}
        </ShimmerButton>
      </div>
    </div>
  );
}

function ProfileTab({
  profile,
  setProfile,
}: {
  profile: ProfileState;
  setProfile: (profile: ProfileState) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
        <input
          type="text"
          value={profile.full_name}
          onChange={(event) => setProfile({ ...profile, full_name: event.target.value })}
          className="mt-1.5 w-full rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600"
          placeholder="Your full name"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="mt-1.5 w-full rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 text-sm text-slate-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Telegram Chat ID</label>
        <input
          type="text"
          value={profile.telegram_chat_id}
          onChange={(event) => setProfile({ ...profile, telegram_chat_id: event.target.value })}
          className="mt-1.5 w-full rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600"
          placeholder="Telegram chat ID"
        />
        <p className="mt-2 text-xs text-slate-500">Used for WARNING and CRITICAL drawdown alerts.</p>
      </div>
    </div>
  );
}

function AlertsTab({
  profile,
  setProfile,
}: {
  profile: ProfileState;
  setProfile: (profile: ProfileState) => void;
}) {
  return (
    <div className="space-y-4">
      <ToggleRow
        label="Telegram Alerts"
        description="Get instant WARNING and CRITICAL drawdown notifications."
        enabled={profile.telegram_alerts_enabled}
        onToggle={() =>
          setProfile({ ...profile, telegram_alerts_enabled: !profile.telegram_alerts_enabled })
        }
      />
    </div>
  );
}

function BillingTab({ profile }: { profile: ProfileState }) {
  const tierLabel = profile.subscription_tier?.charAt(0).toUpperCase() + (profile.subscription_tier || "free").slice(1) || "Free";
  const planMeta = {
    free: { limit: 2, price: "$0", description: "Manual tracking + up to 2 connected accounts." },
    pro: { limit: 3, price: "$49/mo", description: "Live sync and expanded monitoring for active traders." },
    elite: { limit: "Unlimited", price: "$99/mo", description: "Unlimited accounts with premium coverage and priority access." },
  };
  const current = planMeta[profile.subscription_tier as keyof typeof planMeta] || planMeta.free;
  const usage = profile.subscription_tier === "free" ? 1 : profile.subscription_tier === "pro" ? 2 : 8;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-purple-500/20 bg-slate-800/50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">Current plan</p>
            <h3 className="mt-2 text-2xl font-black text-white">{tierLabel}</h3>
            <p className="mt-2 text-sm text-slate-400">{current.description}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
            <p className="mt-2 text-xl font-black text-white">{current.price}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-white">Usage</p>
          <span className="text-xs font-semibold text-slate-400">{typeof current.limit === "number" ? `${usage}/${current.limit}` : current.limit}</span>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
            style={{ width: `${Math.min(100, (usage / (typeof current.limit === "number" ? current.limit : 1)) * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {profile.subscription_tier === "free"
            ? "Free tier includes up to 2 connected accounts before you need an upgrade."
            : profile.subscription_tier === "pro"
              ? "Pro keeps your active account count high enough for most evaluation stacks."
              : "Elite keeps every account monitored without the extra plan ceiling."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-purple-500/20 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Included accounts</p>
          <p className="mt-3 text-2xl font-black text-white">{current.limit}</p>
        </div>
        <div className="rounded-xl border border-purple-500/20 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Alerts</p>
          <p className="mt-3 text-2xl font-black text-white">Live</p>
        </div>
        <div className="rounded-xl border border-purple-500/20 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI support</p>
          <p className="mt-3 text-2xl font-black text-white">{profile.subscription_tier === "free" ? "Locked" : "Enabled"}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/dashboard" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-purple-500/20 bg-slate-800/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${label}: ${enabled ? "enabled" : "disabled"}`}
        className={`relative h-6 w-11 shrink-0 self-end rounded-full transition sm:self-auto ${enabled ? "bg-purple-500" : "bg-slate-700"}`}
      >
        <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
