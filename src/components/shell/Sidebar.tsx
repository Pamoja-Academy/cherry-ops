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
  Bot,
  Settings,
  LogOut,
  CircleDot,
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
    <div
      className="flex flex-col h-full w-56 flex-shrink-0"
      style={{ background: "#1A1214" }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: "#2E2228" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#C4122F" }}
          >
            <CircleDot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm tracking-wide">Cherry Ops</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative"
                style={{
                  background: active ? "rgba(196,18,47,0.15)" : "transparent",
                  color: active ? "#FCE8EC" : "#8C8078",
                }}
              >
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                    style={{ background: "#C4122F" }}
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className={active ? "font-medium" : ""}>{item.label}</span>
                {item.href === "/autopilot" && pendingCount > 0 && (
                  <span
                    className="ml-auto text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                    style={{ background: "#C4122F", color: "#fff" }}
                  >
                    {pendingCount}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "#2E2228" }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "#C4122F" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-white truncate">{name}</div>
            <div className="text-xs truncate" style={{ color: "#8C8078" }}>{roleLabel[role] ?? role}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/5"
          style={{ color: "#8C8078" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
