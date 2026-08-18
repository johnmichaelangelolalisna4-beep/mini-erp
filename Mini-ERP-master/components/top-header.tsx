"use client";

import React from "react";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopHeader() {
  return (
    <header className="h-16 border-b border-[#e8decf] bg-white/80 backdrop-blur-xs px-8 flex items-center justify-end gap-4 sticky top-0 z-10">
      {/* Search Input Box */}
      <div className="relative w-64 md:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
        <Input
          type="text"
          placeholder="Search records..."
          className="pl-9 bg-[#fff7e8] border-[#e8decf] rounded-xl focus:bg-white transition-all text-xs text-[#341100] placeholder:text-[#7f5e35]/70"
        />
      </div>

      {/* Profile Avatar with ESPRESSO Accent */}
      <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-[#cfab71] transition-all">
        <AvatarFallback className="bg-[#713105] text-[#fff7e8]">
          <User className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
