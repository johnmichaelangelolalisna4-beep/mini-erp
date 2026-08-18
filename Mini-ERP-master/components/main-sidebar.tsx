"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart2,
  Package,
  ShoppingCart,
  Banknote,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  History,
  Boxes,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminPortal = pathname.startsWith("/admin");
  const isInventoryPortal = pathname.startsWith("/inventory");

  const isOverviewActive =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/sales/overview" ||
    pathname === "/inventory/overview" ||
    pathname === "/admin/dashboard" ||
    pathname === "/admin";

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out notice:", err);
    }
    router.push("/");
  };


  return (
    <aside className="w-64 border-r border-[#e8decf] bg-white flex flex-col shrink-0 h-screen sticky top-0 z-20 justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-[#e8decf] flex items-center justify-between px-6 shrink-0">
          <Link
            href={
              isAdminPortal
                ? "/admin/dashboard"
                : isInventoryPortal
                ? "/inventory/overview"
                : "/sales/overview"
            }
            className="font-serif text-lg font-bold tracking-tight text-[#341100] hover:text-[#713105] transition-colors"
          >
            MINI-ERP
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#fff7e8] border border-[#e8decf] text-[#713105]">
            {isAdminPortal ? "Admin" : isInventoryPortal ? "Inventory" : "Sales"}
          </span>
        </div>

        {/* Navigation Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* ================= 1. INVENTORY PORTAL SIDEBAR ================= */}
          {isInventoryPortal && (
            <>
              <div>
                <h2 className="text-[10px] font-bold tracking-wider text-[#7f5e35] uppercase px-2 mb-2">
                  Main Menu
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/inventory/overview"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/inventory/overview" || pathname === "/inventory"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <Boxes className="w-4 h-4 text-[#713105] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#341100]">
                        Stock Overview
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        Macro metrics, SKUs, restock alerts & categories.
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-bold tracking-wider text-[#7f5e35] uppercase px-2 mb-2">
                  Catalog & Logs
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/inventory/catalog"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/inventory/catalog"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <Package className="w-4 h-4 text-[#713105] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        Products & Catalog
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        Full Access: Add SKUs, edit stock, pricing & images.
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/inventory/low-stock"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/inventory/low-stock"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        Low Stock & Restock
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        Items below defined reorder thresholds.
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/inventory/stock-logs"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/inventory/stock-logs"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <History className="w-4 h-4 text-[#713105] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        Stock Movement History
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        Log of stock deductions & supplier additions.
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* ================= 2. SALES PORTAL SIDEBAR ================= */}
          {!isAdminPortal && !isInventoryPortal && (
            <>
              <div>
                <h2 className="text-[10px] font-bold tracking-wider text-[#7f5e35] uppercase px-2 mb-2">
                  Main Menu
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/sales/overview"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/sales/overview" || pathname === "/sales"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-[#713105] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#341100]">
                        Sales Performance
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        Personal sales targets, pending invoices & quotes.
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-bold tracking-wider text-[#7f5e35] uppercase px-2 mb-2">
                  Operations Modules
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/sales/orders"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/sales/orders"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 text-[#713105] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        Sales & Orders
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        Full Access: Create orders, customer details & invoices.
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/sales/inventory"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/sales/inventory"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <Package className="w-4 h-4 text-[#7f5e35] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        View Product Stock
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        Read-Only: Check stock availability & pricing.
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* ================= 3. ADMIN PORTAL SIDEBAR ================= */}
          {isAdminPortal && (
            <>
              <div>
                <h2 className="text-[10px] font-bold tracking-wider text-[#7f5e35] uppercase px-2 mb-2">
                  Main Menu
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/admin/dashboard"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      isOverviewActive
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <BarChart2 className="w-4 h-4 text-[#713105] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#341100]">
                        Overview
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        High-level summary with KPI cards and quick revenue charts.
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-bold tracking-wider text-[#7f5e35] uppercase px-2 mb-2">
                  Operations Modules
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/admin/inventory"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/admin/inventory"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <Package className="w-4 h-4 text-[#7f5e35] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        Inventory & Products
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        View products, stock levels, categories, and low-stock alerts.
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/admin/sales"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/admin/sales"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 text-[#7f5e35] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        Sales & Orders
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        View transactions, pending orders, invoices, histories.
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/admin/finance"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/admin/finance"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-[#7f5e35] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        Finance & Reports
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        Ledgers, revenue vs. expense, export summary reports.
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-bold tracking-wider text-[#7f5e35] uppercase px-2 mb-2">
                  Administration (Admin-Only)
                </h2>
                <div className="space-y-1">
                  <Link
                    href="/admin/users"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/admin/users"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <Users className="w-4 h-4 text-[#7f5e35] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        User Management
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        View active staff, register employees, assign roles.
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/admin/logs"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      pathname === "/admin/logs"
                        ? "bg-[#fcf3e3] text-[#341100] border border-[#cfab71]/40 shadow-xs"
                        : "hover:bg-[#fff7e8] text-[#4f351c]"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-[#7f5e35] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-[#4f351c]">
                        Audit & System Logs
                      </div>
                      <div className="text-[11px] text-[#7f5e35] leading-tight mt-0.5">
                        Logs every major system action across modules.
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          )}
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


