"use client";

import React from "react";
import { SidebarRail } from "@/components/sidebar-rail";
import { MainSidebar } from "@/components/main-sidebar";
import { TopHeader } from "@/components/top-header";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#fff7e8] antialiased relative">
      {/* 1. Sticky Slim Left Icon Rail */}
      <SidebarRail />

      {/* 2. Sticky Secondary Main Navigation Drawer */}
      <MainSidebar />

      {/* 3. Main Inventory Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
