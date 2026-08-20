"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { SidebarMetrics } from "@/lib/config/navigation";
import { fetchWithCache, getCacheData } from "@/lib/services/cache";

const CACHE_KEY = "sidebar_metrics";
const CACHE_TTL_MS = 30000; // 30 seconds

export function useSidebarMetrics() {
  // Initialize immediately from in-memory cache if available (0ms instant render)
  const [metrics, setMetrics] = useState<SidebarMetrics>(() => {
    const cached = getCacheData<SidebarMetrics>(CACHE_KEY);
    return cached || {
      lowStock: 0,
      pendingOrders: 0,
      activeStaff: 0,
    };
  });
  const [loading, setLoading] = useState<boolean>(() => !getCacheData<SidebarMetrics>(CACHE_KEY));

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await fetchWithCache<SidebarMetrics>(
        CACHE_KEY,
        async () => {
          const supabase = createClient();

          // Lean query execution: products for low-stock calculation, head counts for orders & profiles
          const [productsRes, ordersRes, profilesRes] = await Promise.all([
            supabase.from("products").select("stock_count, reorder_level"),
            supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
            supabase.from("profiles").select("*", { count: "exact", head: true }),
          ]);

          const products = productsRes.data || [];
          const pendingOrdersCount = ordersRes.count ?? (ordersRes.data?.length || 0);
          const profilesCount = profilesRes.count ?? (profilesRes.data?.length || 0);

          const lowStockCount = products.filter(
            (p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)
          ).length;

          return {
            lowStock: lowStockCount,
            pendingOrders: pendingOrdersCount,
            activeStaff: profilesCount > 0 ? profilesCount : 2,
          };
        },
        CACHE_TTL_MS
      );

      setMetrics(data);
    } catch (err) {
      console.warn("Notice: Failed to fetch sidebar live metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, refreshMetrics: fetchMetrics };
}

