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
      <main className="w-full min-w-0 max-w-full overflow-x-hidden">
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
        <Reveal delay={0.3}>
          <section className="w-full max-w-full overflow-hidden border-b border-purple-500/20 bg-slate-950 px-4 py-12 md:px-6 md:py-20 lg:px-8">
            <div className="mx-auto grid w-full max-w-7xl items-center gap-8 overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/90 p-5 shadow-[0_0_55px_rgba(124,58,237,0.14)] md:grid-cols-2 md:gap-12 md:p-8 lg:p-10">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-purple-500/20 bg-slate-950">
                <Image
                  src="/images/bookpdf.png"
                  alt="Preview of the Propfident trading risk management guide"
                  fill
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
                   ADVANCED PLAYBOOK
                </span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tighter text-white sm:text-4xl">
                  The Seven Figure Funded Trader
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-400 md:text-lg">
                  Master the step by step blueprint millionaire traders use to secure over $4,500,000 in prop firm payouts.
                </p>
                <a
                  href="/images/bookpdf.png"
                  download="The Seven Figure Funded Trader.png"
                  className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:shadow-purple-600/40"
                >
                  Get Premium Access
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
