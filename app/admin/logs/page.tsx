"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  ShieldAlert,
  Activity,
  Filter,
  Search,
  Download,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Package,
  ShoppingCart,
  UserCheck,
  FileDown,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchUnifiedAuditLogs, UnifiedAuditLog } from "@/lib/services/admin";
import { exportAuditLogsReport } from "@/lib/services/excel-export";

export function AuditLogsPage() {
  const [logs, setLogs] = useState<UnifiedAuditLog[]>([]);
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    stockAdditions: 0,
    stockDeductions: 0,
    securityAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModuleFilter, setActiveModuleFilter] = useState<string>("ALL");
  const [exportNotice, setExportNotice] = useState<{
    type: "success" | "error";
    text: string;
    fileName?: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUnifiedAuditLogs();
      setLogs(data.logs);
      setMetrics(data.metrics);
    } catch (err) {
      console.error("Error loading unified audit logs from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportLogs = async () => {
    setExporting(true);
    setExportNotice(null);
    try {
      const result = await exportAuditLogsReport({
        fileNamePrefix: "Mini_ERP_Audit_and_System_Logs",
      });
      setExportNotice({
        type: "success",
        text: "Audit & Operational Logs Excel report downloaded successfully!",
        fileName: result.fileName,
      });
      setTimeout(() => {
        setExportNotice(null);
      }, 6000);
    } catch (err) {
      console.error("Error exporting audit logs:", err);
      setExportNotice({
        type: "error",
        text: "Failed to generate Audit Logs report. Please try again.",
      });
      setTimeout(() => {
        setExportNotice(null);
      }, 6000);
    } finally {
      setExporting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule =
      activeModuleFilter === "ALL"
        ? true
        : activeModuleFilter === "Alerts"
        ? log.level === "WARNING"
        : log.module === activeModuleFilter;

    return matchesSearch && matchesModule;
  });

  const getModuleBadge = (module: string) => {
    switch (module) {
      case "Inventory":
        return <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">Inventory</Badge>;
      case "Sales & Orders":
        return <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">Sales & Orders</Badge>;
      case "User & Auth":
        return <Badge className="bg-blue-50 text-blue-800 border-blue-200 text-[10px]">Security / Auth</Badge>;
      case "Catalog":
        return <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-[10px]">Catalog</Badge>;
      default:
        return <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px]">{module}</Badge>;
    }
  };

  const getLevelBadge = (level: string, action: string) => {
    if (level === "WARNING" || action.includes("TRIGGER")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
          <AlertTriangle className="w-3 h-3" />
          ALERT
        </span>
      );
    }
    if (level === "SUCCESS" || action.includes("COMPLETED") || action.includes("ADDITION")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
          <CheckCircle2 className="w-3 h-3" />
          SUCCESS
        </span>
      );
    }
    if (level === "SECURITY") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
          <UserCheck className="w-3 h-3" />
          AUTH
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7f5e35] bg-[#fff7e8] px-2 py-0.5 rounded-md border border-[#e8decf]">
        <Activity className="w-3 h-3" />
        INFO
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Export Notification Toast */}
      {exportNotice && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-xs font-medium border transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2 ${
            exportNotice.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 shadow-xs"
              : "bg-red-50 text-red-900 border-red-200 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {exportNotice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <div>
              <p className="font-semibold">{exportNotice.text}</p>
              {exportNotice.fileName && (
                <p className="text-[11px] text-emerald-700 mt-0.5 font-mono">
                  File: {exportNotice.fileName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Administrator Portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Audit & Operational Logs
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Live enterprise audit log tracking stock movements, customer sales fulfillments, user permissions, and system triggers in Supabase.
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
              onClick={handleExportLogs}
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
                  Export Audit Logs
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
            <span>Total Logged Events</span>
            <Activity className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            {loading ? "..." : metrics.totalEvents}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Active operational audit trail</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Stock Additions</span>
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            {loading ? "..." : metrics.stockAdditions}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Supplier shipments & restocks</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Stock Deductions</span>
            <FileText className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            {loading ? "..." : metrics.stockDeductions}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Sales order fulfillments</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>System Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {loading ? "..." : metrics.securityAlerts}
          </div>
          <span className="text-[11px] text-amber-800 font-semibold">Low-stock & safety triggers</span>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#713105]" />
              System Activity Feed & Audit Trail ({filteredLogs.length})
            </CardTitle>
            <p className="text-[11px] text-[#7f5e35] mt-0.5">
              Chronological log of inventory movements, client order fulfillment, security events, and catalog changes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter Module Toggle Buttons */}
            <div className="flex items-center bg-[#fff7e8] border border-[#e8decf] rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveModuleFilter("ALL")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeModuleFilter === "ALL"
                    ? "bg-[#713105] text-[#fff7e8] shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                All ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveModuleFilter("Inventory")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeModuleFilter === "Inventory"
                    ? "bg-[#713105] text-[#fff7e8] shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                Inventory
              </button>
              <button
                type="button"
                onClick={() => setActiveModuleFilter("Sales & Orders")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeModuleFilter === "Sales & Orders"
                    ? "bg-[#713105] text-[#fff7e8] shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                Sales
              </button>
              <button
                type="button"
                onClick={() => setActiveModuleFilter("User & Auth")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeModuleFilter === "User & Auth"
                    ? "bg-[#713105] text-[#fff7e8] shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => setActiveModuleFilter("Alerts")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeModuleFilter === "Alerts"
                    ? "bg-amber-700 text-white shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                Alerts
              </button>
            </div>

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search action, entity, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleExportLogs}
              disabled={exporting}
              className="border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] gap-1.5 text-xs rounded-xl cursor-pointer"
              title="Download Excel spreadsheet"
            >
              <FileDown className="w-3.5 h-3.5 text-[#713105]" />
              Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target / Entity</th>
                <th className="py-3 px-4">Actor / Origin</th>
                <th className="py-3 px-4">Impact / Value</th>
                <th className="py-3 px-4">Details & Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7f5e35]">
                    Aggregating real-time operational audit logs from Supabase...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7f5e35]">
                    No system activity logs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#7f5e35] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#cfab71]" />
                        {new Date(log.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getModuleBadge(log.module)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">
                      <div className="flex items-center gap-1.5">
                        {getLevelBadge(log.level, log.action)}
                        <span className="text-[11px]">{log.action}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#341100]">
                      <div className="font-semibold">{log.entity_name}</div>
                      <div className="text-[10px] text-[#7f5e35] font-mono">{log.entity_type}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#7f5e35] font-medium">{log.actor}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#341100]">
                      {log.quantity_or_value || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-[#4f351c] max-w-xs">{log.description}</td>
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

export default AuditLogsPage;
