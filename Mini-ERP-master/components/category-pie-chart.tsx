"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

const categoryData = [
  {
    name: "Home Decor",
    value: 64,
    items: 308,
    revenue: "$79,738.88",
    color: "#713105", // ESPRESSO
  },
  {
    name: "Kitchenware",
    value: 22,
    items: 106,
    revenue: "$27,410.24",
    color: "#cfab71", // CREMA
  },
  {
    name: "Other",
    value: 14,
    items: 68,
    revenue: "$17,442.88",
    color: "#e8decf", // FOAM BORDER TINT
  },
];

const chartConfig: ChartConfig = {
  "Home Decor": {
    label: "Home Decor",
    color: "#713105",
  },
  Kitchenware: {
    label: "Kitchenware",
    color: "#cfab71",
  },
  Other: {
    label: "Other",
    color: "#e8decf",
  },
};

export function CategoryPieChart() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeData = categoryData[activeIndex] || categoryData[0];

  return (
    <Card className="border-[#e8decf] shadow-xs rounded-xl flex flex-col justify-between bg-white h-full">
      <CardHeader className="pb-2 border-b border-[#e8decf] flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-[#341100]">
            Category Distribution
          </CardTitle>
          <p className="text-[11px] text-[#7f5e35] mt-0.5">
            Real-time stock & sales distribution
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4 flex flex-col items-center justify-center flex-1">
        {/* shadcn Donut Chart Container */}
        <div className="relative w-full h-56 flex items-center justify-center my-1">
          <ChartContainer config={chartConfig} className="h-56 w-full max-w-[220px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" indicator="dot" />} />
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={94}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all duration-200 cursor-pointer outline-none hover:opacity-90"
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Compact Center Overlay Badge floating neatly inside cutout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-white/95 px-2.5 py-1.5 rounded-lg border border-[#e8decf] shadow-xs text-center min-w-[92px] max-w-[110px] transition-all">
              <span className="block font-extrabold text-xl text-[#713105] leading-none tracking-tight">
                {activeData.value}%
              </span>
              <span className="text-[10px] font-semibold text-[#7f5e35] mt-0.5 block tracking-tight truncate">
                {activeData.name}
              </span>
              <span className="text-[9px] font-mono text-[#4f351c] mt-0.5 block font-bold">
                {activeData.revenue}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Inventory & Sales Metrics Legend */}
        <div className="w-full space-y-2 mt-2 px-1">
          {categoryData.map((item, index) => {
            const isSelected = activeIndex === index;

            return (
              <div
                key={index}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-[#fff7e8] border-[#cfab71]/50 shadow-2xs"
                    : "border-transparent hover:bg-[#fff7e8]/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-[#e8decf]"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#341100]">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[#7f5e35]">
                      {item.items} products
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#713105]">
                    {item.revenue}
                  </div>
                  <div className="text-[10px] font-medium text-[#7f5e35]">
                    {item.value}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
