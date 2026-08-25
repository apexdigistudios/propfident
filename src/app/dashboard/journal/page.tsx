"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Search, ArrowUpRight, ArrowDownRight, Trash2, Loader2, Check, X, Brain, SlidersHorizontal } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { deleteJournalTrade } from "@/app/actions/journal";

interface Trade {
  id: string;
  symbol: string;
  action: string;
  volume: string | number;
  pnl: string | number;
  status: string;
  open_time: string;
  close_time: string | null;
  notes?: string | null;
  tags?: string[] | null;
  account_id: string | null;
}

type Emotion = "Disciplined" | "FOMO" | "Anxious" | "Revenge Trade" | "Confident" | "Hesitant" | "Executed Strategy";
type TradeNote = { id: string; text: string; symbol: string; opened: string; emotion_tag: Emotion; execution_remark: string };

const emotionStyles: Record<"All" | Emotion, string> = {
  All: "border-slate-600 bg-slate-800 text-slate-200",
  Disciplined: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  FOMO: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  Anxious: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  "Revenge Trade": "border-rose-700/50 bg-rose-950/40 text-rose-300",
  Confident: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  Hesitant: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  "Executed Strategy": "border-slate-500/40 bg-slate-500/10 text-slate-300",
};
const emotionFilters: Array<"All" | Emotion> = ["All", "Disciplined", "FOMO", "Anxious", "Revenge Trade", "Confident", "Hesitant", "Executed Strategy"];

function detectEmotion(note: string): Emotion {
  const text = note.toLowerCase();
  if (/revenge|make back|ticked off|lost big then|doubled lot/.test(text)) return "Revenge Trade";
  if (/chased|late entry|scared to miss|fomo|jumped in early/.test(text)) return "FOMO";
  if (/nervous|scared|too early|panicked|closed too soon/.test(text)) return "Anxious";
  if (/followed plan|stuck to risk|tp hit|clean setup|patient/.test(text)) return "Disciplined";
  return "Executed Strategy";
}

const statusStyles: Record<string, string> = {
  OPEN: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  WIN: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  LOSS: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  BE: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  CLOSED: "border-purple-500/30 bg-purple-500/10 text-purple-300",
};

