import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PayoutsMarquee from "@/components/PayoutsMarquee";
import FeatureShowcase from "@/components/FeatureShowcase";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-full overflow-x-hidden">
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
      </main>
      <Reveal delay={0.25}>
        <Footer />
      </Reveal>
    </>
  );
}
