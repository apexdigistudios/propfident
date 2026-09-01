"use client";

import { Copy, Check, RotateCcw, AlertCircle, TrendingUp, Target, Shield } from "lucide-react";
import { useState } from "react";
import {
  calculateRisks,
  calculateLotSize,
  calculateAllLotSizes,
  formatCurrency,
  formatLots,
  formatPercentage,
  ASSET_CONFIGS,
  type AssetConfig,
} from "@/lib/risk-calculation";

type StepKey = "account" | "daily" | "drawdown" | "perTrade" | "asset";

export function TradePlanGenerator({ isFreeTier, userId }: { isFreeTier: boolean; userId: string }) {
  const [step, setStep] = useState<StepKey | "review" | "complete">("account");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    accountType: "evaluation",
    balance: "10000",
    dailyRiskPct: "3",
    maxDrawdownPct: "10",
    tradeRiskPct: "1",
    asset: "eur-usd",
  });

  function updateForm(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function goNext() {
    const steps: (StepKey | "review" | "complete")[] = [
      "account",
      "daily",
      "drawdown",
      "perTrade",
      "asset",
      "review",
    ];
    const idx = steps.indexOf(step as StepKey | "review" | "complete");
    if (idx < steps.length - 1) setStep(steps[idx + 1] as StepKey | "review" | "complete");
  }

  function goBack() {
    const steps: (StepKey | "review" | "complete")[] = [
      "account",
      "daily",
      "drawdown",
      "perTrade",
      "asset",
      "review",
    ];
    const idx = steps.indexOf(step as StepKey | "review" | "complete");
    if (idx > 0) setStep(steps[idx - 1] as StepKey | "review" | "complete");
  }

  function reset() {
    setStep("account");
    setForm({
      accountType: "evaluation",
      balance: "10000",
      dailyRiskPct: "3",
      maxDrawdownPct: "10",
      tradeRiskPct: "1",
      asset: "eur-usd",
    });
  }

  const balance = Number(form.balance) || 10000;
  const dailyRiskPct = Number(form.dailyRiskPct) || 3;
  const maxDrawdownPct = Number(form.maxDrawdownPct) || 10;
  const tradeRiskPct = Number(form.tradeRiskPct) || 1;

  const risks = calculateRisks(balance, dailyRiskPct, maxDrawdownPct, tradeRiskPct);
  const lotSizeResult = calculateLotSize(risks.dollarRiskPerTrade, form.asset);
  const allLotSizes = calculateAllLotSizes(risks.dollarRiskPerTrade);

  const stepTitles = ["Account Basics", "Daily Loss", "Max Drawdown", "Risk per Trade", "Primary Asset"];
  const stepIndex = ["account", "daily", "drawdown", "perTrade", "asset"].indexOf(
    step as StepKey
  );
  const canMoveForward = step !== "account" || balance > 0;

  async function copyLotSize() {
    await navigator.clipboard.writeText(formatLots(lotSizeResult.roundedLots));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const asset = ASSET_CONFIGS[form.asset];

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Prop Shield Calculator</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white">
          Risk Management & Lot Sizing
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Generate your personalized weekly trading plan with precise risk calculations and dynamic lot sizing.
        </p>
      </div>

      {/* Main Section */}
      <section className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 shadow-2xl shadow-purple-500/10">
        {/* Progress Bar */}
        <div className="border-b border-purple-500/20 px-6 md:px-8 py-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {step === "complete" ? "Analysis Complete" : `Step ${Math.min(stepIndex + 1, 5)} of 5`}
            </span>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300">
              {step === "complete" ? "Complete" : step !== "review" ? stepTitles[stepIndex] : "Review"}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-brand transition-all duration-300"
              style={{
                width: `${step === "complete" ? 100 : (Math.min(stepIndex + 1, 5) / 5) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          {step === "account" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-3">Account Type</label>
                <div className="flex gap-3">
                  {["evaluation", "funded"].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateForm("accountType", type)}
                      className={`flex-1 rounded-lg border px-4 py-3 text-sm font-bold transition ${
                        form.accountType === type
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3">Starting Balance ($)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={form.balance}
                  onChange={(e) => updateForm("balance", e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                  placeholder="10000"
                />
                {balance > 0 && (
                  <p className="mt-2 text-xs text-slate-400">
                    Your starting capital: <span className="text-purple-300 font-bold">{formatCurrency(balance)}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {step === "daily" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Max Daily Loss Limit</label>
                <p className="text-xs text-slate-400 mb-4">
                  Choose your daily risk tolerance as a percentage of your balance.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["2", "3", "4", "5"].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => updateForm("dailyRiskPct", pct)}
                      className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                        form.dailyRiskPct === pct
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300 mb-2">
                    Daily Loss Limit
                  </p>
                  <p className="text-2xl font-bold text-blue-200">
                    {formatCurrency(risks.dailyMaxLossUSD)}
                  </p>
                  <p className="text-xs text-blue-300/60 mt-1">
                    Maximum you can lose per trading day
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "drawdown" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Max Drawdown Limit (%)</label>
                <p className="text-xs text-slate-400 mb-4">
                  Total equity loss limit before account breach (typically 10-15%).
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["8", "10", "12", "15"].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => updateForm("maxDrawdownPct", pct)}
                      className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                        form.maxDrawdownPct === pct
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300 mb-2">
                    Max Drawdown Limit
                  </p>
                  <p className="text-2xl font-bold text-orange-200">
                    {formatCurrency(risks.maxDrawdownLimitUSD)}
                  </p>
                  <p className="text-xs text-orange-300/60 mt-1">
                    Total capital loss threshold
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "perTrade" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Risk Per Trade (%)</label>
                <p className="text-xs text-slate-400 mb-4">
                  Choose the risk percentage per individual trade.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["0.5", "1", "1.5", "2"].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => updateForm("tradeRiskPct", pct)}
                      className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                        form.tradeRiskPct === pct
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300 mb-2">
                    Trade Risk Amount
                  </p>
                  <p className="text-2xl font-bold text-emerald-200">
                    {formatCurrency(risks.dollarRiskPerTrade)}
                  </p>
                  <p className="text-xs text-emerald-300/60 mt-1">
                    Dollar amount per trade
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "asset" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Primary Asset</label>
                <p className="text-xs text-slate-400 mb-4">
                  Choose your main trading pair or instrument.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(ASSET_CONFIGS).map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => updateForm("asset", asset.id)}
                      className={`rounded-lg border px-4 py-4 text-sm font-bold transition flex flex-col items-start ${
                        form.asset === asset.id
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <span>{asset.label}</span>
                      <span className="text-xs font-normal text-opacity-60 mt-1">
                        {asset.stopLossPips} pips SL
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Account Type</p>
                  <p className="mt-2 text-lg font-bold text-white">
                    {form.accountType.charAt(0).toUpperCase() + form.accountType.slice(1)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Balance</p>
                  <p className="mt-2 text-lg font-bold text-white">{formatCurrency(balance)}</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Daily Max</p>
                  <p className="mt-2 text-lg font-bold text-white">{dailyRiskPct}%</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Max Drawdown</p>
                  <p className="mt-2 text-lg font-bold text-white">{maxDrawdownPct}%</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Trade Risk</p>
                  <p className="mt-2 text-lg font-bold text-white">{tradeRiskPct}%</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Asset</p>
                  <p className="mt-2 text-lg font-bold text-white">{asset?.label}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">Everything looks good? Calculate your trading plan.</p>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                        Account Balance
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(balance)}</p>
                    </div>
                    <div className="rounded-lg bg-purple-500/20 p-2.5">
                      <Shield className="h-5 w-5 text-purple-300" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                        Daily Max Loss
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {formatCurrency(risks.dailyMaxLossUSD)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-500/20 p-2.5">
                      <TrendingUp className="h-5 w-5 text-blue-300" />
                    </div>
                  </div>
                  <p className="text-xs text-blue-300/60">{dailyRiskPct}% of balance</p>
                </div>

                <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                        Max Drawdown
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {formatCurrency(risks.maxDrawdownLimitUSD)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-orange-500/20 p-2.5">
                      <AlertCircle className="h-5 w-5 text-orange-300" />
                    </div>
                  </div>
                  <p className="text-xs text-orange-300/60">{maxDrawdownPct}% total loss limit</p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                        Risk Per Trade
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {formatCurrency(risks.dollarRiskPerTrade)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/20 p-2.5">
                      <Target className="h-5 w-5 text-emerald-300" />
                    </div>
                  </div>
                  <p className="text-xs text-emerald-300/60">{tradeRiskPct}% per trade</p>
                </div>
              </div>

              {/* Lot Sizing Calculations */}
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-300 mb-4">
                  Dynamic Lot Sizing - All Instruments
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allLotSizes.map((lot) => (
                    <div
                      key={lot.assetId}
                      className={`rounded-lg border p-3 transition ${
                        lot.assetId === form.asset
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-700 bg-slate-800/50"
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        {lot.assetLabel}
                      </p>
                      <p className="mt-2 text-lg font-bold text-white">{formatLots(lot.roundedLots)}</p>
                      <p className="text-xs text-slate-500 mt-1">{lot.stopLossPips} pips SL</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Advisory */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-300 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 mb-1">
                      ⚠️ Precision Notice
                    </p>
                    <p className="text-sm text-amber-100/80">
                      Fixed lot size estimates assume a standardized stop-loss. Always head over to the{" "}
                      <a
                        href="/dashboard/calculator"
                        className="font-bold text-amber-300 hover:text-amber-200 underline"
                      >
                        Trade Assist Calculator
                      </a>{" "}
                      before opening positions to adjust lot sizes based on your live stop-loss distance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Strategy Guidance */}
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300 mb-3">
                  Weekly Strategy Directive
                </h3>
                <p className="text-sm leading-6 text-slate-300">
                  Your goal this week is to protect your account and stay consistent. Never risk more than{" "}
                  <span className="font-bold text-white">{formatCurrency(risks.dailyMaxLossUSD)}</span> per day, and keep each trade capped at{" "}
                  <span className="font-bold text-white">{formatCurrency(risks.dollarRiskPerTrade)}</span>. Prioritize high-conviction setups on{" "}
                  <span className="font-bold text-white">{asset?.label}</span> and exit with a disciplined 2:1 reward plan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 border-t border-slate-700 p-6 md:p-8">
          {step === "complete" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={copyLotSize}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-300 transition hover:bg-purple-500/20"
              >
                <Copy className="h-4 w-4" />
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  "Copy Lot Size"
                )}
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {step !== "account" && (
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={step === "review" ? () => setStep("complete") : goNext}
                disabled={!canMoveForward && step === "account"}
                className="flex-1 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {step === "review" ? "Calculate Plan" : "Next Step"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
