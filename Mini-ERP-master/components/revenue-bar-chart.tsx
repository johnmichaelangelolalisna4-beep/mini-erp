"use client";

import React, { useState } from "react";
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

const chartData = [
  { month: "Jan", revenue: 18500, orders: 190 },
  { month: "Feb", revenue: 22400, orders: 210 },
  { month: "Mar", revenue: 19800, orders: 185 },
  { month: "Apr", revenue: 27100, orders: 240 },
  { month: "May", revenue: 24900, orders: 225 },
  { month: "Jun", revenue: 31892, orders: 234 },
];

const chartConfig: ChartConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "#713105", // ESPRESSO
  },
  orders: {
    label: "Orders",
    color: "#cfab71", // CREMA
  },
};

export function RevenueBarChart() {
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  return (
    <Card className="border-[#e8decf] shadow-xs rounded-xl flex flex-col justify-between bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#e8decf]">
        <div>
          <CardTitle className="text-sm font-semibold text-[#341100]">
            Revenue Analytics
          </CardTitle>
        </div>
        <div className="flex items-center gap-3">
          {/* Chart Type Selector */}
          <div className="flex items-center bg-[#fff7e8] p-0.5 rounded-lg border border-[#e8decf] text-[11px]">
            <button
              onClick={() => setChartType("bar")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chartType === "bar"
                  ? "bg-[#713105] text-[#fff7e8] font-semibold"
                  : "text-[#7f5e35] hover:text-[#341100]"
              }`}
            >
              Bar Graph
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chartType === "area"
                  ? "bg-[#713105] text-[#fff7e8] font-semibold"
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

      <CardContent className="pt-6 pb-2">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          {chartType === "bar" ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                tickFormatter={(value) => `$${value / 1000}k`}
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
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                tickFormatter={(value) => `$${value / 1000}k`}
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
