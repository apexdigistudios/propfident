import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { TradePlanGenerator } from "@/components/dashboard/trade-plan-generator";

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

  const { data: account } = await supabase
    .from("mt5_accounts")
    .select("id")
    .eq("user_id", user.id)
    .eq("platform", "MT5")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .maybeSingle();

  return <TradePlanGenerator isFreeTier={(profile?.subscription_tier || "free") === "free"} userId={user.id} accountId={account?.id} />;
}
