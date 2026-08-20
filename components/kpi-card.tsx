"use client";

import React from "react";
import { TrendingUp, Package, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiDataProps {
  totalSales?: number;
  totalProducts?: number;
  lowStockCount?: number;
  activeStaffCount?: number;
  loading?: boolean;
}

export function KpiCardsSection({
  totalSales,
  totalProducts,
  lowStockCount,
  activeStaffCount,
  loading = false
}: KpiDataProps) {
  const formatCurrency = (val?: number) => {
    if (val === undefined) return "$124,592.00";
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const kpis = [
    {
      title: "TOTAL SALES",
      value: formatCurrency(totalSales),
      trend: "+12.5%",
      icon: TrendingUp,
    },
    {
      title: "TOTAL PRODUCTS",
      value: totalProducts !== undefined ? String(totalProducts) : "482",
      subtext: "Across active catalog",
      icon: Package,
    },
    {
      title: "LOW STOCK COUNT",
      value: lowStockCount !== undefined ? String(lowStockCount) : "14",
      alertText: "Requires attention",
      isAlert: true,
      icon: AlertTriangle,
    },
    {
      title: "ACTIVE STAFF COUNT",
      value: activeStaffCount !== undefined ? String(activeStaffCount) : "8",
      subtext: "System registered users",
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className="border-[#e8decf] shadow-xs hover:border-[#cfab71] transition-all rounded-xl bg-white"
        >
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7f5e35]">
                {kpi.title}
              </span>
              <kpi.icon className="w-4 h-4 text-[#713105]/70" />
            </div>

            <div className="text-2xl font-bold text-[#341100] tracking-tight">
              {loading ? (
                <Skeleton className="h-7 w-28 rounded-lg my-0.5" />
              ) : kpi.isAlert ? (
                <span className="text-red-700">{kpi.value}</span>
              ) : (
                kpi.value
              )}
            </div>

            <div className="pt-1">
              {loading ? (
                <Skeleton className="h-4 w-24 rounded-md" />
              ) : (
                <>
                  {kpi.trend && (
                    <div className="flex items-center gap-1">
                      <Badge variant="success" className="text-[11px] font-semibold uppercase tracking-wide gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {kpi.trend}
                      </Badge>
                    </div>
                  )}

                  {kpi.subtext && (
                    <span className="text-xs font-normal text-[#7f5e35]">
                      {kpi.subtext}
                    </span>
                  )}

                  {kpi.alertText && (
                    <Badge variant="destructive" className="text-[11px] font-semibold uppercase tracking-wide">
                      {kpi.alertText}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

