"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clients",
  "/events": "Events",
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
  if (pathname.startsWith("/events/activations/")) return "Activation Detail";
  if (pathname.startsWith("/events/scheduling/")) return "Schedule Item";
  if (pathname.startsWith("/events")) return "Events";
  if (pathname.startsWith("/jobs/")) return "Activation Detail";
  if (pathname.startsWith("/jobs")) return "Events";
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
