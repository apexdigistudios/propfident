"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calculator,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  Plus,
  Server,
  Settings,
  ShieldAlert,
  TrendingUp,
  User as UserIcon,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  subscription_tier: string;
  telegram_chat_id?: string | null;
}

interface PropAccount {
  id: string;
  account_name: string;
  platform: string;
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Account Intel", href: "/dashboard/account-intel", icon: Server },
  { label: "Prop Shield", href: "/dashboard/prop-shield", icon: ShieldAlert },
  { label: "Trade Assist", href: "/dashboard/trade-assist", icon: Calculator },
  { label: "Journal", href: "/dashboard/journal", icon: NotebookPen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<PropAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, telegram_chat_id")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(profile);

      const { data: accounts } = await supabase
        .from("mt5_accounts")
        .select("id, account_name, platform")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setAccounts(accounts || []);
      setSelectedAccount(accounts?.[0]?.id || "");
      setLoading(false);
    }

    loadData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const title = navItems.find((item) => {
    if (item.href === "/dashboard") return pathname === item.href;
    return pathname.startsWith(item.href);
  })?.label || "Dashboard";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center overflow-hidden bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
          <p className="mt-4 text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition hover:text-white lg:hidden"
        aria-label="Toggle dashboard navigation"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 shrink-0 transform border-r border-slate-800 bg-slate-900/95 backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-lg shadow-purple-600/30">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">Propfident</span>
        </div>

        <div className="border-b border-slate-800 p-4">
          <Link
            href="/dashboard/account-intel/connect"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:brightness-110"
            title="Connect a new prop firm account"
          >
            <Plus className="h-3.5 w-3.5" />
            Connect Account
          </Link>

          {accounts.length > 0 ? (
            <select
              value={selectedAccount}
              onChange={(event) => setSelectedAccount(event.target.value)}
              className="mt-3 w-full appearance-none rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:border-purple-500 focus:outline-none"
              aria-label="Active account selector"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account_name} · {account.platform}
                </option>
              ))}
            </select>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-800 bg-slate-950 px-3 py-2 text-center text-[11px] text-slate-500">
              No connected accounts
            </div>
          )}

          <div className="mt-3 flex justify-center">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                (profile?.subscription_tier || "free") === "free"
                  ? "bg-slate-800 text-slate-300"
                  : profile?.subscription_tier === "pro"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {profile?.subscription_tier || "free"}
            </span>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-l-2 border-purple-500 bg-purple-600/20 text-purple-300"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            title="Sign out of Propfident"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close dashboard navigation overlay"
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 shrink-0 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="min-w-0 truncate text-lg font-bold capitalize text-slate-100">
              {title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-w-0 flex-1 flex-col space-y-6 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
