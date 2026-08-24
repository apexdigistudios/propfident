import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy | Propfident" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" description="Propfident respects your privacy. This page will contain the full privacy policy governing data collection, use, and retention." />;
}

function LegalPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100 md:px-8 md:py-24">
      <article className="mx-auto max-w-3xl rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-2xl sm:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">{title}</h1>
        <p className="mt-6 text-sm leading-relaxed text-slate-400">{description}</p>
      </article>
    </main>
  );
}