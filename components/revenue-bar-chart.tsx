"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Order } from "@/lib/services/admin";

const chartConfig: ChartConfig = {
  revenue: {
    label: "Revenue (₱)",
    color: "#713105", // ESPRESSO
  },
  orders: {
    label: "Orders",
    color: "#cfab71", // CREMA
  },
};

interface RevenueBarChartProps {
  orders?: Order[];
}

export function RevenueBarChart({ orders = [] }: RevenueBarChartProps) {
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  // Dynamically compute past 6 months from real orders
  const chartData = useMemo(() => {
    const months: { [key: string]: { month: string; revenue: number; orders: number; dateKey: string } } = {};
    const now = new Date();

    // Generate last 6 month buckets
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthShort = d.toLocaleString("en-US", { month: "short" });
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = {
        month: monthShort,
        revenue: 0,
        orders: 0,
        dateKey: key,
      };
    }

    // Populate with real orders
    orders.forEach((order) => {
      if (!order.created_at) return;
      const orderDate = new Date(order.created_at);
      const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;

      if (months[key]) {
        if (order.status === "COMPLETED") {
          months[key].revenue += Number(order.total_amount || 0);
        }
        months[key].orders += 1;
      }
    });

    return Object.values(months);
  }, [orders]);

  const totalChartRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <Card className="border-[#e8decf] shadow-xs rounded-xl flex flex-col justify-between bg-white h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#e8decf]">
        <div>
          <CardTitle className="text-sm font-semibold text-[#341100]">
            Revenue Analytics
          </CardTitle>
          <span className="text-[11px] text-[#7f5e35]">
            Total Trailing 6M: <strong className="text-[#713105] font-bold">₱{totalChartRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Chart Type Selector */}
          <div className="flex items-center bg-[#fff7e8] p-0.5 rounded-lg border border-[#e8decf] text-[11px]">
            <button
              onClick={() => setChartType("bar")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-[#713105] text-[#fff7e8] font-semibold shadow-2xs"
                  : "text-[#7f5e35] hover:text-[#341100]"
              }`}
            >
              Bar Graph
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-[#713105] text-[#fff7e8] font-semibold shadow-2xs"
                  : "text-[#7f5e35] hover:text-[#341100]"
              }`}
            >
              Area Line
            </button>
          </div>

          <span className="text-xs font-normal text-[#7f5e35] bg-[#fff7e8] border border-[#e8decf] px-2.5 py-1 rounded-lg">
            Last 6 Months
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-2 flex-1 flex flex-col justify-center">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          {chartType === "bar" ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8decf" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                className="text-[11px] fill-[#7f5e35] font-medium"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-[10px] fill-[#7f5e35]"
                tickFormatter={(value) => `₱${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Bar
                dataKey="revenue"
                fill="#713105"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#713105" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#713105" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8decf" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                className="text-[11px] fill-[#7f5e35] font-medium"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-[10px] fill-[#7f5e35]"
                tickFormatter={(value) => `₱${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#713105"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
