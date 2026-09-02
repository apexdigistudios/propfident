"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Supabase Realtime changes on `mt5_accounts` and `trades`
 * for the authenticated user. Any insert/update/delete triggers
 * `router.refresh()` and a custom dashboard refresh event so the live
 * balance/equity widgets stay in sync without a page reload.
 */
export function RealtimeSync({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mt5_accounts",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          router.refresh();
          window.dispatchEvent(new Event("dashboard-metrics-refresh"));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          router.refresh();
          window.dispatchEvent(new Event("dashboard-metrics-refresh"));
        }
      )
      .subscribe();

    const onFocus = () => {
      router.refresh();
      window.dispatchEvent(new Event("dashboard-metrics-refresh"));
    };
    window.addEventListener("focus", onFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [router, userId]);

  return null;
}
