"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "propfident:dashboard-welcome-dismissed";

export function WelcomeBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(DISMISSED_KEY) !== "true");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Dismissal remains valid for the current render if storage is unavailable.
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
      <p>Welcome to your Propfident Dashboard! Your drawdown rules are live.</p>
      <button type="button" onClick={dismiss} aria-label="Dismiss welcome message" className="shrink-0 rounded-md p-1 text-emerald-300 transition hover:bg-emerald-500/20 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}