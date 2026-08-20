"use client";

import React, { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Search, Filter, Download, Activity, PackageCheck, Truck, ShoppingBag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockStockLogs = [
  {
    id: "MV-9041",
    timestamp: "2026-08-08 21:04:12",
    sku: "HD-VASE-001",
    product: "Handcrafted Ceramic Vase",
    type: "Order Deduction",
    quantity: "-4 units",
    reference: "Order #ORD-1042",
    actor: "Sales Rep John Miller",
    balanceAfter: "45 units",
  },
  {
    id: "MV-9040",
    timestamp: "2026-08-08 19:15:00",
    sku: "KW-ESPR-002",
    product: "Stainless Steel Espresso Tamper",
    type: "Supplier Addition",
    quantity: "+120 units",
    reference: "Shipment #SUP-884",
    actor: "Inventory Mgr Robert Fox",
    balanceAfter: "120 units",
  },
  {
    id: "MV-9039",
    timestamp: "2026-08-08 17:40:22",
    sku: "LT-LAMP-088",
    product: "Minimalist Walnut Table Lamp",
    type: "Order Deduction",
    quantity: "-2 units",
    reference: "Order #ORD-1041",
    actor: "Sales Rep Sarah Jenkins",
    balanceAfter: "6 units",
  },
  {
    id: "MV-9038",
    timestamp: "2026-08-07 14:10:00",
    sku: "HD-BLNK-032",
    product: "Organic Cotton Throw Blanket",
    type: "Supplier Addition",
    quantity: "+50 units",
    reference: "Shipment #SUP-879",
    actor: "Inventory Mgr Robert Fox",
    balanceAfter: "84 units",
  },
  {
    id: "MV-9037",
    timestamp: "2026-08-07 11:22:15",
    sku: "KW-TEAK-009",
    product: "Japanese Teak Pour-Over Stand",
    type: "Order Deduction",
    quantity: "-5 units",
    reference: "Order #ORD-1039",
    actor: "Sales Rep Emily Watson",
    balanceAfter: "0 units",
  },
];

export function StockLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = mockStockLogs.filter(
    (log) =>
      log.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
              Operational log showing every stock deduction (from customer orders) and addition (from supplier shipments).
            </p>
          </div>

          <Button className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2">
            <Download className="w-4 h-4" />
            Export Stock Movement Report
          </Button>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Supplier Additions</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">+1,240</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Restocked units</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Customer Deductions</span>
            <ShoppingBag className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">-842</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Fulfilled order units</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Net Stock Movement</span>
            <Activity className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">+398</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Positive balance shift</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Log Audit Trail</span>
            <PackageCheck className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">180</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Recorded shifts</span>
        </Card>
      </div>

      {/* Stock Logs Data Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            Stock Addition & Deduction Audit Trail
          </CardTitle>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search SKU, product or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>
            <Button variant="outline" className="border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] gap-1.5 text-xs rounded-xl">
              <Filter className="w-3.5 h-3.5" />
              Filter Type
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Movement ID</th>
                <th className="py-3 px-4">SKU / Product</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Quantity Shift</th>
                <th className="py-3 px-4">Source Reference</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#7f5e35]">{log.timestamp}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{log.id}</td>
                  <td className="py-3.5 px-4 font-medium text-[#341100]">
                    {log.product}
                    <div className="text-[10px] text-[#7f5e35] font-mono">{log.sku}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {log.type === "Supplier Addition" ? (
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] uppercase tracking-wide gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                        Supplier Addition
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[11px] uppercase tracking-wide gap-1">
                        <ArrowDownRight className="w-3 h-3 text-[#713105]" />
                        Order Deduction
                      </Badge>
                    )}
                  </td>
                  <td className={`py-3.5 px-4 font-bold ${log.type === "Supplier Addition" ? "text-emerald-700" : "text-[#713105]"}`}>
                    {log.quantity}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#4f351c]">{log.reference}</td>
                  <td className="py-3.5 px-4 text-[#7f5e35]">{log.actor}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#341100]">
                    {log.balanceAfter}
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

export default StockLogsPage;
