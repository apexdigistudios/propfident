"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PROP_FIRMS } from "@/config/firms";

export default function PropFirmsPage() {
  const [activeFirm, setActiveFirm] = useState("all");
  const [query, setQuery] = useState("");
  const filteredFirms = useMemo(() => PROP_FIRMS.filter((firm) => {
    const matchesTab = activeFirm === "all" || firm.id === activeFirm;
    return matchesTab && firm.name.toLowerCase().includes(query.toLowerCase());
  }), [activeFirm, query]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-300">Propfident Intelligence</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">Prop Firm Rule Directory (2026)</h1>
          <p className="mt-5 text-base leading-7 text-slate-400">Compare the core challenge rules used by the firms available in Prop Match. Always confirm final terms with the firm before purchasing.</p>
        </section>

        <section className="mt-10 rounded-3xl border border-purple-500/20 bg-slate-900/60 p-4 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search prop firms..." className="w-full rounded-xl border border-purple-500/20 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 lg:max-w-xs" />
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[{ id: "all", name: "All Firms" }, ...PROP_FIRMS].map((firm) => (
                <button key={firm.id} type="button" onClick={() => setActiveFirm(firm.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${activeFirm === firm.id ? "border-purple-400/50 bg-purple-500/20 text-purple-200" : "border-slate-700 bg-slate-950/60 text-slate-400 hover:border-purple-500/40 hover:text-white"}`}>
                  {firm.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredFirms.map((firm) => (
            <article id={firm.id} key={firm.id} className="scroll-mt-28 rounded-2xl border border-purple-500/20 bg-slate-900/70 p-5 shadow-xl shadow-purple-950/10 backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                <img src={firm.logo} alt={`${firm.name} logo`} className="h-12 w-12 rounded-xl object-contain" />
                <div>
                  <h2 className="text-lg font-bold text-white">{firm.name}</h2>
                  <p className="text-xs text-purple-300">2026 core rule profile</p>
                </div>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">Daily drawdown</dt><dd className="text-right font-semibold text-slate-200">{(firm.dailyDrawdown * 100).toFixed(1)}% · {firm.dailyDrawdownType}</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">Max drawdown</dt><dd className="font-semibold text-slate-200">{(firm.maxDrawdown * 100).toFixed(1)}%</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">Profit target</dt><dd className="font-semibold text-slate-200">{(firm.profitTarget * 100).toFixed(1)}%</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">Weekend holding</dt><dd className="text-right font-semibold text-slate-200">{firm.weekendHolding ? "Allowed" : "Not allowed"}</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">News trading</dt><dd className="max-w-[12rem] text-right font-semibold text-slate-200">{firm.newsTrading}</dd></div>
              </dl>
              <Link href={`/tools/prop-match#${firm.id}`} className="mt-5 inline-flex text-sm font-semibold text-purple-300 transition hover:text-white">Test your strategy against {firm.name} →</Link>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
