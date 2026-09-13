"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PROP_FIRMS } from "@/config/firms";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropFirmsPage() {
  const [activeFirm, setActiveFirm] = useState("all");
  const [query, setQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const filteredFirms = useMemo(() => PROP_FIRMS.filter((firm) => {
    const matchesTab = activeFirm === "all" || firm.id === activeFirm;
    return matchesTab && firm.name.toLowerCase().includes(query.toLowerCase());
  }), [activeFirm, query]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07090e] dark:text-slate-100">
      <Navbar />
      <main className="relative mx-auto max-w-7xl overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="theme-grid pointer-events-none absolute inset-x-0 top-0 h-96 opacity-60" aria-hidden="true" />
        <section className="mx-auto max-w-3xl text-center">
          <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-purple-700 dark:text-purple-300">📊 OFFICIAL PROP FIRM RULE MATRIX</p>
          <h1 className="relative mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl">Prop Rules (2026)</h1>
          <p className="relative mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">Compare the core challenge rules used by the firms available in Prop Match. Always confirm final terms with the firm before purchasing.</p>
        </section>

        <section className="relative mt-10 rounded-3xl border border-purple-200 bg-white/90 p-4 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-purple-500/20 dark:bg-slate-950/80 dark:shadow-purple-950/20 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input value={query} onChange={(event) => { setIsFiltering(true); setQuery(event.target.value); window.setTimeout(() => setIsFiltering(false), 180); }} placeholder="Search prop firms..." className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-500 dark:border-purple-500/20 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 lg:max-w-xs" />
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[{ id: "all", name: "All Firms" }, ...PROP_FIRMS].map((firm) => (
                <button key={firm.id} type="button" onClick={() => { setIsFiltering(true); setActiveFirm(firm.id); window.setTimeout(() => setIsFiltering(false), 180); }} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${activeFirm === firm.id ? "border-purple-400/50 bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-purple-300 hover:text-purple-800 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-purple-500/40 dark:hover:text-white"}`}>
                  {firm.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {isFiltering ? <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" /></section> : <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredFirms.map((firm) => (
            <article id={firm.id} key={firm.id} className="scroll-mt-28 rounded-2xl border border-purple-200 bg-white/90 p-5 shadow-xl shadow-slate-200/30 backdrop-blur-xl dark:border-purple-500/20 dark:bg-slate-950/80 dark:shadow-purple-950/10">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800/80">
                <img src={firm.logo} alt={`${firm.name} logo`} className="h-12 w-12 rounded-xl object-contain" />
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">{firm.name}</h2>
                  <p className="text-xs text-purple-700 dark:text-purple-300">2026 core rule profile</p>
                </div>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">Daily drawdown</dt><dd className="text-right font-semibold text-slate-800 dark:text-slate-200">{(firm.dailyDrawdown * 100).toFixed(1)}% · {firm.dailyDrawdownType}</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">Max drawdown</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">{(firm.maxDrawdown * 100).toFixed(1)}%</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">Profit target</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">{(firm.profitTarget * 100).toFixed(1)}%</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">Weekend holding</dt><dd className="text-right font-semibold text-slate-800 dark:text-slate-200">{firm.weekendHolding ? "Allowed" : "Not allowed"}</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">News trading</dt><dd className="max-w-[12rem] text-right font-semibold text-slate-800 dark:text-slate-200">{firm.newsTrading}</dd></div>
              </dl>
              <Link href={`/tools/prop-match#${firm.id}`} className="mt-5 inline-flex text-sm font-semibold text-purple-300 transition hover:text-white">Test your strategy against {firm.name} →</Link>
            </article>
          ))}
        </section>}
      </main>
      <Footer />
    </div>
  );
}
