"use client";

import { Calculator } from "lucide-react";
import { useMemo, useState } from "react";

const PAIRS = [
  { symbol: "EUR/USD", pipValuePerLot: 10 },
  { symbol: "GBP/USD", pipValuePerLot: 10 },
  { symbol: "USD/JPY", pipValuePerLot: 9.1 },
  { symbol: "XAU/USD", pipValuePerLot: 10 },
];

export default function LotCalculatorVisual() {
  const [balance, setBalance] = useState(50000);
  const [riskPct, setRiskPct] = useState(1);
  const [stopPips, setStopPips] = useState(20);
  const [pairIdx, setPairIdx] = useState(0);

  const { riskAmount, lotSize } = useMemo(() => {
    const risk = (balance * riskPct) / 100;
    const pipValue = PAIRS[pairIdx].pipValuePerLot;
    const denom = stopPips * pipValue;
    const lots = denom > 0 ? risk / denom : 0;
    return {
      riskAmount: risk,
      lotSize: Math.max(0, lots),
    };
  }, [balance, riskPct, stopPips, pairIdx]);

  return (
    <div className="glow-brand h-full w-full rounded-2xl border border-slate-200 bg-white p-6 dark:border-purple-500/30 dark:bg-slate-900/90">
      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
        <Calculator className="h-5 w-5" strokeWidth={2.5} />
        <span className="text-xs font-bold uppercase tracking-wider">
          Position Sizer
        </span>
      </div>

      {/* Pair selector */}
      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {PAIRS.map((p, i) => (
          <button
            key={p.symbol}
            type="button"
            onClick={() => setPairIdx(i)}
            className={
              "rounded-lg border px-1 py-1.5 text-[11px] font-semibold transition " +
              (i === pairIdx
                ? "border-transparent bg-gradient-brand text-white"
                : "border-slate-200 text-slate-600 hover:border-purple-300 dark:border-purple-500/30 dark:text-slate-400")
            }
          >
            {p.symbol}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="mt-5 space-y-4">
        <Field
          label="Account Balance"
          suffix="USD"
          value={balance}
          min={1000}
          max={500000}
          step={1000}
          onChange={setBalance}
        />
        <Field
          label="Risk per Trade"
          suffix="%"
          value={riskPct}
          min={0.25}
          max={5}
          step={0.25}
          onChange={setRiskPct}
        />
        <Field
          label="Stop Loss"
          suffix="pips"
          value={stopPips}
          min={5}
          max={200}
          step={1}
          onChange={setStopPips}
        />
      </div>

      {/* Output */}
      <div className="mt-5 rounded-xl border border-purple-500/25 bg-purple-500/5 p-4 dark:bg-purple-500/10">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recommended Lot Size
            </div>
            <div className="mt-0.5 text-3xl font-extrabold text-gradient-brand">
              {lotSize.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Risk Amount
            </div>
            <div className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">
              ${riskAmount.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </label>
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {value.toLocaleString()}{" "}
          <span className="text-xs font-medium text-slate-500">{suffix}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-purple-600 dark:bg-slate-700"
      />
    </div>
  );
}
