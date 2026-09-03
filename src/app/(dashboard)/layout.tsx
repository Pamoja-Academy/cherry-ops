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
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role={session.user.role}
        name={session.user.name ?? ""}
        initials={session.user.avatar_initials ?? ""}
        pendingCount={pendingCount}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBarWrapper role={session.user.role} pendingCount={pendingCount} />
        <main className="flex-1 overflow-y-auto bg-[#080808] p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}
