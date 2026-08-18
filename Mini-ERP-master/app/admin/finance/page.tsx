"use client";

import React from "react";
import { Download, Banknote, ArrowUpRight, ArrowDownLeft, PieChart, FileSpreadsheet, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockLedger = [
  {
    id: "TRX-9901",
    date: "Aug 08, 2026",
    category: "Sales Revenue",
    description: "Daily POS Batch Settlement",
    type: "Income",
    amount: "+$8,420.00",
    balance: "$124,592.00",
  },
  {
    id: "TRX-9900",
    date: "Aug 07, 2026",
    category: "Inventory Restock",
    description: "Teak & Wood Supplier Invoice #884",
    type: "Expense",
    amount: "-$4,150.00",
    balance: "$116,172.00",
  },
  {
    id: "TRX-9899",
    date: "Aug 06, 2026",
    category: "Logistics & Freight",
    description: "Express Courier Freight Fee",
    type: "Expense",
    amount: "-$680.00",
    balance: "$120,322.00",
  },
  {
    id: "TRX-9898",
    date: "Aug 05, 2026",
    category: "Sales Revenue",
    description: "Corporate Order Invoice Settlement",
    type: "Income",
    amount: "+$12,300.00",
    balance: "$121,002.00",
  },
  {
    id: "TRX-9897",
    date: "Aug 04, 2026",
    category: "Operational Payroll",
    description: "Staff Bi-weekly Salary Distribution",
    type: "Expense",
    amount: "-$9,400.00",
    balance: "$108,702.00",
  },
];

export function FinancePage() {
  return (
    <div className="space-y-6">
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
              High-level financial ledgers, revenue vs. expense breakdown, and exportable summary reports.
            </p>
          </div>

          <Button className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2">
            <Download className="w-4 h-4" />
            Export Summary Report
          </Button>
        </CardContent>
      </Card>

      {/* Summary Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Gross Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">$148,200.00</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">YTD Total Income</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Expenses</span>
            <ArrowDownLeft className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">$23,608.00</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">YTD Operating Outflow</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Net Profit</span>
            <Banknote className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">$124,592.00</div>
          <span className="text-[11px] text-[#713105] font-semibold">Net Earnings</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Estimated Tax</span>
            <PieChart className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">$18,688.00</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">15% Provision</span>
        </Card>
      </div>

      {/* Financial Ledger Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#713105]" />
            General Ledger & Financial Audit Entries
          </CardTitle>

          <Button variant="outline" className="border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] gap-1.5 text-xs rounded-xl">
            <Filter className="w-3.5 h-3.5" />
            Filter Range
          </Button>
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
              {mockLedger.map((item) => (
                <tr key={item.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
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
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default FinancePage;
