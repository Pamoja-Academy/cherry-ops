"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Film,
  MonitorPlay,
  Radio,
  FileText,
  Target,
  Sparkles,
  Megaphone,
  Bot,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/production", icon: Film, label: "Production" },
  { href: "/studio", icon: MonitorPlay, label: "Studio" },
  { href: "/media", icon: Radio, label: "Media" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/leads", icon: Target, label: "Leads" },
  { href: "/opportunities", icon: Sparkles, label: "Opportunities" },
  { href: "/pitches", icon: Megaphone, label: "Pitches" },
  { href: "/autopilot", icon: Bot, label: "Autopilot" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  role: string;
  name: string;
  initials: string;
  pendingCount: number;
}

export function Sidebar({ role, name, initials, pendingCount }: SidebarProps) {
  const pathname = usePathname();

  const roleLabel: Record<string, string> = {
    CEO: "Chief Executive",
    CREATIVE_DIRECTOR: "Creative Director",
    PRODUCTION: "Production",
    MEDIA: "Media",
    FINANCE: "Finance",
  };

  return (
    <div className="flex h-full w-56 flex-shrink-0 flex-col border-r border-white/10 bg-[#050505]">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#C4122F]">
          Red Cherry
        </p>
        <p className="mt-1 font-display text-lg font-extrabold tracking-tight text-white">
          CHERRY OPS
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 3 }}
                className="relative flex items-center gap-3 px-3 py-2.5 text-sm transition-colors"
                style={{
                  color: active ? "#fff" : "#777",
                  background: active ? "rgba(196,18,47,0.12)" : "transparent",
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-[#C4122F]" />
                )}
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className={active ? "font-semibold" : ""}>{item.label}</span>
                {item.href === "/autopilot" && pendingCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#C4122F] text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="mb-2 flex items-center gap-3 bg-white/[0.03] px-3 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[#C4122F] text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-white">{name}</div>
            <div className="truncate text-[10px] uppercase tracking-wider text-white/40">
              {roleLabel[role] ?? role}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-white/40 transition hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
