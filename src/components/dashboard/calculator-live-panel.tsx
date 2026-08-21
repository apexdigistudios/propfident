"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Lock } from "lucide-react";

const INSTRUMENTS = [
  { symbol: "EURUSD", pipValue: 10 },
  { symbol: "GBPUSD", pipValue: 10 },
  { symbol: "USDJPY", pipValue: 9.1 },
  { symbol: "XAUUSD", pipValue: 100 },
  { symbol: "US30", pipValue: 1 },
  { symbol: "BTCUSD", pipValue: 1 },
];

export function CalculatorLivePanel({
  accountBalance,
  accountName,
}: {
  accountBalance: number;
  accountName: string;
}) {
  const [riskPct, setRiskPct] = useState(1);
  const [instrument, setInstrument] = useState(INSTRUMENTS[0]);
  const [stopLossPips, setStopLossPips] = useState(20);
  const [copied, setCopied] = useState(false);

  const calculation = useMemo(() => {
    const riskAmount = (accountBalance * riskPct) / 100;
    const denominator = stopLossPips * instrument.pipValue;
    const lotSize = denominator > 0 ? riskAmount / denominator : 0;
    return { riskAmount, lotSize };
  }, [accountBalance, riskPct, instrument, stopLossPips]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(calculation.lotSize.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
      <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div>
          <h2 className="text-lg font-bold text-white">Risk Inputs</h2>
          <p className="text-xs text-slate-400">Using live balance from {accountName}</p>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Account Balance
            </label>
            <div className="mt-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-white">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(accountBalance)}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Risk Percentage
            </label>
            <div className="mt-2 flex gap-2">
              {[0.5, 1, 2].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setRiskPct(pct)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                    riskPct === pct
                      ? "bg-purple-600 text-white"
                      : "border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={riskPct}
              onChange={(event) => setRiskPct(Number(event.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-purple-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Instrument
            </label>
            <select
              value={instrument.symbol}
              onChange={(event) => {
                const next = INSTRUMENTS.find((item) => item.symbol === event.target.value);
                if (next) setInstrument(next);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              {INSTRUMENTS.map((item) => (
                <option key={item.symbol} value={item.symbol}>
                  {item.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Stop Loss (Pips)
            </label>
            <input
              type="number"
              min="0"
              value={stopLossPips}
              onChange={(event) => setStopLossPips(Number(event.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="flex min-w-0 flex-col justify-center rounded-2xl border border-purple-500/20 bg-slate-900/80 p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">
          Calculated Lot Size
        </p>
        <div className="mt-4 flex items-center gap-4">
          <p className="text-5xl font-black tracking-tighter text-white">
            {calculation.lotSize.toFixed(2)}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/40 transition hover:bg-purple-500/10 ${
              copied ? "text-emerald-400" : "text-purple-300"
            }`}
            title="Copy calculated lot size"
          >
            {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
          </button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
          <div>
            <p className="text-xs text-slate-400">Monetary Risk</p>
            <p className="mt-1 text-lg font-bold text-white">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(calculation.riskAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Risk %</p>
            <p className="mt-1 text-lg font-bold text-amber-400">{riskPct.toFixed(2)}%</p>
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          <Lock className="mr-1 inline h-3 w-3" />
          Calculation is based entirely on your active Supabase account balance.
        </p>
      </section>
    </div>
  );
}
