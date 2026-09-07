"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  RefreshCw,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Target,
  TrendingUp,
} from "lucide-react";
import { KpiCardsSection } from "@/components/kpi-card";
import { RevenueBarChart } from "@/components/revenue-bar-chart";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastNotification, ToastData } from "@/components/ui/toast-notification";
import { fetchDashboardKPIs, Product, Order } from "@/lib/services/admin";
import { createClient } from "@/lib/supabase/client";

const PRESET_QUOTAS = [
  { label: "₱50k Standard", value: 50000 },
  { label: "₱100k Growth", value: 100000 },
  { label: "₱250k Executive", value: 250000 },
  { label: "₱500k Enterprise", value: 500000 },
];

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    lowStockCount: 0,
    activeStaffCount: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(20000);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [tempTarget, setTempTarget] = useState<number | string>(20000);
  const [toast, setToast] = useState<ToastData | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardKPIs();
      setStats({
        totalSales: data.totalSales,
        totalProducts: data.totalProducts,
        lowStockCount: data.lowStockCount,
        activeStaffCount: data.activeStaffCount,
      });
      setProducts(data.products || []);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error loading dashboard KPIs from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Load shared target quota from storage
    const saved = localStorage.getItem("sales_monthly_target");
    if (saved && !isNaN(Number(saved)) && Number(saved) > 0) {
      setMonthlyTarget(Number(saved));
      setTempTarget(Number(saved));
    }

    // Supabase Realtime WebSocket subscription for live dashboard updates
    const supabase = createClient();
    const channelName = `admin-dashboard-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Dynamic Quota Calculations
  const currentSales = stats.totalSales || 0;
  const progressPercent = monthlyTarget > 0 ? (currentSales / monthlyTarget) * 100 : 0;
  const clampedPercent = Math.min(100, Math.max(0, progressPercent));
  const remainingQuota = Math.max(0, monthlyTarget - currentSales);

  const handleOpenQuotaModal = () => {
    setTempTarget(monthlyTarget);
    setIsQuotaModalOpen(true);
  };

  const handleSaveQuota = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = typeof tempTarget === "string" ? parseFloat(tempTarget) : tempTarget;
    if (isNaN(parsed) || parsed <= 0) {
      setToast({
        type: "error",
        title: "Invalid Quota Amount",
        message: "Please enter a valid positive target amount (e.g. 100,000).",
      });
      return;
    }

    setMonthlyTarget(parsed);
    localStorage.setItem("sales_monthly_target", parsed.toString());
    setIsQuotaModalOpen(false);
    setToast({
      type: "success",
      title: "Enterprise Quota Updated",
      message: `Enterprise sales quota set to ₱${parsed.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
    });
  };

  const parsedTempTarget = typeof tempTarget === "string" ? parseFloat(tempTarget) || 0 : tempTarget;
  const projectedPercent = parsedTempTarget > 0 ? Math.min(100, (currentSales / parsedTempTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          toast={toast}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Banner Card */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Administrator Portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              High-level summary displaying live KPI cards, enterprise quota achievement, and revenue analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="border-[#e8decf] text-[#713105] hover:bg-[#fff7e8] rounded-xl text-xs gap-1.5 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fff7e8] border border-[#e8decf] text-xs font-medium text-[#713105] rounded-xl">
              <Calendar className="w-4 h-4 text-[#7f5e35]" />
              <span>{currentDateFormatted}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Enterprise Sales Quota Progress Card */}
      <Card className="border-[#e8decf] bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7f5e35]">
              Monthly Enterprise Sales Quota
            </span>
            <div className="text-xl font-bold text-[#341100] mt-0.5">
              ₱{currentSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
              /{" "}
              <span className="text-[#7f5e35]">
                ₱{monthlyTarget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Target
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenQuotaModal}
              className="border-[#e8decf] bg-[#fff7e8] text-[#713105] hover:bg-[#fcf3e3] rounded-xl text-xs font-semibold gap-1.5 cursor-pointer active:scale-95 shadow-2xs h-8 px-3"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#cfab71]" />
              Adjust Target Quota
            </Button>

            <Badge
              className={`text-xs font-semibold px-3 py-1 ${
                clampedPercent >= 100
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {clampedPercent.toFixed(1)}% Achieved
            </Badge>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#fff7e8] border border-[#e8decf] h-4 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-[#713105] h-full rounded-full transition-all duration-500"
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between text-[11px] text-[#7f5e35] mt-2 font-medium gap-1">
          <span>
            Realized Revenue: ₱
            {currentSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span>
            Remaining Quota: ₱
            {remainingQuota.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      {/* 4 Dynamic KPI Cards Grid */}
      <KpiCardsSection
        totalSales={stats.totalSales}
        totalProducts={stats.totalProducts}
        lowStockCount={stats.lowStockCount}
        activeStaffCount={stats.activeStaffCount}
        loading={loading}
      />

      {/* 2 Column Data Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Revenue Analytics Bar Graph */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <RevenueBarChart orders={orders} />
        </div>

        {/* Right: Category Distribution Donut / Pie Chart */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <CategoryPieChart products={products} orders={orders} />
        </div>
      </div>

      {/* Target Quota Customization Modal */}
      {isQuotaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#e8decf] shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="bg-[#fff7e8] border-b border-[#e8decf] p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#713105] text-[#fff7e8] flex items-center justify-center">
                  <Target className="w-4 h-4 text-[#cfab71]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#341100]">
                    Set Enterprise Sales Target
                  </h3>
                  <p className="text-[10px] text-[#7f5e35]">
                    Configure monthly organization revenue quota
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuotaModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#e8decf]/60 flex items-center justify-center text-[#7f5e35] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuota} className="p-6 space-y-4">
              {/* Current Sales Overview Card */}
              <div className="bg-[#fff7e8]/60 border border-[#e8decf] rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7f5e35] tracking-wider block">
                    Current Realized Sales
                  </span>
                  <div className="text-base font-black text-[#713105] mt-0.5">
                    ₱{currentSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#7f5e35] tracking-wider block">
                    Projected
                  </span>
                  <div className="text-xs font-bold text-emerald-800 mt-0.5">
                    {projectedPercent.toFixed(1)}% Achieved
                  </div>
                </div>
              </div>

              {/* Preset Quick Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4f351c]">Enterprise Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_QUOTAS.map((preset) => {
                    const isSelected = Number(tempTarget) === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setTempTarget(preset.value)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#fff7e8] border-[#713105] text-[#713105] ring-2 ring-[#713105]/20 font-bold"
                            : "bg-white border-[#e8decf] text-[#4f351c] hover:border-[#cfab71] hover:bg-[#fff7e8]/40"
                        }`}
                      >
                        <span>{preset.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#713105]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4f351c]">Custom Target Amount (₱) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-[#713105]">
                    ₱
                  </span>
                  <Input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={tempTarget}
                    onChange={(e) => setTempTarget(e.target.value)}
                    placeholder="e.g. 100000"
                    className="pl-8 bg-[#fff7e8] border-[#e8decf] text-sm font-bold text-[#341100] rounded-xl focus:border-[#713105]"
                  />
                </div>
                <span className="text-[10px] text-[#7f5e35] block">
                  Sets the monthly revenue goal across the enterprise.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e8decf]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="border-[#e8decf] text-[#7f5e35] hover:bg-[#fff7e8] rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] rounded-xl text-xs font-semibold px-5 gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  <Target className="w-3.5 h-3.5 text-[#cfab71]" />
                  Save Enterprise Quota
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
