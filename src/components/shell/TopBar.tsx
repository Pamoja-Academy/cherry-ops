"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  title: string;
  role: string;
  pendingCount: number;
}

const ROLE_LABELS: Record<string, string> = {
  CEO: "CEO",
  CREATIVE_DIRECTOR: "Creative Director",
  DIRECTOR: "Director",
  PRODUCTION: "Production Director",
  MEDIA: "Media Director",
  FINANCE: "Finance Manager",
};

export function TopBar({ title, role, pendingCount }: TopBarProps) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/10 bg-[#080808] px-6">
      <h1 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white/80">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 border border-white/10 bg-black/40 px-3 py-1.5 text-white/35 sm:flex">
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Search…</span>
        </div>

        <div className="hidden items-center gap-1.5 border border-[#C4122F]/40 bg-[#C4122F]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#fecaca] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C4122F]" />
          {ROLE_LABELS[role] ?? role}
        </div>

        <Link href="/autopilot" className="relative">
          <div className="flex h-8 w-8 items-center justify-center text-white/45 transition hover:text-white">
            <Bell className="h-4 w-4" />
          </div>
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C4122F] text-[10px] font-bold text-white">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
