"use client";

import { X } from "lucide-react";
import type { FirmEvaluation } from "@/lib/firm-fit/evaluator";
import type { NormalizedTrade } from "@/lib/firm-fit/parser";

interface DiagnosticsModalProps {
  result: FirmEvaluation | null;
  trades: NormalizedTrade[];
  onClose: () => void;
}

export function DiagnosticsModal({ result, trades, onClose }: DiagnosticsModalProps) {
  if (!result) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${result.firm.name} breach details`}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cyan-400/30 bg-slate-950 p-5 shadow-2xl shadow-cyan-950/30 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Diagnostics</p><h2 className="mt-2 text-2xl font-bold text-white">{result.firm.name} breach details</h2></div>
          <button type="button" onClick={onClose} aria-label="Close diagnostics" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 space-y-3">
          {result.breaches.length === 0 ? <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">No rule breaches found in this export.</p> : result.breaches.map((breach) => <p key={breach} className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">{breach}</p>)}
        </div>
        <h3 className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Trade evidence</h3>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800"><table className="w-full min-w-[560px] text-left text-xs"><thead className="bg-slate-900 text-slate-400"><tr><th className="p-3">Ticket</th><th className="p-3">Opened UTC</th><th className="p-3">Closed UTC</th><th className="p-3">P&L</th></tr></thead><tbody>{trades.slice(0, 100).map((trade) => <tr key={`${trade.ticket}-${trade.openTime.toISOString()}`} className="border-t border-slate-800 text-slate-300"><td className="p-3 font-mono">{trade.ticket}</td><td className="p-3">{trade.openTime.toISOString()}</td><td className="p-3">{trade.closeTime.toISOString()}</td><td className="p-3">{trade.pnl.toFixed(2)}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}
