"use client";

import React from "react";
import { SidebarRail } from "@/components/layout/sidebar-rail";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { AIChatProvider } from "@/lib/context/ai-chat-context";
import { MobileNavProvider } from "@/lib/context/mobile-nav-context";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AIChatProvider>
      <MobileNavProvider>
        <div className="flex min-h-screen bg-[#fff7e8] antialiased relative">
          {/* 1. Sticky Slim Left Icon Rail (Hidden on mobile <md) */}
          <SidebarRail />

          {/* 2. Sticky Secondary Main Navigation Drawer (Hidden on <lg) */}
          <MainSidebar />

          {/* 3. Mobile Slide-Over Navigation Drawer */}
          <MobileNavDrawer />

          {/* 4. Main Inventory Workspace Canvas */}
          <div className="flex-1 flex flex-col min-w-0">
            <TopHeader />
            <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </MobileNavProvider>
    </AIChatProvider>
  );
}

