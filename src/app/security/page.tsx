import type { Metadata } from "next";
import Link from "next/link";
import { Database, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export const metadata: Metadata = {
  title: "Security & Privacy | Propfident",
  description:
    "Learn how Propfident protects trading credentials and data through read-only connections and encrypted infrastructure.",
};

const sections = [
  {
    title: "Read-Only Access Protocol",
    Icon: KeyRound,
    paragraphs: [
      "Propfident connects to your MT4 or MT5 account through MetaApi using read-only investor credentials. These credentials allow the service to observe account and execution data needed for monitoring and journaling.",
      "Read-only investor access cannot execute trades, modify positions, close orders, or initiate withdrawals. Propfident does not hold trading authority or withdrawal authority over your account.",
    ],
  },
  {
    title: "Data Encryption & Security",
    Icon: LockKeyhole,
    paragraphs: [
      "Data stored by Propfident is protected with AES-256 encryption at rest. Connections between your device, Propfident, and connected services use TLS 1.3 encryption in transit.",
      "Each MetaApi connection is isolated to its connected account and authenticated service context. Propfident uses the connection to retrieve permitted account data; it does not use it to execute trading activity.",
    ],
  },
  {
    title: "Data Collection Scope",
    Icon: Database,
    paragraphs: [
      "To provide risk monitoring and journaling, Propfident processes execution timestamps, symbols, lot sizes, trade status, and balance and equity metrics. It may also process the account rules and preferences you enter for drawdown calculations.",
      "Propfident never accesses withdrawal controls, payment account funds, or unrestricted trading authority. It does not need your main trading password when a read-only investor password is available.",
    ],
  },
  {
    title: "Data Ownership & Retention",
    Icon: ShieldCheck,
    paragraphs: [
      "Your account data remains associated with your Propfident account and is used to provide the features you request. You can review your connected accounts and notification preferences from the dashboard settings and account-intelligence areas.",
      "You can disconnect an account to stop its live synchronization. You may also request deletion of your Propfident account and associated data; retention may continue only where required for security, legal, or operational obligations.",
    ],
  },
] as const;

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-purple-500/20">
          <div className="hero-radial absolute inset-0" aria-hidden="true" />
          <div className="bg-grid absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-slate-900 px-4 py-1.5 text-xs font-semibold text-purple-300">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                Security &amp; Privacy
              </div>
              <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tighter text-white sm:text-5xl lg:text-6xl">
                Bank-Grade Infrastructure &amp; Read-Only Trading Integrity
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
                How Propfident safeguards your credentials, trading data, and privacy.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-purple-500/20 bg-slate-950 py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              {sections.map(({ title, Icon, paragraphs }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-purple-500/20 bg-slate-900/80 p-6 shadow-xl shadow-black/20 md:p-8"
                >
                  <Icon className="h-6 w-6 text-purple-400" strokeWidth={2} />
                  <h2 className="mt-5 text-xl font-bold tracking-tight text-white">
                    {title}
                  </h2>
                  <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-400">
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center md:mt-16 md:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-300">
                Read-Only Access | Zero Trading Authority | Zero Withdrawal Authority
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
                Security controls reduce access to the data Propfident needs. They do not remove the risks of trading, market conditions, or prop-firm rule changes.
              </p>
            </div>

            <div className="relative mt-12 overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-2xl md:mt-16 md:p-10">
              <div className="absolute inset-0 hero-radial opacity-60" aria-hidden="true" />
              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Your funded account is worth protecting.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                    Monitor risk with read-only account access and keep execution decisions in your hands.
                  </p>
                </div>
                <ShimmerButton href="/signup" className="w-full justify-center sm:w-auto">
                  Start Protecting Your Account — Free
                </ShimmerButton>
              </div>
            </div>

            <p className="mt-8 text-center text-xs leading-relaxed text-slate-500">
              For account-specific privacy requests, contact <Link href="mailto:hello@propfident.io" className="text-purple-300 hover:underline">hello@propfident.io</Link>. This page describes the current product controls and does not constitute financial advice.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}