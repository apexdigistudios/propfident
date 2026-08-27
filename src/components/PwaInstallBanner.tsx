"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!installEvent) {
    return null;
  }

  const handleInstall = async () => {
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return (
    <section className="w-full max-w-full overflow-hidden border-y border-purple-500/20 bg-slate-950 px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-[0_0_45px_rgba(124,58,237,0.12)] md:p-8 lg:flex-row lg:items-center lg:p-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-purple-400">
            <Download className="h-4 w-4" strokeWidth={2.5} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Available for Android Users
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tighter text-white sm:text-3xl">
            Your drawdown shield, always in your pocket.
          </h2>
          <p className="mt-2 text-slate-400">
            Install the Propfident app for instant access, breach notifications,
            and offline journaling. No App Store required.
          </p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 sm:w-auto"
        >
          <Smartphone className="h-4 w-4" />
          Install Android App
        </button>
      </div>
    </section>
  );
}