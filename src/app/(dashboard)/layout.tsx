import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { getPendingAutopilotCount } from "@/lib/queries";

// Page title map
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clients",
  "/jobs": "Jobs & Campaigns",
  "/production": "Production Board",
  "/studio": "Studio Capacity",
  "/media": "Media Buys",
  "/invoices": "Invoice Pipeline",
  "/leads": "Private-Sector Pipeline",
  "/autopilot": "Autopilot",
  "/settings": "Settings",
};

export default async function DashboardLayout({
  children,
}: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const pendingCount = await getPendingAutopilotCount();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role={session.user.role}
        name={session.user.name ?? ""}
        initials={session.user.avatar_initials ?? ""}
        pendingCount={pendingCount}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBarWrapper
          role={session.user.role}
          pendingCount={pendingCount}
        />
        <main className="flex-1 overflow-y-auto bg-[#080808] p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}

// Server component wrapper that figures out title from URL
function TopBarWrapper({ role, pendingCount }: { role: string; pendingCount: number }) {
  return (
    <TopBar
      title="Cherry Ops"
      role={role}
      pendingCount={pendingCount}
    />
  );
}
