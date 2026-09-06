import Link from "next/link";
import {
  ShieldCheck,
  Plug,
  Globe,
  MessageCircle,
  Rss,
  Mail,
} from "lucide-react";
import Logo from "./Logo";
const footerLinks = {
  Product: [
    { label: "Drawdown Shield", href: "#drawdown-shield" },
    { label: "Lot Calculator", href: "#lot-calculator" },
    { label: "Auto Journal", href: "#journal" },
    { label: "MT4 / MT5 Sync", href: "#metaapi" },
  ],
  Company: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Blog", href: "#faq" },
    { label: "Careers", href: "mailto:propfidentceos@gmail.com" },
    { label: "Contact", href: "mailto:propfidentceos@gmail.com" },
  ],
  Resources: [
    { label: "Documentation", href: "#features" },
    { label: "MetaApi setup guide", href: "#security" },
    { label: "Prop firm rules", href: "#features" },
    { label: "Status", href: "#security" },
  ],
  Legal: [
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Security", href: "/security" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Risk Disclaimer", href: "/risk" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-purple-500/20 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden px-4 py-16 md:px-6 md:py-24 lg:px-8">
        {/* Links */}
        <div className="grid min-w-0 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo width={36} height={36} />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Real-time drawdown protection, dynamic lot sizing and hands-free
              MT4/MT5 journaling for serious prop traders.
            </p>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-slate-500 dark:text-slate-500">
              Propfident is an independent software tool and is not affiliated with, endorsed by, or sponsored by FTMO, Topstep, MetaQuotes, or any mentioned prop trading firm.
            </p>

            {/* MetaApi badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-purple-500/25 bg-purple-500/5 px-3 py-2 dark:bg-purple-500/10">
              <Plug className="h-4 w-4 text-purple-500" strokeWidth={2.5} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Powered by{" "}
                <span className="text-gradient-brand font-bold">MetaApi</span>{" "}
                · MT4 & MT5
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              {[
                { Icon: Globe, label: "Website" },
                { Icon: MessageCircle, label: "Community" },
                { Icon: Rss, label: "Blog" },
                { Icon: Mail, label: "Email" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href={label === "Website" ? "/" : label === "Blog" ? "#faq" : "mailto:propfidentceos@gmail.com"}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-purple-400 hover:text-purple-600 dark:border-purple-500/30 dark:text-slate-400 dark:hover:border-purple-500/60 dark:hover:text-purple-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                {group}
              </h4>
              <ul className="mt-4 space-y-2.5">
                  {links.map((l) => (
                  <li key={l.label}>
                    {group === "Resources" || (group === "Company" && l.label === "Careers") ? (
                      <span className="pointer-events-none cursor-default text-sm text-slate-400 hover:text-slate-400">{l.label}</span>
                    ) : (
                      <Link href={l.href} className="text-sm text-slate-600 transition hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center dark:border-purple-500/20">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} Propfident, Inc. All rights
              reserved.
            </p>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Trading involves substantial risk of loss and is not suitable for
            every investor. Past performance is not indicative of future
            results.
          </p>
        </div>
      </div>
    </footer>
  );
}
