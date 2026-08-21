"use client";

import Link from "next/link";
import { ShieldCheck, Menu, X, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Payouts", href: "#payouts" },
  { label: "Pricing", href: "#pricing" },
];

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-lg shadow-purple-600/30">
        <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-white">
        Propfident
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Lock body scroll while the full-screen overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-purple-500/20 dark:bg-slate-950/85">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Logo />

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <ShimmerButton href="/dashboard" className="px-5 py-2.5 text-xs">
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Dashboard
            </ShimmerButton>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-purple-600 dark:text-slate-300 dark:hover:text-white"
              >
                Login
              </Link>
              <ShimmerButton href="/signup" className="px-5 py-2.5 text-xs">
                Get Started
              </ShimmerButton>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 transition-colors hover:border-purple-400 dark:border-purple-500/30 dark:bg-slate-900 dark:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Full-screen mobile overlay */}
      <div
        className={`fixed inset-0 z-50 bg-white transition-all duration-300 md:hidden dark:bg-slate-950 ${
          open
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-purple-500/20">
          <Logo onClick={() => setOpen(false)} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 dark:border-purple-500/30 dark:bg-slate-900 dark:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex h-[calc(100%-4rem)] flex-col justify-between px-4 py-8">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-slate-200 bg-white px-4 py-4 text-lg font-extrabold tracking-tighter text-slate-900 transition-colors hover:border-purple-400 dark:border-purple-500/30 dark:bg-slate-900/90 dark:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 pb-4">
            {session ? (
              <ShimmerButton href="/dashboard" className="w-full justify-center">
                <LayoutDashboard className="h-4 w-4 mr-1.5" />
                Dashboard
              </ShimmerButton>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-center text-sm font-bold text-slate-900 dark:border-purple-500/30 dark:bg-slate-900 dark:text-white"
                >
                  Login
                </Link>
                <ShimmerButton href="/signup" className="w-full justify-center">
                  Get Started
                </ShimmerButton>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
