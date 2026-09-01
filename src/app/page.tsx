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
          <section className="w-full border-t border-b border-purple-500/20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-14 md:px-6 md:py-20 lg:px-8">
            <div className="mx-auto max-w-5xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300">
                Free Guide
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                📥 Download The Ultimate Prop Firm Risk Management Playbook (PDF)
              </h2>

              <div className="mt-8 flex justify-center">
                <Image
                  src="/images/bookpdf.png"
                  alt="Propfident risk management playbook"
                  width={760}
                  height={980}
                  priority
                  className="mx-auto w-full max-w-md rounded-[1.5rem] object-contain drop-shadow-[0_30px_60px_rgba(76,29,149,0.65)]"
                />
              </div>

              <a
                href="/images/bookpdf.png"
                download="Prop_Firm_Risk_Management_Playbook.pdf"
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
              >
                Download Free Guide
              </a>
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
