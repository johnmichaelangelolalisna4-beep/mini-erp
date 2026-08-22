"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Package,
  Layers,
  RefreshCw,
  Coins,
  LayoutGrid,
  List,
  ShoppingCart,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ToastNotification, ToastData } from "@/components/ui/toast-notification";
import {
  fetchProducts,
  createOrder,
  createOrderItem,
  deductProductStock,
  Product,
} from "@/lib/services/admin";
import { createClient } from "@/lib/supabase/client";

export function SalesInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Showroom Quick Order Modal State
  const [orderModalProduct, setOrderModalProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [quantity, setQuantity] = useState<number | "">(1);
  const [pricingTier, setPricingTier] = useState<"RETAIL" | "WHOLESALE">("RETAIL");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products for sales inventory from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime WebSocket subscription for live showroom inventory
    const supabase = createClient();
    const channelName = `sales-inventory-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category || "General")));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" ? true : product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const lowStockCount = products.filter(
    (p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)
  ).length;

  const inStockCount = products.filter(
    (p) => Number(p.stock_count || 0) > Number(p.reorder_level || 0)
  ).length;

  const avgUnitPrice =
    products.length > 0
      ? products.reduce((acc, curr) => acc + Number(curr.unit_price || 0), 0) / products.length
      : 0;

  // Showroom Order Calculation
  const availableStock = orderModalProduct ? Number(orderModalProduct.stock_count || 0) : 0;
  const retailPrice = orderModalProduct ? Number(orderModalProduct.unit_price || 0) : 0;
  const wholesalePrice =
    orderModalProduct?.wholesale_price !== undefined && Number(orderModalProduct.wholesale_price) > 0
      ? Number(orderModalProduct.wholesale_price)
      : Number((retailPrice * 0.8).toFixed(2));

  const activeUnitPrice = pricingTier === "RETAIL" ? retailPrice : wholesalePrice;
  const parsedQuantity = quantity === "" ? 0 : Number(quantity) || 0;
  const isOverStock = parsedQuantity > availableStock;
  const calculatedTotal = (activeUnitPrice * (parsedQuantity > 0 ? parsedQuantity : 0)).toFixed(2);

  const handleOpenOrderModal = (product: Product) => {
    setOrderModalProduct(product);
    setCustomerName("");
    setQuantity(1);
    setPricingTier("RETAIL");
    setPaymentMethod("Cash on Delivery");
  };

  const handleCreateShowroomOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderModalProduct) return;

    if (!customerName.trim()) {
      setToast({
        type: "error",
        title: "Validation Error",
        message: "Please enter the client's full name.",
      });
      return;
    }

    if (parsedQuantity <= 0) {
      setToast({
        type: "error",
        title: "Invalid Quantity",
        message: "Please specify an order quantity of at least 1 unit.",
      });
      return;
    }

    if (isOverStock) {
      setToast({
        type: "error",
        title: "Stock Exceeded",
        message: `Quantity (${parsedQuantity}) exceeds available showroom stock (${availableStock} units).`,
      });
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;

      // Record order under "Sales" creator role
      const createdOrder = await createOrder({
        order_number: orderNumber,
        customer_name: customerName.trim(),
        total_amount: Number(calculatedTotal),
        status: "PENDING",
        created_by_role: "Sales",
        payment_method: paymentMethod,
        pricing_tier: pricingTier,
      });

      if (createdOrder) {
        await createOrderItem({
          order_id: createdOrder.id,
          product_id: orderModalProduct.id,
          quantity: parsedQuantity,
          unit_price: activeUnitPrice,
        });

        // Deduct physical stock & write stock_logs audit
        await deductProductStock(
          orderModalProduct.id,
          parsedQuantity,
          `Sales Order fulfillment: ${orderNumber} (${parsedQuantity} units for ${customerName.trim()})`
        );
      }

      setOrderModalProduct(null);
      setToast({
        type: "success",
        title: "Showroom Order Placed",
        message: `Order "${orderNumber}" recorded for ${customerName} and ${parsedQuantity} units deducted.`,
      });
      loadData();
    } catch (err: any) {
      console.error("Error creating showroom order:", err);
      setToast({
        type: "error",
        title: "Order Failed",
        message: err.message || "Failed to submit showroom order.",
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          toast={toast}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Sales Representative Portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Furniture Catalog & Stock Availability
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Live showroom and warehouse inventory catalog with 1-click order placement and dual pricing.
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
            <span>Available Catalog SKUs</span>
            <Layers className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            {products.length}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Active furniture models</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>In Stock Pieces</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {inStockCount}
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold">Ready for customer delivery</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Average Unit Price</span>
            <Coins className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ₱{avgUnitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Average piece catalog value</span>
        </Card>
      </div>

      {/* Products Main Card */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold text-[#4f351c]">
              Live Inventory Catalog ({filteredProducts.length})
            </CardTitle>
            <p className="text-[11px] text-[#7f5e35] mt-0.5">
              Interactive client catalog for quotes, bulk orders, and stock verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* View Mode Switcher (Table vs Grid) */}
            <div className="flex items-center bg-[#fff7e8] border border-[#e8decf] rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#713105] text-[#fff7e8] shadow-2xs font-semibold"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#713105] text-[#fff7e8] shadow-2xs font-semibold"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
                title="Grid Gallery View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {categories.length > 0 && (
              <div className="w-48">
                <CustomSelect
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val)}
                  options={[
                    { value: "ALL", label: "All Collections" },
                    ...categories.map((cat) => ({ value: cat, label: cat })),
                  ]}
                  className="py-1.5 px-3 text-xs"
                />
              </div>
            )}

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search piece name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {viewMode === "table" ? (
            <table className="w-full text-left text-xs text-[#341100]">
              <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Piece Name</th>
                  <th className="py-3 px-4">Collection</th>
                  <th className="py-3 px-4">Stock Units</th>
                  <th className="py-3 px-4">Retail Price</th>
                  <th className="py-3 px-4">Wholesale Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8decf]/60">
                {loading ? (
                  <TableSkeleton columns={8} rows={6} />
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#7f5e35]">
                      No furniture products found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const wholesale =
                      product.wholesale_price ?? Number((Number(product.unit_price) * 0.8).toFixed(2));
                    const isAvailable = Number(product.stock_count || 0) > 0;
                    return (
                      <tr key={product.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{product.sku}</td>
                        <td className="py-3.5 px-4 font-medium text-[#341100]">
                          <div className="flex items-center gap-2.5">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-8 h-8 rounded-lg object-cover border border-[#e8decf] bg-[#fff7e8] shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-[#fff7e8] border border-[#e8decf] flex items-center justify-center text-[#7f5e35] shrink-0">
                                <Package className="w-4 h-4 text-[#cfab71]" />
                              </div>
                            )}
                            <span>{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#7f5e35]">{product.category}</td>
                        <td className="py-3.5 px-4 font-bold text-[#341100]">
                          {product.stock_count} units
                          <div className="text-[10px] text-[#7f5e35] font-mono font-normal">
                            Threshold: {product.reorder_level}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#341100]">
                          ₱{Number(product.unit_price).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#047857]">
                          ₱{Number(wholesale).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          {product.stock_count === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : product.stock_count <= product.reorder_level ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            disabled={!isAvailable}
                            onClick={() => handleOpenOrderModal(product)}
                            className={`h-7 px-3 rounded-lg text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs ${
                              isAvailable
                                ? "bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] active:scale-95"
                                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Sell Piece
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Grid View */
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[#e8decf] bg-white p-4 space-y-3 animate-pulse"
                  >
                    <div className="h-44 bg-[#fff7e8] rounded-xl" />
                    <div className="h-4 bg-[#fff7e8] rounded w-3/4" />
                    <div className="h-3 bg-[#fff7e8] rounded w-1/2" />
                    <div className="h-8 bg-[#fff7e8] rounded" />
                  </div>
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-[#7f5e35]">
                  No furniture products found matching your criteria.
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const wholesale =
                    product.wholesale_price ?? Number((Number(product.unit_price) * 0.8).toFixed(2));
                  const isAvailable = Number(product.stock_count || 0) > 0;
                  return (
                    <div
                      key={product.id}
                      className="group relative rounded-2xl bg-white border border-[#e8decf] hover:border-[#cfab71] shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="relative h-48 w-full bg-[#fff7e8] overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#cfab71] gap-2">
                            <Package className="w-10 h-10 opacity-70" />
                            <span className="text-[10px] text-[#7f5e35]">No image attached</span>
                          </div>
                        )}

                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          <span className="bg-white/90 backdrop-blur-xs text-[#713105] text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-[#e8decf] shadow-2xs">
                            {product.category}
                          </span>
                          {product.stock_count > product.reorder_level ? (
                            <Badge variant="success">IN STOCK</Badge>
                          ) : product.stock_count > 0 ? (
                            <Badge variant="warning">LOW STOCK</Badge>
                          ) : (
                            <Badge variant="destructive">OUT OF STOCK</Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-[#341100] line-clamp-1 group-hover:text-[#713105] transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="font-mono text-[11px] font-bold text-[#713105] bg-[#fff7e8] border border-[#cfab71]/40 px-1.5 py-0.5 rounded-md">
                              {product.sku}
                            </span>
                            <span className="text-[11px] text-[#7f5e35]">
                              • {product.stock_count} units available
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#fff7e8]/60 border border-[#e8decf] rounded-xl p-2.5 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold text-[#7f5e35] uppercase block">
                              Retail
                            </span>
                            <div className="font-bold text-[#341100]">
                              ₱{Number(product.unit_price).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-[#047857] uppercase block">
                              Wholesale
                            </span>
                            <div className="font-bold text-[#047857]">
                              ₱{Number(wholesale).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <Button
                          disabled={!isAvailable}
                          onClick={() => handleOpenOrderModal(product)}
                          className={`w-full h-8 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs ${
                            isAvailable
                              ? "bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] active:scale-95"
                              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {isAvailable ? "Create Client Order" : "Unavailable (0 Stock)"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Showroom Direct Order Modal */}
      {orderModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-[#e8decf] shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative my-8">
            <div className="bg-[#fff7e8] border-b border-[#e8decf] p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#713105] uppercase tracking-wider bg-[#cfab71]/20 px-2 py-0.5 rounded-md">
                  Showroom Fast Order
                </span>
                <h3 className="font-bold text-base text-[#341100] mt-1">
                  Place Order for {orderModalProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOrderModalProduct(null)}
                className="w-8 h-8 rounded-full hover:bg-[#e8decf]/60 flex items-center justify-center text-[#7f5e35] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShowroomOrder} className="p-6 space-y-4">
              {/* Product Info Card */}
              <div className="bg-[#fff7e8]/60 border border-[#e8decf] rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[#341100]">{orderModalProduct.name}</div>
                  <div className="text-[10px] text-[#7f5e35] font-mono">SKU: {orderModalProduct.sku}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#713105]">{availableStock} Available</div>
                  <div className="text-[10px] text-[#7f5e35]">Warehouse Stock</div>
                </div>
              </div>

              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4f351c]">Customer Full Name *</label>
                <Input
                  required
                  placeholder="e.g., Alexander Vance"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:border-[#713105]"
                />
              </div>

              {/* Pricing Tier Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4f351c]">Pricing Tier</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPricingTier("RETAIL")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      pricingTier === "RETAIL"
                        ? "bg-[#fff7e8] border-[#713105] ring-2 ring-[#713105]/20"
                        : "bg-white border-[#e8decf] hover:border-[#cfab71]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#341100]">Retail Rate</span>
                      {pricingTier === "RETAIL" && <CheckCircle2 className="w-3.5 h-3.5 text-[#713105]" />}
                    </div>
                    <div className="text-sm font-black text-[#713105] mt-1">₱{retailPrice.toFixed(2)}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPricingTier("WHOLESALE")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      pricingTier === "WHOLESALE"
                        ? "bg-[#fff7e8] border-[#047857] ring-2 ring-[#047857]/20"
                        : "bg-white border-[#e8decf] hover:border-[#cfab71]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#047857]">Wholesale (20% Off)</span>
                      {pricingTier === "WHOLESALE" && <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />}
                    </div>
                    <div className="text-sm font-black text-[#047857] mt-1">₱{wholesalePrice.toFixed(2)}</div>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#4f351c]">Order Quantity *</label>
                  <span className={`text-[10px] font-bold ${isOverStock ? "text-rose-600" : "text-[#7f5e35]"}`}>
                    Max: {availableStock} units
                  </span>
                </div>
                <Input
                  type="number"
                  min="1"
                  max={availableStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuantity(val === "" ? "" : Math.max(1, parseInt(val, 10) || 1));
                  }}
                  className={`bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl ${
                    isOverStock ? "border-rose-500 ring-2 ring-rose-200" : "focus:border-[#713105]"
                  }`}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4f351c]">Payment Method</label>
                <CustomSelect
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val)}
                  options={[
                    { value: "Cash on Delivery", label: "Cash on Delivery (COD)" },
                    { value: "Bank Transfer", label: "Direct Bank Transfer" },
                    { value: "Credit / Debit Card", label: "Credit / Debit Card (Gateway)" },
                    { value: "Corporate Cheque", label: "Corporate Showroom Cheque" },
                  ]}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                />
              </div>

              {/* Total Order Summary */}
              <div className="bg-[#fff7e8] border border-[#e8decf] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#7f5e35] uppercase tracking-wider block">
                    Calculated Total
                  </span>
                  <span className="text-[11px] text-[#7f5e35]">
                    {parsedQuantity} unit(s) @ ₱{activeUnitPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-[#713105]">₱{calculatedTotal}</div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    Role: Sales Representative
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOrderModalProduct(null)}
                  className="border-[#e8decf] text-[#7f5e35] hover:bg-[#fff7e8] rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingOrder || isOverStock || parsedQuantity <= 0}
                  className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] rounded-xl text-xs font-semibold px-5 gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5 text-[#cfab71]" />
                      Place Client Order
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesInventoryPage;
