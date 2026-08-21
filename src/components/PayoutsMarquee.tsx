import { Marquee } from "@/components/magicui/marquee";

const PAYOUT_CERTIFICATES = [
  {
    firmName: "FTMO",
    amount: "$12,450.00",
    trader: "@kwame_traderFX",
    date: "Aug 2025",
    logoUrl:
      "https://tse4.mm.bing.net/th/id/OIP.YZG0QPkX1OlbZc4UOG4ZZAHaDq?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    certBgUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
  },
  {
    firmName: "Topstep",
    amount: "$8,920.50",
    trader: "@prop_ninja",
    date: "Jul 2025",
    logoUrl:
      "https://propfirmapp.com/wp-content/uploads/topstep-logo-500-250.png",
    certBgUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
  },
  {
    firmName: "FundedNext",
    amount: "$28,200.00",
    trader: "@sarahfx",
    date: "Oct 2025",
    logoUrl:
      "https://tse4.mm.bing.net/th/id/OIP.PEApMUcvIwcJIhgytY9_4QAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    certBgUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
  },
  {
    firmName: "Apex Trader Funding",
    amount: "$31,500.00",
    trader: "@davidxau",
    date: "Oct 2025",
    logoUrl:
      "https://www.apextraderfunding.global/app/post/description-images/atf-1757666998.jpeg",
    certBgUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
  },
  {
    firmName: "Alpha Capital",
    amount: "$19,750.00",
    trader: "@emmafunded",
    date: "Sep 2025",
    logoUrl:
      "https://joinprop.com/wp-content/uploads/2025/06/alpha-capital-S-12-01-01.jpg",
    certBgUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
  },
  {
    firmName: "The 5ers",
    amount: "$45,900.00",
    trader: "@jamesfutures",
    date: "Sep 2025",
    logoUrl:
      "https://roadtotrader.com/wp-content/uploads/2023/09/the5ers-logo-1.png",
    certBgUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
  },
] as const;

export default function PayoutsMarquee() {
  return (
    <section
      id="payouts"
      className="overflow-hidden border-b border-slate-200 bg-white py-16 md:py-24 dark:border-purple-500/20 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 text-center md:px-6 lg:px-8">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
          Proof, not promises
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
          Built For Consistent Payouts, When You Follow The System
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
          Real verified payouts achieved by traders using Propfident risk rules
          across top-tier firms.
        </p>
      </div>

      <div className="relative mt-10 md:mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-white to-transparent sm:w-40 dark:from-slate-950" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-white to-transparent sm:w-40 dark:from-slate-950" />

        <Marquee pauseOnHover>
          {PAYOUT_CERTIFICATES.map((item) => (
            <CertificateCard key={`${item.firmName}-${item.trader}-${item.amount}`} item={item} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

type PayoutCertificate = (typeof PAYOUT_CERTIFICATES)[number];

function CertificateCard({ item }: { item: PayoutCertificate }) {
  return (
    <div className="group relative h-[190px] w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all duration-300 hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-500/20 md:w-[340px] dark:border-purple-500/30 dark:bg-slate-900/90">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-500 group-hover:scale-105 group-hover:opacity-35"
        style={{ backgroundImage: `url(${item.certBgUrl})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/50 dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-950/40" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 backdrop-blur-md md:px-3 dark:border-purple-500/30 dark:bg-slate-900/90">
            <img
              src={item.logoUrl}
              alt={item.firmName}
              className="h-5 w-auto shrink-0 object-contain"
              loading="lazy"
            />
            <span className="truncate text-xs font-semibold text-slate-900 dark:text-purple-200">
              {item.firmName}
            </span>
          </div>

          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-md md:px-2.5 dark:bg-emerald-950/80 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse dark:bg-emerald-400" />
            Verified
          </span>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Payout Secured
          </p>
          <p className="text-2xl font-extrabold tracking-tighter text-slate-900 md:text-3xl dark:text-white dark:drop-shadow-md">
            {item.amount}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs text-slate-600 dark:border-white/10 dark:text-slate-400">
          <span className="truncate font-mono text-purple-700 dark:text-purple-300">
            {item.trader}
          </span>
          <span className="shrink-0 pl-2">{item.date}</span>
        </div>
      </div>
    </div>
  );
}
