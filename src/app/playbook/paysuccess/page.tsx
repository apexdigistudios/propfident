import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Playbook Payment Verified",
  description: "Download your Propfident trading risk management playbook.",
};

export default async function PlaybookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const downloadUrl = sessionId
    ? `/api/playbook/download?session_id=${encodeURIComponent(sessionId)}`
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-slate-100">
      <section className="w-full max-w-lg rounded-3xl border border-purple-500/30 bg-slate-900/80 p-6 text-center shadow-2xl shadow-purple-950/40 backdrop-blur-2xl sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-950/30">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">🎉 PAYMENT VERIFIED</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Your playbook is unlocked.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">Download the Propfident Playbook and build a more disciplined path to staying funded.</p>

        {downloadUrl ? (
          <a href={downloadUrl} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500">
            <Download className="h-4 w-4" /> Download Playbook Now
          </a>
        ) : (
          <p className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Your payment session is missing. Please return to checkout and try again.</p>
        )}

        <Link href="/tools/prop-match" className="mt-5 inline-flex text-sm font-medium text-purple-300 transition hover:text-purple-200">Run a Prop Match check</Link>
      </section>
    </main>
  );
}