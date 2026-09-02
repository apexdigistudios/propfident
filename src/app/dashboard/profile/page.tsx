"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Shield, Sparkles, UserCircle2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    subscription_tier: string;
    telegram_chat_id: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, subscription_tier, telegram_chat_id")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        full_name: data?.full_name || "",
        email: data?.email || user.email || "",
        subscription_tier: data?.subscription_tier || "free",
        telegram_chat_id: data?.telegram_chat_id || "",
      });
      setLoading(false);
    }

    void loadProfile();
  }, [router, supabase]);

  if (loading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Profile</p>
        <h1 className="mt-2 text-3xl font-black text-white">Your account</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="rounded-2xl border border-purple-500/20 bg-slate-900/80 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand text-2xl font-black text-white">
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "P"}
          </div>
          <p className="mt-4 text-xl font-bold text-white">{profile.full_name || "Trader"}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300">
            <Shield className="h-3.5 w-3.5" />
            {profile.subscription_tier}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-5 w-5 text-purple-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</p>
              <p className="mt-1 text-lg font-bold text-white">{profile.full_name || "Add your display name"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-purple-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
              <p className="mt-1 text-lg font-bold text-white">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Telegram</p>
              <p className="mt-1 text-lg font-bold text-white">
                {profile.telegram_chat_id || "No Telegram chat linked yet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
