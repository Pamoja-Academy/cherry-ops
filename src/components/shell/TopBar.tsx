"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopBarProps {
  role: string;
  pendingCount: number;
}

const ROLE_LABELS: Record<string, string> = {
  CEO: "CEO",
  CREATIVE_DIRECTOR: "Creative Director",
  PRODUCTION: "Production",
  MEDIA: "Media",
  FINANCE: "Finance",
};

const PAGE_TITLES: [RegExp, string][] = [
  [/^\/dashboard/, "CEO Command Centre"],
  [/^\/clients\/\d+/, "Client Detail"],
  [/^\/clients/, "Clients"],
  [/^\/jobs\/\d+/, "Job Detail"],
  [/^\/jobs/, "Jobs & Campaigns"],
  [/^\/production/, "Production Board"],
  [/^\/studio/, "Studio Capacity"],
  [/^\/media/, "Media Buys"],
  [/^\/invoices/, "Invoice Pipeline"],
  [/^\/leads/, "Private-Sector Pipeline"],
  [/^\/autopilot/, "Autopilot"],
  [/^\/settings/, "Settings"],
];

function titleFor(pathname: string): string {
  return PAGE_TITLES.find(([re]) => re.test(pathname))?.[1] ?? "Cherry Ops";
}

export function TopBar({ role, pendingCount }: TopBarProps) {
  const pathname = usePathname();

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b flex-shrink-0"
      style={{ background: "#fff", borderColor: "#E4D8D1" }}
    >
      <h1 className="font-display text-lg font-bold" style={{ color: "#1A1214" }}>
        {titleFor(pathname)}
      </h1>

      <div className="flex items-center gap-3">
        {/* Role pill */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "#FCE8EC", color: "#7A0B22" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#C4122F" }} />
          Viewing as {ROLE_LABELS[role] ?? role}
        </div>

        {/* Autopilot bell */}
        <Link href="/autopilot" className="relative" aria-label="Autopilot approvals">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#FCE8EC]"
            style={{ color: "#8C8078" }}
          >
            <Bell className="w-4 h-4" />
          </div>
          {pendingCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white"
              style={{ background: "#C4122F" }}
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