export default function JournalPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState("All");
  const [tradeNotes, setTradeNotes] = useState<TradeNote[]>([]);
  const [analyzingNotes, setAnalyzingNotes] = useState(false);

  useEffect(() => {
    async function loadJournal() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("open_time", { ascending: false });

      setTrades(data || []);
      const notes = (data || []).filter((trade) => trade.notes?.trim());
      setAnalyzingNotes(notes.length > 0);
      const analyzed = await Promise.all(notes.map(async (trade) => {
        try {
          const response = await fetch("/api/ai/analyze-note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: trade.notes }) });
          const result = await response.json();
          return { id: trade.id, text: trade.notes, symbol: trade.symbol, opened: trade.open_time, emotion_tag: result.emotionTag as Emotion, execution_remark: result.executionRemark as string };
        } catch {
          return { id: trade.id, text: trade.notes, symbol: trade.symbol, opened: trade.open_time, emotion_tag: detectEmotion(trade.notes), execution_remark: "Recorded your trading mindset for later review and pattern analysis." };
        }
      }));
      setTradeNotes(analyzed);
      setAnalyzingNotes(false);
      setLoading(false);
    }

    loadJournal();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async (tradeId: string) => {
    if (!confirm("Delete this trade? Its P&L will be reversed on the linked account.")) {
      return;
    }
    setDeletingId(tradeId);
    const result = await deleteJournalTrade(tradeId);
    setDeletingId(null);

    if (!result.success) {
      showToast("error", result.error || "Failed to delete trade.");
      return;
    }

    // Refresh the client list + revalidate all server-rendered metrics
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("open_time", { ascending: false });
      setTrades(data || []);
      const notes = (data || []).filter((trade) => trade.notes?.trim());
      const analyzed = await Promise.all(notes.map(async (trade) => {
        const response = await fetch("/api/ai/analyze-note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: trade.notes }) });
        const result = await response.json();
        return { id: trade.id, text: trade.notes, symbol: trade.symbol, opened: trade.open_time, emotion_tag: result.emotionTag as Emotion || detectEmotion(trade.notes), execution_remark: result.executionRemark as string };
      }));
      setTradeNotes(analyzed);
    }
    router.refresh();
    showToast("success", "Trade deleted and account balance recalculated.");
  };

  const filteredTrades = trades.filter(
    (trade) =>
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trade.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
  const emotionCounts = emotionFilters.reduce<Record<string, number>>((counts, emotion) => {
    counts[emotion] = emotion === "All" ? tradeNotes.length : tradeNotes.filter((note) => note.emotion_tag === emotion).length;
    return counts;
  }, {});
  const filteredNotes = selectedEmotion === "All" ? tradeNotes : tradeNotes.filter((note) => note.emotion_tag === selectedEmotion);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full space-y-6">
      {toast && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 shadow-xl ${
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

      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white">Trade Journal</h2>
          <p className="text-sm text-slate-400">
            {trades.length} trade{trades.length === 1 ? "" : "s"} logged directly in Supabase.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ShimmerButton onClick={() => setShowNotes((visible) => !visible)} className="px-5 py-2.5 text-sm">
            <Brain className="mr-1.5 h-4 w-4" />
            Trade Notes &amp; Insights
          </ShimmerButton>
          <Link href="/dashboard/journal/new" className="w-fit">
            <ShimmerButton className="px-5 py-2.5 text-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Manual Entry
            </ShimmerButton>
          </Link>
        </div>
      </div>

      {showNotes && <section className="min-w-0 rounded-2xl border border-purple-500/20 bg-slate-900/80 p-4 shadow-xl sm:p-6" aria-label="Trade notes and insights">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">AI mindset review</p><h3 className="mt-1 text-xl font-bold text-white">Trade Notes &amp; Insights</h3><p className="mt-1 text-sm text-slate-400">Review the emotions and execution patterns attached to your manual trade notes.</p></div><SlidersHorizontal className="h-5 w-5 text-purple-400" /></div>
        <div className="mt-5 flex max-w-full gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {emotionFilters.map((emotion) => <button key={emotion} type="button" onClick={() => setSelectedEmotion(emotion)} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition ${selectedEmotion === emotion ? emotionStyles[emotion] : "border-slate-700 bg-slate-950 text-slate-400 hover:border-purple-500/50"}`} aria-pressed={selectedEmotion === emotion}>{emotion}<span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">{emotionCounts[emotion]}</span></button>)}
        </div>
        {analyzingNotes ? <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Analyzing notes...</div> : filteredNotes.length === 0 ? <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center"><p className="text-sm text-slate-400">{tradeNotes.length === 0 ? "No trade notes have been added yet." : `No trade notes found with the tag '${selectedEmotion}'.`}</p>{selectedEmotion !== "All" && <button type="button" onClick={() => setSelectedEmotion("All")} className="mt-4 rounded-lg border border-purple-500/30 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/10">Reset Filter</button>}</div> : <div className="mt-4 grid min-w-0 gap-3">{filteredNotes.map((note) => <article key={note.id} className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-xs text-slate-500">{note.symbol} · {new Date(note.opened).toLocaleDateString()}</span><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${emotionStyles[note.emotion_tag]}`}>{note.emotion_tag}</span></div><p className="mt-3 text-sm leading-relaxed text-slate-200">{note.text}</p><p className="mt-3 border-l-2 border-purple-500/50 pl-3 text-xs leading-relaxed text-slate-400">{note.execution_remark}</p><span className="mt-3 inline-flex rounded-full bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400">AI insight</span></article>)}</div>}
      </section>}

      {/* Search */}
      <div className="relative min-w-0 w-full sm:max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search by symbol or tag..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full min-w-0 rounded-xl border border-purple-500/30 bg-slate-950 px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
      </div>

      {/* Table */}
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-purple-500/20 bg-slate-900/80">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-purple-500/20">
              <th className="px-4 py-3 font-semibold text-slate-400">Opened</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Symbol</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Action</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Volume</th>
              <th className="px-4 py-3 font-semibold text-slate-400">P&L</th>
              <th className="px-4 py-3 font-semibold text-slate-400">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-purple-500/10 transition hover:bg-purple-500/5"
              >
                <td className="px-4 py-3 text-slate-400">
                  {new Date(trade.open_time).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 font-semibold text-white">
                  <span className="truncate">{trade.symbol}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      trade.action === "BUY"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {trade.action === "BUY" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {trade.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-300">{trade.volume}</td>
                <td
                  className={`px-4 py-3 font-bold ${
                    Number(trade.pnl) >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  ${Number(trade.pnl).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${
                      statusStyles[trade.status] || statusStyles.OPEN
                    }`}
                  >
                    {trade.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(trade.id)}
                    disabled={deletingId === trade.id}
                    aria-label={`Delete ${trade.symbol} trade`}
                    title="Delete trade & reverse its P&L"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
                  >
                    {deletingId === trade.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTrades.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            No trades found. Log your first trade with Manual Entry.
          </div>
        )}
      </div>
    </div>
  );
}
