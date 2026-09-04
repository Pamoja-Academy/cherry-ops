import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBarWrapper } from "@/components/shell/TopBarWrapper";
import { getPendingAutopilotCount } from "@/lib/queries";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const pendingCount = await getPendingAutopilotCount();

  return (
    <div className="relative flex h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: "url(/hero/cherry-ops-team-wallpaper.png)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#080808]/88" />
      <div className="relative z-10 flex h-full w-full">
        <Sidebar
          role={session.user.role}
          name={session.user.name ?? ""}
          initials={session.user.avatar_initials ?? ""}
          pendingCount={pendingCount}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBarWrapper role={session.user.role} pendingCount={pendingCount} />
          <main className="flex-1 overflow-y-auto bg-transparent p-6 text-white">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
