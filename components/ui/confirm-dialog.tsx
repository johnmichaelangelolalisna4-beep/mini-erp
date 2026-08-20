"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive",
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-sm bg-white border border-[#e8decf] shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200/80 flex items-center justify-center text-red-700">
            {variant === "destructive" ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-[#713105]" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#341100] tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-[#7f5e35] leading-relaxed">
              {description}
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] rounded-xl text-xs py-2"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              disabled={loading}
              className="flex-1 rounded-xl text-xs py-2 font-semibold"
            >
              {loading ? "Processing..." : confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
