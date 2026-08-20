"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  Activity,
  PackageCheck,
  Truck,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ToastNotification, ToastData } from "@/components/ui/toast-notification";
import { fetchStockLogs, StockLog } from "@/lib/services/admin";
import { exportAuditLogsReport } from "@/lib/services/excel-export";

export function StockLogsPage() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "ADDITION" | "DEDUCTION">("ALL");
  const [toast, setToast] = useState<ToastData | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchStockLogs();
      setLogs(data);
    } catch (err) {
      console.error("Error loading stock logs from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportAuditLogsReport({
        fileNamePrefix: "Mini_ERP_Stock_Movement_Report",
      });
      setToast({
        type: "success",
        title: "Logs Exported",
        message: `Excel spreadsheet "${result.fileName}" downloaded successfully.`,
      });
    } catch (err) {
      console.error("Error exporting stock movement logs:", err);
      setToast({
        type: "error",
        title: "Export Failed",
        message: "Failed to export stock movement logs. Please try again.",
      });
    } finally {
      setExporting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.products?.sku && log.products.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.products?.name && log.products.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.change_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "ALL" ? true : log.change_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const totalAddedUnits = logs
    .filter((l) => l.change_type === "ADDITION")
    .reduce((acc, curr) => acc + Math.abs(Number(curr.quantity || 0)), 0);

  const totalDeductedUnits = logs
    .filter((l) => l.change_type === "DEDUCTION")
    .reduce((acc, curr) => acc + Math.abs(Number(curr.quantity || 0)), 0);

  const netMovement = totalAddedUnits - totalDeductedUnits;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Inventory Movement Audit
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Stock Movement History
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Live operational log showing every stock deduction from client sales orders and addition from supplier restocks in Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading || exporting}
              className="border-[#e8decf] text-[#713105] hover:bg-[#fff7e8] rounded-xl text-xs gap-1.5 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 cursor-pointer active:scale-95 transition-all shadow-xs disabled:opacity-70"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#cfab71]" />
                  Generating Excel...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#cfab71]" />
                  Export Stock Movement Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Supplier Additions</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            +{totalAddedUnits}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Restocked units</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Customer Deductions</span>
            <ShoppingBag className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">
            -{totalDeductedUnits}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Sales order fulfillment</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Net Movement</span>
            <PackageCheck className="w-4 h-4 text-[#713105]" />
          </div>
          <div className={`text-2xl font-bold mt-2 ${netMovement >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {netMovement >= 0 ? `+${netMovement}` : netMovement}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Total unit variance</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Movement Logs</span>
            <Activity className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{logs.length}</div>
          <span className="text-[11px] text-[#7f5e35] font-semibold">Active ledger trails</span>
        </Card>
      </div>

      {/* Stock Logs Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#713105]" />
              Stock Movements Ledger ({filteredLogs.length})
            </CardTitle>
            <p className="text-[11px] text-[#7f5e35] mt-0.5">
              Live records of all supplier shipments, order deductions, and warehouse adjustments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter Toggle */}
            <div className="flex items-center bg-[#fff7e8] border border-[#e8decf] rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "ALL"
                    ? "bg-[#713105] text-[#fff7e8] shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType("ADDITION")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "ADDITION"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                Additions
              </button>
              <button
                type="button"
                onClick={() => setFilterType("DEDUCTION")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "DEDUCTION"
                    ? "bg-[#713105] text-white shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                Deductions
              </button>
            </div>

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search SKU, product name, memo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
              className="border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] gap-1.5 text-xs rounded-xl cursor-pointer disabled:opacity-60"
              title="Download Excel spreadsheet"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#713105]" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-[#713105]" />
                  Excel
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Quantity Changed</th>
                <th className="py-3 px-4">Reference / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {loading ? (
                <TableSkeleton columns={5} rows={6} />
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#7f5e35]">
                    No stock movement logs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#7f5e35] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.change_type === "ADDITION" ? (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] uppercase font-bold tracking-wider">
                          <ArrowUpRight className="w-3 h-3 mr-1 text-emerald-600 inline" />
                          Addition
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-900 border-amber-200 text-[10px] uppercase font-bold tracking-wider">
                          <ArrowDownRight className="w-3 h-3 mr-1 text-amber-700 inline" />
                          Deduction
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#341100]">
                      <div className="font-semibold">{log.products?.name || "Inventory Stock Piece"}</div>
                      <div className="text-[10px] text-[#7f5e35] font-mono">{log.products?.sku || "SKU: N/A"}</div>
                    </td>
                    <td className={`py-3.5 px-4 font-bold text-sm ${log.change_type === "ADDITION" ? "text-emerald-700" : "text-amber-900"}`}>
                      {Number(log.quantity) > 0 ? `+${log.quantity}` : log.quantity} units
                    </td>
                    <td className="py-3.5 px-4 text-[#4f351c] max-w-sm">
                      {log.reason || "Operational movement"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default StockLogsPage;
