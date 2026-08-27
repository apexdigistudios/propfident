"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Check, Copy, Lock, Send, Sparkles, User, X } from "lucide-react";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string };
const FREE_USAGE_PREFIX = "propfident:free-ai-plan-usage:";
const fastTrackMessage = "I have provided enough details. Generate my full step-by-step prop trading plan now.";

export function TradePlanGenerator({ isFreeTier, userId, accountId }: { isFreeTier: boolean; userId: string; accountId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFreeTier && window.localStorage.getItem(`${FREE_USAGE_PREFIX}${userId}`) === "1") setFreeGenerationsUsed(1);
  }, [isFreeTier, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const blocked = isFreeTier && freeGenerationsUsed >= 1;

  async function sendMessage(content = input) {
    const trimmed = content.trim();
    if (!trimmed || loading || blocked) return;
    const nextMessages = [...messages, { role: "user", content: trimmed } satisfies Message];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/plan-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages, accountId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The plan service could not answer right now.");
      setMessages((current) => [...current, { role: data.role, content: data.content }]);
      if (isFreeTier && content === fastTrackMessage) {
        setFreeGenerationsUsed(1);
        window.localStorage.setItem(`${FREE_USAGE_PREFIX}${userId}`, "1");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reach Trade Assist.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  async function copyPlan(content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-6 overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Trade Assist V2</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Prop Shield strategist</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Have a focused conversation with your risk strategist, then turn your live MT5 numbers into a practical plan.</p></div>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${isFreeTier ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}><Sparkles className="h-3.5 w-3.5" />{isFreeTier ? `Plan Usage: ${freeGenerationsUsed}/1` : "Unlimited turns"}</span>
      </header>

      <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-900/80 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300"><Bot className="h-5 w-5" /></div><div><p className="text-sm font-bold text-white">Propfident Risk Strategist</p><p className="text-xs text-emerald-400">Live account context enabled</p></div></div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {!messages.length && <div className="mx-auto max-w-xl py-12 text-center"><Sparkles className="mx-auto h-8 w-8 text-purple-400" /><h2 className="mt-4 text-xl font-bold text-white">Let&apos;s protect the account first.</h2><p className="mt-2 text-sm leading-6 text-slate-400">Tell me your prop firm rules, trading style, and risk comfort. I&apos;ll ask short questions before building the plan.</p></div>}
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`flex max-w-[90%] gap-3 rounded-2xl px-4 py-3 text-sm leading-6 md:max-w-[78%] ${message.role === "user" ? "bg-purple-600/25 text-purple-50" : "border border-slate-800 bg-slate-950/80 text-slate-300"}`}>{message.role === "assistant" && <Bot className="mt-1 h-4 w-4 shrink-0 text-purple-400" />}<div className="min-w-0 whitespace-pre-wrap">{message.content}{message.role === "assistant" && /daily loss|lot size|execution rules/i.test(message.content) && <button type="button" onClick={() => void copyPlan(message.content)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-300"><Copy className="h-3.5 w-3.5" />{copied ? <><Check className="h-3.5 w-3.5" />Copied</> : "Copy Plan"}</button>}</div>{message.role === "user" && <User className="mt-1 h-4 w-4 shrink-0 text-purple-300" />}</div></div>)}
          {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><Bot className="h-4 w-4 text-purple-400" />Thinking through your risk...</div>}
          <div ref={bottomRef} />
        </div>
        {error && <div role="alert" className="flex items-start justify-between gap-4 border-t border-rose-500/20 bg-rose-950/20 px-5 py-3 text-sm text-rose-300"><p>{error}</p><button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="shrink-0 text-rose-300 transition hover:text-white"><X className="h-4 w-4" /></button></div>}
        {blocked ? <div className="flex flex-col gap-3 border-t border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm text-amber-300"><Lock className="h-4 w-4" />Your free plan generation is complete.</div><Link href="/pricing" className="inline-flex items-center justify-center rounded-lg bg-gradient-brand px-4 py-2 text-sm font-bold text-white">Upgrade for unlimited plans</Link></div> : <><div className="flex flex-wrap gap-2 border-t border-slate-800 px-4 pt-4"><button type="button" onClick={() => void sendMessage(fastTrackMessage)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-300 disabled:opacity-50"><Sparkles className="h-3.5 w-3.5" />Build Plan Now</button></div><form onSubmit={submit} className="flex gap-2 p-4"><input value={input} onChange={(event) => setInput(event.target.value)} disabled={loading} placeholder="Tell your strategist about your rules or risk style..." className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none" /><button type="submit" disabled={loading || !input.trim()} aria-label="Send message" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /></button></form></>}
      </section>
    </div>
  );
}
