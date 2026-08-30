"use client";

import { Copy, Check, RotateCcw } from "lucide-react";
import { useState } from "react";

type StepKey = "account" | "daily" | "perTrade" | "asset";

const ASSETS = [
  { id: "eur-usd", label: "EUR/USD", defaultStopLoss: 15 },
  { id: "gbp-usd", label: "GBP/USD", defaultStopLoss: 15 },
  { id: "xau-usd", label: "XAU/USD", defaultStopLoss: 25 },
  { id: "us30-nas100", label: "US30/NAS100", defaultStopLoss: 30 },
];

export function TradePlanGenerator({ isFreeTier, userId }: { isFreeTier: boolean; userId: string }) {
  const [step, setStep] = useState<StepKey | "review" | "complete">("account");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    accountType: "evaluation",
    balance: "10000",
    dailyRiskPct: "3",
    tradeRiskPct: "1",
    asset: "eur-usd",
  });

  function updateForm(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function goNext() {
    const steps: (StepKey | "review" | "complete")[] = ["account", "daily", "perTrade", "asset", "review"];
    const idx = steps.indexOf(step as StepKey | "review" | "complete");
    if (idx < steps.length - 1) setStep(steps[idx + 1] as StepKey | "review" | "complete");
  }

  function goBack() {
    const steps: (StepKey | "review" | "complete")[] = ["account", "daily", "perTrade", "asset", "review"];
    const idx = steps.indexOf(step as StepKey | "review" | "complete");
    if (idx > 0) setStep(steps[idx - 1] as StepKey | "review" | "complete");
  }

  function reset() {
    setStep("account");
    setForm({ accountType: "evaluation", balance: "10000", dailyRiskPct: "3", tradeRiskPct: "1", asset: "eur-usd" });
  }

  const balance = Number(form.balance) || 10000;
  const dailyRiskPct = Number(form.dailyRiskPct) || 3;
  const tradeRiskPct = Number(form.tradeRiskPct) || 1;
  const dailyMaxRisk = (balance * dailyRiskPct) / 100;
  const tradeMaxRisk = (balance * tradeRiskPct) / 100;
  const assetData = ASSETS.find((a) => a.id === form.asset) || ASSETS[0];
  const suggestedLotSize = Math.max(0.01, Math.round((tradeMaxRisk / assetData.defaultStopLoss) * 100) / 100);

  const planOutput = `PROPFIDENT WEEKLY TRADING PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Account: ${form.accountType.charAt(0).toUpperCase() + form.accountType.slice(1)} Account
Starting Balance: $${balance.toLocaleString()}

RISK PARAMETERS
────────────────
Daily Risk Limit: $${dailyMaxRisk.toFixed(2)} (${dailyRiskPct}% of balance)
Risk Per Trade: $${tradeMaxRisk.toFixed(2)} (${tradeRiskPct}% of balance)
Primary Asset: ${assetData.label}
Suggested Lot Size: ${suggestedLotSize} lots

WEEKLY STRATEGY DIRECTIVE
──────────────────────────
Your goal this week is to grow your account safely and consistently. Never risk more than $${dailyMaxRisk.toFixed(2)} per day—this is your capital preservation line. On each trade, target ${tradeRiskPct}% risk ($${tradeMaxRisk.toFixed(2)}), which means if your stop loss is ${assetData.defaultStopLoss} pips away, use ${suggestedLotSize} lots.

Execute only high-conviction trades on ${assetData.label}. Close winners at 2:1 reward-to-risk. If you hit your daily loss limit, stop trading—wait for tomorrow. Preserve your equity above all else.

ACCOUNT PARAMETER SUMMARY
─────────────────────────
Starting Balance:             $${balance.toLocaleString()}
Max Daily Loss Allowed:       $${dailyMaxRisk.toFixed(2)}
Max Risk Per Individual Trade: $${tradeMaxRisk.toFixed(2)}
Recommended Lot Size:         ${suggestedLotSize} lots
Target Stop Loss Pips:        ${assetData.defaultStopLoss} pips

💡 RISK ADVISORY
─────────────────
Market volatility varies daily. Always use our Position Size Calculator before opening a trade to calculate precise lot sizes based on your exact stop-loss pips. This plan is a framework—adapt it to real market conditions.

Remember: Staying profitable means staying in the game. Never let a single trade ruin your week.`;

  async function copyPlan() {
    await navigator.clipboard.writeText(planOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const stepTitles = [
    "Account Basics",
    "Daily Loss",
    "Risk per Trade",
    "Primary Asset",
  ];

  const stepIndex = step === "account" ? 0 : step === "daily" ? 1 : step === "perTrade" ? 2 : step === "asset" ? 3 : 4;
  const canMoveForward = step !== "account" || Number(form.balance) > 0;

  async function copyLotSize() {
    await navigator.clipboard.writeText(`${suggestedLotSize.toFixed(2)} lots`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden">
      <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-950/40 p-3 text-center text-sm text-blue-300">
        🚀 AI-Powered Live Assistant Coming Soon — Currently using Precision Formula Engine
      </div>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Trade Assist V2</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Prop Shield Questionnaire</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Answer a few quick questions and generate your personalized weekly trading plan instantly.</p>
      </header>

      <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-900/80 shadow-2xl shadow-black/20">
        <div className="border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {step === "complete" ? "Plan Ready" : `Step ${Math.min(stepIndex + 1, 4)} of 4`}
            </span>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300">
              {step === "complete" ? "Complete" : step !== "review" ? stepTitles[stepIndex] : "Review"}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-brand transition-all duration-300"
              style={{ width: `${step === "complete" ? 100 : (Math.min(stepIndex + 1, 4) / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 p-6 md:p-8">
          {step === "account" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white">Account Type</label>
                <div className="mt-3 flex gap-3">
                  {["evaluation", "funded"].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateForm("accountType", type)}
                      className={`flex-1 rounded-lg border px-4 py-3 text-sm font-bold transition ${
                        form.accountType === type
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white">Starting Balance ($)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={form.balance}
                  onChange={(e) => updateForm("balance", e.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === "daily" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white">Max Daily Loss Limit</label>
                <p className="mt-1 text-xs text-slate-400">Choose your daily risk tolerance as a percentage of your balance.</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {["3", "4", "5"].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => updateForm("dailyRiskPct", pct)}
                      className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                        form.dailyRiskPct === pct
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Daily Loss Limit: ${((Number(form.balance) * Number(form.dailyRiskPct)) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {step === "perTrade" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white">Risk Per Trade</label>
                <p className="mt-1 text-xs text-slate-400">Choose the risk percentage per individual trade.</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {["0.5", "1", "1.5"].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => updateForm("tradeRiskPct", pct)}
                      className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                        form.tradeRiskPct === pct
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Trade Risk Amount: ${((Number(form.balance) * Number(form.tradeRiskPct)) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {step === "asset" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white">Primary Asset</label>
                <p className="mt-1 text-xs text-slate-400">Choose your main trading pair or instrument.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => updateForm("asset", asset.id)}
                      className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${
                        form.asset === asset.id
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {asset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-700 bg-slate-950 p-6">
                <h3 className="text-lg font-bold text-white">Review Your Answers</h3>
                <dl className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-400">Account Type</dt>
                    <dd className="text-sm font-bold text-white">{form.accountType.charAt(0).toUpperCase() + form.accountType.slice(1)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-400">Balance</dt>
                    <dd className="text-sm font-bold text-white">${Number(form.balance).toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-400">Daily Risk Limit</dt>
                    <dd className="text-sm font-bold text-white">{form.dailyRiskPct}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-400">Risk Per Trade</dt>
                    <dd className="text-sm font-bold text-white">{form.tradeRiskPct}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-400">Primary Asset</dt>
                    <dd className="text-sm font-bold text-white">{ASSETS.find((a) => a.id === form.asset)?.label}</dd>
                  </div>
                </dl>
              </div>
              <p className="text-xs text-slate-500">Everything looks good? Generate your plan.</p>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Weekly Strategy Directive</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Your goal this week is to protect your account and stay consistent. Never risk more than ${dailyMaxRisk.toFixed(2)} per day, and keep each trade capped at ${tradeMaxRisk.toFixed(2)}. Prioritize high-conviction setups on {assetData.label} and exit with a disciplined 2:1 reward plan.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Account Metrics</p>
                  <dl className="mt-4 space-y-3 text-sm text-slate-300">
                    <div className="flex justify-between gap-4"><dt>Balance</dt><dd className="font-bold text-white">${balance.toLocaleString()}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Daily Max Risk</dt><dd className="font-bold text-white">${dailyMaxRisk.toFixed(2)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Max Trade Risk</dt><dd className="font-bold text-white">${tradeMaxRisk.toFixed(2)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Suggested Base Lot</dt><dd className="font-bold text-purple-300">{suggestedLotSize.toFixed(2)} lots</dd></div>
                  </dl>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Quick Risk Notes</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-300">
                    <li>• Account type: {form.accountType.charAt(0).toUpperCase() + form.accountType.slice(1)}</li>
                    <li>• Daily loss cap: {dailyRiskPct}%</li>
                    <li>• Risk per trade: {tradeRiskPct}%</li>
                    <li>• Primary asset: {assetData.label}</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-7 text-amber-100">
                💡 Note: Market volatility varies. Always use our Position Size Calculator before opening a trade to calculate precise lot sizes based on your exact stop-loss pips.
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-300">
                {planOutput}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 p-6">
          {step === "complete" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={copyLotSize}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-300 transition hover:bg-purple-500/20"
              >
                <Copy className="h-4 w-4" />
                {copied ? <><Check className="h-4 w-4" /> Copied</> : "Copy Lot Size"}
              </button>
              <button
                type="button"
                onClick={copyPlan}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-300 transition hover:bg-purple-500/20"
              >
                <Copy className="h-4 w-4" />
                Copy Entire Plan
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over / Re-Calculate
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {step !== "account" && (
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
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
                {step === "review" ? "Calculate Weekly Plan" : "Next"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
