"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Store, Home, Package, Receipt, Users, Settings, TrendingUp, Boxes, AlertTriangle, History, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SidebarRail() {
  const pathname = usePathname();
  const router = useRouter();

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

  const inventoryNavItems = [
    { id: "overview", icon: Boxes, label: "Stock Overview", href: "/inventory/overview" },
    { id: "catalog", icon: Package, label: "Products & Catalog", href: "/inventory/catalog" },
    { id: "low_stock", icon: AlertTriangle, label: "Low Stock & Restock", href: "/inventory/low-stock" },
    { id: "logs", icon: History, label: "Stock Movement History", href: "/inventory/stock-logs" },
  ];

  const salesNavItems = [
    { id: "overview", icon: TrendingUp, label: "Sales Performance", href: "/sales/overview" },
    { id: "orders", icon: Receipt, label: "Sales & Orders", href: "/sales/orders" },
    { id: "inventory", icon: Package, label: "View Product Stock (Read-Only)", href: "/sales/inventory" },
  ];

  const adminNavItems = [
    { id: "home", icon: Home, label: "Dashboard Overview", href: "/admin/dashboard" },
    { id: "inventory", icon: Package, label: "Inventory & Products", href: "/admin/inventory" },
    { id: "sales", icon: Receipt, label: "Sales & Orders", href: "/admin/sales" },
    { id: "users", icon: Users, label: "User Management", href: "/admin/users" },
    { id: "settings", icon: Settings, label: "System Settings", href: "/admin/settings" },
  ];

  const navItems = isAdminPortal
    ? adminNavItems
    : isInventoryPortal
    ? inventoryNavItems
    : salesNavItems;

  const topHomeHref = isAdminPortal
    ? "/admin/dashboard"
    : isInventoryPortal
    ? "/inventory/overview"
    : "/sales/overview";

  return (
    <aside className="w-16 border-r border-[#e8decf] bg-white flex flex-col items-center py-4 shrink-0 justify-between h-screen sticky top-0 z-20">
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === topHomeHref
                ? pathname === item.href || (pathname === "/inventory" && item.href === "/inventory/overview")
                : pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                title={item.label}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-[#fcf3e3] text-[#713105] font-semibold border border-[#cfab71]/40 shadow-2xs"
                    : "text-[#7f5e35] hover:text-[#341100] hover:bg-[#fff7e8]"
                }`}
              >
                <Icon className="w-5 h-5" />
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

