import { Star } from "lucide-react";
import { Marquee } from "@/components/magicui/marquee";

const TRADER_REVIEWS = [
  {
    quote:
      "The trailing drawdown shield saved my $100k account twice this month during high news volatility.",
    trader: "Verified Trader",
  },
  {
    quote:
      "Finally a journal that syncs automatically. No more filling out spreadsheets after bad sessions.",
    trader: "Funded Trader - Marcus K.",
  },
  {
    quote:
      "Position sizing calculator alone is worth it. Never miscalculated lot sizes since.",
    trader: "Alex M.",
  },
  {
    quote:
      "The live risk view makes it easier to respect my rules before every session.",
    trader: "David R.",
  },
  {
    quote:
      "Automatic trade journaling gives me a much clearer picture of my execution habits.",
    trader: "Verified User",
  },
  {
    quote:
      "Having drawdown and position sizing in one workflow keeps my process consistent.",
    trader: "Verified User",
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
          Built For Consistent Performance, When You Follow The System
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
          Feedback from traders using Propfident to strengthen risk control and journaling habits.
        </p>
        <p className="mx-auto mt-4 max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-500">
          Propfident does not guarantee profits or payouts. Trading outcomes depend on execution, market conditions, and adherence to applicable prop-firm rules.
        </p>
      </div>

      <div className="relative mt-10 w-full max-w-full overflow-hidden md:mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-white to-transparent sm:w-40 dark:from-slate-950" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-white to-transparent sm:w-40 dark:from-slate-950" />

        <Marquee pauseOnHover>
          {TRADER_REVIEWS.map((review, index) => (
            <ReviewCard key={`${review.trader}-${index}`} review={review} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

type TraderReview = (typeof TRADER_REVIEWS)[number];

function ReviewCard({ review }: { review: TraderReview }) {
  return (
    <article className="flex h-[190px] w-[280px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all duration-300 hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-500/20 md:w-[340px] dark:border-purple-500/30 dark:bg-slate-900/90">
      <div>
        <div className="flex items-center gap-1" aria-label="5 star rating">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="mt-4 text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">
          “{review.quote}”
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs dark:border-white/10">
        <span className="truncate font-semibold text-purple-700 dark:text-purple-300">
          {review.trader}
        </span>
        <span className="shrink-0 pl-2 text-slate-500">Verified User</span>
      </div>
    </article>
  );
}
