"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cpu,
  Server,
  KeyRound,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  Anchor,
  Scale,
  Rocket,
  PartyPopper,
  Landmark,
  BadgeDollarSign,
} from "lucide-react";

type DrawdownType = "trailing" | "static" | "balance_based";
type AccountType = "evaluation" | "verification" | "funded";
type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";
type Platform = "MT4" | "MT5";

type ConnectFormData = {
  account_name: string;
  login_id: string;
  password: string;
  server: string;
  broker: string;
  platform: Platform;
  account_currency: Currency;
  account_type: AccountType;
  initial_balance: string;
  max_total_drawdown: string;
  max_daily_drawdown: string;
  drawdown_type: DrawdownType;
};

const STEP_META = [
  { n: 1, label: "Broker & Platform" },
  { n: 2, label: "Credentials" },
  { n: 3, label: "Firm Rules & Risk" },
];

const POPULAR_BROKERS = ["FTMO", "FundedNext", "IC Markets", "Forex.com", "Exness", "The5ers"];
const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "CAD", "AUD"];

const inputCls =
  "mt-1.5 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-slate-400";

export function ConnectAccountWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [metaApiConnected, setMetaApiConnected] = useState(false);
  const [dealCount, setDealCount] = useState(0);

  const [formData, setFormData] = useState<ConnectFormData>({
    account_name: "",
    login_id: "",
    password: "",
    server: "",
    broker: "",
    platform: "MT5",
    account_currency: "USD",
    account_type: "evaluation",
    initial_balance: "100000",
    max_total_drawdown: "10",
    max_daily_drawdown: "5",
    drawdown_type: "trailing",
  });

  const updateFormData = <K extends keyof ConnectFormData>(
    key: K,
    value: ConnectFormData[K]
  ) => setFormData((current) => ({ ...current, [key]: value }));

  /* ── Per-step validation: blocks navigation until fields are complete ── */
  const validateStep = (target: number): string | null => {
    if (target === 1) {
      if (!formData.account_name.trim()) return "Give this account a name or alias.";
      const bal = Number(formData.initial_balance);
      if (!Number.isFinite(bal) || bal <= 0) return "Enter a valid initial balance.";
    }
    if (target === 2) {
      if (!formData.login_id.trim() || !/^\d+$/.test(formData.login_id.trim()))
        return "Enter a valid numeric MetaTrader account ID.";
      if (!formData.password.trim()) return "Enter your trader or investor password.";
    }
    if (target === 3) {
      if (!formData.broker.trim()) return "Enter your broker name (e.g. FTMO).";
      if (!formData.server.trim()) return "Enter the exact broker server name.";
      if (Number(formData.max_total_drawdown) <= 0) return "Enter a valid max overall drawdown %.";
      if (Number(formData.max_daily_drawdown) <= 0) return "Enter a valid max daily drawdown %.";
    }
    return null;
  };

  const goTo = (target: number) => {
    const problem = validateStep(step);
    if (problem) {
      setFieldError(problem);
      return;
    }
    setFieldError(null);
    setError(null);
    setStep(target);
  };

  const handleSubmit = async () => {
    const problem = validateStep(3);
    if (problem) {
      setFieldError(problem);
      return;
    }

    setFieldError(null);
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/metaapi/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          account_name: formData.account_name.trim(),
          initial_balance: Number(formData.initial_balance) || 0,
          login_id: formData.login_id.trim(),
          password: formData.password,
          server: formData.server.trim(),
          broker: formData.broker.trim(),
          accountName: formData.account_name.trim(),
          brokerName: formData.broker.trim(),
          brokerServer: formData.server.trim(),
          accountNumber: formData.login_id.trim(),
          accountCurrency: formData.account_currency,
          accountType: formData.account_type,
          initialBalance: Number(formData.initial_balance) || 0,
          maxTotalDrawdownPct: Number(formData.max_total_drawdown),
          maxDailyDrawdownPct: Number(formData.max_daily_drawdown),
          drawdownType: formData.drawdown_type,
        }),
      });

      const result = await res.json();
      setSubmitting(false);

      if (!res.ok || !result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Failed to connect trading account. Please try again later."
        );
        return;
      }

      setMetaApiConnected(result.metaApiConnected ?? false);
      setDealCount(result.dealCount ?? 0);
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setSubmitting(false);
      console.error("[Connect Account UI Error]:", err);
      setError("Failed to connect trading account. Please try again later.");
    }
  };

  /* ── Success confirmation state ─────────────────────────────── */
  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-10 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
          Prop Account Created
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-200">{formData.account_name}</span> · {formData.platform} ·{" "}
          <span className="font-mono">{formData.server}</span> — {formData.account_currency}{" "}
          <span className="font-mono">{Number(formData.initial_balance).toLocaleString()}</span> is now live.
        </p>
        <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-500">
          {metaApiConnected
            ? `MetaApi terminal connected · ${dealCount} historical deal${dealCount === 1 ? "" : "s"} synced to your journal. Real-time trade sync is active.`
            : "Local account record created. Configure METAAPI_TOKEN to enable live terminal provisioning and real-time deal sync."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/dashboard/prop-shield")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:brightness-110"
          >
            <Rocket className="h-4 w-4" />
            Open Prop Shield
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
          >
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl md:p-8">
      {/* ── Visual step indicator bar ────────────────────────────── */}
      <ol className="mb-8 flex items-center">
        {STEP_META.map((item, index) => {
          const done = step > item.n;
          const active = step === item.n;
          return (
            <li key={item.n} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-bold transition-all duration-300 ${
                    done
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : active
                        ? "border-purple-500 bg-purple-500/20 text-purple-200"
                        : "border-slate-700 bg-slate-950 text-slate-500"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : item.n}
                </span>
                <span
                  className={`hidden text-xs font-bold sm:block ${
                    active ? "text-white" : done ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {index < STEP_META.length - 1 && (
                <span
                  className={`mx-3 h-0.5 flex-1 rounded transition-colors duration-300 ${
                    step > item.n ? "bg-emerald-500" : "bg-slate-800"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* ── Sliding step track ───────────────────────────────────── */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
        >
          {/* STEP 1 — Broker & Platform */}
          <StepPane>
            <FieldHeading icon={Building2} title="Broker & platform details" />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <PlatformCard
                active={formData.platform === "MT4"}
                onClick={() => updateFormData("platform", "MT4")}
                icon={<Cpu className="h-6 w-6" />}
                name="MetaTrader 4"
                sub="MT4 terminal"
              />
              <PlatformCard
                active={formData.platform === "MT5"}
                onClick={() => updateFormData("platform", "MT5")}
                icon={<Server className="h-6 w-6" />}
                name="MetaTrader 5"
                sub="MT5 terminal"
              />
            </div>

            <div className="mt-5">
              <label className={labelCls}>Account Name / Alias</label>
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => updateFormData("account_name", e.target.value)}
                placeholder="e.g., My Headway Demo Account"
                className={inputCls}
              />
            </div>

            <div className="mt-4">
              <label className={labelCls}>Initial Balance ($)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.initial_balance}
                onChange={(e) => updateFormData("initial_balance", e.target.value)}
                placeholder="e.g., 10000"
                className={inputCls}
              />
            </div>
          </StepPane>

          {/* STEP 2 — Credentials & Metadata */}
          <StepPane>
            <FieldHeading icon={KeyRound} title="Account credentials & metadata" />

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Account Login / ID</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.login_id}
                    onChange={(e) => updateFormData("login_id", e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 40218"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    placeholder="Trader or investor read-only password"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Account Currency</label>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateFormData("account_currency", c)}
                      className={`rounded-lg border px-2 py-2.5 font-mono text-xs font-bold transition ${
                        formData.account_currency === c
                          ? "border-purple-500 bg-purple-600/15 text-purple-200"
                          : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </StepPane>

          {/* STEP 3 — Firm Rules & Risk */}
          <StepPane>
            <FieldHeading icon={BadgeDollarSign} title="Prop firm rules & risk parameters" />

            <div className="mt-4 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Broker Name</label>
                  <input
                    type="text"
                    list="popular-brokers"
                    value={formData.broker}
                    onChange={(e) => updateFormData("broker", e.target.value)}
                    placeholder="e.g. FTMO, FundedNext, IC Markets"
                    className={inputCls}
                  />
                  <datalist id="popular-brokers">
                    {POPULAR_BROKERS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className={labelCls}>Server Name</label>
                  <input
                    type="text"
                    value={formData.server}
                    onChange={(e) => updateFormData("server", e.target.value)}
                    placeholder="e.g. FTMO-Demo, FundedNext-Server2"
                    className={inputCls}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Use the exact server string shown in your MT terminal&apos;s login window.
              </p>

              {/* Account type / model */}
              <div>
                <label className={labelCls}>Account Type / Model</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <TypeCard
                    active={formData.account_type === "evaluation"}
                    onClick={() => updateFormData("account_type", "evaluation")}
                    icon={<Landmark className="h-4 w-4" />}
                    label="Evaluation / Challenge"
                  />
                  <TypeCard
                    active={formData.account_type === "verification"}
                    onClick={() => updateFormData("account_type", "verification")}
                    icon={<Check className="h-4 w-4" />}
                    label="Verification / Step 2"
                  />
                  <TypeCard
                    active={formData.account_type === "funded"}
                    onClick={() => updateFormData("account_type", "funded")}
                    icon={<Rocket className="h-4 w-4" />}
                    label="Funded / Live"
                  />
                </div>
              </div>

              {/* Drawdown limits */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Max Overall Drawdown %</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.max_total_drawdown}
                    onChange={(e) => updateFormData("max_total_drawdown", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Max Daily Drawdown %</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.max_daily_drawdown}
                    onChange={(e) => updateFormData("max_daily_drawdown", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Drawdown calculation type */}
              <div>
                <label className={labelCls}>Drawdown Calculation Type</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <TypeCard
                    active={formData.drawdown_type === "trailing"}
                    onClick={() => updateFormData("drawdown_type", "trailing")}
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Trailing (HWM based)"
                  />
                  <TypeCard
                    active={formData.drawdown_type === "static"}
                    onClick={() => updateFormData("drawdown_type", "static")}
                    icon={<Anchor className="h-4 w-4" />}
                    label="Static (initial balance)"
                  />
                  <TypeCard
                    active={formData.drawdown_type === "balance_based"}
                    onClick={() => updateFormData("drawdown_type", "balance_based")}
                    icon={<Scale className="h-4 w-4" />}
                    label="Balance-Based (daily start)"
                  />
                </div>
              </div>
            </div>
          </StepPane>
        </div>
      </div>

      {/* Error + field error */}
      {(error || fieldError) && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-sm text-rose-300"
        >
          {error || fieldError}
        </div>
      )}

      {/* Nav buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goTo(step - 1)}
          disabled={step === 1}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={() => goTo(step + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:brightness-110"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Create Prop Account
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function StepPane({ children }: { children: React.ReactNode }) {
  return <div className="w-full shrink-0 px-0.5">{children}</div>;
}

function FieldHeading({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 shrink-0 text-purple-400" />
      <h3 className="text-base font-bold tracking-tight text-white">{title}</h3>
    </div>
  );
}

function PlatformCard({
  active,
  onClick,
  icon,
  name,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  name: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all duration-200 ${
        active
          ? "border-purple-500 bg-purple-600/15 shadow-lg shadow-purple-600/10"
          : "border-slate-700 bg-slate-950 hover:border-slate-600"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${
          active ? "bg-purple-500/20 text-purple-300" : "bg-slate-800 text-slate-400"
        }`}
      >
        {icon}
      </div>
      <p className={`mt-3 text-sm font-bold tracking-tight ${active ? "text-white" : "text-slate-300"}`}>
        {name}
      </p>
      <p className="text-xs text-slate-500">{sub}</p>
    </button>
  );
}

function TypeCard({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200 ${
        active
          ? "border-purple-500 bg-purple-600/15 text-purple-200"
          : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"
      }`}
    >
      {icon}
      <span className="text-center text-xs font-bold leading-snug">{label}</span>
    </button>
  );
}
