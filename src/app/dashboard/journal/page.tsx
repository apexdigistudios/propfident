"use client";

import { useState } from "react";
import { BarChart3, Bell, Brain, Check, Radio, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Direct MT4/MT5 Broker Sync",
    description: "Every execution will flow into your journal automatically through MetaAPI.",
  },
  {
    icon: Brain,
    title: "AI Trade Emotion & Discipline Scoring",
    description: "Understand your decision-making patterns without manual note-taking.",
  },
  {
    icon: BarChart3,
    title: "Automated Drawdown & R:R Heatmaps",
    description: "See the relationship between execution quality, risk, and performance.",
  },
];

export default function JournalPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <div className="min-w-0 w-full space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-purple-500/25 bg-slate-900/75 p-6 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300">
            <Radio className="h-3.5 w-3.5" /> Coming Soon · MetaAPI Automation
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">AI Automated Trade Journal</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            Manual trade entry is deprecated to ensure 100% verified execution accuracy. Propfident is integrating direct MetaAPI connectivity for automated real-time MT4 & MT5 trade logging, emotion tracking, and rule analytics.
          </p>
          <button
            type="button"
            onClick={() => setNotificationsEnabled((enabled) => !enabled)}
            aria-pressed={notificationsEnabled}
            className="mt-7 inline-flex items-center gap-3 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-sm font-bold text-purple-100 transition hover:bg-purple-500/20"
          >
            <Bell className="h-4 w-4 text-purple-300" />
            {notificationsEnabled ? "Beta access notification enabled" : "Enable Beta Access Notification"}
            {notificationsEnabled && <Check className="h-4 w-4 text-emerald-400" />}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Automated journal preview features">
        {features.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-2xl border border-purple-500/20 bg-slate-900/70 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
