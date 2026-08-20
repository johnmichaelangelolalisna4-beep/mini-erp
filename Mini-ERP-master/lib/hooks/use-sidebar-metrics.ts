"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { SidebarMetrics } from "@/lib/config/navigation";

export function useSidebarMetrics() {
  const [metrics, setMetrics] = useState<SidebarMetrics>({
    lowStock: 0,
    pendingOrders: 0,
    activeStaff: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const supabase = createClient();

      const [productsRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from("products").select("stock_count, reorder_level"),
        supabase.from("orders").select("id").eq("status", "PENDING"),
        supabase.from("profiles").select("id"),
      ]);

      const products = productsRes.data || [];
      const pendingOrders = ordersRes.data || [];
      const profiles = profilesRes.data || [];

      const lowStockCount = products.filter(
        (p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)
      ).length;

      setMetrics({
        lowStock: lowStockCount,
        pendingOrders: pendingOrders.length,
        activeStaff: profiles.length > 0 ? profiles.length : 2, // 2 default staff fallback
      });
    } catch (err) {
      console.warn("Notice: Failed to fetch sidebar live metrics:", err);
      // Sensible defaults
      setMetrics((prev) => ({
        ...prev,
        activeStaff: prev.activeStaff || 2,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    // Refetch when window regains focus to keep counts fresh
    const handleFocus = () => fetchMetrics();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchMetrics]);

  return { metrics, loading, refreshMetrics: fetchMetrics };
}
