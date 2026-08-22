"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  ShoppingCart,
  Clock,
  CheckCircle2,
  RefreshCw,
  X,
  ChevronDown,
  Check,
  Loader2,
  Trash2,
  FileText,
  Printer,
  Download,
  AlertTriangle,
  CreditCard,
  Coins,
  Coffee,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ToastNotification, ToastData } from "@/components/ui/toast-notification";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  fetchProducts,
  createOrderItem,
  deductProductStock,
  restoreProductStock,
  Order,
  Product,
} from "@/lib/services/admin";
import { createClient } from "@/lib/supabase/client";

// 100% Clip-Proof React Portal Status Badge Dropdown
function OrderStatusPill({
  status,
  onStatusChange,
}: {
  status: "COMPLETED" | "PENDING" | "CANCELLED";
  onStatusChange: (newStatus: "COMPLETED" | "PENDING" | "CANCELLED") => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleWindowChange = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleWindowChange, true);
    window.addEventListener("resize", handleWindowChange);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleWindowChange, true);
      window.removeEventListener("resize", handleWindowChange);
    };
  }, [isOpen]);

  const config = {
    PENDING: {
      label: "PENDING",
      icon: Clock,
      pillClass: "bg-[#fff7e8] text-[#713105] border-[#cfab71] hover:bg-[#fcf3e3]",
      dotClass: "bg-[#cfab71]",
    },
    COMPLETED: {
      label: "COMPLETED",
      icon: CheckCircle2,
      pillClass: "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100",
      dotClass: "bg-emerald-500",
    },
    CANCELLED: {
      label: "CANCELLED",
      icon: X,
      pillClass: "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100",
      dotClass: "bg-rose-500",
    },
  }[status] || {
    label: status,
    icon: Clock,
    pillClass: "bg-[#fff7e8] text-[#713105] border-[#cfab71]",
    dotClass: "bg-[#cfab71]",
  };

  const Icon = config.icon;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold tracking-wider transition-all cursor-pointer shadow-2xs active:scale-95",
          config.pillClass,
          isOpen && "ring-2 ring-[#cfab71]"
        )}
        title="Click to change order status"
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", config.dotClass)} />
        <Icon className="w-3 h-3 shrink-0" />
        <span>{config.label}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 opacity-60 transition-transform duration-200",
            isOpen && "rotate-180 opacity-100"
          )}
        />
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="w-44 bg-white border border-[#e8decf] rounded-2xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-2.5 py-1 text-[9px] font-bold text-[#7f5e35] uppercase tracking-wider border-b border-[#e8decf]/60 mb-1">
              Update Order Status
            </div>

            <button
              type="button"
              onClick={() => {
                onStatusChange("PENDING");
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer",
                status === "PENDING"
                  ? "bg-[#fcf3e3] text-[#713105] font-bold"
                  : "text-[#341100] hover:bg-[#fff7e8] hover:text-[#713105]"
              )}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#713105] shrink-0" />
                <span>Set Pending</span>
              </div>
              {status === "PENDING" && <Check className="w-3.5 h-3.5 text-[#713105] shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => {
                onStatusChange("COMPLETED");
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer",
                status === "COMPLETED"
                  ? "bg-emerald-50 text-emerald-900 font-bold"
                  : "text-[#341100] hover:bg-[#fff7e8] hover:text-[#713105]"
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Set Completed</span>
              </div>
              {status === "COMPLETED" && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => {
                onStatusChange("CANCELLED");
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer",
                status === "CANCELLED"
                  ? "bg-rose-50 text-rose-900 font-bold"
                  : "text-[#341100] hover:bg-[#fff7e8] hover:text-[#713105]"
              )}
            >
              <div className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Set Cancelled</span>
              </div>
              {status === "CANCELLED" && <Check className="w-3.5 h-3.5 text-rose-700 shrink-0" />}
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

export function SalesPage({ userRole }: { userRole?: "Admin" | "Sales" } = {}) {
  const pathname = usePathname();
  const isSalesPortal = userRole === "Sales" || pathname?.startsWith("/sales");
  const effectiveRole: "Admin" | "Sales" = isSalesPortal ? "Sales" : "Admin";

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Delete Confirm Dialog state
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  // PDF Invoice View Modal state
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Custom Dropdown Open States in Create Modal
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // New Order Form State
  const [customerName, setCustomerName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [pricingTier, setPricingTier] = useState<"RETAIL" | "WHOLESALE">("RETAIL");
  const [quantity, setQuantity] = useState<string | number>(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

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

    // Supabase Realtime WebSocket subscription for live sales & orders
    const supabase = createClient();
    const channelName = `sales-orders-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle click outside for modal dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenModal = () => {
    const defaultProduct = products.length > 0 ? products[0] : null;
    setSelectedProductId(defaultProduct ? defaultProduct.id : "");
    setCustomerName("");
    setQuantity(1);
    setPricingTier("RETAIL");
    setPaymentMethod("Cash on Delivery");
    setIsProductDropdownOpen(false);
    setIsModalOpen(true);
  };

  // Selected Product Calculations
  const currentSelectedProduct = products.find((p) => p.id === selectedProductId) || products[0] || null;
  const availableStock = currentSelectedProduct ? Number(currentSelectedProduct.stock_count || 0) : 0;
  const retailPrice = currentSelectedProduct ? Number(currentSelectedProduct.unit_price || 0) : 0;
  const wholesalePrice =
    currentSelectedProduct?.wholesale_price !== undefined && Number(currentSelectedProduct.wholesale_price) > 0
      ? Number(currentSelectedProduct.wholesale_price)
      : Number((retailPrice * 0.8).toFixed(2));

  const activeUnitPrice = pricingTier === "RETAIL" ? retailPrice : wholesalePrice;
  const parsedQuantity = quantity === "" ? 0 : Number(quantity) || 0;
  const isOverStock = parsedQuantity > availableStock;
  const calculatedTotal = (activeUnitPrice * (parsedQuantity > 0 ? parsedQuantity : 0)).toFixed(2);
  const retailTotal = (retailPrice * (parsedQuantity > 0 ? parsedQuantity : 1)).toFixed(2);
  const wholesaleTotal = (wholesalePrice * (parsedQuantity > 0 ? parsedQuantity : 1)).toFixed(2);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setToast({
        type: "error",
        title: "Validation Error",
        message: "Please enter the customer's full name.",
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
        message: `Quantity (${parsedQuantity}) exceeds maximum available stock (${availableStock} units).`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;

      // Default status is explicitly PENDING with dynamic creator role
      const createdOrder = await createOrder({
        order_number: orderNumber,
        customer_name: customerName.trim(),
        total_amount: Number(calculatedTotal),
        status: "PENDING",
        created_by_role: effectiveRole,
        payment_method: paymentMethod,
        pricing_tier: pricingTier,
      });

      if (createdOrder && currentSelectedProduct) {
        await createOrderItem({
          order_id: createdOrder.id,
          product_id: currentSelectedProduct.id,
          quantity: parsedQuantity,
          unit_price: activeUnitPrice,
        });

        // 1. DEDUCT STOCK & LOG AUDIT ENTRY
        await deductProductStock(
          currentSelectedProduct.id,
          parsedQuantity,
          `Sales Order fulfillment: ${orderNumber} (${parsedQuantity} units for ${customerName.trim()})`
        );
      }

      setIsModalOpen(false);
      setToast({
        type: "success",
        title: "Order Placed Successfully",
        message: `Client order "${orderNumber}" recorded and ${parsedQuantity} units deducted from warehouse stock.`,
      });
      loadData();
    } catch (err: any) {
      console.error("Error creating order:", err);
      setToast({
        type: "error",
        title: "Order Creation Failed",
        message: err.message || "Failed to create client order. Please verify values.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "COMPLETED" | "PENDING" | "CANCELLED") => {
    try {
      const order = orders.find((o) => o.id === id);
      const oldStatus = order?.status;

      // Auto-restore stock if cancelling an active order
      if (newStatus === "CANCELLED" && oldStatus !== "CANCELLED" && order?.order_items) {
        for (const item of order.order_items) {
          if (item.product_id && item.quantity > 0) {
            await restoreProductStock(
              item.product_id,
              item.quantity,
              `Order cancelled: ${order.order_number} (${item.quantity} units returned to warehouse)`
            );
          }
        }
      }

      // Auto-deduct stock if reactivating a cancelled order
      if (oldStatus === "CANCELLED" && newStatus !== "CANCELLED" && order?.order_items) {
        for (const item of order.order_items) {
          if (item.product_id && item.quantity > 0) {
            await deductProductStock(
              item.product_id,
              item.quantity,
              `Order reactivated: ${order.order_number} (${item.quantity} units deducted)`
            );
          }
        }
      }

      await updateOrderStatus(id, newStatus);
      setToast({
        type: "success",
        title: "Order Status Updated",
        message: `Order status changed to ${newStatus}.`,
      });
      loadData();
    } catch (err) {
      console.error("Error updating order status:", err);
      setToast({
        type: "error",
        title: "Status Update Failed",
        message: "Could not update order status in Supabase.",
      });
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteConfirmOrder) return;
    setDeleting(true);
    try {
      // If deleting an order that was not cancelled, return its stock back to inventory
      if (deleteConfirmOrder.status !== "CANCELLED" && deleteConfirmOrder.order_items) {
        for (const item of deleteConfirmOrder.order_items) {
          if (item.product_id && item.quantity > 0) {
            await restoreProductStock(
              item.product_id,
              item.quantity,
              `Order deletion restoration: ${deleteConfirmOrder.order_number} (${item.quantity} units)`
            );
          }
        }
      }

      await deleteOrder(deleteConfirmOrder.id);
      setToast({
        type: "success",
        title: "Order Deleted",
        message: `Order "${deleteConfirmOrder.order_number}" removed and stock restored.`,
      });
      setDeleteConfirmOrder(null);
      loadData();
    } catch (err: any) {
      console.error("Error deleting order:", err);
      setToast({
        type: "error",
        title: "Delete Failed",
        message: err.message || "Could not delete order from database.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!invoiceOrder) return;
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!invoiceOrder) return;
    const originalTitle = document.title;
    document.title = `Invoice_${invoiceOrder.order_number}`;
    window.print();
    document.title = originalTitle;
  };

  const getIssuerDetails = (role?: string) => {
    const r = (role || "").toLowerCase().trim();
    if (r === "admin" || r === "administrator") {
      return { title: "System Administrator", subtitle: "Executive Operations" };
    }
    if (r === "sales" || r === "sales representative") {
      return { title: "Sales Representative", subtitle: "Showroom Commerce" };
    }
    if (r === "inventory" || r === "warehouse") {
      return { title: "Inventory Manager", subtitle: "Warehouse Operations" };
    }
    return { title: "Operations Staff", subtitle: "Mini-ERP Verified" };
  };

  // Filter and Search logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const avgOrderValue =
    orders.length > 0
      ? orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) / orders.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                {isSalesPortal ? "Sales Representative Portal" : "Administrator Portal"}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              {isSalesPortal ? "Sales Orders & Client Quotes" : "Furniture Orders & Client Invoices"}
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              {isSalesPortal
                ? "Create showroom client orders with dynamic retail/wholesale pricing, manage pending quotes, and generate luxury commercial invoices."
                : "Manage showroom client orders, wholesale contractor quotes, payment channels, and live Supabase fulfillments."}
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
              className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 cursor-pointer active:scale-95 shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#cfab71]" />
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
            <Coins className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ₱{totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
          <span className="text-[11px] text-[#7f5e35] font-normal">Fulfilled & settled</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Average Order Value</span>
            <ShoppingCart className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ₱{avgOrderValue.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Per transaction</span>
        </Card>
      </div>

      {/* Orders Data Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold text-[#4f351c] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#713105]" />
              Client Orders & Transactions ({filteredOrders.length})
            </CardTitle>
            <p className="text-[11px] text-[#7f5e35] mt-0.5">
              Live showroom transactions with quick status updates, printable PDF invoices, and payment tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="w-36">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { value: "ALL", label: "All Statuses" },
                  { value: "PENDING", label: "Pending" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "CANCELLED", label: "Cancelled" },
                ]}
                className="py-1.5 px-3 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">UNITS</th>
                <th className="py-3 px-4">TOTAL AMOUNT</th>
                <th className="py-3 px-4">PAYMENT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">INVOICE & MANAGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {loading ? (
                <TableSkeleton columns={7} rows={6} />
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7f5e35]">
                    No client orders found matching your criteria. Click "Create Client Order" to add one.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const paymentDisplay = order.payment_method || "Cash on Delivery";
                  return (
                    <tr key={order.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#341100]">
                        <div className="font-semibold">{order.customer_name}</div>
                        <div className="font-mono text-[10px] text-[#713105]">{order.order_number}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#7f5e35] whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#fff7e8] border border-[#e8decf] font-mono text-xs font-semibold text-[#713105]">
                          {order.quantity || 1} {Number(order.quantity) === 1 ? "unit" : "units"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#341100]">
                        ₱{Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-[#4f351c] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#fff7e8] border border-[#cfab71]/40 text-[11px] font-medium text-[#713105]">
                          <CreditCard className="w-3 h-3 text-[#cfab71]" />
                          {paymentDisplay}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <OrderStatusPill
                          status={order.status}
                          onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInvoiceOrder(order)}
                            className="h-7 border-[#e8decf] bg-[#fff7e8] hover:bg-[#fcf3e3] text-[#713105] text-[11px] gap-1 px-2.5 rounded-lg cursor-pointer active:scale-95"
                            title="View / Download PDF Invoice"
                          >
                            <Download className="w-3 h-3 text-[#cfab71]" />
                            <span>PDF Invoice</span>
                          </Button>

                          <button
                            onClick={() => setDeleteConfirmOrder(order)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Custom Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmOrder}
        onClose={() => setDeleteConfirmOrder(null)}
        onConfirm={handleDeleteOrder}
        title="Delete Client Order"
        description={`Are you sure you want to delete order "${deleteConfirmOrder?.order_number}" for ${deleteConfirmOrder?.customer_name}? This action cannot be undone.`}
        confirmText="Delete Order"
        variant="destructive"
        loading={deleting}
      />

      {/* ========================================================================= */}
      {/* 2. ADVANCED CREATE ORDER MODAL                                            */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#fffdfa] border border-[#e8decf] shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative my-8">
            <div className="bg-[#fff7e8] border-b border-[#e8decf] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#713105] text-[#fff7e8] flex items-center justify-center shadow-xs">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#341100] tracking-tight">
                    Create Order (Administrator)
                  </h2>
                  <p className="text-[11px] text-[#7f5e35]">
                    Real-time stock deduction from Supabase catalog
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#e8decf]/60 flex items-center justify-center text-[#7f5e35] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Customer Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Acme Corporation / John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:bg-white"
                />
              </div>

              <div className="relative" ref={productDropdownRef}>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Select Product *
                </label>

                {products.length === 0 ? (
                  <div className="p-2.5 bg-[#fff7e8] border border-[#e8decf] rounded-xl text-[11px] text-[#7f5e35]">
                    No furniture items in catalog.
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProductDropdownOpen(!isProductDropdownOpen);
                      }}
                      className="w-full bg-[#fff7e8] border border-[#e8decf] hover:border-[#cfab71] text-xs text-[#341100] rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all cursor-pointer shadow-2xs text-left"
                    >
                      {currentSelectedProduct ? (
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-[#341100] truncate">
                            {currentSelectedProduct.name}
                          </span>
                          <span className="font-mono text-[10px] bg-white text-[#713105] border border-[#cfab71]/50 px-1.5 py-0.5 rounded-md shrink-0">
                            ({currentSelectedProduct.sku})
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

                    {isProductDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#e8decf] rounded-2xl shadow-xl p-1.5 max-h-52 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-100">
                        {products.map((p) => {
                          const isSelected = p.id === currentSelectedProduct?.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedProductId(p.id);
                                setIsProductDropdownOpen(false);
                              }}
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
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-[#713105] font-bold">
                                  ₱{Number(p.unit_price).toFixed(2)}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#713105] shrink-0" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {currentSelectedProduct && (
                <div className="p-3.5 rounded-2xl bg-[#fff7e8] border border-[#e8decf] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-[#7f5e35] uppercase tracking-wider block">
                        WAREHOUSE STOCK
                      </span>
                      <strong className="text-[#341100] text-xs font-bold">
                        {availableStock} units available
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-[#7f5e35] uppercase tracking-wider block">
                        PRICING TIER SUMMARY
                      </span>
                      <span className="text-[11px] text-[#7f5e35] font-medium">
                        Retail: ₱{retailPrice.toFixed(2)} | Wholesale: ₱{wholesalePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div
                      onClick={() => setPricingTier("RETAIL")}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative ${
                        pricingTier === "RETAIL"
                          ? "bg-white border-[#341100] shadow-xs"
                          : "bg-white/60 border-[#e8decf] hover:border-[#cfab71]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#4f351c] uppercase tracking-wider">
                          RETAIL TIER
                        </span>
                        {pricingTier === "RETAIL" && (
                          <span className="bg-[#341100] text-[#fff7e8] text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[#341100]">
                        ₱{retailPrice.toFixed(2)}{" "}
                        <span className="text-[10px] text-[#7f5e35] font-normal">/ unit</span>
                      </div>
                      <div className="text-[10px] text-[#7f5e35] mt-1 font-medium">
                        Total: ₱{retailTotal}
                      </div>
                    </div>

                    <div
                      onClick={() => setPricingTier("WHOLESALE")}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative ${
                        pricingTier === "WHOLESALE"
                          ? "bg-white border-[#047857] shadow-xs"
                          : "bg-white/60 border-[#e8decf] hover:border-[#cfab71]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#047857] uppercase tracking-wider">
                          WHOLESALE TIER
                        </span>
                        {pricingTier === "WHOLESALE" && (
                          <span className="bg-[#047857] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[#047857]">
                        ₱{wholesalePrice.toFixed(2)}{" "}
                        <span className="text-[10px] text-[#7f5e35] font-normal">/ unit</span>
                      </div>
                      <div className="text-[10px] text-[#047857] mt-1 font-medium">
                        Total: ₱{wholesaleTotal}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Quantity (Max {availableStock}) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={`text-xs rounded-xl font-bold ${
                      isOverStock
                        ? "bg-red-50/50 border-red-500 text-red-900 focus:border-red-600 ring-1 ring-red-400"
                        : "bg-[#fff7e8] border-[#e8decf] text-[#341100] focus:bg-white"
                    }`}
                  />
                  {isOverStock && (
                    <div className="flex items-start gap-1 text-[11px] text-red-700 font-semibold mt-1 animate-in fade-in">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                      <span>
                        Quantity ({parsedQuantity}) exceeds max available stock ({availableStock} units)
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Payment Method
                  </label>
                  <CustomSelect
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    options={[
                      { value: "Cash on Delivery", label: "Cash on Delivery" },
                      { value: "Bank Transfer", label: "Bank Transfer" },
                      { value: "Credit Card", label: "Credit Card" },
                      { value: "GCash / Maya", label: "GCash / Maya" },
                    ]}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#cfab71] shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#713105] uppercase tracking-wider block">
                    CALCULATED ORDER TOTAL ({pricingTier} TIER)
                  </span>
                  <div className="text-2xl font-black text-[#341100] mt-0.5 tracking-tight">
                    ₱{calculatedTotal}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#341100] block">
                    {parsedQuantity}× units
                  </span>
                  <span className="text-[11px] text-[#7f5e35] font-mono">
                    @ ₱{activeUnitPrice.toFixed(2)} / unit
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-[#e8decf] text-[#7f5e35] hover:bg-[#fff7e8] text-xs rounded-xl px-5 py-2 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || isOverStock || parsedQuantity <= 0}
                  className="bg-[#713105] text-[#fff7e8] hover:bg-[#341100] text-xs font-semibold rounded-xl px-5 py-2 cursor-pointer gap-2 disabled:opacity-50 shadow-xs active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#cfab71]" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#cfab71]" />
                      Save & Process Order
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CLEAN REFERENCE SALES ORDER INVOICE MODAL                              */}
      {/* ========================================================================= */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#e8decf] shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative my-8">
            {/* Modal Header Bar */}
            <div className="bg-[#fff7e8] border-b border-[#e8decf] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#713105]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#713105]" />
                <span className="text-xs font-bold text-[#341100] uppercase tracking-wider">
                  SALES ORDER INVOICE PREVIEW
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="h-8 bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] text-xs font-semibold px-3.5 rounded-xl gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-[#cfab71]" />
                  Print Invoice
                </Button>
                <Button
                  type="button"
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="h-8 border-[#cfab71] bg-white text-[#713105] hover:bg-[#fff7e8] text-xs font-semibold px-3.5 rounded-xl gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#713105]" />
                  Download PDF
                </Button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="w-8 h-8 rounded-full hover:bg-[#e8decf]/60 flex items-center justify-center text-[#7f5e35] transition-colors cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Invoice Document Body */}
            <div className="p-8 space-y-6 text-[#341100] bg-white">
              {/* Top Letterhead */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#713105] text-[#fff7e8] flex items-center justify-center shadow-xs">
                      <Coffee className="w-5 h-5 text-[#cfab71]" />
                    </div>
                    <span className="text-xl font-bold text-[#341100] tracking-tight">
                      Mini-ERP Systems
                    </span>
                  </div>
                  <p className="text-xs text-[#7f5e35] font-medium">
                    Enterprise Commerce & Inventory Platform
                  </p>
                  <p className="text-[11px] text-[#7f5e35]">
                    100 Enterprise Way, Suite 400 • Commerce City
                  </p>
                </div>

                <div className="text-right space-y-1.5">
                  <div className="text-xs font-mono font-bold text-[#713105]">
                    #{invoiceOrder.order_number}
                  </div>
                  <h1 className="text-2xl font-black text-[#341100] tracking-tight">
                    INVOICE
                  </h1>
                  <div>
                    {invoiceOrder.status === "COMPLETED" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        PAID & FULFILLED
                      </span>
                    ) : invoiceOrder.status === "PENDING" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        PENDING PAYMENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[10px] font-bold tracking-wider">
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        CANCELLED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#e8decf]" />

              {/* 4-Column Metadata Card */}
              <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-[#fffdfa] border border-[#e8decf] text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#7f5e35] uppercase tracking-wider block mb-1">
                    BILLED TO
                  </span>
                  <div className="font-bold text-[#341100]">{invoiceOrder.customer_name}</div>
                  <div className="text-[10px] text-[#7f5e35] mt-0.5">Verified Customer</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#7f5e35] uppercase tracking-wider block mb-1">
                    DATE ISSUED
                  </span>
                  <div className="font-bold text-[#341100]">
                    {new Date(invoiceOrder.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-[10px] text-[#7f5e35] mt-0.5">Due upon receipt</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#7f5e35] uppercase tracking-wider block mb-1">
                    PAYMENT METHOD
                  </span>
                  <div className="font-bold text-[#713105]">
                    {invoiceOrder.payment_method || "Cash on Delivery"}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Standard Gateway</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#7f5e35] uppercase tracking-wider block mb-1">
                    ISSUED BY
                  </span>
                  <div className="font-bold text-[#341100]">
                    {getIssuerDetails(invoiceOrder.created_by_role).title}
                  </div>
                  <div className="text-[10px] text-[#7f5e35] mt-0.5">
                    {getIssuerDetails(invoiceOrder.created_by_role).subtitle}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="rounded-2xl border border-[#e8decf] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[10px] uppercase font-bold text-[#7f5e35] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">ITEM DESCRIPTION</th>
                      <th className="py-3 px-4 text-center">QTY</th>
                      <th className="py-3 px-4 text-right">UNIT RATE</th>
                      <th className="py-3 px-4 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8decf]/60">
                    {invoiceOrder.order_items && invoiceOrder.order_items.length > 0 ? (
                      invoiceOrder.order_items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#341100]">
                              {item.products?.name || "Handcrafted Premium Product Catalog Item"}
                            </div>
                            <div className="text-[10px] font-mono text-[#7f5e35]">
                              SKU: {item.products?.sku || "SKU-ERP-4479"}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#341100]">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 px-4 text-right text-[#7f5e35] font-mono">
                            ₱{Number(item.unit_price).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#341100]">
                            ₱{(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#341100]">
                            Handcrafted Premium Product Catalog Item
                          </div>
                          <div className="text-[10px] font-mono text-[#7f5e35]">
                            SKU: {invoiceOrder.order_number}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#341100]">
                          {invoiceOrder.quantity || 1}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#7f5e35] font-mono">
                          ₱{(Number(invoiceOrder.total_amount) / (invoiceOrder.quantity || 1)).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#341100]">
                          ₱{Number(invoiceOrder.total_amount).toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Terms & Financial Totals */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2">
                <div className="max-w-xs space-y-1">
                  <span className="text-xs font-bold text-[#341100] block">
                    Terms & Conditions:
                  </span>
                  <p className="text-[11px] text-[#7f5e35] leading-relaxed">
                    Thank you for your business. For billing inquiries or invoice reconciliation, please contact support@minierp.com.
                  </p>
                </div>

                <div className="w-full sm:w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-[#7f5e35]">
                    <span>Subtotal (Net):</span>
                    <span className="font-mono font-bold text-[#341100]">
                      ₱{(Number(invoiceOrder.total_amount) * 0.88).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#7f5e35]">
                    <span>Estimated Tax (12%):</span>
                    <span className="font-mono font-bold text-[#341100]">
                      ₱{(Number(invoiceOrder.total_amount) * 0.12).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-[#e8decf] pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#341100]">Grand Total:</span>
                    <span className="text-xl font-black text-[#341100]">
                      ₱{Number(invoiceOrder.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#e8decf]" />

              {/* Security Audit Footer */}
              <div className="text-center text-[10px] text-[#7f5e35]/80">
                Mini-ERP Commercial Invoice • Generated securely via Supabase PostgreSQL Cloud
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesPage;
