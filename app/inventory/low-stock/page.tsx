"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  AlertTriangle,
  PlusCircle,
  Package,
  RefreshCw,
  XCircle,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchProducts,
  updateProduct,
  createStockLog,
  Product,
} from "@/lib/services/admin";

export function LowStockRestockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<string | number>(20);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products for low stock page from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const lowStockItems = products.filter(
    (p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)
  );

  const outOfStockCount = lowStockItems.filter((p) => Number(p.stock_count || 0) === 0).length;
  const criticalLowCount = lowStockItems.filter((p) => Number(p.stock_count || 0) > 0).length;

  const filteredItems = lowStockItems.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenRestock = (prod: Product) => {
    const suggestedRestock = Math.max(10, (Number(prod.reorder_level || 10) * 2) - Number(prod.stock_count || 0));
    setRestockingProduct(prod);
    setRestockQty(suggestedRestock);
  };

  const handleConfirmRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockingProduct) return;

    const qtyToAdd = Number(restockQty);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      alert("Please enter a valid positive restock quantity.");
      return;
    }

    setSubmitting(true);
    try {
      const newStock = Number(restockingProduct.stock_count || 0) + qtyToAdd;
      const newStatus = newStock > Number(restockingProduct.reorder_level || 10) ? "IN STOCK" : "LOW STOCK";

      await updateProduct(restockingProduct.id, {
        stock_count: newStock,
        status: newStatus,
      });

      await createStockLog({
        product_id: restockingProduct.id,
        change_type: "ADDITION",
        quantity: qtyToAdd,
        reason: `Supplier warehouse replenishment: +${qtyToAdd} units for ${restockingProduct.name}`,
      });

      setNotice({
        type: "success",
        text: `Successfully restocked +${qtyToAdd} units of "${restockingProduct.name}".`,
      });
      setTimeout(() => setNotice(null), 5000);

      setRestockingProduct(null);
      loadData();
    } catch (err) {
      console.error("Error executing restock in Supabase:", err);
      setNotice({
        type: "error",
        text: "Failed to update restock in Supabase. Please try again.",
      });
      setTimeout(() => setNotice(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notice && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-xs font-medium border transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2 ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 shadow-xs"
              : "bg-red-50 text-red-900 border-red-200 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <p className="font-semibold">{notice.text}</p>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Inventory Manager Portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Low Stock & Restock Action
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Live priority view highlighting items that have reached or fallen below designated safety thresholds in Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {loading ? "..." : criticalLowCount}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-semibold">At or below reorder threshold</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Out-of-Stock SKUs</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">
            {loading ? "..." : outOfStockCount}
          </div>
          <span className="text-[11px] text-red-700 font-semibold">Critical 0 unit balance</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Monitored SKUs</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            {loading ? "..." : products.length}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Active furniture catalog pieces</span>
        </Card>
      </div>

      {/* Low Stock Data Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            Restock Priority Action List ({filteredItems.length})
          </CardTitle>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
            <Input
              placeholder="Search piece name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Piece Name</th>
                <th className="py-3 px-4">Collection</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Safety Level</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#7f5e35]">
                    Scanning database for low stock items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-emerald-800 font-medium">
                    ✓ All inventory items are currently above their designated safety thresholds.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{item.sku}</td>
                    <td className="py-3.5 px-4 font-medium text-[#341100]">{item.name}</td>
                    <td className="py-3.5 px-4 text-[#7f5e35]">{item.category}</td>
                    <td className="py-3.5 px-4 font-bold text-red-700">
                      {item.stock_count} units
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#4f351c]">
                      {item.reorder_level} units
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#713105]">
                      ${Number(item.unit_price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.stock_count === 0 ? (
                        <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                          Out of Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                          Low Stock
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenRestock(item)}
                        className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] text-[11px] font-semibold rounded-lg px-3 py-1 cursor-pointer active:scale-95 transition-all shadow-2xs"
                      >
                        Restock SKU
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Restock SKU Modal */}
      {restockingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-[#e8decf] shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <CardHeader className="p-5 bg-[#fff7e8] border-b border-[#e8decf] flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-[#341100] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#713105]" />
                Receive Supplier Restock
              </CardTitle>
              <button
                onClick={() => setRestockingProduct(null)}
                className="text-[#7f5e35] hover:text-[#341100] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>

            <form onSubmit={handleConfirmRestock}>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="bg-[#fff7e8] border border-[#e8decf] p-3 rounded-xl">
                  <div className="font-semibold text-sm text-[#341100]">
                    {restockingProduct.name}
                  </div>
                  <div className="text-xs text-[#7f5e35] font-mono mt-0.5">
                    SKU: {restockingProduct.sku} • Category: {restockingProduct.category}
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-[#e8decf]/60">
                    <span>Current Stock: <strong className="text-red-700">{restockingProduct.stock_count} units</strong></span>
                    <span>Safety Level: <strong className="text-[#4f351c]">{restockingProduct.reorder_level} units</strong></span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#4f351c] block mb-1">
                    Units Received from Supplier *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={restockQty}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setRestockQty(e.target.value)}
                    required
                    className="bg-[#fff7e8] border-[#e8decf] text-sm font-bold text-[#713105] rounded-xl font-mono"
                  />
                  <span className="text-[11px] text-[#7f5e35] mt-1 block">
                    New total stock will be:{" "}
                    <strong className="text-[#341100]">
                      {Number(restockingProduct.stock_count || 0) + (Number(restockQty) || 0)} units
                    </strong>
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8decf]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRestockingProduct(null)}
                    className="border-[#e8decf] text-[#7f5e35] hover:bg-[#fff7e8] rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] rounded-xl text-xs font-semibold"
                  >
                    {submitting ? "Processing..." : "Confirm Restock Intake"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default LowStockRestockPage;
