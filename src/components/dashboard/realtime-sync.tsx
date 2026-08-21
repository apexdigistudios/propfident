"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Supabase Realtime changes on `mt5_accounts` and `trades`
 * for the authenticated user. Any insert/update/delete triggers
 * `router.refresh()`, which re-runs server components so every derived
 * risk metric recalculates and propagates without a browser reload.
 */
export function RealtimeSync({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`propfident-sync-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mt5_accounts",
          filter: `user_id=eq.${userId}`,
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
          filter: `user_id=eq.${userId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    // Refresh when the tab regains focus so stale views re-sync too
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [router, userId]);

  return null;
}
