"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
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
  CheckCircle2,
  Loader2,
  Upload,
  Check,
  LayoutGrid,
  List,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ToastNotification, ToastData } from "@/components/ui/toast-notification";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createStockLog,
  compressImageTo1080p,
  uploadProductImage,
  Product,
} from "@/lib/services/admin";
import { createClient } from "@/lib/supabase/client";

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const filterQuery = searchParams.get("filter");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState(filterQuery === "low_stock" ? "low_stock" : "all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [compressingImage, setCompressingImage] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  // File input refs for image upload
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Compressed Blobs staged for Supabase Storage upload
  const [selectedImageBlob, setSelectedImageBlob] = useState<{ blob: Blob; name: string } | null>(null);
  const [editSelectedImageBlob, setEditSelectedImageBlob] = useState<{ blob: Blob; name: string } | null>(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState<{
    sku: string;
    name: string;
    category: string;
    stock_count: string | number;
    unit_price: string | number;
    wholesale_price: string | number;
    reorder_level: string | number;
    image_url: string;
  }>({
    sku: "",
    name: "",
    category: "Living Room",
    stock_count: "0",
    unit_price: "",
    wholesale_price: "",
    reorder_level: "10",
    image_url: "",
  });

  // Edit Product Form State
  const [editingProduct, setEditingProduct] = useState<{
    id: string;
    sku: string;
    name: string;
    category: string;
    stock_count: string | number;
    unit_price: string | number;
    wholesale_price: string | number;
    reorder_level: string | number;
    image_url: string;
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

    // Supabase Realtime WebSocket subscription for live catalog and stock
    const supabase = createClient();
    const channelName = `inventory-catalog-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_logs" },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        title: "Invalid File Type",
        message: "Please select an image file (.png, .jpg, .jpeg, .webp).",
      });
      return;
    }

    setCompressingImage(true);
    try {
      const compressedBlob = await compressImageTo1080p(file, 0.85);
      const previewUrl = URL.createObjectURL(compressedBlob);

      if (isEditing) {
        setEditSelectedImageBlob({ blob: compressedBlob, name: file.name });
        setEditingProduct((prev) => (prev ? { ...prev, image_url: previewUrl } : null));
      } else {
        setSelectedImageBlob({ blob: compressedBlob, name: file.name });
        setNewProduct((prev) => ({ ...prev, image_url: previewUrl }));
      }
    } catch (err: any) {
      console.error("Image compression error:", err);
      setToast({
        type: "error",
        title: "Compression Failed",
        message: "Could not compress image. Please choose another image.",
      });
    } finally {
      setCompressingImage(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku.trim() || !newProduct.name.trim()) {
      setToast({
        type: "error",
        title: "Validation Error",
        message: "Please provide both product title and SKU code.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const stockCount = Number(newProduct.stock_count) || 0;
      const unitPrice = Number(newProduct.unit_price) || 0;
      const wholesalePrice =
        newProduct.wholesale_price !== ""
          ? Number(newProduct.wholesale_price)
          : Number((unitPrice * 0.8).toFixed(2));
      const reorderLevel = Number(newProduct.reorder_level) || 0;

      // Upload to Supabase Storage 'products' bucket
      let uploadedImageUrl: string | undefined = undefined;
      if (selectedImageBlob) {
        uploadedImageUrl = await uploadProductImage(
          selectedImageBlob.blob,
          `${newProduct.sku}_${selectedImageBlob.name}`
        );
      }

      const status =
        stockCount === 0
          ? "OUT OF STOCK"
          : stockCount <= reorderLevel
          ? "LOW STOCK"
          : "IN STOCK";

      const created = await createProduct({
        sku: newProduct.sku.trim().toUpperCase(),
        name: newProduct.name.trim(),
        category: newProduct.category,
        stock_count: stockCount,
        unit_price: unitPrice,
        wholesale_price: wholesalePrice,
        reorder_level: reorderLevel,
        image_url: uploadedImageUrl,
        status,
      });

      if (created && stockCount > 0) {
        await createStockLog({
          product_id: created.id,
          change_type: "ADDITION",
          quantity: stockCount,
          reason: `Initial catalog registration: ${newProduct.name} (${stockCount} units)`,
        });
      }

      setIsModalOpen(false);
      setSelectedImageBlob(null);
      setNewProduct({
        sku: "",
        name: "",
        category: "Living Room",
        stock_count: "0",
        unit_price: "",
        wholesale_price: "",
        reorder_level: "10",
        image_url: "",
      });
      setToast({
        type: "success",
        title: "SKU Cataloged",
        message: `SKU "${newProduct.sku}" (${newProduct.name}) stored in database & storage bucket.`,
      });
      loadData();
    } catch (err: any) {
      console.error("Error creating product in Supabase:", err);
      setToast({
        type: "error",
        title: "Registration Failed",
        message: err.message || "Failed to catalog piece. Please check storage bucket permissions or SKU uniqueness.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (product: Product) => {
    setEditSelectedImageBlob(null);
    setEditingProduct({
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      stock_count: product.stock_count,
      unit_price: product.unit_price,
      wholesale_price: product.wholesale_price ?? Number((Number(product.unit_price) * 0.8).toFixed(2)),
      reorder_level: product.reorder_level,
      image_url: product.image_url || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSubmitting(true);
    try {
      const stockCount = Number(editingProduct.stock_count) || 0;
      const unitPrice = Number(editingProduct.unit_price) || 0;
      const wholesalePrice =
        editingProduct.wholesale_price !== ""
          ? Number(editingProduct.wholesale_price)
          : Number((unitPrice * 0.8).toFixed(2));
      const reorderLevel = Number(editingProduct.reorder_level) || 0;

      let finalImageUrl: string | undefined = editingProduct.image_url || undefined;
      if (editSelectedImageBlob) {
        finalImageUrl = await uploadProductImage(
          editSelectedImageBlob.blob,
          `${editingProduct.sku}_${editSelectedImageBlob.name}`
        );
      }

      const originalProduct = products.find((p) => p.id === editingProduct.id);
      const originalStock = originalProduct ? Number(originalProduct.stock_count || 0) : 0;
      const stockDiff = stockCount - originalStock;

      const status =
        stockCount === 0
          ? "OUT OF STOCK"
          : stockCount <= reorderLevel
          ? "LOW STOCK"
          : "IN STOCK";

      await updateProduct(editingProduct.id, {
        sku: editingProduct.sku.trim().toUpperCase(),
        name: editingProduct.name.trim(),
        category: editingProduct.category,
        stock_count: stockCount,
        unit_price: unitPrice,
        wholesale_price: wholesalePrice,
        reorder_level: reorderLevel,
        image_url: finalImageUrl,
        status,
      });

      // Automatically log stock delta to stock_logs so General Ledger & Audit are updated
      if (stockDiff > 0) {
        await createStockLog({
          product_id: editingProduct.id,
          change_type: "ADDITION",
          quantity: stockDiff,
          reason: `Supplier Restock: ${editingProduct.name.trim()} (+${stockDiff} units)`,
        });
      } else if (stockDiff < 0) {
        await createStockLog({
          product_id: editingProduct.id,
          change_type: "DEDUCTION",
          quantity: Math.abs(stockDiff),
          reason: `Inventory Adjustment: ${editingProduct.name.trim()} (-${Math.abs(stockDiff)} units)`,
        });
      }

      setIsEditModalOpen(false);
      setEditingProduct(null);
      setEditSelectedImageBlob(null);
      setToast({
        type: "success",
        title: "Catalog Updated",
        message: `Changes for "${editingProduct.name}" saved successfully${
          stockDiff !== 0 ? ` (Stock adjusted by ${stockDiff > 0 ? "+" : ""}${stockDiff} units)` : ""
        }.`,
      });
      loadData();
    } catch (err: any) {
      console.error("Error updating product in Supabase:", err);
      setToast({
        type: "error",
        title: "Update Failed",
        message: err.message || "Failed to save product changes.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteProduct(deleteConfirmId);
      setToast({
        type: "success",
        title: "SKU Deleted",
        message: "Furniture model permanently removed from database.",
      });
      loadData();
    } catch (err: any) {
      console.error("Error deleting product from Supabase:", err);
      setToast({
        type: "error",
        title: "Delete Failed",
        message: err.message || "Could not delete piece.",
      });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTabFilter === "low_stock") {
      return matchesSearch && product.stock_count <= product.reorder_level;
    }
    return matchesSearch;
  });

  const lowStockCount = products.filter((p) => p.stock_count <= p.reorder_level).length;
  const outOfStockCount = products.filter((p) => p.stock_count === 0).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-[#e8decf] shadow-xs rounded-2xl bg-white p-6">
        <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#fcf3e3] text-[#713105] border-[#cfab71]/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                Warehouse Catalog Hub
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#341100] tracking-tight">
              Furniture SKU & Materials Catalog
            </h1>
            <p className="text-xs font-normal text-[#7f5e35] mt-1">
              Direct live registry of furniture models, timber materials, dual pricing (Retail & Wholesale), and Supabase Storage photos.
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
              onClick={() => {
                setSelectedImageBlob(null);
                setIsModalOpen(true);
              }}
              className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 cursor-pointer active:scale-95 shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#cfab71]" />
              Add Furniture Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Catalog KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Total Catalog SKUs</span>
            <Layers className="w-4 h-4 text-[#713105]" />
          </div>
          <div className="text-2xl font-bold text-[#341100] mt-2">{products.length}</div>
          <span className="text-[11px] text-[#7f5e35] font-normal">Active registered pieces</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{lowStockCount}</div>
          <span className="text-[11px] text-amber-800 font-semibold">At or below reorder threshold</span>
        </Card>

        <Card className="border-[#e8decf] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#7f5e35] text-xs font-semibold uppercase">
            <span>Out of Stock Items</span>
            <Package className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">{outOfStockCount}</div>
          <span className="text-[11px] text-red-800 font-normal">Zero available stock</span>
        </Card>
      </div>

      {/* Catalog Table & Main Card */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

            <div className="flex items-center gap-2 bg-[#fff7e8] border border-[#e8decf] rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setActiveTabFilter("all")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTabFilter === "all"
                    ? "bg-[#713105] text-[#fff7e8] shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                All Items ({products.length})
              </button>
              <button
                onClick={() => setActiveTabFilter("low_stock")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTabFilter === "low_stock"
                    ? "bg-amber-700 text-white shadow-xs"
                    : "text-[#7f5e35] hover:text-[#341100]"
                }`}
              >
                Low Stock Alerts ({lowStockCount})
              </button>
            </div>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
            <Input
              placeholder="Search SKU code, piece name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {viewMode === "table" ? (
            <table className="w-full text-left text-xs text-[#341100]">
              <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Furniture Piece Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Retail Price</th>
                  <th className="py-3 px-4">Wholesale Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8decf]/60">
                {loading ? (
                  <TableSkeleton columns={8} rows={6} />
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#7f5e35]">
                      No furniture items match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const wholesale =
                      product.wholesale_price ?? Number((Number(product.unit_price) * 0.8).toFixed(2));
                    return (
                      <tr key={product.id} className="hover:bg-[#fcf3e3]/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#713105]">{product.sku}</td>
                        <td className="py-3.5 px-4 font-medium text-[#341100]">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover border border-[#e8decf] bg-[#fff7e8] shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#fff7e8] border border-[#e8decf] flex items-center justify-center text-[#7f5e35] shrink-0">
                                <Package className="w-5 h-5 text-[#cfab71]" />
                              </div>
                            )}
                            <span className="font-semibold">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#7f5e35]">{product.category}</td>
                        <td className="py-3.5 px-4 font-bold text-[#341100]">
                          {product.stock_count} units
                          <div className="text-[10px] text-[#7f5e35] font-normal font-mono">
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
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(product)}
                              className="h-8 w-8 text-[#713105] hover:text-[#341100] hover:bg-[#fff7e8] rounded-lg cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete SKU"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                  No furniture items found matching your criteria.
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const wholesale =
                    product.wholesale_price ?? Number((Number(product.unit_price) * 0.8).toFixed(2));
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
                              • {product.stock_count} units in stock
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#fff7e8]/60 border border-[#e8decf] rounded-xl p-2.5 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold text-[#7f5e35] uppercase block">
                              Retail Price
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

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e8decf]/60">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(product)}
                            className="h-8 text-xs border-[#e8decf] text-[#713105] hover:bg-[#fff7e8] rounded-xl gap-1.5 flex-1 cursor-pointer active:scale-95"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#cfab71]" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="h-8 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl px-2.5 cursor-pointer active:scale-95"
                            title="Delete Piece"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Furniture Item"
        description="Are you sure you want to delete this furniture item from the warehouse catalog?"
      />

      {/* ========================================================================= */}
      {/* 1. ADD PRODUCT MODAL                                                      */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#fffdfa] border border-[#e8decf] shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative my-8">
            <div className="bg-[#fff7e8] border-b border-[#e8decf] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#713105]">
                <Package className="w-5 h-5" />
                <h2 className="text-sm font-bold text-[#341100] tracking-tight">
                  Add New SKU & Product Catalog Item
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#e8decf]/60 flex items-center justify-center text-[#7f5e35] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Product Title *
                  </label>
                  <Input
                    required
                    placeholder="Acrilic Vase"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    SKU Code *
                  </label>
                  <Input
                    required
                    placeholder="VASE-12345"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Category
                  </label>
                  <CustomSelect
                    value={newProduct.category}
                    onChange={(val) => setNewProduct({ ...newProduct, category: val })}
                    options={[
                      { value: "Home Decor", label: "Home Decor" },
                      { value: "Living Room", label: "Living Room" },
                      { value: "Dining & Kitchen", label: "Dining & Kitchen" },
                      { value: "Bedroom", label: "Bedroom" },
                      { value: "Office & Workspace", label: "Office & Workspace" },
                      { value: "Outdoor & Patio", label: "Outdoor & Patio" },
                      { value: "Storage & Cabinets", label: "Storage & Cabinets" },
                    ]}
                    className="w-full text-xs h-9"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Initial Stock
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.stock_count}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_count: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Reorder Level
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={newProduct.reorder_level}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Retail Price (₱) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    placeholder="49.99"
                    value={newProduct.unit_price}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewProduct((prev) => ({
                        ...prev,
                        unit_price: val,
                        wholesale_price:
                          prev.wholesale_price === "" && val
                            ? (Number(val) * 0.8).toFixed(2)
                            : prev.wholesale_price,
                      }));
                    }}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Wholesale Price (₱)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="30.00"
                    value={newProduct.wholesale_price}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setNewProduct({ ...newProduct, wholesale_price: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#047857] rounded-xl font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Upload Product Image (Compressed to 1080p)
                </label>
                <input
                  type="file"
                  ref={addFileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => handleImageFileChange(e, false)}
                  className="hidden"
                />

                {compressingImage ? (
                  <div className="p-5 rounded-2xl bg-[#fff7e8] border border-[#cfab71] flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#713105]" />
                    <span className="text-xs text-[#713105] font-semibold">
                      Optimizing and compressing image to 1080p...
                    </span>
                  </div>
                ) : newProduct.image_url ? (
                  <div className="relative p-3 rounded-2xl bg-[#fff7e8] border-2 border-dashed border-[#cfab71] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={newProduct.image_url}
                        alt="Product preview"
                        className="w-14 h-14 rounded-xl object-cover border border-[#e8decf] bg-white shadow-2xs"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#341100] block">1080p Image Ready</span>
                        <span className="text-[10px] text-[#7f5e35]">Will be uploaded to Supabase Storage</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addFileInputRef.current?.click()}
                        className="h-7 text-xs border-[#e8decf] text-[#713105] rounded-lg"
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedImageBlob(null);
                          setNewProduct({ ...newProduct, image_url: "" });
                        }}
                        className="h-7 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => addFileInputRef.current?.click()}
                    className="p-5 rounded-2xl bg-[#fff7e8]/50 border-2 border-dashed border-[#e8decf] hover:border-[#cfab71] hover:bg-[#fff7e8] flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <Upload className="w-5 h-5 text-[#713105]" />
                    <span className="text-xs text-[#7f5e35] font-medium">
                      Click to select product image file (.png, .jpg)
                    </span>
                  </div>
                )}
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
                  disabled={submitting || compressingImage}
                  className="bg-[#713105] text-[#fff7e8] hover:bg-[#341100] text-xs font-semibold rounded-xl px-5 py-2 cursor-pointer gap-2 disabled:opacity-70 shadow-xs active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#cfab71]" />
                      Uploading & Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#cfab71]" />
                      Save Product to Catalog
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT PRODUCT MODAL                                                     */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#fffdfa] border border-[#e8decf] shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative my-8">
            <div className="bg-[#fff7e8] border-b border-[#e8decf] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#713105]">
                <Edit2 className="w-5 h-5" />
                <h2 className="text-sm font-bold text-[#341100] tracking-tight">
                  Edit SKU & Product Item
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                  setEditSelectedImageBlob(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-[#e8decf]/60 flex items-center justify-center text-[#7f5e35] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Product Title *
                  </label>
                  <Input
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    SKU Code *
                  </label>
                  <Input
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Category
                  </label>
                  <CustomSelect
                    value={editingProduct.category}
                    onChange={(val) => setEditingProduct({ ...editingProduct, category: val })}
                    options={[
                      { value: "Home Decor", label: "Home Decor" },
                      { value: "Living Room", label: "Living Room" },
                      { value: "Dining & Kitchen", label: "Dining & Kitchen" },
                      { value: "Bedroom", label: "Bedroom" },
                      { value: "Office & Workspace", label: "Office & Workspace" },
                      { value: "Outdoor & Patio", label: "Outdoor & Patio" },
                      { value: "Storage & Cabinets", label: "Storage & Cabinets" },
                    ]}
                    className="w-full text-xs h-9"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Stock Units
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingProduct.stock_count}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_count: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Reorder Level
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editingProduct.reorder_level}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditingProduct({ ...editingProduct, reorder_level: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Retail Price (₱) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.unit_price}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit_price: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                    Wholesale Price (₱)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProduct.wholesale_price}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesale_price: e.target.value })}
                    className="bg-[#fff7e8] border-[#e8decf] text-xs text-[#047857] rounded-xl font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4f351c] uppercase block mb-1">
                  Product Image (1080p Compression)
                </label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => handleImageFileChange(e, true)}
                  className="hidden"
                />

                {compressingImage ? (
                  <div className="p-5 rounded-2xl bg-[#fff7e8] border border-[#cfab71] flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#713105]" />
                    <span className="text-xs text-[#713105] font-semibold">
                      Compressing image to 1080p...
                    </span>
                  </div>
                ) : editingProduct.image_url ? (
                  <div className="relative p-3 rounded-2xl bg-[#fff7e8] border-2 border-dashed border-[#cfab71] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={editingProduct.image_url}
                        alt="Product preview"
                        className="w-14 h-14 rounded-xl object-cover border border-[#e8decf] bg-white shadow-2xs"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#341100] block">Photo Attached</span>
                        <span className="text-[10px] text-[#7f5e35]">Ready for Supabase Storage</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editFileInputRef.current?.click()}
                        className="h-7 text-xs border-[#e8decf] text-[#713105] rounded-lg"
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditSelectedImageBlob(null);
                          setEditingProduct({ ...editingProduct, image_url: "" });
                        }}
                        className="h-7 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="p-5 rounded-2xl bg-[#fff7e8]/50 border-2 border-dashed border-[#e8decf] hover:border-[#cfab71] hover:bg-[#fff7e8] flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <Upload className="w-5 h-5 text-[#713105]" />
                    <span className="text-xs text-[#7f5e35] font-medium">
                      Click to select product image file (.png, .jpg)
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                    setEditSelectedImageBlob(null);
                  }}
                  className="border-[#e8decf] text-[#7f5e35] hover:bg-[#fff7e8] text-xs rounded-xl px-5 py-2 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || compressingImage}
                  className="bg-[#713105] text-[#fff7e8] hover:bg-[#341100] text-xs font-semibold rounded-xl px-5 py-2 cursor-pointer gap-2 disabled:opacity-70 shadow-xs active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#cfab71]" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#cfab71]" />
                      Save Product Changes
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

export function ProductsCatalogPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={7} rows={8} />}>
      <ProductsCatalogContent />
    </Suspense>
  );
}

export default ProductsCatalogPage;
