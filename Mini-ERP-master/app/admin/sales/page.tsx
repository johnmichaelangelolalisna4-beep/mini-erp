"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, Filter, Plus, ShoppingCart, Clock, CheckCircle2, DollarSign, RefreshCw, X, Package, Calculator, ChevronDown, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchOrders, createOrder, updateOrderStatus, fetchProducts, updateProduct, Order, Product } from "@/lib/services/admin";

export function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Custom Dropdown Open States
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Selected product and quantity for auto-calculating total amount
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string | number>(1);

  // New Order Form State
  const [newOrder, setNewOrder] = useState<{
    customer_name: string;
    total_amount: string | number;
    status: "COMPLETED" | "PENDING" | "CANCELLED";
  }>({
    customer_name: "",
    total_amount: "",
    status: "PENDING",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      console.error("Error loading sales orders & products from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle click outside for custom dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setIsProductDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenModal = () => {
    const defaultProduct = products.length > 0 ? products[0] : null;
    const initialPrice = defaultProduct ? Number(defaultProduct.unit_price).toFixed(2) : "";

    setSelectedProductId(defaultProduct ? defaultProduct.id : "");
    setQuantity(1);
    setNewOrder({
      customer_name: "",
      total_amount: initialPrice,
      status: "PENDING",
    });
    setIsProductDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setIsProductDropdownOpen(false);
    const qty = Number(quantity) || 1;
    const calculated = (Number(product.unit_price) * qty).toFixed(2);
    setNewOrder((prev) => ({
      ...prev,
      total_amount: calculated,
    }));
  };

  const handleQuantityChange = (newQtyStr: string) => {
    setQuantity(newQtyStr);
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod) {
      const qty = newQtyStr === "" ? 0 : Number(newQtyStr) || 1;
      const calculated = (Number(prod.unit_price) * qty).toFixed(2);
      setNewOrder((prev) => ({
        ...prev,
        total_amount: calculated,
      }));
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customer_name) return;

    setSubmitting(true);
    try {
      const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
      const selectedProd = products.find((p) => p.id === selectedProductId);

      const orderAmount = Number(newOrder.total_amount) || (selectedProd ? Number(selectedProd.unit_price) * (Number(quantity) || 1) : 0);

      await createOrder({
        order_number: orderNumber,
        customer_name: newOrder.customer_name,
        total_amount: Number(orderAmount),
        status: newOrder.status,
        created_by_role: "Admin",
      });

      // If order is completed and a product was selected, update product stock in Supabase
      if (selectedProd && newOrder.status === "COMPLETED") {
        const orderQty = Number(quantity) || 1;
        const newStock = Math.max(0, selectedProd.stock_count - orderQty);
        const newStatus = newStock === 0 ? "OUT OF STOCK" : newStock <= selectedProd.reorder_level ? "LOW STOCK" : "IN STOCK";
        await updateProduct(selectedProd.id, { stock_count: newStock, status: newStatus });
      }

      setIsModalOpen(false);
      setNewOrder({
        customer_name: "",
        total_amount: "",
        status: "PENDING",
      });
      loadData();
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "COMPLETED" | "PENDING" | "CANCELLED") => {
    try {
      await updateOrderStatus(id, newStatus);
      loadData();
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const avgOrderValue = orders.length > 0
    ? orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) / orders.length
    : 0;

  const currentSelectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Administrator Portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Furniture Orders & Client Invoices
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Manage client transactions, interior design showroom orders, customer billing, and fulfillment live in Supabase.
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

            <Button
              onClick={handleOpenModal}
              className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Client Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Furniture Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Fulfilled client orders</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">{pendingCount}</div>
          <span className="text-[11px] text-[#713105] font-semibold">In production / delivery</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Completed Deliveries</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{completedCount}</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Fulfilled & installed</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Average Order Value</span>
            <ShoppingCart className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ${avgOrderValue.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Per transaction</span>
        </Card>
      </div>

      {/* Orders Data Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            Recent Client Orders & Invoices ({filteredOrders.length})
          </CardTitle>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search order # or client / studio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>
            <Button variant="outline" className="border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] gap-1.5 text-xs rounded-xl">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Client / Studio</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#7f5e35]">
                    Loading orders from Supabase...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#7f5e35]">
                    No client orders found. Click "Create Client Order" to add one.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{order.order_number}</td>
                    <td className="py-3.5 px-4 font-medium text-[#341100]">{order.customer_name}</td>
                    <td className="py-3.5 px-4 text-[#7f5e35]">{order.created_by_role}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#341100]">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.status === "COMPLETED" && (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] uppercase tracking-wide">
                          COMPLETED
                        </Badge>
                      )}
                      {order.status === "PENDING" && (
                        <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[11px] uppercase tracking-wide">
                          PENDING
                        </Badge>
                      )}
                      {order.status === "CANCELLED" && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 text-[11px] uppercase tracking-wide">
                          CANCELLED
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                        className="bg-[#fff7e8] border border-[#e8decf] text-[11px] text-[#4f351c] rounded-lg p-1.5 outline-none font-semibold cursor-pointer"
                      >
                        <option value="PENDING">Mark Pending</option>
                        <option value="COMPLETED">Mark Completed</option>
                        <option value="CANCELLED">Mark Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-[#e8decf] shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <CardHeader className="bg-[#fff7e8] border-b border-[#e8decf] p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#341100] flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#713105]" />
                Create New Client Order
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 text-[#7f5e35]"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCreateOrder} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Client / Design Studio Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Haven Interior Studio & Showroom"
                  value={newOrder.customer_name}
                  onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                />
              </div>

              {/* Custom Styled Select Furniture Piece Dropdown */}
              <div className="relative" ref={productDropdownRef}>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1 flex items-center justify-between">
                  <span>Select Furniture Item</span>
                  {currentSelectedProduct && (
                    <span className="text-[10px] text-[#713105] font-bold font-mono">
                      UNIT PRICE: ${Number(currentSelectedProduct.unit_price).toFixed(2)}
                    </span>
                  )}
                </label>

                {products.length === 0 ? (
                  <div className="p-2.5 bg-[#fff7e8] border border-[#e8decf] rounded-xl text-[11px] text-[#7f5e35]">
                    No furniture items in catalog.
                  </div>
                ) : (
                  <>
                    {/* Custom Styled Dropdown Trigger Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProductDropdownOpen(!isProductDropdownOpen);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="w-full bg-[#fff7e8] border border-[#e8decf] hover:border-[#cfab71] text-xs text-[#341100] rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all cursor-pointer shadow-2xs text-left"
                    >
                      {currentSelectedProduct ? (
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-[#341100] truncate">
                            {currentSelectedProduct.name}
                          </span>
                          <span className="font-mono text-[10px] bg-white text-[#713105] border border-[#cfab71]/50 px-1.5 py-0.5 rounded-md shrink-0">
                            {currentSelectedProduct.sku}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#7f5e35]">Select a piece...</span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-[#713105] shrink-0 transition-transform duration-200 ${
                          isProductDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Custom Styled Dropdown Menu */}
                    {isProductDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#e8decf] rounded-2xl shadow-xl p-1.5 max-h-52 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-100">
                        {products.map((p) => {
                          const isSelected = p.id === selectedProductId;
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleSelectProduct(p)}
                              className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#fcf3e3] text-[#713105] font-semibold border border-[#cfab71]/40 shadow-2xs"
                                  : "text-[#341100] hover:bg-[#fff7e8] hover:text-[#713105]"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="truncate">{p.name}</span>
                                <span className="font-mono text-[10px] bg-[#fff7e8] text-[#7f5e35] border border-[#e8decf] px-1.5 py-0.5 rounded-md shrink-0">
                                  {p.sku}
                                </span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#713105] shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Order Quantity & Total Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Order Quantity *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    placeholder="1"
                    value={quantity}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>

                {/* Total Order Amount (Pre-filled & Auto-calculated) */}
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1 flex items-center gap-1">
                    <Calculator className="w-3 h-3 text-[#713105]" />
                    <span>Total Amount ($) *</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newOrder.total_amount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setNewOrder({ ...newOrder, total_amount: e.target.value })}
                    className="bg-[#fff7e8] border-[#cfab71] text-xs text-[#341100] font-bold rounded-xl"
                  />
                </div>
              </div>

              {currentSelectedProduct && (
                <div className="p-2.5 rounded-xl bg-[#fff7e8] border border-[#cfab71]/40 flex items-center justify-between text-[11px] text-[#713105]">
                  <span>
                    Auto-calculated: <strong>${Number(currentSelectedProduct.unit_price).toFixed(2)}</strong> × <strong>{quantity || 0}</strong>
                  </span>
                  <span className="font-semibold text-[#4f351c]">
                    Available: {currentSelectedProduct.stock_count} units
                  </span>
                </div>
              )}

              {/* Custom Styled Initial Status Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Initial Status
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    setIsProductDropdownOpen(false);
                  }}
                  className="w-full bg-[#fff7e8] border border-[#e8decf] hover:border-[#cfab71] text-xs text-[#341100] rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all cursor-pointer shadow-2xs text-left"
                >
                  <div className="flex items-center gap-2">
                    {newOrder.status === "PENDING" && (
                      <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                        PENDING
                      </Badge>
                    )}
                    {newOrder.status === "COMPLETED" && (
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                        COMPLETED
                      </Badge>
                    )}
                    {newOrder.status === "CANCELLED" && (
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                        CANCELLED
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#713105] shrink-0 transition-transform duration-200 ${
                      isStatusDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#e8decf] rounded-2xl shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div
                      onClick={() => {
                        setNewOrder({ ...newOrder, status: "PENDING" });
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        newOrder.status === "PENDING"
                          ? "bg-[#fcf3e3] text-[#713105] font-semibold border border-[#cfab71]/40 shadow-2xs"
                          : "text-[#341100] hover:bg-[#fff7e8]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          PENDING
                        </Badge>
                        <span className="text-[11px] text-[#7f5e35]">Order awaiting processing / craft</span>
                      </div>
                      {newOrder.status === "PENDING" && <Check className="w-3.5 h-3.5 text-[#713105]" />}
                    </div>

                    <div
                      onClick={() => {
                        setNewOrder({ ...newOrder, status: "COMPLETED" });
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        newOrder.status === "COMPLETED"
                          ? "bg-[#fcf3e3] text-[#713105] font-semibold border border-[#cfab71]/40 shadow-2xs"
                          : "text-[#341100] hover:bg-[#fff7e8]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          COMPLETED
                        </Badge>
                        <span className="text-[11px] text-[#7f5e35]">Deducts stock automatically</span>
                      </div>
                      {newOrder.status === "COMPLETED" && <Check className="w-3.5 h-3.5 text-[#713105]" />}
                    </div>

                    <div
                      onClick={() => {
                        setNewOrder({ ...newOrder, status: "CANCELLED" });
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        newOrder.status === "CANCELLED"
                          ? "bg-[#fcf3e3] text-[#713105] font-semibold border border-[#cfab71]/40 shadow-2xs"
                          : "text-[#341100] hover:bg-[#fff7e8]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          CANCELLED
                        </Badge>
                        <span className="text-[11px] text-[#7f5e35]">Cancelled order</span>
                      </div>
                      {newOrder.status === "CANCELLED" && <Check className="w-3.5 h-3.5 text-[#713105]" />}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-[#e8decf] text-[#7f5e35] text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] text-xs font-semibold rounded-xl cursor-pointer"
                >
                  {submitting ? "Creating..." : "Create Client Order"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SalesPage;
