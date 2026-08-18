"use client";

import React, { useState } from "react";
import { Search, Filter, Plus, ShoppingCart, Clock, CheckCircle2, DollarSign, Download, X, Check, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const initialOrders = [
  {
    id: "#ORD-1042",
    customer: "John Miller",
    date: "Aug 08, 2026",
    items: 4,
    total: "$284.00",
    payment: "Credit Card",
    status: "Fulfilled",
  },
  {
    id: "#ORD-1041",
    customer: "Sarah Jenkins",
    date: "Aug 08, 2026",
    items: 2,
    total: "$112.50",
    payment: "PayPal",
    status: "Pending",
  },
  {
    id: "#ORD-1040",
    customer: "Robert Davis",
    date: "Aug 07, 2026",
    items: 1,
    total: "$89.00",
    payment: "Bank Transfer",
    status: "Fulfilled",
  },
  {
    id: "#ORD-1039",
    customer: "Emily Watson",
    date: "Aug 07, 2026",
    items: 5,
    total: "$410.00",
    payment: "Credit Card",
    status: "Pending",
  },
  {
    id: "#ORD-1038",
    customer: "Michael Brown",
    date: "Aug 06, 2026",
    items: 2,
    total: "$64.00",
    payment: "Cash on Delivery",
    status: "Cancelled",
  },
];

export function SalesOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Order Form state
  const [customerName, setCustomerName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("Handcrafted Ceramic Vase");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    const newOrder = {
      id: `#ORD-${1043 + orders.length}`,
      customer: customerName,
      date: "Aug 09, 2026",
      items: Number(quantity),
      total: `$${(Number(quantity) * 48).toFixed(2)}`,
      payment: paymentMethod,
      status: "Pending",
    };

    setOrders([newOrder, ...orders]);
    setIsModalOpen(false);
    setCustomerName("");
    setQuantity(1);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Full Read/Write Workspace
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Sales & Orders
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Core workspace: Add new sales orders, input customer details, select products, and process invoices.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Sales Order
          </Button>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">$42,850.00</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">This month</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#713105] mt-2">12</div>
          <span className="text-[11px] text-[#713105] font-semibold">Requires processing</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">340</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Fulfilled & delivered</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Avg Order Value</span>
            <ShoppingCart className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">$126.00</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Per transaction</span>
        </Card>
      </div>

      {/* Orders Data Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            Recent Sales Orders & Invoices
          </CardTitle>

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
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Invoice Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{order.id}</td>
                  <td className="py-3.5 px-4 font-medium text-[#341100]">{order.customer}</td>
                  <td className="py-3.5 px-4 text-[#7f5e35]">{order.date}</td>
                  <td className="py-3.5 px-4 text-[#4f351c]">{order.items} items</td>
                  <td className="py-3.5 px-4 font-semibold text-[#341100]">{order.total}</td>
                  <td className="py-3.5 px-4 text-[#7f5e35]">{order.payment}</td>
                  <td className="py-3.5 px-4">
                    {order.status === "Fulfilled" && (
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] uppercase tracking-wide">
                        Fulfilled
                      </Badge>
                    )}
                    {order.status === "Pending" && (
                      <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[11px] uppercase tracking-wide">
                        Pending
                      </Badge>
                    )}
                    {order.status === "Cancelled" && (
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-[11px] uppercase tracking-wide">
                        Cancelled
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="ghost" size="sm" className="text-[#7f5e35] hover:text-[#341100] gap-1 text-xs">
                      <Download className="w-3.5 h-3.5" />
                      PDF Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add New Sales Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e8decf] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#e8decf] flex items-center justify-between bg-[#fff7e8]">
              <h2 className="font-bold text-sm text-[#341100] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#713105]" />
                Create New Sales Order
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#7f5e35] hover:text-[#341100]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 space-y-4 text-xs text-[#341100]">
              <div>
                <label className="block font-medium text-[#4f351c] mb-1">Customer Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4f351c] mb-1">Select Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full h-9 bg-[#fff7e8] border border-[#e8decf] rounded-xl px-3 text-xs text-[#341100] focus:outline-hidden"
                >
                  <option value="Handcrafted Ceramic Vase">Handcrafted Ceramic Vase ($48.00)</option>
                  <option value="Minimalist Walnut Table Lamp">Minimalist Walnut Table Lamp ($125.00)</option>
                  <option value="Stainless Steel Espresso Tamper">Stainless Steel Espresso Tamper ($34.50)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-9 bg-[#fff7e8] border border-[#e8decf] rounded-xl px-3 text-xs text-[#341100] focus:outline-hidden"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#e8decf]">
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
                  className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] text-xs font-semibold rounded-xl px-4 py-2"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Process Sales Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesOrdersPage;
