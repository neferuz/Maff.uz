"use client";

import { 
  MoreHorizontal, 
  ExternalLink,
  Plus,
  Filter,
  Download,
  Search,
  ChevronRight,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Edit3,
  Trash2,
  Tag,
  Layers,
  ArrowUpRight,
  Image as ImageIcon,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  price_outlet?: number | null;
  stock: number;
  category_id: number | null;
  image_url: string | null;
  is_active: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived" | "outlet">("all");
  const itemsPerPage = 50;

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/products/");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/v1/categories/");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await Promise.all([
        fetch("/api/v1/products/sync", { method: "POST" }),
        fetch("/api/v1/categories/sync", { method: "POST" })
      ]);
      await Promise.all([fetchProducts(), fetchCategories()]);
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/uploads", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEditForm({ ...editForm, image_url: data.url });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      setEditForm({ ...selectedProduct });
    } else {
      document.body.style.overflow = 'unset';
      setIsEditing(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/v1/products/${selectedProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: Number(editForm.price),
          price_outlet: editForm.price_outlet ? Number(editForm.price_outlet) : null,
          stock: Number(editForm.stock),
          sku: editForm.sku,
          brand: editForm.brand,
          country: editForm.country,
          grade: editForm.grade,
          thickness: editForm.thickness,
          pack_size: editForm.pack_size ? Number(editForm.pack_size) : null,
          category_id: editForm.category_id ? Number(editForm.category_id) : null,
          image_url: editForm.image_url,
          is_active: editForm.is_active,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map(p => p.id === updated.id ? updated : p));
        setSelectedProduct(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/v1/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== selectedProduct.id));
        setSelectedProduct(null);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to get all child category IDs recursively
  const getAllChildIds = (catId: number): number[] => {
    const children = categories.filter(c => c.parent_id === catId);
    let ids = [catId];
    children.forEach(child => {
      ids = [...ids, ...getAllChildIds(child.id)];
    });
    return ids;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "active" ? product.is_active :
      statusFilter === "outlet" ? (product.price_outlet && product.price_outlet > 0) :
      !product.is_active;

    if (!selectedCategoryId) return matchesSearch && matchesStatus;
    
    // Get all nested child IDs to show all products in sub-categories
    const allRelatedIds = getAllChildIds(selectedCategoryId);
    const matchesCategory = product.category_id && allRelatedIds.includes(product.category_id);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchQuery]);

  const mainCategories = categories.filter(c => !c.parent_id);
  const currentSubCategories = selectedCategoryId ? categories.filter(c => c.parent_id === selectedCategoryId) : [];

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Товары</h1>
            <p className="text-[14px] text-[#4f566b]">Управление ассортиментом и складскими остатками.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all no-shadow",
                isSyncing && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
              {isSyncing ? "Синхронизация..." : "Синхронизация с 1С"}
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all no-shadow">
              <Plus className="w-3.5 h-3.5" />
              Новый товар
            </button>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-6 overflow-x-auto w-full border-b border-[#e3e8ee] scrollbar-hide">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={cn(
                "pb-3 text-[14px] font-semibold transition-all relative whitespace-nowrap",
                !selectedCategoryId ? "text-[#2c3b6e]" : "text-[#4f566b] hover:text-[#1a1f36]"
              )}
            >
              Все товары
              {!selectedCategoryId && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c3b6e]" />
              )}
            </button>
            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "pb-3 text-[14px] font-semibold transition-all relative whitespace-nowrap",
                  selectedCategoryId === cat.id || categories.find(c => c.id === selectedCategoryId)?.parent_id === cat.id ? "text-[#2c3b6e]" : "text-[#4f566b] hover:text-[#1a1f36]"
                )}
              >
                {cat.name}
                {(selectedCategoryId === cat.id || categories.find(c => c.id === selectedCategoryId)?.parent_id === cat.id) && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c3b6e]" />
                )}
              </button>
            ))}
          </div>

          {/* Sub-categories Pills and Path */}
          {selectedCategoryId && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#4f566b]">
                <button 
                  onClick={() => setSelectedCategoryId(null)}
                  className="hover:text-[#2c3b6e] transition-colors"
                >
                  Все товары
                </button>
                {(() => {
                  const path: any[] = [];
                  let curr = categories.find(c => c.id === selectedCategoryId);
                  while (curr) {
                    path.unshift(curr);
                    curr = categories.find(c => c.id === curr.parent_id);
                  }
                  return path.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 opacity-50" />
                      <button 
                        onClick={() => setSelectedCategoryId(c.id)}
                        className={cn(
                          "transition-colors",
                          i === path.length - 1 ? "text-[#1a1f36] font-bold" : "hover:text-[#2c3b6e]"
                        )}
                      >
                        {c.name}
                      </button>
                    </div>
                  ));
                })()}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const current = categories.find(c => c.id === selectedCategoryId);
                    if (current?.parent_id) {
                      setSelectedCategoryId(current.parent_id);
                    } else {
                      setSelectedCategoryId(null);
                    }
                  }}
                  className="px-3 py-1 rounded-full bg-[#f7f8f9] border border-[#e3e8ee] text-[12px] font-bold text-[#4f566b] hover:bg-white transition-all flex items-center gap-1.5"
                >
                  ← Назад
                </button>
                {categories.filter(c => c.parent_id === selectedCategoryId).map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedCategoryId(sub.id)}
                    className={cn(
                      "px-3 py-1 rounded-full border text-[12px] font-medium transition-all",
                      selectedCategoryId === sub.id 
                        ? "bg-[#2c3b6e] border-[#2c3b6e] text-white" 
                        : "bg-white border-[#e3e8ee] text-[#1a1f36] hover:border-[#2c3b6e] hover:text-[#2c3b6e]"
                    )}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f7f8f9] p-4 rounded-xl border border-[#e3e8ee]">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
            <input 
              type="text" 
              placeholder="Поиск по названию или SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#e3e8ee] focus:border-[#2c3b6e]/30 rounded-lg text-[13px] outline-none transition-all no-shadow"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#e3e8ee] no-shadow">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1.5 text-[12px] font-bold rounded-md transition-all",
                statusFilter === "all" ? "bg-[#2c3b6e] text-white" : "text-[#4f566b] hover:bg-[#f7f8f9]"
              )}
            >
              Все
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={cn(
                "px-3 py-1.5 text-[12px] font-bold rounded-md transition-all",
                statusFilter === "active" ? "bg-[#10b981] text-white" : "text-[#4f566b] hover:bg-[#f7f8f9]"
              )}
            >
              Активные
            </button>
            <button
              onClick={() => setStatusFilter("archived")}
              className={cn(
                "px-3 py-1.5 text-[12px] font-bold rounded-md transition-all",
                statusFilter === "archived" ? "bg-[#4f566b] text-white" : "text-[#4f566b] hover:bg-[#f7f8f9]"
              )}
            >
              Архив
            </button>
            <button
              onClick={() => setStatusFilter("outlet")}
              className={cn(
                "px-3 py-1.5 text-[12px] font-bold rounded-md transition-all",
                statusFilter === "outlet" ? "bg-[#e11d48] text-white" : "text-[#4f566b] hover:bg-[#f7f8f9]"
              )}
            >
              Аутлет
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden no-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider w-[35%]">Товар</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider w-[15%]">Статус</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider w-[25%]">SKU</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider w-[10%]">Остаток</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider w-[15%]">Цена</th>
                  <th className="px-6 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee]">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, idx) => (
                    <motion.tr 
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setSelectedProduct(product)}
                      className="group cursor-pointer hover:bg-[#2c3b6e]/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 truncate">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#e3e8ee] bg-[#f7f8f9] flex-shrink-0">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#e3e8ee]">
                                   <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                           </div>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors truncate" title={product.name}>{product.name}</span>
                              <span className="text-[10px] text-[#4f566b] font-medium uppercase tracking-wider truncate" title={categories.find(c => c.id === product.category_id)?.name || "Без категории"}>{categories.find(c => c.id === product.category_id)?.name || "Без категории"}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          product.is_active ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#cd5c5c]/10 text-[#cd5c5c]"
                        )}>
                          {product.is_active ? "Активен" : "Неактивен"}
                        </div>
                      </td>
                      <td className="px-6 py-4 truncate">
                        <span className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest block truncate" title={product.sku}>{product.sku}</span>
                      </td>
                      <td className="px-6 py-4">
                        {product.stock > 0 ? (
                          <span className="text-[13px] font-bold text-[#1a1f36]">{product.stock} шт</span>
                        ) : (
                          <span className="text-[12px] text-[#e3e8ee]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.price_outlet && product.price_outlet > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-400 line-through">
                              {product.price.toLocaleString('ru-RU')} сум
                            </span>
                            <span className="text-[13px] font-black text-[#e11d48]">
                              {product.price_outlet.toLocaleString('ru-RU')} сум
                            </span>
                          </div>
                        ) : (
                          <span className="text-[13px] font-black text-[#1a1f36]">{product.price.toLocaleString('ru-RU')} сум</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-colors ml-auto" />
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-[#f7f8f9] rounded-full flex items-center justify-center text-[#4f566b]">
                            <Search className="w-8 h-8 opacity-20" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[16px] font-bold text-[#1a1f36]">Ничего не найдено</p>
                            <p className="text-[13px] text-[#4f566b]">Попробуйте изменить параметры поиска или фильтры.</p>
                         </div>
                         <button 
                            onClick={() => { setSearchQuery(""); setSelectedCategoryId(null); }}
                            className="mt-2 px-4 py-1.5 bg-[#2c3b6e] text-white text-[12px] font-bold rounded-lg hover:bg-[#232f58] transition-all"
                         >
                            Сбросить все фильтры
                         </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-[#f7f8f9] border-t border-[#e3e8ee] flex items-center justify-between">
              <p className="text-[12px] text-[#4f566b] font-medium">
                Показано {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} из {filteredProducts.length}
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage(pageNum);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-lg text-[12px] font-bold transition-all",
                        currentPage === pageNum 
                          ? "bg-[#2c3b6e] text-white" 
                          : "text-[#4f566b] hover:bg-white hover:text-[#2c3b6e]"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Drawer */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              key="backdrop" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => { if (!isSaving) setSelectedProduct(null); }} 
              className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md z-[9999]" 
            />
            <motion.div 
              key="drawer" 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white border-l border-[#e3e8ee] z-[10000] shadow-2xl flex flex-col" 
            >
              <div className="px-6 py-5 border-b border-[#e3e8ee] flex items-center justify-between">
                <div>
                   <h2 className="text-[16px] font-bold text-[#1a1f36]">
                     {isEditing ? "Редактирование товара" : "Детали товара"}
                   </h2>
                   <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">ID: PRD-{selectedProduct.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-[#f7f8f9] rounded-lg text-[#2c3b6e] transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => setSelectedProduct(null)} disabled={isSaving} className="p-2 hover:bg-[#f7f8f9] rounded-lg transition-colors"><XCircle className="w-5 h-5 text-[#4f566b]" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {isEditing ? (
                   <div className="space-y-6">
                      {/* Image Edit */}
                      <div className="flex justify-center">
                        <div className="relative group">
                          <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-dashed border-[#e3e8ee] bg-[#f7f8f9] flex items-center justify-center">
                            {editForm.image_url ? (
                              <img src={editForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-10 h-10 text-slate-300" />
                            )}
                            {isUploadingImage && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
                              </div>
                            )}
                          </div>
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-2xl text-[12px] font-bold disabled:opacity-50"
                          >
                            <RefreshCw className={cn("w-5 h-5", isUploadingImage && "animate-spin")} />
                            {isUploadingImage ? "Загрузка..." : "Изменить фото"}
                          </button>
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <input 
                            type="text" 
                            placeholder="URL изображения..." 
                            value={editForm.image_url || ""}
                            onChange={(e) => setEditForm({...editForm, image_url: e.target.value})}
                            className="mt-3 w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[11px] outline-none focus:border-[#2c3b6e] font-mono"
                          />
                        </div>
                      </div>

                      {/* Name and Basic Info */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Название товара</label>
                          <input 
                            type="text" 
                            value={editForm.name || ""}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[14px] font-bold text-[#1a1f36] outline-none transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Цена (сум)</label>
                            <input 
                              type="number" 
                              value={editForm.price || 0}
                              onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                              className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-black text-[#2c3b6e] outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Аутлет (сум)</label>
                            <input 
                              type="number" 
                              value={editForm.price_outlet || ""}
                              onChange={(e) => setEditForm({...editForm, price_outlet: e.target.value})}
                              placeholder="Нет"
                              className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-black text-[#e11d48] outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Остаток</label>
                            <input 
                              type="number" 
                              value={editForm.stock || 0}
                              onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                              className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-bold text-[#1a1f36] outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Артикул (SKU)</label>
                          <input 
                            type="text" 
                            value={editForm.sku || ""}
                            onChange={(e) => setEditForm({...editForm, sku: e.target.value})}
                            className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-medium text-[#4f566b] uppercase tracking-widest outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Категория</label>
                          <select 
                            value={editForm.category_id || ""}
                            onChange={(e) => setEditForm({...editForm, category_id: e.target.value ? Number(e.target.value) : null})}
                            className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-semibold text-[#1a1f36] outline-none transition-all"
                          >
                            <option value="">Без категории</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Бренд</label>
                            <input 
                              type="text" 
                              value={editForm.brand || ""}
                              onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                              className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-medium text-[#1a1f36] outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Страна</label>
                            <input 
                              type="text" 
                              value={editForm.country || ""}
                              onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                              className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-medium text-[#1a1f36] outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Сорт</label>
                            <input 
                              type="text" 
                              value={editForm.grade || ""}
                              onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                              className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-medium text-[#1a1f36] outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Толщина</label>
                            <input 
                              type="text" 
                              value={editForm.thickness || ""}
                              onChange={(e) => setEditForm({...editForm, thickness: e.target.value})}
                              className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-medium text-[#1a1f36] outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Упаковка</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={editForm.pack_size || ""}
                              onChange={(e) => setEditForm({...editForm, pack_size: e.target.value})}
                              className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] font-medium text-[#1a1f36] outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between p-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                          <div>
                            <p className="text-[13px] font-bold text-[#1a1f36]">Статус отображения</p>
                            <p className="text-[11px] text-[#4f566b]">Показывать товар на сайте</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditForm({...editForm, is_active: !editForm.is_active})}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none",
                              editForm.is_active ? "bg-[#10b981]" : "bg-slate-300"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                editForm.is_active ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Description Editor */}
                      <div>
                        <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Описание (HTML)</label>
                        <textarea 
                          rows={10}
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="w-full px-4 py-3 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] text-[#4f566b] leading-relaxed outline-none transition-all resize-none"
                        />
                      </div>
                   </div>
                 ) : (
                   <>
                     {/* View Mode content */}
                     <div className="flex gap-6">
                        <div className="w-40 h-40 rounded-2xl overflow-hidden border border-[#e3e8ee] bg-[#f7f8f9] relative group flex-shrink-0">
                           {selectedProduct.image_url ? (
                             <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-[#e3e8ee]"><ImageIcon className="w-12 h-12" /></div>
                           )}
                        </div>
                        <div className="flex flex-col flex-1">
                           <h3 className="text-xl leading-tight font-black text-[#1a1f36] line-clamp-3">{selectedProduct.name}</h3>
                           <p className="text-[12px] font-bold text-[#2c3b6e] mt-2 uppercase tracking-wider">{categories.find(c => c.id === selectedProduct.category_id)?.name || "Без категории"}</p>
                           <div className="mt-auto pt-4">
                              <p className="text-3xl font-black text-[#2c3b6e]">{(selectedProduct.price || 0).toLocaleString('ru-RU')} сум</p>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                           <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5">SKU (Артикул)</p>
                           <p className="text-[13px] font-bold text-[#1a1f36] break-all">{selectedProduct.sku || "—"}</p>
                        </div>
                        <div className="p-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                           <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5">Складской остаток</p>
                           <p className="text-[13px] font-bold text-[#1a1f36]">{selectedProduct.stock > 0 ? `${selectedProduct.stock} шт.` : "Нет в наличии"}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                           <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5">Бренд</p>
                           <p className="text-[13px] font-bold text-[#1a1f36]">{selectedProduct.brand || "—"}</p>
                        </div>
                        <div className="p-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                           <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5">Страна</p>
                           <p className="text-[13px] font-bold text-[#1a1f36]">{selectedProduct.country || "—"}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                           <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5">Сорт</p>
                           <p className="text-[13px] font-bold text-[#1a1f36]">{selectedProduct.grade || "—"}</p>
                        </div>
                        <div className="p-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                           <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5">Толщина</p>
                           <p className="text-[13px] font-bold text-[#1a1f36]">{selectedProduct.thickness || "—"}</p>
                        </div>
                        <div className="p-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                           <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5">Упаковка</p>
                           <p className="text-[13px] font-bold text-[#1a1f36]">{selectedProduct.pack_size ? `${selectedProduct.pack_size} м²` : "—"}</p>
                        </div>
                     </div>

                     {selectedProduct.description && (
                        <div className="pt-6 border-t border-[#e3e8ee]">
                           <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-4">Описание</p>
                           <div 
                             className="text-[14px] text-[#4f566b] leading-relaxed prose prose-slate max-w-none prose-p:mb-3 prose-ul:pl-5 prose-ul:list-disc"
                             dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                           />
                        </div>
                     )}
                   </>
                 )}
              </div>

              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 sticky bottom-0">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#4f566b] hover:bg-white transition-all no-shadow disabled:opacity-50"
                    >
                      Отмена
                    </button>
                    <button 
                      onClick={handleUpdateProduct}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Сохранить
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#4f566b] hover:bg-white hover:border-[#cd5c5c] hover:text-[#cd5c5c] transition-all no-shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                      В Bitrix24
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-[11001] shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Удалить товар?</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">Это действие нельзя будет отменить. Товар будет полностью удален из базы данных.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button 
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                  className="px-4 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
