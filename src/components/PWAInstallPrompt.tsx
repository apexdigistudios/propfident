"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [ios, setIos] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      if (pathname === "/") setShowPrompt(true);
    };
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator as Navigator & { standalone?: boolean }).standalone;
    setIos(isIos);
    if (isIos && pathname === "/") setShowPrompt(true);
    window.addEventListener("beforeinstallprompt", handleInstall);
    const handleInstallRequest = () => {
      if (pathname === "/" || ios) {
        setShowPrompt(true);
      } else if (installEvent) {
        void installEvent.prompt();
      }
    };
    window.addEventListener("pwa-install-request", handleInstallRequest);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstall);
      window.removeEventListener("pwa-install-request", handleInstallRequest);
    };
  }, [installEvent, pathname]);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setShowPrompt(false);
  }

  if (!showPrompt) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex w-full max-w-sm animate-in slide-in-from-top-4 flex-col rounded-2xl border border-white/15 bg-slate-900/80 p-4 text-white shadow-2xl shadow-purple-950/60 backdrop-blur-2xl">
      <button type="button" onClick={() => setShowPrompt(false)} aria-label="Close install prompt" className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-4 w-4" /></button>
      <div className="flex items-center gap-2"><img src="/propfidentlogo.png" alt="" className="h-5 w-5 rounded-md" /><span className="text-[10px] font-semibold tracking-wider text-slate-300">PROPFIDENT</span><span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-slate-400">NOW</span></div>
      <div className="mt-3 flex items-start gap-3"><Download className="mt-1 h-5 w-5 shrink-0 text-purple-300" /><div><h2 className="text-sm font-semibold text-white">Install Propfident</h2>{ios ? <p className="mt-1 text-xs text-slate-300">Tap the <Share className="inline h-4 w-4 text-purple-300" /> Share icon, then choose <strong>Add to Home Screen</strong>.</p> : <p className="mt-1 text-xs text-slate-300">Keep your equity shield one tap away.</p>}{!ios && <button type="button" onClick={() => void install()} className="mt-3 rounded-xl border border-purple-500/40 bg-purple-600/30 px-3 py-1.5 text-xs font-medium text-purple-200 hover:bg-purple-600/50">Install App</button>}</div></div>
    </div>
  );
}
