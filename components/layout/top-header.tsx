"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, User, Bot, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAIChat } from "@/lib/context/ai-chat-context";
import { useMobileNav } from "@/lib/context/mobile-nav-context";

export function TopHeader() {
  const pathname = usePathname();
  const { isOpen, toggleChat } = useAIChat();
  const { toggleNav } = useMobileNav();

  const isAdmin = pathname.startsWith("/admin");
  const isInventory = pathname.startsWith("/inventory");
  const portalName = isAdmin ? "Admin" : isInventory ? "Inventory" : "Sales";

  const isSettingsActive =
    pathname === "/admin/settings" || pathname.startsWith("/admin/settings/");

  return (
    <header className="h-16 border-b border-[#e8decf] bg-white/80 backdrop-blur-xs px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3 sticky top-0 z-10">
      {/* Mobile Hamburger & Brand Marker (Visible only on < lg screens) */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleNav}
          title="Open navigation menu"
          aria-label="Open navigation menu"
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[#e8decf] bg-[#fff7e8] text-[#713105] hover:bg-[#fcf3e3] hover:border-[#cfab71] transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <Menu className="w-5 h-5 text-[#713105]" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <span className="font-serif text-base font-bold text-[#341100] tracking-tight">
            MINI-ERP
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#fff7e8] border border-[#e8decf] text-[#713105]">
            {portalName}
          </span>
        </div>
      </div>

      {/* Right Side Action Items */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
        {/* AI Chatbot Header Action Button */}
        <button
          onClick={toggleChat}
          title="Open AI Chatbot"
          aria-label="Open AI Chatbot"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border shadow-2xs cursor-pointer active:scale-95 ${
            isOpen
              ? "bg-[#713105] text-[#fff7e8] border-[#cfab71] ring-2 ring-[#cfab71]/50"
              : "bg-[#fff7e8] text-[#713105] border-[#e8decf] hover:bg-[#fcf3e3] hover:border-[#cfab71]/60"
          }`}
        >
          <div className="relative">
            <Bot className={`w-4 h-4 ${isOpen ? "text-[#cfab71]" : "text-[#713105]"}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
          </div>
          <span className="hidden sm:inline font-semibold">AI Chatbot</span>
        </button>

        {/* Admin Quick Action: System Settings */}
        {isAdmin && (
          <Link
            href="/admin/settings"
            title="System Settings"
            aria-label="System Settings"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
              isSettingsActive
                ? "bg-[#fcf3e3] text-[#713105] border-[#cfab71] ring-1 ring-[#cfab71]/50"
                : "bg-[#fff7e8] text-[#713105] border-[#e8decf] hover:bg-[#fcf3e3] hover:border-[#cfab71]/60"
            }`}
          >
            <Settings
              className={`w-4 h-4 transition-transform duration-300 ${
                isSettingsActive ? "rotate-45" : "hover:rotate-45"
              }`}
            />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        )}

        {/* Profile Avatar with ESPRESSO Accent */}
        <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-[#cfab71] transition-all">
          <AvatarFallback className="bg-[#713105] text-[#fff7e8]">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
