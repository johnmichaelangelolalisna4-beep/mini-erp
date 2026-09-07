"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Product, Order } from "@/server/services/admin";

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
  orders?: Order[];
}

export function CategoryPieChart({ products = [], orders = [] }: CategoryPieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Map product id -> category for quick lookup
  const productCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p) => {
      if (p.id && p.category) {
        map[p.id] = p.category;
      }
    });
    return map;
  }, [products]);

  const { categoryData, totalRevenue, completedOrdersCount } = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === "COMPLETED");
    const totalRev = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    if (completedOrders.length === 0 || totalRev === 0) {
      // If no completed orders yet, fallback to empty/placeholder representation
      return {
        categoryData: [
          {
            name: "No Sales Yet",
            value: 100,
            unitsSold: 0,
            revenueAmount: 0,
            revenue: "₱0.00",
            color: "#e8decf",
          },
        ],
        totalRevenue: 0,
        completedOrdersCount: 0,
      };
    }

    const map: Record<string, { revenue: number; units: number }> = {};

    completedOrders.forEach((order) => {
      const items = order.order_items;

      if (items && items.length > 0) {
        items.forEach((item) => {
          // Resolve category from joined product (handling both object and array representations from Supabase) or product map
          const prod = Array.isArray(item.products) ? item.products[0] : item.products;
          const cat =
            prod?.category ||
            (item.product_id ? productCategoryMap[item.product_id] : null) ||
            "General Collection";

          if (!map[cat]) {
            map[cat] = { revenue: 0, units: 0 };
          }
          const itemTotal = Number(item.unit_price || 0) * Number(item.quantity || 1);
          map[cat].revenue += itemTotal > 0 ? itemTotal : Number(order.total_amount || 0) / items.length;
          map[cat].units += Number(item.quantity || 1);
        });
      } else {
        // Direct order without nested items
        const cat = products[0]?.category || "General Collection";
        if (!map[cat]) {
          map[cat] = { revenue: 0, units: 0 };
        }
        map[cat].revenue += Number(order.total_amount || 0);
        map[cat].units += 1;
      }
    });

    const entries = Object.entries(map).map(([name, data], idx) => {
      const percentage = totalRev > 0 ? Math.round((data.revenue / totalRev) * 100) : 0;
      return {
        name,
        value: percentage || 1,
        unitsSold: data.units,
        revenueAmount: data.revenue,
        revenue: `₱${data.revenue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        color: PALETTE_COLORS[idx % PALETTE_COLORS.length],
      };
    });

    // Sort categories by highest revenue
    entries.sort((a, b) => b.revenueAmount - a.revenueAmount);

    return {
      categoryData: entries,
      totalRevenue: totalRev,
      completedOrdersCount: completedOrders.length,
    };
  }, [orders, products, productCategoryMap]);

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
    unitsSold: 0,
    revenue: "₱0.00",
  };

  const hasSales = totalRevenue > 0;

  return (
    <Card className="border-[#e8decf] shadow-xs rounded-xl flex flex-col justify-between bg-white h-full">
      <CardHeader className="pb-2 border-b border-[#e8decf] flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-[#341100]">
            Category Sales Distribution
          </CardTitle>
          <p className="text-[11px] text-[#7f5e35] mt-0.5">
            Real-time revenue by furniture category
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#713105] bg-[#fff7e8] border border-[#cfab71]/40 px-2 py-0.5 rounded-md">
          {hasSales
            ? `₱${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Sales`
            : "0 Sales"}
        </span>
      </CardHeader>

      <CardContent className="pt-4 pb-4 flex flex-col items-center justify-center flex-1">
        {!hasSales ? (
          <div className="py-12 text-center text-xs text-[#7f5e35] space-y-1">
            <p className="font-semibold text-[#4f351c]">No completed sales recorded yet</p>
            <p className="text-[11px]">Category revenue breakdown will appear once customer orders are completed.</p>
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
                          {item.unitsSold} {item.unitsSold === 1 ? "unit sold" : "units sold"}
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
