import { BarChart3, Link2, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect",
    description: "Connect your MT4/MT5 account securely through read-only access.",
    Icon: Link2,
  },
  {
    number: "02",
    title: "Protect",
    description:
      "Propfident monitors your drawdown in real time and calculates optimal position sizing.",
    Icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Improve",
    description:
      "Your trades are automatically journaled and analyzed to refine your edge.",
    Icon: BarChart3,
  },
] as const;

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-28 border-b border-slate-200 bg-white py-16 dark:border-purple-500/20 dark:bg-slate-950 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
            A clearer trading workflow
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Protect your account in 3 steps
          </h2>
        </div>

        <ol className="mx-auto mt-12 grid max-w-5xl gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
          {steps.map(({ number, title, description, Icon }) => (
            <li
              key={number}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-purple-500/30 dark:bg-slate-900/90 md:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-purple-600 dark:text-purple-400">
                  {number}
                </span>
                <Icon className="h-5 w-5 text-purple-500" strokeWidth={2.5} />
              </div>
              <h3 className="mt-8 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}