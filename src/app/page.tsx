import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PayoutsMarquee from "@/components/PayoutsMarquee";
import FeatureShowcase from "@/components/FeatureShowcase";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import PwaInstallBanner from "@/components/PwaInstallBanner";
import Reveal from "@/components/Reveal";
import AdSlot from "@/components/AdSlot";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <div className="sticky top-0 z-[60] border-b border-purple-500/20 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs font-medium text-slate-200 sm:text-sm">
            <span className="mr-2">🔥</span>
            FREE GUIDE: Download the Prop Firm Risk Management Playbook (PDF) — Learn how to pass funded challenges cleanly.
          </p>
          <a
            href="/images/bookpdf.png"
            download="Prop_Firm_Risk_Management_Playbook.pdf"
            className="inline-flex items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-200 transition hover:bg-purple-500/20"
          >
            Download Free PDF
          </a>
        </div>
      </div>
      <Navbar />
      <main className="w-full min-h-screen min-w-0 max-w-full">
        <Reveal delay={0}>
          <Hero />
        </Reveal>
        <Reveal delay={0.05}>
          <HowItWorks />
        </Reveal>
        <Reveal delay={0.1}>
          <PayoutsMarquee />
        </Reveal>
        <Reveal delay={0.15}>
          <FeatureShowcase />
        </Reveal>
        <Reveal delay={0.2}>
          <Pricing />
        </Reveal>
        <Reveal delay={0.25}>
          <Faq />
        </Reveal>
        <Reveal delay={0.27}>
          <div className="w-full max-w-full overflow-hidden bg-slate-950 px-4 py-2 md:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <AdSlot className="max-w-3xl mx-auto" />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <section className="w-full max-w-full border-b border-purple-500/20 bg-slate-950 px-4 py-12 md:px-6 md:py-20 lg:px-8">
            <div className="mx-auto grid w-full max-w-3xl items-center gap-6 overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/90 p-4 shadow-[0_0_55px_rgba(124,58,237,0.14)] md:grid-cols-[minmax(0,0.95fr)_1.05fr] md:gap-8 md:p-6 lg:max-w-4xl lg:p-8">
              <div className="relative mx-auto flex max-h-64 w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-950 shadow-xl shadow-purple-950/30">
                <div className="relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-xl">
                  <Image
                    src="/images/bookpdf.png"
                    alt="Preview of the Propfident trading risk management guide"
                    fill
                    sizes="(max-width: 767px) 100vw, 32vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
                  ADVANCED PLAYBOOK
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tighter text-white sm:text-4xl">
                  The Seven Figure Funded Trader
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-400 md:text-lg">
                  Master the step-by-step blueprint millionaire traders use to secure over $4,500,000 in prop firm payouts.
                </p>
                <a
                  href="/images/bookpdf.png"
                  download="The_Seven_Figure_Funded_Trader.pdf"
                  className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
                >
                  Download Free PDF
                </a>
              </div>
            </div>
          </section>
        </Reveal>
        <Reveal delay={0.35}>
          <PwaInstallBanner />
        </Reveal>
      </main>
      <Reveal delay={0.3}>
        <Footer />
      </Reveal>
    </>
  );
}
