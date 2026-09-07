'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Logo from "./Logo";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Trader Results', href: '#results' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center px-3 pt-2 sm:px-4 sm:pt-4">
      <div className="relative pointer-events-auto flex h-12 w-full max-w-6xl items-center justify-between rounded-full border border-purple-500/20 bg-slate-950/70 px-3 shadow-2xl shadow-purple-950/30 backdrop-blur-2xl before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-purple-600/10 before:blur-xl sm:h-14 sm:px-6">
        <Link className="flex items-center gap-2 text-xl font-bold text-white" href="/">
          <Logo width={28} height={28} className="sm:[&>img]:h-9 sm:[&>img]:w-9" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
              href={link.href}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link className="rounded-full px-2.5 py-1 text-xs font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white sm:px-3 sm:py-1.5 sm:text-sm" href="/login">
            Login
          </Link>
          <Link
            className="rounded-full bg-purple-600 px-2.5 py-1 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 sm:px-4 sm:py-2 sm:text-sm"
            href="/dashboard"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 md:hidden sm:h-10 sm:w-10"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute left-3 right-3 top-full z-50 mt-3 rounded-2xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl shadow-purple-950/50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 md:hidden sm:left-4 sm:right-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
            <hr className="my-2 border-white/10" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-200 hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg bg-indigo-600 py-2.5 text-center text-base font-semibold text-white shadow-md hover:bg-indigo-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
