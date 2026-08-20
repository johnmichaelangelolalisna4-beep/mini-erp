"use client";

import React, { useEffect, useState } from "react";
import { Package, AlertTriangle, XCircle, Layers, Calendar, RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { RevenueBarChart } from "@/components/revenue-bar-chart";
import { fetchProducts, fetchOrders, Product, Order } from "@/lib/services/admin";
import Link from "next/link";

export default function StockOverviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      console.error("Error loading inventory overview data from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const now = new Date();
  const currentMonthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Dynamic KPI computations
  const totalActiveSkus = products.length;
  const itemsRequiringRestock = products.filter(
    (p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0) && Number(p.stock_count || 0) > 0
  ).length;
  const outOfStockItems = products.filter((p) => Number(p.stock_count || 0) === 0).length;
  const activeCategories = Array.from(new Set(products.map((p) => p.category || "General"))).length;

  // Critical restock priority items (stock <= reorder level, sorted by stock ascending)
  const criticalItems = products
    .filter((p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0))
    .sort((a, b) => Number(a.stock_count || 0) - Number(b.stock_count || 0))
    .slice(0, 5);

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
              Live warehouse metrics: Total Active SKUs, items requiring restock, out-of-stock items, and collection category distribution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#fff7e8] border border-[#e8decf] px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#713105]">
              <Calendar className="w-3.5 h-3.5 text-[#cfab71]" />
              <span>{currentMonthName}</span>
            </div>

            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
              className="border-[#e8decf] text-[#713105] hover:bg-[#fff7e8] rounded-xl text-xs gap-1.5 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4 Macro Warehouse KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Active SKUs</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            {loading ? "..." : totalActiveSkus}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Catalog items</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Items Requiring Restock</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">
            {loading ? "..." : itemsRequiringRestock}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-semibold">Below reorder level</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Out-of-Stock Items</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">
            {loading ? "..." : outOfStockItems}
          </div>
          <span className="text-[11px] text-red-700 font-semibold">Zero availability</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Active Categories</span>
            <Layers className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            {loading ? "..." : activeCategories}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Product collections</span>
        </Card>
      </div>

      {/* Analytics & Restock Alert Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <RevenueBarChart orders={orders} />
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-6">
          <CategoryPieChart products={products} />

          {/* Quick Restock Alert Box */}
          <Card className="border-[#e8decf] bg-white rounded-xl p-5 shadow-xs">
            <CardHeader className="p-0 pb-3 border-b border-[#e8decf]">
              <CardTitle className="text-xs font-bold text-[#341100] uppercase tracking-wider flex items-center justify-between">
                <span>Critical Restock Priority</span>
                <span className={`${criticalItems.length > 0 ? "text-red-700" : "text-emerald-700"} text-[10px]`}>
                  {criticalItems.length} High Alerts
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-3 space-y-2 text-xs">
              {loading ? (
                <div className="py-4 text-center text-[#7f5e35] text-xs">
                  Checking safety stock thresholds...
                </div>
              ) : criticalItems.length === 0 ? (
                <div className="py-4 text-center text-emerald-800 text-xs font-medium">
                  ✓ All furniture models currently meet safety stock thresholds.
                </div>
              ) : (
                criticalItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-[#e8decf]/50 last:border-0"
                  >
                    <div>
                      <div className="font-semibold text-[#341100]">{item.name}</div>
                      <div className="text-[10px] text-[#7f5e35] font-mono">
                        {item.sku} • {item.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${item.stock_count === 0 ? "text-red-700" : "text-amber-700"}`}>
                        {item.stock_count} units left
                      </span>
                      <div className="text-[10px] text-[#7f5e35]">
                        Reorder at: {item.reorder_level}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {criticalItems.length > 0 && (
                <div className="pt-2 border-t border-[#e8decf]/60 text-right">
                  <Link
                    href="/inventory/low-stock"
                    className="text-xs text-[#713105] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Manage Low Stock Reorders <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
