"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, Plus, ShoppingCart, Clock, CheckCircle2, DollarSign, Download, RefreshCw, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchOrders, createOrder, updateOrderStatus, Order } from "@/lib/services/admin";

export function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Order Form State
  const [newOrder, setNewOrder] = useState({
    customer_name: "",
    total_amount: 150.00,
    status: "PENDING" as "COMPLETED" | "PENDING" | "CANCELLED",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error("Error loading orders from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customer_name) return;

    setSubmitting(true);
    try {
      const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
      await createOrder({
        order_number: orderNumber,
        customer_name: newOrder.customer_name,
        total_amount: Number(newOrder.total_amount),
        status: newOrder.status,
        created_by_role: "Admin",
      });

      setIsModalOpen(false);
      setNewOrder({
        customer_name: "",
        total_amount: 150.00,
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
              Sales & Orders
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              View total sales transactions, pending orders, customer invoices, and order histories live from Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
              className="border-[#e8decf] text-[#713105] hover:bg-[#fff7e8] rounded-xl text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              Create Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">
            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Completed orders</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">{pendingCount}</div>
          <span className="text-[11px] text-[#713105] font-semibold">Requires processing</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{completedCount}</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Fulfilled & delivered</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Avg Order Value</span>
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
            Recent Orders & Transaction History ({filteredOrders.length})
          </CardTitle>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Search order # or customer..."
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
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Role Created</th>
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
                    No orders found. Click "Create Order" to add one.
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
                        className="bg-[#fff7e8] border border-[#e8decf] text-[11px] text-[#4f351c] rounded-lg p-1.5 outline-none font-semibold"
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
              <CardTitle className="text-sm font-bold text-[#341100]">Create New Sales Order</CardTitle>
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
                  Customer Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Cafe Metro & Co."
                  value={newOrder.customer_name}
                  onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Total Order Amount ($) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={newOrder.total_amount}
                  onChange={(e) => setNewOrder({ ...newOrder, total_amount: Number(e.target.value) })}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Initial Status
                </label>
                <select
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value as any })}
                  className="w-full bg-[#fff7e8] border border-[#e8decf] text-xs text-[#341100] rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-[#e8decf] text-[#7f5e35] text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] text-xs font-semibold rounded-xl"
                >
                  {submitting ? "Creating..." : "Create Order"}
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
