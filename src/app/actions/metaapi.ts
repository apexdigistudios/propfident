"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Deactivates a connected prop account (scoped to the owning user) and
 * revalidates the dashboard views so it disappears from all risk views.
 */
export async function disconnectMetaApiAccount(
  propAccountId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated." };
    }

    const { data: account, error: fetchError } = await supabase
      .from("mt5_accounts")
      .select("id, metaapi_account_id, user_id")
      .eq("id", propAccountId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !account) {
      return { success: false, error: "Account not found." };
    }

    const { error: updateError } = await supabase
      .from("mt5_accounts")
      .update({ is_active: false, connection_status: "DISCONNECTED" })
      .eq("id", propAccountId)
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/account-intel");
    revalidatePath("/dashboard/prop-shield");
    revalidatePath("/dashboard/trade-assist");

    return { success: true, data: { id: propAccountId } };
  } catch (err) {
    console.error("Disconnect Server Action Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to disconnect account.",
    };
  }
}
