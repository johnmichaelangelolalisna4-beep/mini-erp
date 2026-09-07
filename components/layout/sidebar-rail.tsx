"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Store, LogOut } from "lucide-react";
import { createClient } from "@/server/supabase/client";
import {
  adminRailItems,
  inventoryRailItems,
  salesRailItems,
  isActiveRoute,
} from "@/lib/config/navigation";
import { useSidebarMetrics } from "@/lib/hooks/use-sidebar-metrics";

export function SidebarRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { metrics } = useSidebarMetrics();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out notice:", err);
    }
    router.push("/");
  };

  const isAdminPortal = pathname.startsWith("/admin");
  const isInventoryPortal = pathname.startsWith("/inventory");

  const railItems = isAdminPortal
    ? adminRailItems
    : isInventoryPortal
    ? inventoryRailItems
    : salesRailItems;

  const topHomeHref = isAdminPortal
    ? "/admin/dashboard"
    : isInventoryPortal
    ? "/inventory/overview"
    : "/sales/overview";

  return (
    <aside className="w-16 border-r border-[#e8decf] bg-white hidden md:flex flex-col items-center py-4 shrink-0 justify-between h-screen sticky top-0 z-20">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Top Store Badge Icon */}
        <Link
          href={topHomeHref}
          title="Mini-ERP Store Overview"
          className="w-10 h-10 rounded-lg bg-[#713105] text-[#fff7e8] flex items-center justify-center shadow-xs transition-transform hover:scale-105 active:scale-95"
        >
          <Store className="w-5 h-5" />
        </Link>

        {/* Navigation Icon List */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {railItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(pathname, item.href);
            const hasAlert =
              item.badgeKey &&
              metrics[item.badgeKey] !== undefined &&
              (metrics[item.badgeKey] || 0) > 0;

            return (
              <Link
                key={item.id}
                href={item.href}
                title={item.label}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative ${
                  isActive
                    ? "bg-[#fcf3e3] text-[#713105] font-semibold border border-[#cfab71]/40 shadow-2xs"
                    : "text-[#7f5e35] hover:text-[#341100] hover:bg-[#fff7e8]"
                }`}
              >
                <Icon className="w-5 h-5" />
                {hasAlert && !isActive && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#713105] ring-2 ring-white" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section with Log Out button & status indicator */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        <button
          onClick={handleLogout}
          title="Sign Out / Log Out"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-red-700 hover:text-red-800 hover:bg-red-50 border border-red-200/60 transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <LogOut className="w-4 h-4" />
        </button>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mb-1" title="System Status: Operational" />
      </div>
    </aside>
  );
}
