"use client";

import { useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import type { FirmEvaluation } from "@/lib/firm-fit/evaluator";

export function ShareableCard({ result }: { result: FirmEvaluation }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function downloadCard() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${result.firm.id}-firm-fit.png`;
      link.href = dataUrl;
      link.click();
    } finally { setBusy(false); }
  }

  async function shareCard() {
    if (!cardRef.current || !navigator.share) return downloadCard();
    setBusy(true);
    try {
      const blob = await (await fetch(await toPng(cardRef.current, { pixelRatio: 2 }))).blob();
      const file = new File([blob], "propfident-firm-fit.png", { type: "image/png" });
      await navigator.share({ title: "My Propfident Firm-Fit score", files: [file] });
    } catch { /* User cancelled sharing. */ } finally { setBusy(false); }
  }

  return <div className="mt-6"><div ref={cardRef} className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Propfident Firm-Fit Matrix</p><p className="mt-4 text-4xl font-black text-cyan-300">{result.matchPercentage}%</p><p className="mt-1 text-lg font-bold">{result.firm.name}</p><p className="mt-4 text-sm text-slate-400">Based on your uploaded trading history</p></div><div className="mt-3 flex gap-3"><button type="button" disabled={busy} onClick={() => void downloadCard()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-400"><Download className="h-4 w-4" /> Download Card</button><button type="button" disabled={busy} onClick={() => void shareCard()} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"><Share2 className="h-4 w-4" /> Share</button></div></div>;
}
