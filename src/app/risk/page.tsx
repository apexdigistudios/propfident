import type { Metadata } from "next";

export const metadata: Metadata = { title: "Risk Disclaimer | Propfident" };

export default function RiskPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100 md:px-8 md:py-24">
      <article className="mx-auto max-w-3xl rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-2xl sm:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Risk Disclaimer</h1>
        <p className="mt-6 text-sm leading-relaxed text-slate-400">Propfident is an independent analytics and monitoring tool. It does not provide financial advice, execute trades, or guarantee profits, payouts, or account outcomes.</p>
      </article>
    </main>
  );
}