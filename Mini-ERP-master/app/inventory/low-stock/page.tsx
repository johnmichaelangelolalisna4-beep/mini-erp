"use client";

import React, { useState } from "react";
import { Search, Filter, AlertTriangle, PlusCircle, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const lowStockItems = [
  {
    id: "PRD-102",
    name: "Minimalist Walnut Table Lamp",
    category: "Lighting",
    sku: "LT-LAMP-088",
    stock: 6,
    reorderLevel: 10,
    retailPrice: "$125.00",
    supplier: "Lumina Crafts Co.",
    status: "Low Stock",
  },
  {
    id: "PRD-104",
    name: "Linen Textured Cushion Covers",
    category: "Home Decor",
    sku: "HD-CUSH-014",
    stock: 3,
    reorderLevel: 15,
    retailPrice: "$28.00",
    supplier: "Textile Craft Ltd.",
    status: "Low Stock",
  },
  {
    id: "PRD-105",
    name: "Japanese Teak Pour-Over Stand",
    category: "Kitchenware",
    sku: "KW-TEAK-009",
    stock: 0,
    reorderLevel: 5,
    retailPrice: "$89.00",
    supplier: "Nippon Woodworks",
    status: "Out of Stock",
  },
  {
    id: "PRD-107",
    name: "Arch Framed Brass Mirror",
    category: "Home Decor",
    sku: "HD-MIRR-041",
    stock: 2,
    reorderLevel: 8,
    retailPrice: "$140.00",
    supplier: "Artisan Metalworks",
    status: "Low Stock",
  },
];

export function LowStockRestockPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = lowStockItems.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Inventory Manager Portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Low Stock & Restock
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Filtered action view highlighting items that have dropped below their defined reorder level.
            </p>
          </div>

          <Button className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 shadow-xs">
            <PlusCircle className="w-4 h-4" />
            Create Supplier Purchase Order
          </Button>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">14</div>
          <span className="text-[11px] text-[#713105] font-semibold">Below reorder threshold</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Out-of-Stock SKUs</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">3</div>
          <span className="text-[11px] text-red-700 font-semibold">Critical 0 balance</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Pending Restock POs</span>
            <ArrowUpRight className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">5</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Supplier orders in transit</span>
        </Card>
      </div>

      {/* Low Stock Data Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            Restock Priority Action List
          </CardTitle>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>
            <Button variant="outline" className="border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] gap-1.5 text-xs rounded-xl">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Product Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Preferred Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{item.sku}</td>
                  <td className="py-3.5 px-4 font-medium text-[#341100]">
                    {item.name}
                    <div className="text-[10px] text-[#7f5e35] font-normal">{item.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#7f5e35]">{item.category}</td>
                  <td className="py-3.5 px-4 font-bold text-red-700">{item.stock} units</td>
                  <td className="py-3.5 px-4 font-medium text-[#4f351c]">{item.reorderLevel} units</td>
                  <td className="py-3.5 px-4 text-[#7f5e35]">{item.supplier}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {item.status === "Low Stock" && (
                      <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                        Low Stock
                      </Badge>
                    )}
                    {item.status === "Out of Stock" && (
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                        Out of Stock
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button size="sm" className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] text-[11px] rounded-lg px-3 py-1">
                      Restock SKU
                    </Button>
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

export default LowStockRestockPage;
