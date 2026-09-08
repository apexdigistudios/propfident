import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export const metadata: Metadata = {
  title: "The Seven Figure Funded Trader",
  description: "Read the Propfident risk management playbook for practical drawdown, sizing, and challenge protection strategies.",
};

const chapters = [
  ["01", "Protect the daily loss limit", "Set your daily stop before you trade. Once the buffer is thin, step away instead of trying to win it back."],
  ["02", "Size from the stop loss", "Choose the dollar risk first, then calculate the lot size. Your stop distance should never decide your account risk by accident."],
  ["03", "Respect the drawdown floor", "Track the true breach floor as your account changes. A winning day can move the line, especially with trailing rules."],
  ["04", "Build a repeatable week", "Keep a short journal, review your best setups, and use fewer high-quality trades when conditions are unclear."],
];

const checkoutUrl = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_URL || "https://whop.com/checkout/plan_4VBu6Mxzk15hN";

export default function PlaybookPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-slate-900/80 to-slate-950 p-6 shadow-2xl shadow-purple-950/30 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300">Propfident Playbook</p>
            <div className="mt-6 aspect-[3/4] overflow-hidden rounded-2xl border border-purple-400/20 bg-slate-950 shadow-xl">
              <img src="/images/bookpdf.png" alt="Propfident risk management playbook cover" className="h-full w-full object-contain" />
            </div>
            <ShimmerButton href={checkoutUrl} background="rgba(124, 58, 237, 0.8)" className="mt-6 w-full px-5 py-3 text-sm">Get The Playbook</ShimmerButton>
          </div>
          <div>
            <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-purple-300">Read the guide</span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">Trade smaller. Stay funded longer.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">A practical guide to protecting your challenge account with clear drawdown rules, disciplined sizing, and a weekly review process.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {chapters.map(([number, title, summary]) => <article key={number} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl"><p className="text-xs font-bold tracking-[0.2em] text-purple-400">{number}</p><h2 className="mt-3 text-lg font-bold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{summary}</p></article>)}
            </div>
            <Link href="/tools/firm-fit" className="mt-8 inline-flex min-h-[42px] items-center rounded-xl border border-purple-400/30 bg-purple-600/30 px-5 py-3 text-sm font-medium text-purple-100 transition hover:bg-purple-600/50">Run a Prop Match check</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
