"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastData {
  type: "success" | "error";
  message: string;
  title?: string;
}

export interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
  duration?: number;
}

export function ToastNotification({
  toast,
  onClose,
  duration = 4000,
}: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-200">
      <div
        className={cn(
          "flex items-start gap-3 p-4 rounded-2xl border shadow-2xl transition-all",
          isSuccess
            ? "bg-emerald-50 border-emerald-300 text-emerald-950"
            : "bg-red-50 border-red-300 text-red-950"
        )}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          {toast.title ? (
            <>
              <h4
                className={cn(
                  "text-xs font-bold leading-tight mb-0.5",
                  isSuccess ? "text-emerald-900" : "text-red-900"
                )}
              >
                {toast.title}
              </h4>
              <p
                className={cn(
                  "text-xs leading-relaxed",
                  isSuccess ? "text-emerald-800" : "text-red-800"
                )}
              >
                {toast.message}
              </p>
            </>
          ) : (
            <p
              className={cn(
                "text-xs font-semibold leading-relaxed",
                isSuccess ? "text-emerald-900" : "text-red-900"
              )}
            >
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className={cn(
            "shrink-0 p-1 rounded-lg transition-colors cursor-pointer focus:outline-none",
            isSuccess
              ? "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-950"
              : "text-red-700 hover:bg-red-100 hover:text-red-950"
          )}
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
