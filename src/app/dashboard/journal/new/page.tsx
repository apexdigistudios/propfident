"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, NotebookPen, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveJournalTrade } from "@/app/actions/journal";

const SETUP_TAGS = ["Order Block", "FVG", "Liquidity Sweep", "Breakout", "Reversal", "Scalp"];

type AccountOption = {
  id: string;
  account_name: string;
  platform: string;
};

type Toast = {
  type: "success" | "error";
  message: string;
} | null;

export default function NewTradePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [toast, setToast] = useState<Toast>(null);
  const [formData, setFormData] = useState({
    account_id: "",
    symbol: "",
    action: "BUY",
    volume: "",
    open_price: "",
    close_price: "",
    stop_loss: "",
    take_profit: "",
    pnl: "",
    status: "WIN",
    setup_tag: "",
    notes: "",
  });

  useEffect(() => {
    async function loadAccounts() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("mt5_accounts")
        .select("id, account_name, platform")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      const liveAccounts = data || [];
      setAccounts(liveAccounts);
      setFormData((current) => ({
        ...current,
        account_id: liveAccounts[0]?.id || "",
      }));
      setLoadingAccounts(false);
    }

    loadAccounts();
  }, [router, supabase]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    const pnlValue = Number(formData.pnl || 0);
    const normalizedPnl = formData.status === "LOSS" && pnlValue > 0 ? pnlValue * -1 : pnlValue;

    const result = await saveJournalTrade({
      account_id: formData.account_id || null,
      symbol: formData.symbol,
      action: formData.action,
      open_price: Number(formData.open_price),
      close_price: formData.close_price ? Number(formData.close_price) : null,
      stop_loss: formData.stop_loss ? Number(formData.stop_loss) : null,
      take_profit: formData.take_profit ? Number(formData.take_profit) : null,
      volume: Number(formData.volume),
      pnl: normalizedPnl,
      status: formData.status,
      notes: formData.notes,
      tags: formData.setup_tag ? [formData.setup_tag] : [],
    });

    setIsSubmitting(false);

    if (!result.success) {
      showToast("error", result.error || "Failed to save trade entry.");
      return;
    }

    showToast("success", "Trade saved to journal.");
    setTimeout(() => router.push("/dashboard/journal"), 800);
  };

  if (loadingAccounts) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <NotebookPen className="mx-auto h-12 w-12 text-slate-600" />
        <h2 className="mt-4 text-lg font-bold text-slate-300">
          No account available for trade entry
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Connect a prop account before logging manual trades.
        </p>
        <Link
          href="/dashboard/account-intel/connect"
          className="mt-6 inline-flex rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-2.5 text-sm font-bold text-purple-200 transition hover:bg-purple-500/20"
        >
          Connect Account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 w-full max-w-2xl space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-xl ${
            toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-300"
              : "border-rose-500/30 bg-rose-950/90 text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-white">Manual Trade Entry</h2>
        <p className="text-sm text-slate-400">
          Record your result and let Propfident handle the P&L sign correctly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="min-w-0 space-y-6 rounded-2xl border border-purple-500/20 bg-slate-900/80 p-4 sm:p-6"
      >
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account
          </label>
          <select
            value={formData.account_id}
            onChange={(event) =>
              setFormData({ ...formData, account_id: event.target.value })
            }
            className="mt-1.5 w-full min-w-0 rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name} · {account.platform}
              </option>
            ))}
          </select>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <Field
            label="Symbol / Pair"
            required
            value={formData.symbol}
            onChange={(value) =>
              setFormData({ ...formData, symbol: value.toUpperCase() })
            }
            placeholder="EURUSD"
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Action
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, action: "BUY" })}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  formData.action === "BUY"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-800"
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, action: "SELL" })}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                  formData.action === "SELL"
                    ? "bg-rose-600 text-white"
                    : "border border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-800"
                }`}
              >
                SELL
              </button>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-3">
          <Field
            label="Lot Size (Volume)"
            type="number"
            step="0.01"
            required
            value={formData.volume}
            onChange={(value) => setFormData({ ...formData, volume: value })}
            placeholder="0.10"
          />
          <Field
            label="P&L ($)"
            type="number"
            step="0.01"
            value={formData.pnl}
            onChange={(value) => setFormData({ ...formData, pnl: value })}
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Result
            </label>
            <select
              value={formData.status}
              onChange={(event) =>
                setFormData({ ...formData, status: event.target.value })
              }
              className="mt-1.5 w-full min-w-0 rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              {["WIN", "LOSS"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <Field
            label="Open Price"
            type="number"
            step="0.00001"
            required
            value={formData.open_price}
            onChange={(value) => setFormData({ ...formData, open_price: value })}
          />
          <Field
            label="Close Price"
            type="number"
            step="0.00001"
            value={formData.close_price}
            onChange={(value) => setFormData({ ...formData, close_price: value })}
          />
          <Field
            label="Stop Loss"
            type="number"
            step="0.00001"
            value={formData.stop_loss}
            onChange={(value) => setFormData({ ...formData, stop_loss: value })}
          />
          <Field
            label="Take Profit"
            type="number"
            step="0.00001"
            value={formData.take_profit}
            onChange={(value) => setFormData({ ...formData, take_profit: value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Setup Tag
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SETUP_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    setup_tag: formData.setup_tag === tag ? "" : tag,
                  })
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  formData.setup_tag === tag
                    ? "border border-purple-500/50 bg-purple-500/20 text-purple-300"
                    : "border border-slate-700 bg-slate-800/50 text-slate-400 hover:border-purple-500/50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(event) =>
              setFormData({ ...formData, notes: event.target.value })
            }
            rows={3}
            className="mt-1.5 w-full min-w-0 rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            placeholder="Trade rationale, observations..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-purple-500/20 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Trade Entry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <input
        type={type}
        step={step}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full min-w-0 rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
      />
    </div>
  );
}
