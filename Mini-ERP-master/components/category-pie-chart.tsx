"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Product } from "@/lib/services/admin";

const PALETTE_COLORS = [
  "#713105", // ESPRESSO
  "#cfab71", // CREMA
  "#a37a4c", // ROAST MEDIUM
  "#7f5e35", // ROAST
  "#4f351c", // GROUNDS
  "#c49a6c", // CARAMEL
  "#e8decf", // FOAM BORDER TINT
];

interface CategoryPieChartProps {
  products?: Product[];
}

export function CategoryPieChart({ products = [] }: CategoryPieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const categoryData = useMemo(() => {
    if (!products || products.length === 0) {
      return [
        {
          name: "General",
          value: 100,
          items: 0,
          revenue: "$0.00",
          color: "#cfab71",
        },
      ];
    }

    const map: { [cat: string]: { count: number; value: number } } = {};
    let totalItems = 0;

    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!map[cat]) {
        map[cat] = { count: 0, value: 0 };
      }
      map[cat].count += 1;
      map[cat].value += Number(p.stock_count || 0) * Number(p.unit_price || 0);
      totalItems += 1;
    });

    const entries = Object.entries(map).map(([name, data], idx) => {
      const percentage = totalItems > 0 ? Math.round((data.count / totalItems) * 100) : 0;
      return {
        name,
        value: percentage || 1,
        items: data.count,
        revenue: `$${data.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        color: PALETTE_COLORS[idx % PALETTE_COLORS.length],
      };
    });

    return entries;
  }, [products]);

  const chartConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    categoryData.forEach((item) => {
      cfg[item.name] = {
        label: item.name,
        color: item.color,
      };
    });
    return cfg;
  }, [categoryData]);

  const activeData = categoryData[activeIndex] || categoryData[0] || {
    name: "Overview",
    value: 0,
    items: 0,
    revenue: "$0.00",
  };

  return (
    <Card className="border-[#e8decf] shadow-xs rounded-xl flex flex-col justify-between bg-white h-full">
      <CardHeader className="pb-2 border-b border-[#e8decf] flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-[#341100]">
            Category Distribution
          </CardTitle>
          <p className="text-[11px] text-[#7f5e35] mt-0.5">
            Real-time stock & catalogue distribution
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#713105] bg-[#fff7e8] border border-[#cfab71]/40 px-2 py-0.5 rounded-md">
          {products.length} Products
        </span>
      </CardHeader>

      <CardContent className="pt-4 pb-4 flex flex-col items-center justify-center flex-1">
        {products.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7f5e35]">
            No products found. Add items to see live category breakdown.
          </div>
        ) : (
          <>
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

              {/* Center Overlay Badge */}
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

            {/* Detailed Category Legend */}
            <div className="w-full space-y-1.5 mt-2 px-1 max-h-36 overflow-y-auto">
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
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-[#e8decf]"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#341100] truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[#7f5e35]">
                          {item.items} {item.items === 1 ? "product" : "products"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
