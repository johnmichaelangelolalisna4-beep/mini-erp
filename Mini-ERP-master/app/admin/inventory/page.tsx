"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter, Plus, Package, AlertTriangle, Layers, Trash2, Edit2, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product } from "@/lib/services/admin";

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New product form state with empty string allowed to prevent sticky 0
  const [newProduct, setNewProduct] = useState<{
    sku: string;
    name: string;
    category: string;
    stock_count: string | number;
    unit_price: string | number;
    reorder_level: string | number;
  }>({
    sku: "",
    name: "",
    category: "Living Room",
    stock_count: "",
    unit_price: "",
    reorder_level: "",
  });

  // Editing product state
  const [editingProduct, setEditingProduct] = useState<{
    id: string;
    sku: string;
    name: string;
    category: string;
    stock_count: string | number;
    unit_price: string | number;
    reorder_level: string | number;
  } | null>(null);

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
      const stockCount = Number(newProduct.stock_count) || 0;
      const unitPrice = Number(newProduct.unit_price) || 0;
      const reorderLevel = Number(newProduct.reorder_level) || 0;

      const status = stockCount === 0 
        ? "OUT OF STOCK" 
        : stockCount <= reorderLevel 
        ? "LOW STOCK" 
        : "IN STOCK";

      await createProduct({
        sku: newProduct.sku,
        name: newProduct.name,
        category: newProduct.category,
        stock_count: stockCount,
        unit_price: unitPrice,
        reorder_level: reorderLevel,
        status,
      });

      setIsModalOpen(false);
      setNewProduct({
        sku: "",
        name: "",
        category: "Living Room",
        stock_count: "",
        unit_price: "",
        reorder_level: "",
      });
      loadData();
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create product. Make sure SKU is unique.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct({
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category || "Living Room",
      stock_count: product.stock_count,
      unit_price: product.unit_price,
      reorder_level: product.reorder_level,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.sku || !editingProduct.name) return;

    setSubmitting(true);
    try {
      const stockCount = Number(editingProduct.stock_count) || 0;
      const unitPrice = Number(editingProduct.unit_price) || 0;
      const reorderLevel = Number(editingProduct.reorder_level) || 0;

      const status = stockCount === 0 
        ? "OUT OF STOCK" 
        : stockCount <= reorderLevel 
        ? "LOW STOCK" 
        : "IN STOCK";

      await updateProduct(editingProduct.id, {
        sku: editingProduct.sku,
        name: editingProduct.name,
        category: editingProduct.category,
        stock_count: stockCount,
        unit_price: unitPrice,
        reorder_level: reorderLevel,
        status,
      });

      setIsEditModalOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this furniture SKU?")) return;
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
              Furniture Catalog & Inventory
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Manage furniture collections, showroom inventory, woodcraft stock levels, categories, and restock thresholds in Supabase.
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
              onClick={() => setIsModalOpen(true)}
              className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Furniture Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Furniture SKUs</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{products.length}</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Active designs in catalog</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Collections / Categories</span>
            <Layers className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{categoriesCount}</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Living, Dining, Bedroom etc.</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">{lowStockCount}</div>
          <span className="text-[11px] text-red-700 font-semibold">Requires restock / craft</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Units in Stock</span>
            <Package className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{totalStockUnits.toLocaleString()}</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Showroom & warehouse units</span>
        </Card>
      </div>

      {/* Products Data Table Section */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            Furniture Collection & Stock Status ({filteredProducts.length})
          </CardTitle>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Filter by piece name, collection, or SKU..."
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
                <th className="py-3 px-4">Furniture Piece</th>
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
                    Loading furniture catalog from Supabase...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7f5e35]">
                    No furniture items found. Click "Add Furniture Item" to register your first piece.
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
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#4f351c] font-semibold">{product.sku}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#341100]">
                      {product.stock_count} units
                      <div className="text-[10px] text-[#7f5e35] font-normal">Reorder threshold: {product.reorder_level}</div>
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
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(product)}
                          className="h-8 w-8 text-[#713105] hover:text-[#341100] hover:bg-[#fff7e8] rounded-lg cursor-pointer transition-all active:scale-95"
                          title="Edit Furniture Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg cursor-pointer transition-all active:scale-95"
                          title="Delete Furniture SKU"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
              <CardTitle className="text-sm font-bold text-[#341100]">Add New Furniture Piece</CardTitle>
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
                  placeholder="e.g. OAK-1001, SOFA-202"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Furniture Piece Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Nordic Solid Oak Dining Table 6-Seater"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Category / Collection
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-[#fff7e8] border border-[#e8decf] text-xs text-[#341100] rounded-xl p-2.5 outline-none font-medium cursor-pointer"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Dining & Kitchen">Dining & Kitchen</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Office & Workspace">Office & Workspace</option>
                    <option value="Outdoor & Patio">Outdoor & Patio</option>
                    <option value="Lighting & Decor">Lighting & Decor</option>
                    <option value="Storage & Cabinets">Storage & Cabinets</option>
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
                    placeholder="e.g. 450.00"
                    value={newProduct.unit_price}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setNewProduct({ ...newProduct, unit_price: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Stock Units in Stock *
                  </label>
                  <Input
                    type="number"
                    required
                    placeholder="e.g. 15"
                    value={newProduct.stock_count}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_count: e.target.value })}
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
                    placeholder="e.g. 5"
                    value={newProduct.reorder_level}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>
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
                  {submitting ? "Saving..." : "Save Furniture Piece"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-[#e8decf] shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <CardHeader className="bg-[#fff7e8] border-b border-[#e8decf] p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#341100] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#713105]" />
                Edit Furniture Details
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="h-8 w-8 text-[#7f5e35]"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleUpdateProduct} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  SKU Code *
                </label>
                <Input
                  required
                  placeholder="e.g. OAK-1001, SOFA-202"
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Furniture Piece Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Nordic Solid Oak Dining Table 6-Seater"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Category / Collection
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-[#fff7e8] border border-[#e8decf] text-xs text-[#341100] rounded-xl p-2.5 outline-none font-medium cursor-pointer"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Dining & Kitchen">Dining & Kitchen</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Office & Workspace">Office & Workspace</option>
                    <option value="Outdoor & Patio">Outdoor & Patio</option>
                    <option value="Lighting & Decor">Lighting & Decor</option>
                    <option value="Storage & Cabinets">Storage & Cabinets</option>
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
                    placeholder="e.g. 450.00"
                    value={editingProduct.unit_price}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit_price: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Stock Units in Stock *
                  </label>
                  <Input
                    type="number"
                    required
                    placeholder="e.g. 15"
                    value={editingProduct.stock_count}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_count: e.target.value })}
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
                    placeholder="e.g. 5"
                    value={editingProduct.reorder_level}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditingProduct({ ...editingProduct, reorder_level: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="border-[#e8decf] text-[#7f5e35] text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] text-xs font-semibold rounded-xl cursor-pointer gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {submitting ? "Saving..." : "Update Furniture Piece"}
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
