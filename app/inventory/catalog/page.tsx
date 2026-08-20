"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createStockLog,
  Product,
} from "@/lib/services/admin";

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const filterQuery = searchParams.get("filter");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState(filterQuery === "low_stock" ? "low_stock" : "all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Product Form State
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

  // Edit Product Form State
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
      console.error("Error loading products catalog from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filterQuery === "low_stock") {
      setActiveTabFilter("low_stock");
    }
  }, [filterQuery]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku || !newProduct.name) return;

    setSubmitting(true);
    try {
      const stockCount = Number(newProduct.stock_count) || 0;
      const unitPrice = Number(newProduct.unit_price) || 0;
      const reorderLevel = Number(newProduct.reorder_level) || 0;

      const status =
        stockCount === 0
          ? "OUT OF STOCK"
          : stockCount <= reorderLevel
          ? "LOW STOCK"
          : "IN STOCK";

      const created = await createProduct({
        sku: newProduct.sku,
        name: newProduct.name,
        category: newProduct.category,
        stock_count: stockCount,
        unit_price: unitPrice,
        reorder_level: reorderLevel,
        status,
      });

      if (created && stockCount > 0) {
        await createStockLog({
          product_id: created.id,
          change_type: "ADDITION",
          quantity: stockCount,
          reason: `Catalog intake: ${newProduct.name} (${stockCount} units)`,
        });
      }

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
      console.error("Error creating product in Supabase:", err);
      alert("Failed to create product. Ensure the SKU code is unique.");
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

      const previousProd = products.find((p) => p.id === editingProduct.id);
      const stockDiff = stockCount - (previousProd ? previousProd.stock_count : 0);

      const status =
        stockCount === 0
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

      if (stockDiff !== 0) {
        await createStockLog({
          product_id: editingProduct.id,
          change_type: stockDiff > 0 ? "ADDITION" : "ADJUSTMENT",
          quantity: stockDiff,
          reason: `Stock adjustment: updated from ${previousProd?.stock_count || 0} to ${stockCount} units`,
        });
      }

      setIsEditModalOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (err) {
      console.error("Error updating product details in Supabase:", err);
      alert("Failed to update product details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this furniture piece from the catalog?")) return;
    try {
      await deleteProduct(id);
      loadData();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTabFilter === "low_stock") {
      return Number(product.stock_count || 0) <= Number(product.reorder_level || 0);
    }
    return true;
  });

  const lowStockCount = products.filter(
    (p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)
  ).length;

  return (
    <div className="space-y-6">
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
              Products & Catalog
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Primary workspace: Add new SKUs, edit stock counts, update categories, adjust unit pricing, and maintain catalog assets in Supabase.
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
              className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add New Piece / SKU
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e8decf] pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setActiveTabFilter("all")}
            className={`text-xs font-semibold rounded-xl px-4 py-2 cursor-pointer ${
              activeTabFilter === "all"
                ? "bg-[#713105] text-[#fff7e8]"
                : "text-[#7f5e35] hover:bg-[#fff7e8]"
            }`}
          >
            All Catalog SKUs ({products.length})
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveTabFilter("low_stock")}
            className={`text-xs font-semibold rounded-xl px-4 py-2 gap-1.5 cursor-pointer ${
              activeTabFilter === "low_stock"
                ? "bg-[#713105] text-[#fff7e8]"
                : "text-amber-800 hover:bg-amber-50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Alerts ({lowStockCount})
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
          <Input
            placeholder="Search piece name, category, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Piece Name</th>
                <th className="py-3 px-4">Collection</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#7f5e35]">
                    Loading live catalog products from Supabase...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#7f5e35]">
                    No furniture models found matching criteria. Click &quot;Add New Piece&quot; to insert one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{product.sku}</td>
                    <td className="py-3.5 px-4 font-medium text-[#341100]">{product.name}</td>
                    <td className="py-3.5 px-4 text-[#7f5e35]">{product.category}</td>
                    <td className="py-3.5 px-4 font-bold text-[#341100]">
                      {product.stock_count} units
                    </td>
                    <td className="py-3.5 px-4 text-[#7f5e35] font-mono">
                      {product.reorder_level} units
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#713105]">
                      ${Number(product.unit_price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {product.stock_count === 0 ? (
                        <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] uppercase font-bold tracking-wider">
                          Out of Stock
                        </Badge>
                      ) : product.stock_count <= product.reorder_level ? (
                        <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px] uppercase font-bold tracking-wider">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] uppercase font-bold tracking-wider">
                          In Stock
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(product)}
                          className="text-[#713105] hover:bg-[#fff7e8] p-1.5 h-auto rounded-lg cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:bg-red-50 p-1.5 h-auto rounded-lg cursor-pointer"
                          title="Delete SKU"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add New SKU Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-[#e8decf] shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <CardHeader className="p-5 bg-[#fff7e8] border-b border-[#e8decf] flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-[#341100] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#713105]" />
                Add New Furniture Piece
              </CardTitle>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#7f5e35] hover:text-[#341100] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>

            <form onSubmit={handleCreateProduct}>
              <CardContent className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#4f351c] block mb-1">
                    Furniture Piece Name *
                  </label>
                  <Input
                    placeholder="e.g. Nordic Solid Oak Coffee Table"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      SKU Code *
                    </label>
                    <Input
                      placeholder="e.g. LR-OAK-042"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      required
                      className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      Collection / Category *
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full bg-[#fff7e8] border border-[#e8decf] text-xs text-[#341100] rounded-xl p-2 outline-none font-medium"
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
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      Unit Price ($) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.unit_price}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setNewProduct({ ...newProduct, unit_price: e.target.value })}
                      required
                      className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      Stock Count *
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newProduct.stock_count}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_count: e.target.value })}
                      required
                      className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      Reorder Lvl *
                    </label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={newProduct.reorder_level}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                      required
                      className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8decf]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="border-[#e8decf] text-[#7f5e35] hover:bg-[#fff7e8] rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] rounded-xl text-xs font-semibold"
                  >
                    {submitting ? "Adding..." : "Add to Catalog"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Piece Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border-[#e8decf] shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <CardHeader className="p-5 bg-[#fff7e8] border-b border-[#e8decf] flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-[#341100] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#713105]" />
                Edit Furniture Details
              </CardTitle>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#7f5e35] hover:text-[#341100] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>

            <form onSubmit={handleUpdateProduct}>
              <CardContent className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#4f351c] block mb-1">
                    Furniture Piece Name *
                  </label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      SKU Code *
                    </label>
                    <Input
                      value={editingProduct.sku}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      required
                      className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      Collection / Category *
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full bg-[#fff7e8] border border-[#e8decf] text-xs text-[#341100] rounded-xl p-2 outline-none font-medium"
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
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      Unit Price ($) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.unit_price}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unit_price: e.target.value })}
                      required
                      className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      Stock Count *
                    </label>
                    <Input
                      type="number"
                      value={editingProduct.stock_count}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock_count: e.target.value })}
                      required
                      className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#4f351c] block mb-1">
                      Reorder Lvl *
                    </label>
                    <Input
                      type="number"
                      value={editingProduct.reorder_level}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setEditingProduct({ ...editingProduct, reorder_level: e.target.value })}
                      required
                      className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8decf]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    className="border-[#e8decf] text-[#7f5e35] hover:bg-[#fff7e8] rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] rounded-xl text-xs font-semibold"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
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

export default function ProductsCatalogPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[#7f5e35]">Loading Catalog...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
