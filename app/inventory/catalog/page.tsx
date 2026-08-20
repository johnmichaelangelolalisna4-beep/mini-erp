"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Plus, Package, AlertTriangle, Image as ImageIcon, X, Check, Edit2, Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const initialCatalog = [
  {
    id: "PRD-101",
    name: "Handcrafted Ceramic Vase",
    category: "Home Decor",
    sku: "HD-VASE-001",
    stock: 45,
    reorderLevel: 10,
    retailPrice: "$48.00",
    wholesalePrice: "$32.00",
    status: "In Stock",
    image: "ceramic_vase.jpg",
  },
  {
    id: "PRD-102",
    name: "Minimalist Walnut Table Lamp",
    category: "Lighting",
    sku: "LT-LAMP-088",
    stock: 6,
    reorderLevel: 10,
    retailPrice: "$125.00",
    wholesalePrice: "$85.00",
    status: "Low Stock",
    image: "walnut_lamp.jpg",
  },
  {
    id: "PRD-103",
    name: "Stainless Steel Espresso Tamper",
    category: "Kitchenware",
    sku: "KW-ESPR-002",
    stock: 120,
    reorderLevel: 25,
    retailPrice: "$34.50",
    wholesalePrice: "$22.00",
    status: "In Stock",
    image: "espresso_tamper.jpg",
  },
  {
    id: "PRD-104",
    name: "Linen Textured Cushion Covers",
    category: "Home Decor",
    sku: "HD-CUSH-014",
    stock: 3,
    reorderLevel: 15,
    retailPrice: "$28.00",
    wholesalePrice: "$18.00",
    status: "Low Stock",
    image: "cushion_cover.jpg",
  },
  {
    id: "PRD-105",
    name: "Japanese Teak Pour-Over Stand",
    category: "Kitchenware",
    sku: "KW-TEAK-009",
    stock: 0,
    reorderLevel: 5,
    retailPrice: "$89.00",
    wholesalePrice: "$58.00",
    status: "Out of Stock",
    image: "teak_stand.jpg",
  },
  {
    id: "PRD-106",
    name: "Organic Cotton Throw Blanket",
    category: "Home Decor",
    sku: "HD-BLNK-032",
    stock: 84,
    reorderLevel: 20,
    retailPrice: "$64.00",
    wholesalePrice: "$42.00",
    status: "In Stock",
    image: "cotton_blanket.jpg",
  },
];

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const filterQuery = searchParams.get("filter");

  const [catalog, setCatalog] = useState(initialCatalog);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState(filterQuery === "low_stock" ? "low_stock" : "all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [prodName, setProdName] = useState("");
  const [skuCode, setSkuCode] = useState("");
  const [category, setCategory] = useState("Home Decor");
  const [stockCount, setStockCount] = useState(25);
  const [reorderLvl, setReorderLvl] = useState(10);
  const [retailPrice, setRetailPrice] = useState("49.99");
  const [wholesalePrice, setWholesalePrice] = useState("30.00");
  const [imageFileName, setImageFileName] = useState("");

  useEffect(() => {
    if (filterQuery === "low_stock") {
      setActiveTabFilter("low_stock");
    }
  }, [filterQuery]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !skuCode) return;

    const newProd = {
      id: `PRD-${107 + catalog.length}`,
      name: prodName,
      category,
      sku: skuCode,
      stock: Number(stockCount),
      reorderLevel: Number(reorderLvl),
      retailPrice: `$${parseFloat(retailPrice).toFixed(2)}`,
      wholesalePrice: `$${parseFloat(wholesalePrice).toFixed(2)}`,
      status: Number(stockCount) === 0 ? "Out of Stock" : Number(stockCount) <= Number(reorderLvl) ? "Low Stock" : "In Stock",
      image: imageFileName || "product_img.jpg",
    };

    setCatalog([newProd, ...catalog]);
    setIsModalOpen(false);
    setProdName("");
    setSkuCode("");
  };

  const filteredCatalog = catalog.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTabFilter === "low_stock") {
      return product.stock <= product.reorderLevel;
    }
    return true;
  });

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
              Primary workspace: Add new SKUs, edit stock counts, update categories, adjust unit pricing, and upload product images.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#713105] text-[#fff7e8] hover:bg-[#4f351c] gap-2 rounded-xl text-xs font-semibold px-4 py-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add New SKU / Product
          </Button>
        </CardContent>
      </Card>

      {/* Filter Tabs Header */}
      <div className="flex items-center gap-2 border-b border-[#e8decf] pb-3">
        <Button
          variant="ghost"
          onClick={() => setActiveTabFilter("all")}
          className={`text-xs font-semibold rounded-xl px-4 py-2 ${
            activeTabFilter === "all"
              ? "bg-[#713105] text-[#fff7e8]"
              : "text-[#7f5e35] hover:bg-[#fff7e8]"
          }`}
        >
          All Catalog SKUs ({catalog.length})
        </Button>

        <Button
          variant="ghost"
          onClick={() => setActiveTabFilter("low_stock")}
          className={`text-xs font-semibold rounded-xl px-4 py-2 gap-1.5 ${
            activeTabFilter === "low_stock"
              ? "bg-[#713105] text-[#fff7e8]"
              : "text-amber-800 hover:bg-amber-50"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Low Stock & Restock Action ({catalog.filter((i) => i.stock <= i.reorderLevel).length})
        </Button>
      </div>

      {/* Product Catalog Data Table */}
      <Card className="border-[#e8decf] shadow-xs rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-[#e8decf] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle className="text-sm font-semibold text-[#4f351c]">
            {activeTabFilter === "low_stock"
              ? "Low Stock & Restock Action List"
              : "Complete Product Catalog Directory"}
          </CardTitle>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7f5e35]" />
              <Input
                placeholder="Filter by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#fff7e8] border-[#e8decf] text-xs text-[#341100] rounded-xl placeholder:text-[#7f5e35]/60"
              />
            </div>
            <Button variant="outline" className="border-[#e8decf] text-[#4f351c] hover:bg-[#fff7e8] gap-1.5 text-xs rounded-xl">
              <Filter className="w-3.5 h-3.5" />
              Filter Category
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#341100]">
            <thead className="bg-[#fff7e8] border-b border-[#e8decf] text-[11px] uppercase tracking-wider text-[#7f5e35] font-semibold">
              <tr>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Wholesale Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]/60">
              {filteredCatalog.map((product) => (
                <tr key={product.id} className="hover:bg-[#fcf3e3]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-9 h-9 rounded-lg bg-[#fff7e8] border border-[#e8decf] flex items-center justify-center text-[#713105]">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#341100]">
                    {product.name}
                    <div className="text-[10px] text-[#7f5e35] font-normal">{product.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#7f5e35]">{product.category}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#4f351c]">{product.sku}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#341100]">
                    {product.stock} units
                    <div className="text-[10px] text-[#7f5e35] font-normal">Reorder level: {product.reorderLevel}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#713105]">{product.retailPrice}</td>
                  <td className="py-3.5 px-4 text-[#7f5e35] font-medium">{product.wholesalePrice}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {product.status === "In Stock" && (
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                        In Stock
                      </Badge>
                    )}
                    {product.status === "Low Stock" && (
                      <Badge className="bg-amber-50 text-[#713105] border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                        Low Stock
                      </Badge>
                    )}
                    {product.status === "Out of Stock" && (
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 whitespace-nowrap">
                        Out of Stock
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="ghost" size="sm" className="text-[#7f5e35] hover:text-[#341100] gap-1 text-xs">
                      <Edit2 className="w-3.5 h-3.5 text-[#713105]" />
                      Edit SKU
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add New SKU Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#e8decf] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#e8decf] flex items-center justify-between bg-[#fff7e8]">
              <h2 className="font-bold text-sm text-[#341100] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#713105]" />
                Add New SKU & Product Catalog Item
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#7f5e35] hover:text-[#341100]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-5 space-y-4 text-xs text-[#341100]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Product Title *</label>
                  <Input
                    required
                    placeholder="e.g. Modern Brass Table Lamp"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">SKU Code *</label>
                  <Input
                    required
                    placeholder="e.g. LT-LAMP-099"
                    value={skuCode}
                    onChange={(e) => setSkuCode(e.target.value)}
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 bg-[#fff7e8] border border-[#e8decf] rounded-xl px-2 text-xs text-[#341100] focus:outline-hidden"
                  >
                    <option value="Home Decor">Home Decor</option>
                    <option value="Kitchenware">Kitchenware</option>
                    <option value="Lighting">Lighting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Initial Stock</label>
                  <Input
                    type="number"
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Reorder Level</label>
                  <Input
                    type="number"
                    value={reorderLvl}
                    onChange={(e) => setReorderLvl(Number(e.target.value))}
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Retail Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs font-bold text-[#713105]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#4f351c] mb-1">Wholesale Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    className="bg-[#fff7e8] border-[#e8decf] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#4f351c] mb-1">Upload Product Image</label>
                <div className="border border-dashed border-[#e8decf] bg-[#fff7e8]/60 rounded-xl p-3 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-[#fff7e8]">
                  <Upload className="w-4 h-4 text-[#713105] mb-1" />
                  <span className="text-[11px] text-[#7f5e35]">Click to select product image file (.png, .jpg)</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setImageFileName(e.target.files?.[0]?.name || "")}
                  />
                  {imageFileName && (
                    <span className="text-[10px] text-[#713105] font-semibold mt-1">{imageFileName}</span>
                  )}
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
                  Save Product to Catalog
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-semibold text-[#7f5e35]">
          Loading products catalog...
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
