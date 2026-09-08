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
      <Navbar />
      <main className="w-full min-h-screen min-w-0 max-w-full pt-28 sm:pt-32">
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
          <section id="playbook-banner" className="scroll-mt-24 w-full border-t border-b border-purple-500/20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-6 sm:py-8 md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto max-w-5xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-300">
                Free Guide
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                📥 Download The Ultimate Prop Firm Risk Management Playbook (PDF)
              </h2>

              <div className="mt-4 flex justify-center sm:mt-5">
                <Image
                  src="/images/bookpdf.png"
                  alt="Propfident risk management playbook"
                  width={760}
                  height={980}
                  priority
                  className="mx-auto w-full max-w-[10rem] rounded-[1.25rem] object-contain drop-shadow-[0_25px_50px_rgba(76,29,149,0.6)] sm:max-w-[12rem] md:max-w-[13rem]"
                />
              </div>

              <a
                href="/playbook"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40 sm:mt-5"
              >
                Open Propfident Playbook ↗
              </a>
              <a href="/prop-firms" className="mt-3 inline-flex items-center justify-center rounded-xl border border-purple-400/30 px-5 py-2.5 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/10 sm:mt-4">
                View Prop Rules →
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
