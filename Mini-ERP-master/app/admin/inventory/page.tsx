"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, Plus, Package, AlertTriangle, Layers, MoreHorizontal, Trash2, X, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchProducts, createProduct, deleteProduct, Product } from "@/lib/services/admin";

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "Coffee Beans",
    stock_count: 50,
    unit_price: 25.00,
    reorder_level: 10,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku || !newProduct.name) return;

    setSubmitting(true);
    try {
      const status = newProduct.stock_count === 0 
        ? "OUT OF STOCK" 
        : newProduct.stock_count <= newProduct.reorder_level 
        ? "LOW STOCK" 
        : "IN STOCK";

      await createProduct({
        sku: newProduct.sku,
        name: newProduct.name,
        category: newProduct.category,
        stock_count: Number(newProduct.stock_count),
        unit_price: Number(newProduct.unit_price),
        reorder_level: Number(newProduct.reorder_level),
        status,
      });

      setIsModalOpen(false);
      setNewProduct({
        sku: "",
        name: "",
        category: "Coffee Beans",
        stock_count: 50,
        unit_price: 25.00,
        reorder_level: 10,
      });
      loadData();
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create product. Make sure SKU is unique.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      loadData();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock_count || 0), 0);
  const lowStockCount = products.filter((p) => p.stock_count <= p.reorder_level).length;
  const categoriesCount = new Set(products.map((p) => p.category)).size;

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
              Inventory & Products
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Manage product catalogue, real-time stock levels, categories, and stock reorders in Supabase.
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
              Add New Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Products</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{products.length}</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Active SKUs</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Categories</span>
            <Layers className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{categoriesCount}</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Product groupings</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">{lowStockCount}</div>
          <span className="text-[11px] text-red-700 font-semibold">Requires reorder</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Stock Units</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{totalStockUnits.toLocaleString()}</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Units in warehouse</span>
        </Card>
      </div>

      {/* Products Data Table Section */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            Product Catalog & Stock Status ({filteredProducts.length})
          </CardTitle>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Filter by product name, category, or SKU..."
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
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7f5e35]">
                    Loading products from Supabase...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7f5e35]">
                    No products found. Click "Add New Product" to create one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#341100]">
                      {product.name}
                      <div className="text-[10px] text-[#7f5e35] font-normal">{product.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#7f5e35] font-normal">{product.category}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#4f351c]">{product.sku}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#341100]">
                      {product.stock_count} units
                      <div className="text-[10px] text-[#7f5e35] font-normal">Reorder level: {product.reorder_level}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#341100]">
                      ${Number(product.unit_price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {product.stock_count > product.reorder_level && (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                          IN STOCK
                        </Badge>
                      )}
                      {product.stock_count > 0 && product.stock_count <= product.reorder_level && (
                        <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                          LOW STOCK
                        </Badge>
                      )}
                      {product.stock_count === 0 && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                          OUT OF STOCK
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-[#e8decf] shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <CardHeader className="bg-[#fff7e8] border-b border-[#e8decf] p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#341100]">Add New Product SKU</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 text-[#7f5e35]"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCreateProduct} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  SKU Code *
                </label>
                <Input
                  required
                  placeholder="e.g. SKU-1006"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Product Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Organic Colombian Medium Roast"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-[#fff7e8] border border-[#e8decf] text-xs text-[#341100] rounded-xl p-2.5 outline-none"
                  >
                    <option value="Coffee Beans">Coffee Beans</option>
                    <option value="Dairy & Alternatives">Dairy & Alternatives</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Syrups & Flavors">Syrups & Flavors</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Unit Price ($) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.unit_price}
                    onChange={(e) => setNewProduct({ ...newProduct, unit_price: Number(e.target.value) })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Stock Quantity *
                  </label>
                  <Input
                    type="number"
                    required
                    value={newProduct.stock_count}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_count: Number(e.target.value) })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Reorder Threshold *
                  </label>
                  <Input
                    type="number"
                    required
                    value={newProduct.reorder_level}
                    onChange={(e) => setNewProduct({ ...newProduct, reorder_level: Number(e.target.value) })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>
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
                  {submitting ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
