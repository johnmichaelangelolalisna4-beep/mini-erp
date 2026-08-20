"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchFinancialOverview, FinancialOverview } from "@/lib/services/admin";
import { exportFinanceSummaryReport } from "@/lib/services/excel-export";

export function FinancePage() {
  const [financialData, setFinancialData] = useState<FinancialOverview>({
    grossRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    estimatedTax: 0,
    ledger: [],
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "Income" | "Expense">("ALL");
  const [exportNotice, setExportNotice] = useState<{
    type: "success" | "error";
    text: string;
    fileName?: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchFinancialOverview();
      setFinancialData(data);
    } catch (err) {
      console.error("Error loading financial overview from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportReport = async () => {
    setExporting(true);
    setExportNotice(null);
    try {
      const result = await exportFinanceSummaryReport({
        fileNamePrefix: "Mini_ERP_Sales_Financial_Summary",
      });
      setExportNotice({
        type: "success",
        text: "Sales & Financial Summary Excel report downloaded successfully!",
        fileName: result.fileName,
      });
      setTimeout(() => {
        setExportNotice(null);
      }, 6000);
    } catch (err) {
      console.error("Error exporting Excel summary report:", err);
      setExportNotice({
        type: "error",
        text: "Failed to generate Excel report. Please check database connection and try again.",
      });
      setTimeout(() => {
        setExportNotice(null);
      }, 6000);
    } finally {
      setExporting(false);
    }
  };

  const filteredLedger = financialData.ledger.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "ALL" ? true : item.type === filterType;

    return matchesSearch && matchesFilter;
  });

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
              Finance & Reports
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Live financial ledgers, revenue vs. expense breakdown, and automated audit trails calculated from Supabase.
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
              onClick={handleExportReport}
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
                  Export Summary Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Gross Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ${financialData.grossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Completed sales volume</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Expenses</span>
            <ArrowDownLeft className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">
            ${financialData.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Restock & fulfillment cost</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Net Profit</span>
            <Banknote className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ${financialData.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#713105] font-semibold">Net operating margin</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Estimated Tax</span>
            <PieChart className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ${financialData.estimatedTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">15% Default provision</span>
        </Card>
      </div>

      {/* Financial Ledger Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#713105]" />
              General Ledger & Financial Entries ({filteredLedger.length})
            </CardTitle>
            <p className="text-[11px] text-[#7f5e35] mt-0.5">
              Detailed chronological record of sales income, inventory expenses, and account balances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter Toggle Buttons */}
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
                onClick={() => setFilterType("Income")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "Income"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFilterType("Expense")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "Expense"
                    ? "bg-red-700 text-white shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                Expenses
              </button>
            </div>

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search transaction ID, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleExportReport}
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
                <th className="py-3 px-4">TRX ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7f5e35]">
                    Calculating live ledger entries from Supabase...
                  </td>
                </tr>
              ) : filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7f5e35]">
                    No financial ledger transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} className="hover:bg-[#fcf3e3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{item.id}</td>
                    <td className="py-3.5 px-4 text-[#7f5e35]">{item.date}</td>
                    <td className="py-3.5 px-4 font-medium text-[#4f351c]">{item.category}</td>
                    <td className="py-3.5 px-4 text-[#7f5e35]">{item.description}</td>
                    <td className="py-3.5 px-4">
                      {item.type === "Income" ? (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] uppercase tracking-wide">
                          Income
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-700 border-red-200 text-[11px] uppercase tracking-wide">
                          Expense
                        </Badge>
                      )}
                    </td>
                    <td className={`py-3.5 px-4 font-bold ${item.type === "Income" ? "text-emerald-700" : "text-red-700"}`}>
                      {item.amount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#341100]">
                      {item.balance}
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

export default FinancePage;
