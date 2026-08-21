"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";

export interface CalculatorAccount {
  id: string;
  accountName: string;
  platform: string;
  accountNumber: string;
  balance: number;
  equity: number;
  highWaterMark: number;
  initialBalance: number;
  maxTotalDrawdownPct: number;
  maxDailyDrawdownPct: number;
  drawdownType: string;
  headroom: number;
}

const INSTRUMENTS = [
  { symbol: "EURUSD", pipValue: 10, notionalPerLot: 110000, label: "EURUSD · FX Major" },
  { symbol: "GBPUSD", pipValue: 10, notionalPerLot: 135000, label: "GBPUSD · FX Major" },
  { symbol: "USDJPY", pipValue: 9.1, notionalPerLot: 15300, label: "USDJPY · FX Major" },
  { symbol: "XAUUSD", pipValue: 100, notionalPerLot: 200000, label: "XAUUSD · Gold" },
  { symbol: "NAS100", pipValue: 1, notionalPerLot: 25000, label: "NAS100 · Index" },
  { symbol: "US30", pipValue: 1, notionalPerLot: 30000, label: "US30 · Index" },
  { symbol: "BTCUSD", pipValue: 1, notionalPerLot: 100000, label: "BTCUSD · Crypto" },
  { symbol: "CUSTOM", pipValue: 0, notionalPerLot: 100000, label: "Custom Pip Value" },
];

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function LotCalculatorEngine({ accounts }: { accounts: CalculatorAccount[] }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [customCapital, setCustomCapital] = useState("");
  const [riskMode, setRiskMode] = useState<"pct" | "usd">("pct");
  const [riskPct, setRiskPct] = useState(1);
  const [riskUsd, setRiskUsd] = useState("");
  const [instrument, setInstrument] = useState(INSTRUMENTS[0]);
  const [customPipValue, setCustomPipValue] = useState("10");
  const [stopLoss, setStopLoss] = useState(20);
  const [copied, setCopied] = useState(false);

  const selectedAccount = accounts.find((account) => account.id === accountId) || null;
  const useCustom = accountId === "custom";

  const effectivePipValue =
    instrument.symbol === "CUSTOM"
      ? Number(customPipValue) || 0
      : instrument.pipValue;

  const calc = useMemo(() => {
    const capital = useCustom
      ? Number(customCapital) || 0
      : selectedAccount
        ? selectedAccount.equity
        : 0;

    const riskAmount =
      riskMode === "pct" ? (capital * riskPct) / 100 : Number(riskUsd) || 0;

    const denominator = stopLoss * effectivePipValue;
    const lotSize = denominator > 0 ? riskAmount / denominator : 0;

    const headroom = useCustom ? capital : selectedAccount?.headroom ?? 0;

    return {
      capital,
      riskAmount,
      lotSize,
      miniLots: lotSize * 10,
      microLots: lotSize * 100,
      pipValueAtPosition: lotSize * effectivePipValue,
      notional: lotSize * instrument.notionalPerLot,
      headroom,
      exceedsHeadroom: riskAmount > headroom && headroom > 0,
    };
  }, [
    useCustom,
    customCapital,
    selectedAccount,
    riskMode,
    riskPct,
    riskUsd,
    stopLoss,
    effectivePipValue,
    instrument,
  ]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(calc.lotSize.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-3">
        <h2 className="text-lg font-bold text-white">Sizing Inputs</h2>
        <p className="text-xs text-slate-400">
          {useCustom
            ? "Using custom capital"
            : selectedAccount
              ? `Linked: ${selectedAccount.accountName} (${selectedAccount.platform})`
              : "No account linked"}
        </p>

        <div className="mt-6 space-y-5">
          {/* Capital source */}
          <div className="min-w-0">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Capital Source
            </label>
            <select
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              className="mt-1.5 w-full min-w-0 appearance-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName} · Equity {usd.format(account.equity)}
                </option>
              ))}
              <option value="custom">Custom Capital (Manual)</option>
            </select>
          </div>

          {useCustom && (
            <div className="min-w-0">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account Balance / Equity ($)
              </label>
              <input
                type="number"
                min="0"
                value={customCapital}
                onChange={(event) => setCustomCapital(event.target.value)}
                placeholder="100000"
                className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          )}

          {/* Instrument */}
          <div className="min-w-0">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Asset Class / Instrument
            </label>
            <select
              value={instrument.symbol}
              onChange={(event) => {
                const next = INSTRUMENTS.find((item) => item.symbol === event.target.value);
                if (next) setInstrument(next);
              }}
              className="mt-1.5 w-full min-w-0 appearance-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              {INSTRUMENTS.map((item) => (
                <option key={item.symbol} value={item.symbol}>
                  {item.label}
                </option>
              ))}
            </select>
            {instrument.symbol === "CUSTOM" && (
              <input
                type="number"
                step="0.01"
                min="0"
                value={customPipValue}
                onChange={(event) => setCustomPipValue(event.target.value)}
                placeholder="Pip value per standard lot"
                className="mt-2 w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            )}
          </div>

          {/* Risk mode */}
          <div className="min-w-0">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Risk Model
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRiskMode("pct")}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  riskMode === "pct"
                    ? "bg-purple-600 text-white"
                    : "border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                }`}
              >
                Risk %
              </button>
              <button
                type="button"
                onClick={() => setRiskMode("usd")}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  riskMode === "usd"
                    ? "bg-purple-600 text-white"
                    : "border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                }`}
              >
                Fixed $ Risk
              </button>
            </div>

            {riskMode === "pct" ? (
              <div className="mt-3">
                <div className="flex gap-2">
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
                <p className="mt-1 text-right font-mono text-xs text-slate-400">
                  {riskPct.toFixed(2)}% of {usd.format(calc.capital)}
                </p>
              </div>
            ) : (
              <input
                type="number"
                min="0"
                step="100"
                value={riskUsd}
                onChange={(event) => setRiskUsd(event.target.value)}
                placeholder="1000"
                className="mt-3 w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            )}
          </div>

          {/* Stop loss */}
          <div className="min-w-0">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Stop Loss Distance (Pips / Points)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={stopLoss}
              onChange={(event) => setStopLoss(Number(event.target.value))}
              className="mt-1.5 w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Outputs */}
      <section className="flex min-w-0 flex-col rounded-2xl border border-purple-500/20 bg-slate-900/80 p-6 lg:col-span-2">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              Recommended Position
            </p>
            <div className="mt-3 flex items-center gap-3">
              <p className="min-w-0 truncate text-5xl font-black tracking-tighter text-white">
                {calc.lotSize.toFixed(2)}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy calculated lot size"
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/40 transition hover:bg-purple-500/10 ${
                  copied ? "text-emerald-400" : "text-purple-300"
                }`}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 min-w-0">
          <LotUnit label="Standard" value={calc.lotSize.toFixed(2)} />
          <LotUnit label="Mini" value={calc.miniLots.toFixed(1)} />
          <LotUnit label="Micro" value={calc.microLots.toFixed(0)} />
        </div>

        <div className="mt-6 space-y-3 border-t border-slate-800 pt-5 font-mono text-xs min-w-0">
          <OutputRow label="Exact Dollar Risk" value={usd.format(calc.riskAmount)} tone="text-amber-400" />
          <OutputRow label="Pip/Point Value" value={`${usd.format(calc.pipValueAtPosition)} per pip`} />
          <OutputRow label="Notional Exposure" value={`≈ ${usd.format(calc.notional)}`} />
          <OutputRow
            label="Drawdown Headroom"
            value={useCustom ? "n/a (custom capital)" : usd.format(calc.headroom)}
          />
        </div>

        {calc.exceedsHeadroom && (
          <div className="mt-6 flex min-w-0 items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-red-300">Drawdown Safety Check Failed</p>
              <p className="mt-1 break-words text-xs text-red-400">
                Position risk of {usd.format(calc.riskAmount)} exceeds remaining drawdown
                headroom of {usd.format(calc.headroom)}. Reduce risk or stop loss distance.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function LotUnit({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
      <p className="truncate font-mono text-sm font-bold text-white">{value}</p>
      <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

function OutputRow({ label, value, tone = "text-slate-200" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className={`min-w-0 truncate font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
