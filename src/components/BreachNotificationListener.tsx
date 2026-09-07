"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { BREACH_ALERT_EVENT, type BreachAlertDetails } from "@/lib/firm-fit/alerts";

export default function BreachNotificationListener() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/dashboard")) return;

    const handleBreach = (event: Event) => {
      const details = (event as CustomEvent<BreachAlertDetails>).detail;
      if (!details) return;

      toast.error(`🚨 Account Breach Detected: ${details.rule}`, {
        description: `${details.firm} exceeded the rule by ${details.value}.`,
        duration: 10000,
        action: {
          label: "View Diagnostic Breakdown",
          onClick: () => window.dispatchEvent(new CustomEvent("propfident:open-diagnostics", { detail: details })),
        },
      });
    };

    window.addEventListener(BREACH_ALERT_EVENT, handleBreach);
    return () => window.removeEventListener(BREACH_ALERT_EVENT, handleBreach);
  }, [pathname]);

  return null;
}
