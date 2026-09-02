import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { TradePlanGenerator } from "@/components/dashboard/trade-plan-generator";

export const dynamic = "force-dynamic";

export default async function QuickPlanPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <TradePlanGenerator isFreeTier={(profile?.subscription_tier || "free") === "free"} userId={user.id} />
    </div>
  );
}
