"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/server/supabase/client";
import {
  adminNavSections,
  inventoryNavSections,
  salesNavSections,
  isActiveRoute,
  MetricBadgeKey,
} from "@/lib/config/navigation";
import { useSidebarMetrics } from "@/lib/hooks/use-sidebar-metrics";

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { metrics } = useSidebarMetrics();

  const isAdminPortal = pathname.startsWith("/admin");
  const isInventoryPortal = pathname.startsWith("/inventory");

  const navSections = isAdminPortal
    ? adminNavSections
    : isInventoryPortal
    ? inventoryNavSections
    : salesNavSections;

  const portalBadge = isAdminPortal
    ? "Admin"
    : isInventoryPortal
    ? "Inventory"
    : "Sales";

  const portalHomeHref = isAdminPortal
    ? "/admin/dashboard"
    : isInventoryPortal
    ? "/inventory/overview"
    : "/sales/overview";

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out notice:", err);
    }
    router.push("/");
  };

  const renderBadge = (badgeKey?: MetricBadgeKey, badgeType?: string) => {
    if (!badgeKey) return null;
    const count = metrics[badgeKey];
    if (count === undefined || count === null || count <= 0) return null;

    let badgeClasses = "bg-[#fff7e8] text-[#7f5e35] border-[#e8decf]";
    let label = `${count}`;

    if (badgeKey === "lowStock") {
      badgeClasses = "bg-amber-100/90 text-amber-900 border-amber-300/80 font-bold";
      label = `${count} Alert`;
    } else if (badgeKey === "pendingOrders") {
      badgeClasses = "bg-[#fcf3e3] text-[#713105] border-[#cfab71]/70 font-bold";
      label = `${count} Pending`;
    } else if (badgeKey === "activeStaff") {
      badgeClasses = "bg-[#fff7e8] text-[#713105] border-[#cfab71]/50 font-semibold";
      label = `${count} Staff`;
    }

    return (
      <span
        className={`ml-auto text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md border shadow-2xs shrink-0 ${badgeClasses}`}
      >
        {label}
      </span>
    );
  };

  return (
    <aside className="w-72 border-r border-[#e8decf] bg-white hidden lg:flex flex-col shrink-0 h-screen sticky top-0 z-20 justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-[#e8decf] flex items-center justify-between px-6 shrink-0">
          <Link
            href={portalHomeHref}
            className="font-serif text-lg font-bold tracking-tight text-[#341100] hover:text-[#713105] transition-colors"
          >
            MINI-ERP
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#fff7e8] border border-[#e8decf] text-[#713105]">
            {portalBadge}
          </span>
        </div>

        {/* Dynamic Navigation Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((section) => (
            <div key={section.id}>
              <h2 className="text-[10px] font-bold tracking-wider text-[#7f5e35] uppercase px-2 mb-2">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(pathname, item.href);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                        active
                          ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                          : "hover:bg-[#fff7e8] text-[#4f351c]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          active ? "text-[#713105]" : "text-[#7f5e35]"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`text-xs ${
                              active
                                ? "font-bold text-[#341100]"
                                : "font-semibold text-[#4f351c]"
                            }`}
                          >
                            {item.label}
                          </span>
                          {renderBadge(item.badgeKey, item.badgeType)}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5 line-clamp-2">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Out Footer Button */}
      <div className="p-3 border-t border-[#e8decf] bg-[#fff7e8]/40 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 border border-red-200/70 transition-all shadow-2xs cursor-pointer active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Log Out</span>
        </button>
      </div>
    </aside>
  );
}
