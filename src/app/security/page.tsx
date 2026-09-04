import type { Metadata } from "next";
import Link from "next/link";
import {
  Database,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  KeyRound,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export const metadata: Metadata = {
  title: "Security | Propfident",
  description: "Security controls for risk monitoring, account protection, and encrypted data handling.",
};

const pillars = [
  {
    title: "Local & Client-Side Risk Processing",
    description:
      "Risk computations, lot sizing, and drawdown math execute on the client side whenever possible. This keeps latency low, minimizes unnecessary server exposure, and ensures the account data used in the calculations stays focused on the actual risk model in use.",
    Icon: Sparkles,
  },
  {
    title: "Data Encryption",
    description:
      "All internet-facing communications are protected with TLS encryption, and data in transit is secured using HTTPS standards. We also rely on secure service providers and encrypted storage best practices for account and waitlist data.",
    Icon: LockKeyhole,
  },
  {
    title: "Database Security",
    description:
      "Propfident stores account and email data in Supabase with row-level access controls and isolated user records. Sensitive records are segmented by user scope to reduce vertical exposure and maintain service accountability.",
    Icon: Database,
  },
  {
    title: "Credential Safety",
    description:
      "Execution authority remains with the user. Propfident does not place trades, manage withdrawals, or control a broker account. Account execution stays strictly within the customer’s own operational workflow and account permissions.",
    Icon: KeyRound,
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
                Security Overview
              </div>
              <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tighter text-white sm:text-5xl lg:text-6xl">
                Built for risk visibility without unnecessary exposure.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
                Propfident keeps your trading decisions transparent, your calculations efficient, and your account execution firmly in your control.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {pillars.map(({ title, description, Icon }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-purple-500/20 bg-slate-900/80 p-6 shadow-xl shadow-black/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-white">{title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">{description}</p>
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 md:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
                Execution stays with the user
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200">
                Propfident is designed to support risk awareness and planning, not to replace your responsibility for trading decisions, broker access, or challenge compliance. We keep the operational surface small and the user in control.
              </p>
            </div>

            <div className="mt-12 rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-2xl md:p-10">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Security-first product principles
              </h2>
              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
                <li>• Keep calculation logic local and lightweight to reduce unnecessary data movement.</li>
                <li>• Protect all account and waitlist communications with HTTPS and secure hosting practices.</li>
                <li>• Isolate user data through scoped access controls and a least-privilege design.</li>
                <li>• Make it easy to disconnect integrations and review what the service can access.</li>
              </ul>
            </div>

            <div className="relative mt-12 overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-2xl md:p-10">
              <div className="absolute inset-0 hero-radial opacity-60" aria-hidden="true" />
              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Your funded account is worth protecting.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                    Review risk before you take the next position, and keep your execution authority with you at all times.
                  </p>
                </div>
                <ShimmerButton href="/signup" className="w-full justify-center sm:w-auto">
                  Start Protecting Your Account
                </ShimmerButton>
              </div>
            </div>

            <p className="mt-8 text-center text-xs leading-relaxed text-slate-500">
              For account-specific privacy requests: <Link href="mailto:propfidentceos@gmail.com" className="text-purple-300 hover:underline">propfidentceos@gmail.com</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}