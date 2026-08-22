"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OptionItem<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: OptionItem<T>[];
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  placement?: "bottom" | "top";
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  menuClassName,
  disabled = false,
  placement = "bottom",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#fff7e8] border border-[#e8decf] text-xs font-semibold text-[#341100] transition-all hover:bg-[#fcf3e3] hover:border-[#cfab71]/70 focus:outline-hidden focus:ring-2 focus:ring-[#cfab71] shadow-2xs cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "ring-2 ring-[#cfab71] border-[#cfab71] bg-white",
          className
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-[#7f5e35] transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-[#713105]"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 right-0 w-full min-w-[140px] max-h-52 overflow-y-auto rounded-xl bg-white border border-[#e8decf] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100",
            placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            menuClassName
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer",
                  isSelected
                    ? "bg-[#fcf3e3] text-[#713105] font-bold"
                    : "text-[#4f351c] hover:bg-[#fff7e8] hover:text-[#341100]"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0 text-[#713105]" />}
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#713105] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
