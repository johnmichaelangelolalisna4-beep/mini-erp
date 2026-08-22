"use client";

import React, { useState } from "react";
import {
  PackagePlus,
  PackageMinus,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Boxes,
} from "lucide-react";

export interface StockAdjustmentAction {
  action_id: string;
  action_type: "STOCK_ADJUSTMENT";
  product_id: string;
  product_name: string;
  sku: string;
  category?: string;
  change_type: "ADDITION" | "DEDUCTION";
  quantity: number;
  current_stock: number;
  new_stock: number;
  reason?: string;
  status?: "PENDING_CONFIRMATION" | "CONFIRMED" | "CANCELLED";
}

interface ActionConfirmationCardProps {
  action: StockAdjustmentAction;
  onExecuteSuccess?: (result: any) => void;
}

export function ActionConfirmationCard({
  action,
  onExecuteSuccess,
}: ActionConfirmationCardProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "cancelled" | "error">(
    action.status === "CONFIRMED"
      ? "success"
      : action.status === "CANCELLED"
      ? "cancelled"
      : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);

  const isAddition = action.change_type === "ADDITION";

  const handleConfirm = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/chat/execute-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: action.action_type,
          product_id: action.product_id,
          change_type: action.change_type,
          quantity: action.quantity,
          reason: action.reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server responded with ${res.status}`);
      }

      setResultData(data);
      setStatus("success");
      try {
        const { invalidateRelatedCaches } = await import("@/lib/services/cache");
        invalidateRelatedCaches(["products", "stock_logs", "dashboard_kpis", "audit_logs", "sidebar_metrics"]);
        window.dispatchEvent(new CustomEvent("erp-refresh-data"));
      } catch (e) {
        // Safe fallback
      }
      if (onExecuteSuccess) {
        onExecuteSuccess(data);
      }
    } catch (err: any) {
      console.error("Failed to execute action:", err);
      setErrorMessage(err.message || "Failed to update stock");
      setStatus("error");
    }
  };

  const handleCancel = () => {
    setStatus("cancelled");
  };

  if (status === "success") {
    return (
      <div className="my-2.5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl shadow-xs animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Stock Adjustment Applied</span>
        </div>
        <p className="text-xs text-emerald-800 mt-1 font-medium">
          {isAddition ? "Restocked" : "Deducted"}{" "}
          <strong>
            {isAddition ? "+" : "-"}
            {action.quantity} units
          </strong>{" "}
          for <strong>{action.product_name}</strong> ({action.sku}).
        </p>
        <div className="mt-2 text-[11px] text-emerald-950 font-mono bg-white/70 px-2 py-1 rounded border border-emerald-200 inline-block">
          New Live Stock: <strong>{resultData?.new_stock ?? action.new_stock} units</strong> • Status:{" "}
          <strong className="uppercase">{resultData?.status ?? "UPDATED"}</strong>
        </div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="my-2.5 p-3 bg-stone-50 border border-[#e8decf] rounded-xl text-stone-600 text-xs flex items-center gap-2 animate-in fade-in">
        <XCircle className="w-4 h-4 text-stone-400" />
        <span>Action cancelled. No database changes were made.</span>
      </div>
    );
  }

  return (
    <div className="my-2.5 bg-[#fcf3e3] border border-[#cfab71]/50 rounded-xl p-3.5 shadow-xs space-y-3 font-sans transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e8decf] pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#713105] text-[#fff7e8] flex items-center justify-center">
            {isAddition ? <PackagePlus className="w-3.5 h-3.5" /> : <PackageMinus className="w-3.5 h-3.5" />}
          </div>
          <span className="font-bold text-xs text-[#341100] uppercase tracking-wide">
            Stock Adjustment Confirmation
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isAddition
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-amber-50 text-[#713105] border-amber-300"
          }`}
        >
          {isAddition ? `+${action.quantity} ADDITION` : `-${action.quantity} DEDUCTION`}
        </span>
      </div>

      {/* Details Grid */}
      <div className="space-y-1.5 text-xs text-[#4f351c]">
        <div className="flex items-center justify-between">
          <span className="text-[#7f5e35]">Product Piece:</span>
          <span className="font-semibold text-[#341100] text-right truncate max-w-[200px]">
            {action.product_name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#7f5e35]">Catalog SKU:</span>
          <code className="font-mono text-[11px] bg-white text-[#713105] border border-[#e8decf] px-1.5 py-0.5 rounded">
            {action.sku}
          </code>
        </div>

        {/* Stock Comparison Progression */}
        <div className="flex items-center justify-between pt-1 border-t border-[#e8decf]/60">
          <span className="text-[#7f5e35]">Stock Level:</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-[#7f5e35]">{action.current_stock}</span>
            <ArrowRight className="w-3 h-3 text-[#cfab71]" />
            <span className={isAddition ? "text-emerald-700 font-extrabold" : "text-[#713105] font-extrabold"}>
              {action.new_stock} units
            </span>
          </div>
        </div>

        {action.reason && (
          <div className="text-[11px] text-[#7f5e35] italic pt-1">
            Note: {action.reason}
          </div>
        )}
      </div>

      {/* Error Message if execution failed */}
      {status === "error" && errorMessage && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleConfirm}
          disabled={status === "loading"}
          className="flex-1 bg-[#713105] hover:bg-[#4f351c] text-[#fff7e8] font-semibold text-xs py-2 px-3 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#cfab71]" />
              <span>Applying...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#cfab71]" />
              <span>Confirm & Apply Stock</span>
            </>
          )}
        </button>

        <button
          onClick={handleCancel}
          disabled={status === "loading"}
          className="border border-[#e8decf] bg-white text-[#7f5e35] hover:bg-[#fff7e8] font-medium text-xs py-2 px-3 rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
