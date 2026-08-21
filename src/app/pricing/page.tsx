import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing | Propfident",
  description: "Choose the Propfident plan that fits your funded trading workflow.",
};

export default function PricingPage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-slate-950">
      <Navbar />
      <main className="w-full max-w-full overflow-x-hidden">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
