"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clients",
  "/jobs": "Jobs & Campaigns",
  "/production": "Production Board",
  "/studio": "Studio Capacity",
  "/media": "Media Buys",
  "/invoices": "Invoice Pipeline",
  "/leads": "Private-Sector Pipeline",
  "/opportunities": "Opportunity Ops",
  "/pitches": "Active Pitches",
  "/autopilot": "Autopilot",
  "/settings": "Settings",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/opportunities/")) return "Brief Detail";
  if (pathname.startsWith("/clients/")) return "Client Detail";
  if (pathname.startsWith("/jobs/")) return "Job Detail";
  return "Cherry Ops";
}

interface Props {
  role: string;
  pendingCount: number;
}

export function TopBarWrapper({ role, pendingCount }: Props) {
  const pathname = usePathname();
  const title = resolveTitle(pathname);
  return <TopBar title={title} role={role} pendingCount={pendingCount} />;
}
