'use client';

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const navigationLinks = [
  { label: "Prop Match", href: "/tools/prop-match" },
  { label: "Prop Rules", href: "/prop-firms" },
  { label: "Pricing", href: "/#pricing" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handlePlaybookClick(event: MouseEvent<HTMLAnchorElement>) {
    if (window.location.pathname === "/") {
      event.preventDefault();
      document.getElementById("playbook-banner")?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative pointer-events-auto flex items-center justify-between rounded-full border border-purple-500/20 bg-slate-950/80 px-4 py-2.5 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl transition-all duration-300 sm:px-6 sm:py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={closeMobileMenu}>
          <img src="/propfidentlogo.png" alt="Propfident" className="h-7 w-7 object-contain sm:h-9 sm:w-9" />
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-base font-bold tracking-tight text-transparent sm:text-xl">PROPFIDENT</span>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 sm:text-sm md:flex">
          {navigationLinks.map((link) => (
            <Link key={link.label} href={link.href} className="rounded-full px-2 py-1.5 transition hover:bg-white/10 hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link href="/#playbook-banner" onClick={handlePlaybookClick} className="rounded-full px-2 py-1.5 transition hover:bg-white/10 hover:text-white">
            Playbook
          </Link>
        </nav>

        <ShimmerButton href="/tools/prop-match" background="rgba(124, 58, 237, 0.85)" className="hidden px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 md:flex">
          Get Started →
        </ShimmerButton>

        <button type="button" onClick={() => setIsMobileMenuOpen((open) => !open)} className="flex rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-purple-500/15 hover:text-white md:hidden" aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isMobileMenuOpen}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-full mt-3 flex flex-col gap-4 rounded-3xl border border-purple-500/30 bg-slate-950/95 p-5 shadow-2xl shadow-purple-950/80 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 md:hidden">
            {navigationLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={closeMobileMenu} className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition-all hover:border-purple-500/30 hover:bg-purple-500/10">
                {link.label}
              </Link>
            ))}
            <Link href="/#playbook-banner" onClick={handlePlaybookClick} className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition-all hover:border-purple-500/30 hover:bg-purple-500/10">
              Playbook
            </Link>
            <Link href="/tools/prop-match" onClick={closeMobileMenu} className="mt-2 w-full">
              <ShimmerButton background="rgba(124, 58, 237, 0.9)" className="w-full py-3 text-sm font-semibold text-white shadow-xl shadow-purple-600/40">
                Get Started 🚀
              </ShimmerButton>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
