"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "./Sidebar";

interface MobileNavProps {
  pendingCount: number;
}

// Horizontal scroll nav for small screens — the fixed sidebar is hidden below lg.
export function MobileNav({ pendingCount }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div
      className="lg:hidden flex items-center gap-1 px-3 py-2 overflow-x-auto border-b flex-shrink-0"
      style={{ background: "#1A1214" }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 relative"
            style={{
              background: active ? "rgba(196,18,47,0.25)" : "transparent",
              color: active ? "#FCE8EC" : "#8C8078",
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
            {item.href === "/autopilot" && pendingCount > 0 && (
              <span
                className="ml-1 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: "#C4122F", color: "#fff" }}
              >
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
        style={{ color: "#8C8078" }}
        aria-label="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </button>
    </div>
  );
}
