"use client";

import React, { useState } from "react";
import { Search, Filter, Package, AlertTriangle, Layers, Lock, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockProducts = [
  {
    id: "PRD-101",
    name: "Handcrafted Ceramic Vase",
    category: "Home Decor",
    sku: "HD-VASE-001",
    stock: 45,
    minStock: 10,
    retailPrice: "$48.00",
    wholesalePrice: "$32.00",
    status: "In Stock",
  },
  {
    id: "PRD-102",
    name: "Minimalist Walnut Table Lamp",
    category: "Lighting",
    sku: "LT-LAMP-088",
    stock: 6,
    minStock: 10,
    retailPrice: "$125.00",
    wholesalePrice: "$85.00",
    status: "Low Stock",
  },
  {
    id: "PRD-103",
    name: "Stainless Steel Espresso Tamper",
    category: "Kitchenware",
    sku: "KW-ESPR-002",
    stock: 120,
    minStock: 25,
    retailPrice: "$34.50",
    wholesalePrice: "$22.00",
    status: "In Stock",
  },
  {
    id: "PRD-104",
    name: "Linen Textured Cushion Covers",
    category: "Home Decor",
    sku: "HD-CUSH-014",
    stock: 3,
    minStock: 15,
    retailPrice: "$28.00",
    wholesalePrice: "$18.00",
    status: "Low Stock",
  },
  {
    id: "PRD-105",
    name: "Japanese Teak Pour-Over Stand",
    category: "Kitchenware",
    sku: "KW-TEAK-009",
    stock: 0,
    minStock: 5,
    retailPrice: "$89.00",
    wholesalePrice: "$58.00",
    status: "Out of Stock",
  },
  {
    id: "PRD-106",
    name: "Organic Cotton Throw Blanket",
    category: "Home Decor",
    sku: "HD-BLNK-032",
    stock: 84,
    minStock: 20,
    retailPrice: "$64.00",
    wholesalePrice: "$42.00",
    status: "In Stock",
  },
];

export function SalesInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = mockProducts.filter(
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
              <Badge className="bg-[#fff7e8] text-[#713105] border-[#e8decf] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 gap-1">
                <Lock className="w-3 h-3 text-[#713105]" />
                Read-Only Stock Lookup Panel
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              View Product Stock
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Read-Only Access: Check stock availability, minimum reorder thresholds, and wholesale/retail pricing before confirming orders with customers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#7f5e35] bg-[#fff7e8] border border-[#e8decf] px-3.5 py-2 rounded-xl">
            <Eye className="w-4 h-4 text-[#713105]" />
            <span>Editing Actions Hidden (Sales Mode)</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Active SKUs</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">482</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Ready for orders</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Product Categories</span>
            <Layers className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">12</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Catalog groups</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">14</div>
          <span className="text-[11px] text-red-700 font-semibold">Limited availability</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Avg Retail Margin</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">35.4%</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Retail over wholesale</span>
        </Card>
      </div>

      {/* Stock Lookup Data Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            Stock Availability & Pricing Lookup Table
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
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Stock Available</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Wholesale Price</th>
                <th className="py-3 px-4 text-right">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[#341100]">
                    {product.name}
                    <div className="text-[10px] text-[#7f5e35] font-normal">{product.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#7f5e35] font-normal">{product.category}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#4f351c]">{product.sku}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#341100]">
                    {product.stock} units
                    <div className="text-[10px] text-[#7f5e35] font-normal">Min threshold: {product.minStock}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#713105]">{product.retailPrice}</td>
                  <td className="py-3.5 px-4 font-medium text-[#7f5e35]">{product.wholesalePrice}</td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {product.status === "In Stock" && (
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                        In Stock
                      </Badge>
                    )}
                    {product.status === "Low Stock" && (
                      <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                        Low Stock
                      </Badge>
                    )}
                    {product.status === "Out of Stock" && (
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                        Out of Stock
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

export default SalesInventoryPage;
