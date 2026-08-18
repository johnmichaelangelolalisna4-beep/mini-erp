"use client";

import React from "react";
import { Package, AlertTriangle, XCircle, Layers, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { RevenueBarChart } from "@/components/revenue-bar-chart";

const warehouseAlertItems = [
  {
    sku: "LT-LAMP-088",
    name: "Minimalist Walnut Table Lamp",
    category: "Lighting",
    stock: 6,
    reorderLevel: 10,
    status: "Low Stock",
  },
  {
    sku: "HD-CUSH-014",
    name: "Linen Textured Cushion Covers",
    category: "Home Decor",
    stock: 3,
    reorderLevel: 15,
    status: "Low Stock",
  },
  {
    sku: "KW-TEAK-009",
    name: "Japanese Teak Pour-Over Stand",
    category: "Kitchenware",
    stock: 0,
    reorderLevel: 5,
    status: "Out of Stock",
  },
  {
    sku: "HD-MIRR-041",
    name: "Arch Framed Brass Mirror",
    category: "Home Decor",
    stock: 2,
    reorderLevel: 8,
    status: "Low Stock",
  },
];

export default function StockOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Inventory Manager Portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Stock Overview
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Macro warehouse metrics: Total Active SKUs, items requiring restock, out-of-stock items, and category distribution.
            </p>
          </div>

          <div className="relative w-44">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
            <Input
              type="text"
              defaultValue="August 2026"
              className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs font-normal text-[#7f5e35] focus:bg-white rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4 Macro Warehouse KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Active SKUs</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">482</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Catalog items</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Items Requiring Restock</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">14</div>
          <span className="text-[11px] text-[#713105] font-semibold">Below reorder level</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Out-of-Stock Items</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">3</div>
          <span className="text-[11px] text-red-700 font-semibold">Zero availability</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Active Categories</span>
            <Layers className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">12</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Product categories</span>
        </Card>
      </div>

      {/* Analytics & Restock Alert Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <RevenueBarChart />
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-6">
          <CategoryPieChart />

          {/* Quick Restock Alert Box */}
          <Card className="border-[#e8decf] bg-white rounded-xl p-5 shadow-xs">
            <CardHeader className="p-0 pb-3 border-b border-[#e8decf]">
              <CardTitle className="text-xs font-bold text-[#341100] uppercase tracking-wider flex items-center justify-between">
                <span>Critical Restock Priority</span>
                <span className="text-red-700 text-[10px]">4 High Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-3 space-y-2 text-xs">
              {warehouseAlertItems.map((item) => (
                <div key={item.sku} className="flex items-center justify-between py-1.5 border-b border-[#e8decf]/50 last:border-0">
                  <div>
                    <div className="font-semibold text-[#341100]">{item.name}</div>
                    <div className="text-[10px] text-[#7f5e35] font-mono">{item.sku}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-red-700">{item.stock} units left</span>
                    <div className="text-[10px] text-[#7f5e35]">Reorder at: {item.reorderLevel}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
