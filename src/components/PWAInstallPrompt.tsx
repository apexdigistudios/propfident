"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator as Navigator & { standalone?: boolean }).standalone;
    setIos(isIos);
    if (isIos) setShowPrompt(true);
    window.addEventListener("beforeinstallprompt", handleInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setShowPrompt(false);
  }

  if (!showPrompt) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-md rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-5 text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
      <button type="button" onClick={() => setShowPrompt(false)} aria-label="Close install prompt" className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-4 w-4" /></button>
      <div className="flex items-start gap-3"><Download className="mt-1 h-5 w-5 shrink-0 text-cyan-300" /><div><h2 className="font-bold">Install Propfident</h2>{ios ? <p className="mt-2 text-sm leading-6 text-slate-300">Tap the <Share className="inline h-4 w-4 text-cyan-300" /> Share icon, then choose <strong>Add to Home Screen</strong>.</p> : <p className="mt-2 text-sm text-slate-300">Keep your equity shield one tap away.</p>}{!ios && <button type="button" onClick={() => void install()} className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20">Install App</button>}</div></div>
    </div>
  );
}
