"use client";

import React, { useState } from "react";
import { FileText, ShieldAlert, Activity, Filter, Search, Download, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockLogs = [
  {
    id: "LOG-88401",
    timestamp: "2026-08-08 21:04:12",
    actor: "Sales Rep John Miller",
    action: "CREATE_ORDER",
    description: "Sales Rep John created Order #1042 ($284.00)",
    module: "Sales & Orders",
    ip: "192.168.1.45",
    level: "INFO",
  },
  {
    id: "LOG-88400",
    timestamp: "2026-08-08 20:48:30",
    actor: "Admin Jane Smith",
    action: "UPDATE_ROLE",
    description: "Admin Jane updated user role for David Chen to 'Inventory'",
    module: "User Management",
    ip: "192.168.1.10",
    level: "SECURITY",
  },
  {
    id: "LOG-88399",
    timestamp: "2026-08-08 19:15:00",
    actor: "Inventory Mgr Robert Fox",
    action: "STOCK_UPDATE",
    description: "Restocked 120 units of 'Stainless Steel Espresso Tamper'",
    module: "Inventory",
    ip: "192.168.1.88",
    level: "INFO",
  },
  {
    id: "LOG-88398",
    timestamp: "2026-08-08 18:30:22",
    actor: "SYSTEM_ALERT",
    action: "LOW_STOCK_TRIGGER",
    description: "Stock level for 'Minimalist Walnut Table Lamp' dropped below threshold (6 left)",
    module: "Inventory",
    ip: "127.0.0.1",
    level: "WARNING",
  },
  {
    id: "LOG-88397",
    timestamp: "2026-08-08 17:02:11",
    actor: "Admin Jane Smith",
    action: "FINANCE_EXPORT",
    description: "Exported Q3 Monthly Profit & Loss Ledger Summary (PDF)",
    module: "Finance & Reports",
    ip: "192.168.1.10",
    level: "INFO",
  },
];

export function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = mockLogs.filter(
    (log) =>
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Audit & System Logs
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Logs every major system action across all modules (e.g. &quot;Sales Rep John created Order #1042&quot;, &quot;Admin updated user role for Jane&quot;).
            </p>
          </div>

          <Button className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2">
            <Download className="w-4 h-4" />
            Export Audit Logs
          </Button>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Logged Events</span>
            <Activity className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">1,420</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">All time records</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Admin Audits</span>
            <ShieldAlert className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">84</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Role & setting changes</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Sales Actions</span>
            <FileText className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">620</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Orders & invoices</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Security Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">12</div>
          <span className="text-[11px] text-[#713105] font-semibold">Flagged events</span>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            System Activity Feed & Trail
          </CardTitle>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search actor, action or log detail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>
            <Button variant="outline" className="border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] gap-1.5 text-xs rounded-xl">
              <Filter className="w-3.5 h-3.5" />
              Filter Level
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User / Actor</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#7f5e35]">{log.timestamp}</td>
                  <td className="py-3.5 px-4 font-medium text-[#341100]">{log.actor}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#713105] font-bold">{log.action}</td>
                  <td className="py-3.5 px-4 text-[#4f351c]">{log.description}</td>
                  <td className="py-3.5 px-4 text-[#7f5e35]">{log.module}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#7f5e35]">{log.ip}</td>
                  <td className="py-3.5 px-4">
                    {log.level === "INFO" && (
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] uppercase tracking-wide">
                        INFO
                      </Badge>
                    )}
                    {log.level === "WARNING" && (
                      <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[11px] uppercase tracking-wide">
                        WARNING
                      </Badge>
                    )}
                    {log.level === "SECURITY" && (
                      <Badge className="bg-[#713105] text-[#fff7e8] text-[11px] uppercase tracking-wide">
                        SECURITY
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuditLogsPage;
