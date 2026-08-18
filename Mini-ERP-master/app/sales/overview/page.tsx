"use client";

import React from "react";
import { TrendingUp, ShoppingBag, Clock, Award, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RevenueBarChart } from "@/components/revenue-bar-chart";

const myRecentOrders = [
  {
    id: "#ORD-1042",
    customer: "John Miller (Self Sale)",
    date: "Aug 08, 2026",
    items: 4,
    total: "$284.00",
    status: "Fulfilled",
    commission: "$28.40",
  },
  {
    id: "#ORD-1041",
    customer: "Sarah Jenkins",
    date: "Aug 08, 2026",
    items: 2,
    total: "$112.50",
    status: "Pending Invoice",
    commission: "$11.25",
  },
  {
    id: "#ORD-1039",
    customer: "Emily Watson",
    date: "Aug 07, 2026",
    items: 5,
    total: "$410.00",
    status: "Pending Invoice",
    commission: "$41.00",
  },
  {
    id: "#ORD-1035",
    customer: "David Harrison",
    date: "Aug 05, 2026",
    items: 3,
    total: "$355.00",
    status: "Fulfilled",
    commission: "$35.50",
  },
];

export function SalesPerformancePage() {
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
              Personal sales targets, active quotes, pending invoices, and order activity for John Miller.
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

      {/* Target Progress Bar Card */}
      <Card className="border-[#e8decf] bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7f5e35]">
              Monthly Sales Quota Progress
            </span>
            <div className="text-xl font-bold text-[#341100] mt-0.5">
              $15,450.00 / <span className="text-[#7f5e35]">$20,000.00 Target</span>
            </div>
          </div>
          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold px-3 py-1">
            77.2% Achieved
          </Badge>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#fff7e8] border border-[#e8decf] h-4 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-[#713105] h-full rounded-full transition-all duration-500"
            style={{ width: "77.2%" }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-[#7f5e35] mt-2 font-medium">
          <span>Current Sales: $15,450.00</span>
          <span>Remaining Quota: $4,550.00</span>
        </div>
      </Card>

      {/* 4 Tailored KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>My Sales Target</span>
            <TrendingUp className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">$20,000.00</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Monthly allocation</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Pending Invoices</span>
            <Clock className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">4</div>
          <span className="text-[11px] text-[#713105] font-semibold">Awaiting payment</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Orders Created Today</span>
            <ShoppingBag className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">8</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">New transactions</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Commission</span>
            <Award className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">$1,545.00</div>
          <span className="text-[11px] text-emerald-700 font-semibold">10% earned rate</span>
        </Card>
      </div>

      {/* Chart & Recent Orders Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col">
          <RevenueBarChart />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white flex-1 flex flex-col justify-between">
            <CardHeader className="p-5 border-b border-[#e8decf] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[#4f351c]">
                My Recent Orders
              </CardTitle>
              <Badge className="bg-[#fff7e8] text-[#713105] border-[#e8decf] text-[10px]">
                John Miller
              </Badge>
            </CardHeader>

            <CardContent className="p-0 flex-1">
              <table className="w-full text-left text-xs text-[#341100]">
                <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[10px] uppercase tracking-wider text-[#7f5e35] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Order ID</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8decf]/60">
                  {myRecentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#fcf3e3]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#713105]">{order.id}</td>
                      <td className="py-3 px-4 text-[#341100] font-medium">{order.customer}</td>
                      <td className="py-3 px-4 font-bold text-[#341100]">{order.total}</td>
                      <td className="py-3 px-4">
                        {order.status === "Fulfilled" ? (
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                            Fulfilled
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px]">
                            Pending
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
      </div>
    </div>
  );
}

export default SalesPerformancePage;
