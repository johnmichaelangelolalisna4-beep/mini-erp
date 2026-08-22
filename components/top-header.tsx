"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, User, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAIChat } from "@/lib/context/ai-chat-context";

export function TopHeader() {
  const pathname = usePathname();
  const { isOpen, toggleChat } = useAIChat();
  const isAdmin = pathname.startsWith("/admin");
  const isSettingsActive =
    pathname === "/admin/settings" || pathname.startsWith("/admin/settings/");

  return (
    <header className="h-16 border-b border-[#e8decf] bg-white/80 backdrop-blur-xs px-8 flex items-center justify-end gap-3 sticky top-0 z-10">
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
    </header>
  );
}


