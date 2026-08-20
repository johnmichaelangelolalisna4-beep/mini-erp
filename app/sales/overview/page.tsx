"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Clock, Award, Calendar, RefreshCw, ShoppingCart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenueBarChart } from "@/components/revenue-bar-chart";
import { fetchOrders, Order } from "@/lib/services/admin";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function SalesPerformancePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState<string>("Sales Representative");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [ordersData, authRes] = await Promise.all([
        fetchOrders(),
        supabase.auth.getUser(),
      ]);

      setOrders(ordersData);

      if (authRes.data?.user) {
        const userId = authRes.data.user.id;
        const userEmail = authRes.data.user.email;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", userId)
          .single();

        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (userEmail) {
          setUserName(userEmail.split("@")[0]);
        }
      }
    } catch (err) {
      console.error("Error loading sales performance data from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const now = new Date();
  const currentMonthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayDateStr = now.toDateString();

  // Dynamic Sales Metrics Computation
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const pendingOrders = orders.filter((o) => o.status === "PENDING");

  const currentSales = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const monthlyTarget = 20000;
  const progressPercent = monthlyTarget > 0 ? (currentSales / monthlyTarget) * 100 : 0;
  const clampedPercent = Math.min(100, Math.max(0, progressPercent));
  const remainingQuota = Math.max(0, monthlyTarget - currentSales);

  const ordersCreatedToday = orders.filter(
    (o) => o.created_at && new Date(o.created_at).toDateString() === todayDateStr
  ).length;

  const pendingInvoicesCount = pendingOrders.length;
  const totalCommission = currentSales * 0.1; // 10% earned rate

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Sales Representative Portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Sales Performance
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Personal sales targets, active quotes, pending invoices, and order activity for{" "}
              <strong className="text-[#341100] font-semibold">{userName}</strong>.
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

      {/* Target Progress Bar Card */}
      <Card className="border-[#e8decf] bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7f5e35]">
              Monthly Sales Quota Progress
            </span>
            <div className="text-xl font-bold text-[#341100] mt-0.5">
              ${currentSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
              /{" "}
              <span className="text-[#7f5e35]">
                ${monthlyTarget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Target
              </span>
            </div>
          </div>
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

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#fff7e8] border border-[#e8decf] h-4 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-[#713105] h-full rounded-full transition-all duration-500"
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-[#7f5e35] mt-2 font-medium">
          <span>
            Current Sales: $
            {currentSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span>
            Remaining Quota: $
            {remainingQuota.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      {/* 4 Tailored KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>My Sales Target</span>
            <TrendingUp className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ${monthlyTarget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Monthly allocation</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Pending Invoices</span>
            <Clock className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">
            {loading ? "..." : pendingInvoicesCount}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-semibold">Awaiting client payment</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Orders Created Today</span>
            <ShoppingBag className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            {loading ? "..." : ordersCreatedToday}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">New transactions today</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Commission</span>
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            ${totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">10% earned on sales</span>
        </Card>
      </div>

      {/* Chart & Recent Orders Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col">
          <RevenueBarChart orders={orders} />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white flex-1 flex flex-col justify-between">
            <CardHeader className="p-5 border-b border-[#e8decf] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[#4f351c]">
                My Recent Orders
              </CardTitle>
              <Badge className="bg-[#fff7e8] text-[#713105] border-[#e8decf] text-[10px]">
                {userName}
              </Badge>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs text-[#341100]">
                <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[10px] uppercase tracking-wider text-[#7f5e35] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Order #</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8decf]/60">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-[#7f5e35]">
                        Loading recent orders from Supabase...
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-[#7f5e35]">
                        No client orders recorded yet.{" "}
                        <Link href="/sales/orders" className="text-[#713105] font-semibold underline">
                          Create an order
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#fcf3e3]/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#713105]">
                          {order.order_number}
                        </td>
                        <td className="py-3 px-4 text-[#341100] font-medium">
                          {order.customer_name}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#341100]">
                          ${Number(order.total_amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {order.status === "COMPLETED" && (
                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                              Fulfilled
                            </Badge>
                          )}
                          {order.status === "PENDING" && (
                            <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px]">
                              Pending
                            </Badge>
                          )}
                          {order.status === "CANCELLED" && (
                            <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                              Cancelled
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
      </div>
    </div>
  );
}

export default SalesPerformancePage;
