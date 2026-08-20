"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, Package, AlertTriangle, Layers, Lock, Eye, RefreshCw, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { fetchProducts, Product } from "@/lib/services/admin";

export function SalesInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products for sales inventory from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category || "General")));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" ? true : product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const lowStockCount = products.filter(
    (p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)
  ).length;

  const inStockCount = products.filter(
    (p) => Number(p.stock_count || 0) > Number(p.reorder_level || 0)
  ).length;

  const avgUnitPrice =
    products.length > 0
      ? products.reduce((acc, curr) => acc + Number(curr.unit_price || 0), 0) / products.length
      : 0;

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
              Read-Only Access: Check live stock availability, minimum reorder thresholds, and retail pricing before confirming customer orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
              className="border-[#e8decf] text-[#713105] hover:bg-[#fff7e8] rounded-xl text-xs gap-1.5 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <div className="flex items-center gap-2 text-xs font-medium text-[#7f5e35] bg-[#fff7e8] border border-[#e8decf] px-3 py-1.5 rounded-xl">
              <Eye className="w-4 h-4 text-[#713105]" />
              <span>Sales Mode</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Catalog SKUs</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            {loading ? "..." : products.length}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Active furniture models</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>In-Stock Pieces</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {loading ? "..." : inStockCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Immediate fulfillment</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {loading ? "..." : lowStockCount}
          </div>
          <span className="text-[11px] text-amber-800 font-semibold">Limited showroom availability</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Average Unit Price</span>
            <DollarSign className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ${avgUnitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Average piece catalog value</span>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            Live Inventory Catalog ({filteredProducts.length})
          </CardTitle>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="w-48">
                <CustomSelect
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val)}
                  options={[
                    { value: "ALL", label: "All Collections" },
                    ...categories.map((cat) => ({ value: cat, label: cat })),
                  ]}
                  className="py-1.5 px-3 text-xs"
                />
              </div>
            )}

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search piece name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Piece Name</th>
                <th className="py-3 px-4">Collection</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {loading ? (
                <TableSkeleton columns={7} rows={6} />
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7f5e35]">
                    No furniture products found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{product.sku}</td>
                    <td className="py-3.5 px-4 font-medium text-[#341100]">{product.name}</td>
                    <td className="py-3.5 px-4 text-[#7f5e35]">{product.category}</td>
                    <td className="py-3.5 px-4 font-bold text-[#341100]">
                      {product.stock_count} units
                    </td>
                    <td className="py-3.5 px-4 text-[#7f5e35] font-mono">
                      {product.reorder_level} units
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#713105]">
                      ${Number(product.unit_price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {product.stock_count === 0 ? (
                        <Badge variant="destructive">
                          Out of Stock
                        </Badge>
                      ) : product.stock_count <= product.reorder_level ? (
                        <Badge variant="warning">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          In Stock
                        </Badge>
                      )}
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

export default SalesInventoryPage;
