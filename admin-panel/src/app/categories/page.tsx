"use client";
import { toast } from "react-hot-toast";
import React from "react";
import { 
  MoreHorizontal, 
  ExternalLink,
  Plus,
  Filter,
  Download,
  Search,
  ChevronRight,
  Layers,
  Edit3,
  Trash2,
  Tag,
  ArrowUpRight,
  XCircle,
  FolderOpen,
  Folder,
  RefreshCw,
  ChevronDown,
  Archive,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  // 34 Lucide Icons for category selection
  Home as HomeIcon, DoorOpen, LayoutGrid, Square, Maximize, Layout, Box, Shapes, Hammer, Wind, Sparkles, Award,
  Wrench, Grid, HardHat, Brush, Paintbrush, Ruler, Construction, Flame, Sun, Compass, Scissors, ShieldCheck,
  PenTool, Pipette, Trees, Boxes, Warehouse, Smile, Heart, Sparkle, Gem
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const lucideMap: Record<string, any> = {
  Home: HomeIcon, DoorOpen, Layers, LayoutGrid, Square, Maximize, Layout, Box, Shapes, Hammer, Wind, Sparkles, Award,
  Wrench, Grid, HardHat, Brush, Paintbrush, Ruler, Construction, Flame, Sun, Compass, Scissors, ShieldCheck,
  PenTool, Pipette, Trees, Boxes, Warehouse, Smile, Heart, Sparkle, Gem
};

const categoryIcons = [Layers, LayoutGrid, Square, DoorOpen, Layout, Box, Shapes, Hammer, Wind, Sparkles];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [categoryToArchive, setCategoryToArchive] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');
  const [editName, setEditName] = useState("");
  const [editIsOrderOnly, setEditIsOrderOnly] = useState(false);
  const [editIsPreorder, setEditIsPreorder] = useState(false);
  const [editPricePrefix, setEditPricePrefix] = useState("");
  const [editOrderLink, setEditOrderLink] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editParentId, setEditParentId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [parentSearchQuery, setParentSearchQuery] = useState("");
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [isLoadingCategoryProducts, setIsLoadingCategoryProducts] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [searchedProducts, setSearchedProducts] = useState<any[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [mergeTargetCategoryId, setMergeTargetCategoryId] = useState<number | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editRecommendedAccessories, setEditRecommendedAccessories] = useState<any>({
    category_ids: [],
    product_ids: []
  });
  const [editAttributes, setEditAttributes] = useState<any[]>([]);
  const [accProductSearch, setAccProductSearch] = useState("");
  const [accProductResults, setAccProductResults] = useState<any[]>([]);
  const [isSearchingAccProducts, setIsSearchingAccProducts] = useState(false);
  const [loadedAccProducts, setLoadedAccProducts] = useState<any[]>([]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/categories/?include_inactive=true");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Произошла ошибка: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (category: any, direction: 'up' | 'down') => {
    // 1. Find siblings (categories with the same parent)
    const siblings = displayCategories.filter(c => c.parent_id === category.parent_id);
    const currentIndex = siblings.findIndex(c => c.id === category.id);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex > 0) {
      // Swap elements in the array
      const temp = siblings[currentIndex - 1];
      siblings[currentIndex - 1] = siblings[currentIndex];
      siblings[currentIndex] = temp;
    } else if (direction === 'down' && currentIndex < siblings.length - 1) {
      // Swap elements in the array
      const temp = siblings[currentIndex + 1];
      siblings[currentIndex + 1] = siblings[currentIndex];
      siblings[currentIndex] = temp;
    } else {
      return;
    }

    // Explicitly set sort_order sequentially for all siblings
    const items = siblings.map((sib, index) => ({
      id: sib.id,
      sort_order: index
    }));
    await executeReorder(items);
  };

  const executeReorder = async (items: any[]) => {
    try {
      const res = await fetch("/api/v1/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        await fetchCategories();
        toast.success("Изменения успешно сохранены!");
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      toast.error("Произошла ошибка: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
      console.error("Failed to reorder categories", error);
    }
  };

  const fetchCategoryProducts = async (catId: number) => {
    try {
      setIsLoadingCategoryProducts(true);
      const res = await fetch(`/api/v1/products?category_id=${catId}&include_inactive=true`);
      if (res.ok) {
        const data = await res.json();
        setCategoryProducts(data);
      }
    } catch (error) {
      toast.error("Произошла ошибка: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
      console.error("Failed to fetch category products:", error);
    } finally {
      setIsLoadingCategoryProducts(false);
    }
  };

  const handleSearchProducts = async (query: string) => {
    setProductSearchQuery(query);
    if (!query.trim()) {
      setSearchedProducts([]);
      return;
    }
    
    try {
      setIsSearchingProducts(true);
      const res = await fetch(`/api/v1/products?q=${encodeURIComponent(query)}&include_inactive=true`);
      if (res.ok) {
        const data = await res.json();
        // Filter out products that are already in this category
        const filtered = data.filter((p: any) => p.category_id !== selectedCategory?.id);
        setSearchedProducts(filtered);
      }
    } catch (error) {
      toast.error("Произошла ошибка: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
      console.error("Failed to search products:", error);
    } finally {
      setIsSearchingProducts(false);
    }
  };

  const handleAssignProduct = async (productId: number) => {
    if (!selectedCategory || selectedCategory.id === 'new') return;
    try {
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: selectedCategory.id,
        }),
      });
      if (res.ok) {
        await fetchCategoryProducts(selectedCategory.id);
        setSearchedProducts(prev => prev.filter(p => p.id !== productId));
        await fetchCategories();
      } else {
        toast.error("Не удалось добавить товар в категорию");
      }
    } catch (error) {
      console.error("Failed to assign product:", error);
      toast.error("Ошибка сети");
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!selectedCategory || selectedCategory.id === 'new') return;
    try {
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: null,
        }),
      });
      if (res.ok) {
        await fetchCategoryProducts(selectedCategory.id);
        await fetchCategories();
      } else {
        toast.error("Не удалось убрать товар из категории");
      }
    } catch (error) {
      console.error("Failed to remove product:", error);
      toast.error("Ошибка сети");
    }
  };

  const handleMergeCategory = async () => {
    if (!selectedCategory || selectedCategory.id === 'new' || !mergeTargetCategoryId) return;
    
    try {
      setIsMerging(true);
      const res = await fetch(`/api/v1/categories/${selectedCategory.id}/merge?target_category_id=${mergeTargetCategoryId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Успешно перенесено товаров: ${data.moved_products_count}`);
        await fetchCategories();
        await fetchCategoryProducts(selectedCategory.id);
        setMergeTargetCategoryId(null);
      } else {
        const err = await res.json();
        toast.error(`Не удалось объединить категории: ${err.detail || "Неизвестная ошибка"}`);
      }
    } catch (error) {
      console.error("Merge error:", error);
      toast.error("Ошибка при подключении к серверу");
    } finally {
      setIsMerging(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await fetch("/api/v1/categories/sync", { method: "POST" });
      await fetchCategories();
    } catch (error) {
      toast.error("Произошла ошибка: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCategory = (id: number) => {
    setCategoryToDelete(id);
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete === null) return;
    
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/v1/categories/${categoryToDelete}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setCategoryToDelete(null);
        setSelectedCategory(null);
        await fetchCategories();
      } else {
        toast.error("Не удалось удалить категорию");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Ошибка при подключении к серверу");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleArchiveCategory = (cat: any) => {
    setCategoryToArchive(cat);
  };

  const confirmArchiveCategory = async () => {
    if (categoryToArchive === null) return;
    
    const action = categoryToArchive.is_active !== false ? 'archive' : 'restore';
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/v1/categories/${categoryToArchive.id}/${action}`, {
        method: "POST"
      });
      if (res.ok) {
        setCategoryToArchive(null);
        setSelectedCategory(null);
        await fetchCategories();
      } else {
        toast.error("Не удалось изменить статус категории");
      }
    } catch (error) {
      console.error("Failed to archive/restore category:", error);
      toast.error("Ошибка при подключении к серверу");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
      setEditName(selectedCategory.name || "");
      setEditIsOrderOnly(selectedCategory.is_order_only || false);
      setEditIsPreorder(selectedCategory.is_preorder || false);
      setEditPricePrefix(selectedCategory.price_prefix || "");
      setEditOrderLink(selectedCategory.order_link || "");
      setEditImageUrl(selectedCategory.image_url || "");
      setEditParentId(selectedCategory.parent_id || null);
      setEditRecommendedAccessories(selectedCategory.recommended_accessories || { category_ids: [], product_ids: [] });
      setEditAttributes(selectedCategory.attributes || []);
      setAccProductSearch("");
      setAccProductResults([]);

      if (selectedCategory.id !== 'new') {
        fetchCategoryProducts(selectedCategory.id);
        setProductSearchQuery("");
        setSearchedProducts([]);
        setMergeTargetCategoryId(null);
      } else {
        setCategoryProducts([]);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCategory]);

  // Search accessory products
  useEffect(() => {
    if (!accProductSearch.trim()) {
      setAccProductResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingAccProducts(true);
      try {
        const response = await fetch(`/api/v1/products?q=${encodeURIComponent(accProductSearch)}&limit=10`);
        if (response.ok) {
          const results = await response.json();
          setAccProductResults(results);
        }
      } catch (err) {
        console.error("Error searching accessory products:", err);
      } finally {
        setIsSearchingAccProducts(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [accProductSearch]);

  // Load details of selected accessory products
  useEffect(() => {
    async function loadAccProducts() {
      const ids = editRecommendedAccessories.product_ids || [];
      if (ids.length === 0) {
        setLoadedAccProducts([]);
        return;
      }
      
      const unloadedIds = ids.filter((id: number) => !loadedAccProducts.some(p => p.id === id));
      if (unloadedIds.length === 0) return;

      try {
        const responses = await Promise.all(
          unloadedIds.map((id: number) => fetch(`/api/v1/products/${id}`))
        );
        const newProds: any[] = [];
        for (const res of responses) {
          if (res.ok) {
            newProds.push(await res.json());
          }
        }
        setLoadedAccProducts(prev => [...prev, ...newProds]);
      } catch (err) {
        console.error("Failed to load accessory products details", err);
      }
    }
    loadAccProducts();
  }, [editRecommendedAccessories.product_ids]);

  const handleSaveCategory = async () => {
    if (!selectedCategory || !editName.trim()) return;
    
    try {
      setIsSaving(true);
      const url = selectedCategory.id === 'new' ? '/api/v1/categories' : `/api/v1/categories/${selectedCategory.id}`;
      const method = selectedCategory.id === 'new' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          parent_id: editParentId,
          is_order_only: editIsOrderOnly,
          is_preorder: editIsPreorder,
          price_prefix: editPricePrefix,
          order_link: editOrderLink,
          image_url: editImageUrl,
          recommended_accessories: editRecommendedAccessories,
          attributes: editAttributes,
        }),
      });
      if (res.ok) {
        setSelectedCategory(null);
        await fetchCategories();
      } else {
        toast.error("Не удалось сохранить изменения");
      }
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Ошибка при подключении к серверу");
    } finally {
      setIsSaving(false);
    }
  };

  // Build a tree from flat categories
  const buildTree = (cats: any[]) => {
    const map = new Map();
    const roots: any[] = [];
    
    cats.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });
    
    cats.forEach(cat => {
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id).children.push(map.get(cat.id));
      } else {
        roots.push(map.get(cat.id));
      }
    });
    
    return roots;
  };

  // Flatten the tree for rendering, respecting expanded state
  const flattenTree = (nodes: any[], depth = 0) => {
    let result: any[] = [];
    nodes.forEach(node => {
      result.push({ ...node, depth });
      if (expandedFolders.has(node.id) && node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children, depth + 1));
      }
    });
    return result;
  };

  const toggleFolder = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredByStatus = categories.filter(cat => 
    statusFilter === 'active' ? cat.is_active !== false : cat.is_active === false
  );

  const searchedCategories = searchQuery 
    ? filteredByStatus.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredByStatus;

  const displayCategories = searchQuery 
    ? searchedCategories.map(cat => ({...cat, depth: 0})) 
    : flattenTree(buildTree(filteredByStatus));

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Категории</h1>
            <p className="text-[14px] text-[#4f566b]">Управление структурой каталога и разделами товаров.</p>
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
            <button 
              onClick={() => setSelectedCategory({ id: 'new', name: '', parent_id: null, is_order_only: false, is_preorder: false, price_prefix: '', order_link: '', image_url: '' })}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all no-shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Создать категорию
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 border-b border-[#e3e8ee] pb-4">
          <div className="flex items-center bg-[#f7f8f9] p-1 rounded-lg border border-[#e3e8ee]">
            <button 
              onClick={() => setStatusFilter('active')}
              className={cn(
                "px-4 py-1.5 text-[13px] font-bold rounded-md transition-all",
                statusFilter === 'active' ? "bg-white text-[#1a1f36] shadow-sm" : "text-[#4f566b] hover:text-[#1a1f36]"
              )}
            >
              Активные
            </button>
            <button 
              onClick={() => setStatusFilter('archived')}
              className={cn(
                "px-4 py-1.5 text-[13px] font-bold rounded-md transition-all flex items-center gap-1.5",
                statusFilter === 'archived' ? "bg-white text-[#1a1f36] shadow-sm" : "text-[#4f566b] hover:text-[#1a1f36]"
              )}
            >
              Архив
            </button>
          </div>
          <div className="relative group flex-1 max-w-md ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
            <input 
              type="text" 
              placeholder="Поиск по названию категории..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-lg text-[13px] outline-none transition-all no-shadow"
            />
          </div>
        </div>

        {/* Categories Grid/Table */}
        <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden no-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Категория</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Товаров</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Обновлено</th>
                  <th className="px-6 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee]">
                {displayCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-[280px] mx-auto text-center">
                        <div className="w-10 h-10 rounded-xl bg-[#f7f8f9] border border-[#e3e8ee] flex items-center justify-center text-[#4f566b] mb-1">
                          <Layers className="w-5 h-5 opacity-60" />
                        </div>
                        <p className="text-[14px] font-bold text-[#1a1f36]">Ничего не найдено</p>
                        <p className="text-[11px] text-[#4f566b] leading-normal">
                          {searchQuery 
                            ? "По вашему запросу категорий не найдено. Попробуйте изменить текст поиска." 
                            : "В данном разделе отсутствуют категории."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayCategories.map((cat, idx) => (
                    <motion.tr 
                      key={cat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                      onClick={() => setSelectedCategory(cat)}
                      className="group cursor-pointer hover:bg-[#2c3b6e]/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4" style={{ paddingLeft: `${cat.depth * 28}px` }}>
                           <div 
                             className={cn(
                               "w-6 h-6 flex items-center justify-center rounded-md transition-colors",
                               cat.children && cat.children.length > 0 ? "hover:bg-[#e3e8ee] cursor-pointer" : "opacity-0"
                             )}
                             onClick={(e) => cat.children && cat.children.length > 0 ? toggleFolder(e, cat.id) : undefined}
                           >
                             {cat.children && cat.children.length > 0 && (
                               <ChevronRight className={cn("w-4 h-4 text-[#4f566b] transition-transform", expandedFolders.has(cat.id) && "rotate-90")} />
                             )}
                           </div>
                                                       <div className="w-10 h-10 bg-[#f7f8f9] group-hover:bg-white border border-transparent group-hover:border-[#e3e8ee] rounded-xl flex items-center justify-center text-[#2c3b6e] transition-all flex-shrink-0">
                               {cat.image_url ? (
                                 (cat.image_url.startsWith("http") || cat.image_url.startsWith("/")) ? (
                                   <img src={cat.image_url} alt={cat.name} className="w-5 h-5 object-contain rounded" />
                                 ) : (
                                   lucideMap[cat.image_url] ? (
                                     React.createElement(lucideMap[cat.image_url], { className: "w-5 h-5" })
                                   ) : (
                                     <FolderOpen className="w-5 h-5" />
                                   )
                                 )
                               ) : (
                                 cat.children && cat.children.length > 0 ? (
                                   <Folder className="w-5 h-5 fill-[#2c3b6e]/10" />
                                 ) : (
                                   React.createElement(categoryIcons[idx % categoryIcons.length] || FolderOpen, { className: "w-5 h-5" })
                                 )
                               )}
                            </div>
                           <span className="text-[14px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          cat.is_active !== false ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#f59e0b]/10 text-[#f59e0b]"
                        )}>
                          {cat.is_active !== false ? "Активна" : "В архиве"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[13px] font-bold text-[#1a1f36]">{cat.product_count || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[12px] font-medium text-[#4f566b]">—</span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleReorder(cat, 'up'); }}
                              className="p-1.5 hover:bg-[#f7f8f9] rounded-lg text-[#4f566b] hover:text-[#2c3b6e] transition-colors"
                              title="Вверх"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleReorder(cat, 'down'); }}
                              className="p-1.5 hover:bg-[#f7f8f9] rounded-lg text-[#4f566b] hover:text-[#2c3b6e] transition-colors"
                              title="Вниз"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-[1px] h-4 bg-[#e3e8ee] mx-1"></div>
                            <button 
                              onClick={() => setSelectedCategory(cat)}
                              className="p-1.5 hover:bg-[#f7f8f9] rounded-lg text-[#4f566b] hover:text-[#2c3b6e] transition-colors"
                              title="Редактировать"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleToggleArchiveCategory(cat)}
                              className="p-1.5 hover:bg-[#f7f8f9] rounded-lg text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-colors"
                              title={cat.is_active !== false ? "В архив" : "Восстановить"}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 hover:bg-[#cd5c5c]/10 rounded-lg text-[#cd5c5c] transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-colors ml-auto flex-shrink-0" />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Detail Drawer - Moved out of animated container */}
      <AnimatePresence>
        {selectedCategory && (
          <>
            <motion.div 
              key="backdrop" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedCategory(null)} 
              className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md z-[9999]" 
            />
            <motion.div 
              key="drawer" 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-[#e3e8ee] z-[10000] shadow-2xl flex flex-col" 
            >
              <div className="px-6 py-5 border-b border-[#e3e8ee] flex items-center justify-between">
                <div>
                   <h2 className="text-[16px] font-bold text-[#1a1f36]">
                      {selectedCategory.id === 'new' ? "Создание категории" : "Настройки категории"}
                   </h2>
                   <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">
                      {selectedCategory.id === 'new' ? "Новая категория" : `ID: CAT-${selectedCategory.id}`}
                   </p>
                </div>
                <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-[#f7f8f9] rounded-lg transition-colors"><XCircle className="w-5 h-5 text-[#4f566b]" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 <div className="space-y-4">
                    <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">Название категории</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30"
                    />
                 </div>

                  <div className="space-y-4">
                     <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">Родительская категория</label>
                     <div className="relative">
                        <div 
                          className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[13px] font-bold text-[#1a1f36] flex items-center justify-between cursor-pointer"
                          onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                        >
                          <span className={!editParentId ? "text-[#4f566b] font-normal" : ""}>
                            {editParentId 
                              ? categories.find(c => c.id === editParentId)?.name || "Неизвестная категория"
                              : "Без родительской категории (Корневая)"}
                          </span>
                          <ChevronDown className={cn("w-4 h-4 text-[#4f566b] transition-transform", isParentDropdownOpen && "rotate-180")} />
                        </div>
                        
                        {isParentDropdownOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-[#e3e8ee] rounded-xl shadow-lg max-h-[300px] flex flex-col overflow-hidden">
                            <div className="p-2 border-b border-[#e3e8ee]">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b]" />
                                <input 
                                  type="text" 
                                  placeholder="Поиск категории..." 
                                  value={parentSearchQuery}
                                  onChange={(e) => setParentSearchQuery(e.target.value)}
                                  className="w-full pl-9 pr-4 py-2 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-lg text-[13px] outline-none transition-all"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="overflow-y-auto flex-1 p-1">
                              <div 
                                className={cn(
                                  "px-3 py-2 text-[13px] rounded-lg cursor-pointer transition-colors",
                                  editParentId === null ? "bg-[#2c3b6e]/10 text-[#2c3b6e] font-bold" : "text-[#1a1f36] hover:bg-[#f7f8f9]"
                                )}
                                onClick={() => {
                                  setEditParentId(null);
                                  setIsParentDropdownOpen(false);
                                  setParentSearchQuery("");
                                }}
                              >
                                Без родительской категории (Корневая)
                              </div>
                              {categories
                                .filter((c) => c.id !== selectedCategory.id)
                                .filter((c) => c.name.toLowerCase().includes(parentSearchQuery.toLowerCase()))
                                .map((c) => (
                                  <div 
                                    key={c.id} 
                                    className={cn(
                                      "px-3 py-2 text-[13px] rounded-lg cursor-pointer transition-colors",
                                      editParentId === c.id ? "bg-[#2c3b6e]/10 text-[#2c3b6e] font-bold" : "text-[#1a1f36] hover:bg-[#f7f8f9]"
                                    )}
                                    onClick={() => {
                                      setEditParentId(c.id);
                                      setIsParentDropdownOpen(false);
                                      setParentSearchQuery("");
                                    }}
                                  >
                                    {c.name}
                                  </div>
                                ))}
                                {categories.filter((c) => c.id !== selectedCategory.id && c.name.toLowerCase().includes(parentSearchQuery.toLowerCase())).length === 0 && (
                                  <div className="px-3 py-4 text-center text-[12px] text-[#4f566b]">
                                    Ничего не найдено
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                     </div>
                  </div>

                 {/* Custom Order Settings */}
                  <div className="space-y-4 p-4 bg-white border border-[#e3e8ee] rounded-xl">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-[13px] font-bold text-[#1a1f36]">Режим «Заказать»</p>
                           <p className="text-[10px] text-[#4f566b] mt-0.5 max-w-[200px]">Вместо покупки через корзину кнопка будет вести в Telegram с текстом «Заказать»</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditIsOrderOnly(!editIsOrderOnly);
                          }}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none flex-shrink-0",
                            editIsOrderOnly ? "bg-[#10b981]" : "bg-slate-300"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              editIsOrderOnly ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                     </div>

                     <div className="flex items-center justify-between pt-3 border-t border-[#f7f8f9]">
                        <div>
                           <p className="text-[13px] font-bold text-[#1a1f36]">Режим «Под заказ»</p>
                           <p className="text-[10px] text-[#4f566b] mt-0.5 max-w-[200px]">Вместо покупки через корзину кнопка будет вести в Telegram с текстом «Под заказ»</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditIsPreorder(!editIsPreorder);
                          }}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none flex-shrink-0",
                            editIsPreorder ? "bg-[#10b981]" : "bg-slate-300"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              editIsPreorder ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                     </div>

                     {(editIsOrderOnly || editIsPreorder) && (
                       <div className="space-y-3 pt-3 border-t border-[#f7f8f9] animate-in fade-in slide-in-from-top-2">
                         <div>
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1.5 block">Ссылка для заказа (Telegram)</label>
                            <input 
                              type="text" 
                              value={editOrderLink}
                              onChange={(e) => setEditOrderLink(e.target.value)}
                              placeholder="https://t.me/your_username"
                              className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] font-medium text-[#2c3b6e] outline-none focus:border-[#2c3b6e]/30"
                            />
                         </div>
                       </div>
                     )}
                  </div>
                  
                  {/* Category Icon and Image Selector */}
                  <div className="space-y-4 p-4 bg-white border border-[#e3e8ee] rounded-xl">
                     <p className="text-[13px] font-bold text-[#1a1f36]">Выбор иконки категории</p>
                     
                     {/* Preview */}
                     <div className="flex items-center gap-3.5 pb-3.5 border-b border-[#f7f8f9]">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#2c3b6e]">
                           {editImageUrl ? (
                             (editImageUrl.startsWith("http") || editImageUrl.startsWith("/")) ? (
                               <img src={editImageUrl} alt="Preview" className="w-8 h-8 object-contain rounded-lg" />
                             ) : (
                               lucideMap[editImageUrl] ? (
                                 React.createElement(lucideMap[editImageUrl], { className: "w-6 h-6" })
                               ) : (
                                 <Folder className="w-6 h-6" />
                               )
                             )
                           ) : (
                             <Folder className="w-6 h-6" />
                           )}
                        </div>
                        <div>
                           <p className="text-[11px] font-bold text-[#1a1f36]">Текущая иконка</p>
                           <p className="text-[10px] text-[#4f566b] mt-0.5">
                             {editImageUrl ? (
                               (editImageUrl.startsWith("http") || editImageUrl.startsWith("/")) ? "Собственный SVG/PNG" : `Lucide: ${editImageUrl}`
                             ) : "Стандартная (Папка)"}
                           </p>
                           {editImageUrl && (
                             <button 
                               onClick={() => setEditImageUrl("")}
                               className="text-[9px] font-extrabold text-red-500 hover:text-red-600 uppercase tracking-wider mt-1 block"
                             >
                               Сбросить иконку
                             </button>
                           )}
                        </div>
                     </div>

                     {/* Upload Custom Image Option */}
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest block">Загрузить файл иконки (SVG/PNG)</label>
                        <div className="relative border border-dashed border-[#e3e8ee] hover:border-[#2c3b6e]/30 rounded-xl p-3 text-center transition-all bg-[#f7f8f9]/50">
                           <input 
                              type="file" 
                              accept="image/*"
                              onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (!file) return;
                                 
                                 const formData = new FormData();
                                 formData.append("file", file);
                                 
                                 try {
                                    const res = await fetch("/api/v1/uploads", {
                                       method: "POST",
                                       body: formData,
                                    });
                                    if (res.ok) {
                                       const data = await res.json();
                                       setEditImageUrl(data.url);
                                    } else {
                                       toast.error("Не удалось загрузить иконку");
                                    }
                                 } catch (err) {
                                    console.error("Upload error", err);
                                    toast.error("Ошибка сети при загрузке");
                                 }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                           <div className="space-y-1">
                              <p className="text-[11px] font-bold text-[#2c3b6e]">Выберите SVG или PNG файл</p>
                              <p className="text-[9px] text-[#4f566b] leading-tight">
                                 Рекомендуемый формат: <strong>SVG</strong> или <strong>PNG</strong><br/>
                                 Размер: <strong>64x64px</strong>, прозрачный фон.
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Grid of Lucide Icons */}
                     <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest block">Выбрать готовую иконку (30+ вариантов)</label>
                        <div className="grid grid-cols-6 gap-2 max-h-[160px] overflow-y-auto p-1.5 bg-[#f7f8f9] rounded-xl border border-[#e3e8ee]">
                           {Object.keys(lucideMap).map((iconName) => {
                              const IconComp = lucideMap[iconName];
                              const isSelected = editImageUrl === iconName;
                              return (
                                 <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setEditImageUrl(iconName)}
                                    className={cn(
                                       "aspect-square rounded-lg flex items-center justify-center transition-all border",
                                       isSelected 
                                          ? "bg-[#2c3b6e] text-white border-transparent scale-105" 
                                          : "bg-white text-slate-600 hover:text-[#2c3b6e] border-slate-100 hover:border-slate-300"
                                    )}
                                    title={iconName}
                                 >
                                    <IconComp className="w-4 h-4" />
                                 </button>
                              );
                           })}
                        </div>
                     </div>
                  </div>

                  {/* --- Accessories Config (Часто покупают вместе) --- */}
                  {selectedCategory.id !== 'new' && (
                     <div className="space-y-4 p-4 bg-white border border-[#e3e8ee] rounded-xl shadow-none">
                        <div>
                           <p className="text-[13px] font-bold text-[#1a1f36]">Сопутствующие категории и товары</p>
                           <p className="text-[10px] text-[#4f566b] mt-0.5">Настройте, какие категории или конкретные товары будут рекомендоваться к товарам из этой категории.</p>
                        </div>

                        {/* Custom Title Input */}
                        <div className="space-y-2 pt-3 border-t border-[#f7f8f9]">
                           <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest block">Заголовок блока рекомендаций</label>
                           <input
                             type="text"
                             placeholder="Например: С этим товаром покупают"
                             value={editRecommendedAccessories.title || ""}
                             onChange={(e) => {
                               setEditRecommendedAccessories({
                                 ...editRecommendedAccessories,
                                 title: e.target.value
                               });
                             }}
                             className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[12px] font-medium outline-none focus:border-[#2c3b6e]/30"
                           />
                        </div>

                        {/* Category selection */}
                        <div className="space-y-2 pt-3 border-t border-[#f7f8f9]">
                           <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest block">Рекомендовать категории</label>
                           
                           {/* Selected category tags */}
                           <div className="flex flex-wrap gap-1.5 mb-2">
                              {(editRecommendedAccessories.category_ids || []).map((catId: number) => {
                                const cat = categories.find(c => c.id === catId);
                                if (!cat) return null;
                                return (
                                  <span key={catId} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2c3b6e]/10 text-[#2c3b6e] text-[10px] font-bold rounded-lg border border-[#2c3b6e]/20">
                                     {cat.name}
                                     <button
                                       type="button"
                                       onClick={() => {
                                         const nextCatIds = (editRecommendedAccessories.category_ids || []).filter((id: number) => id !== catId);
                                         setEditRecommendedAccessories({ ...editRecommendedAccessories, category_ids: nextCatIds });
                                       }}
                                       className="hover:text-red-500 transition-colors font-bold ml-1 text-slate-400"
                                     >
                                       &times;
                                     </button>
                                  </span>
                                );
                              })}
                              {(editRecommendedAccessories.category_ids || []).length === 0 && (
                                <span className="text-[10px] text-slate-400 italic">Категории не выбраны</span>
                              )}
                           </div>

                           {/* Select a category to add */}
                           <div className="relative">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (!e.target.value) return;
                                  const catId = parseInt(e.target.value);
                                  const currentIds = editRecommendedAccessories.category_ids || [];
                                  if (!currentIds.includes(catId)) {
                                    setEditRecommendedAccessories({
                                      ...editRecommendedAccessories,
                                      category_ids: [...currentIds, catId]
                                    });
                                  }
                                }}
                                className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[12px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 appearance-none cursor-pointer"
                              >
                                 <option value="">Добавить сопутствующую категорию...</option>
                                 {categories
                                   .filter(c => c.id !== selectedCategory.id && !(editRecommendedAccessories.category_ids || []).includes(c.id))
                                   .map(c => {
                                     const parent = c.parent_id ? categories.find(parentCat => parentCat.id === c.parent_id) : null;
                                     const displayName = parent ? `${parent.name} → ${c.name}` : c.name;
                                     return (
                                       <option key={c.id} value={c.id}>
                                          {displayName}
                                       </option>
                                     );
                                   })}
                              </select>
                              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] pointer-events-none" />
                           </div>
                        </div>

                        {/* Product selection */}
                        <div className="space-y-2.5 pt-3 border-t border-[#f7f8f9]">
                           <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest block">Рекомендовать товары</label>
                           
                           {/* Product search input */}
                           <div className="relative">
                              <input
                                type="text"
                                placeholder="Поиск товаров для добавления..."
                                value={accProductSearch}
                                onChange={(e) => setAccProductSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[12px] font-medium outline-none focus:border-[#2c3b6e]/30"
                              />
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b]" />
                              {isSearchingAccProducts && (
                                <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2c3b6e] animate-spin" />
                              )}

                              {/* Search results dropdown */}
                              {accProductResults.length > 0 && (
                                <div className="absolute z-[100] left-0 right-0 mt-1 bg-white border border-[#e3e8ee] rounded-xl shadow-xl max-h-[180px] overflow-y-auto">
                                   {accProductResults.map(p => {
                                     const isAdded = (editRecommendedAccessories.product_ids || []).includes(p.id);
                                     return (
                                       <div
                                         key={p.id}
                                         onClick={() => {
                                           if (isAdded) return;
                                           const currentProductIds = editRecommendedAccessories.product_ids || [];
                                           setEditRecommendedAccessories({
                                             ...editRecommendedAccessories,
                                             product_ids: [...currentProductIds, p.id]
                                           });
                                           setAccProductSearch("");
                                           setAccProductResults([]);
                                         }}
                                         className={cn(
                                           "px-3 py-2 text-[11px] border-b border-[#f7f8f9] last:border-0 flex items-center justify-between cursor-pointer hover:bg-slate-50",
                                           isAdded && "opacity-50 cursor-not-allowed"
                                         )}
                                       >
                                          <span className="truncate max-w-[70%] font-bold text-[#1a1f36]">{p.name}</span>
                                          <span className="text-[10px] font-medium text-slate-500">{p.price?.toLocaleString()} сум</span>
                                       </div>
                                     );
                                   })}
                                </div>
                              )}
                           </div>

                           {/* Selected accessory products list */}
                           <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                              {(editRecommendedAccessories.product_ids || []).map((prodId: number) => {
                                const prod = loadedAccProducts.find(p => p.id === prodId);
                                return (
                                  <div key={prodId} className="flex items-center justify-between p-2 bg-[#f7f8f9] border border-slate-100 rounded-lg">
                                     <div className="min-w-0 flex-1 pr-2">
                                        <p className="text-[11px] font-bold text-[#1a1f36] truncate">{prod ? prod.name : `Загрузка товара #${prodId}...`}</p>
                                     </div>
                                     <button
                                       type="button"
                                       onClick={() => {
                                         const nextProductIds = (editRecommendedAccessories.product_ids || []).filter((id: number) => id !== prodId);
                                         setEditRecommendedAccessories({ ...editRecommendedAccessories, product_ids: nextProductIds });
                                       }}
                                       className="text-red-500 hover:text-red-600 transition-colors p-1"
                                     >
                                        <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                  </div>
                                );
                              })}
                              {(editRecommendedAccessories.product_ids || []).length === 0 && (
                                <p className="text-[10px] text-slate-400 italic">Товары не выбраны</p>
                              )}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* --- Category Attributes (Характеристики) --- */}
                  {selectedCategory.id !== 'new' && (
                     <div className="space-y-4 p-4 bg-white border border-[#e3e8ee] rounded-xl">
                        <div>
                           <p className="text-[13px] font-bold text-[#1a1f36]">Характеристики категории</p>
                           <p className="text-[10px] text-[#4f566b] mt-0.5">Настройте характеристики, которые будут отображаться у всех товаров этой категории.</p>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-[#f7f8f9]">
                           {/* Existing attributes */}
                           <div className="space-y-1.5">
                              {editAttributes.map((attr: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-[#f7f8f9] border border-slate-100 rounded-lg">
                                   <input
                                     type="text"
                                     placeholder="Название характеристики"
                                     value={attr.name || ""}
                                     onChange={(e) => {
                                       const next = [...editAttributes];
                                       next[idx] = { ...next[idx], name: e.target.value };
                                       setEditAttributes(next);
                                     }}
                                     className="flex-1 px-2 py-1.5 bg-white border border-[#e3e8ee] rounded-lg text-[12px] font-medium text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30"
                                   />
                                   <select
                                     value={attr.type || "text"}
                                     onChange={(e) => {
                                       const next = [...editAttributes];
                                       next[idx] = { ...next[idx], type: e.target.value };
                                       setEditAttributes(next);
                                     }}
                                     className="px-2 py-1.5 bg-white border border-[#e3e8ee] rounded-lg text-[11px] font-medium text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 w-[110px]"
                                   >
                                      <option value="text">Текст</option>
                                      <option value="number">Число</option>
                                   </select>
                                   <button
                                     type="button"
                                     onClick={() => {
                                       const next = editAttributes.filter((_, i) => i !== idx);
                                       setEditAttributes(next);
                                     }}
                                     className="text-red-500 hover:text-red-600 transition-colors p-1"
                                   >
                                      <Trash2 className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                              ))}
                              {editAttributes.length === 0 && (
                                <p className="text-[10px] text-slate-400 italic">Характеристики не добавлены</p>
                              )}
                           </div>

                           {/* Add new attribute */}
                           <button
                             type="button"
                             onClick={() => {
                               setEditAttributes([...editAttributes, { name: "", type: "text" }]);
                             }}
                             className="w-full py-2 border border-dashed border-[#e3e8ee] hover:border-[#2c3b6e]/40 rounded-xl text-[11px] font-bold text-[#2c3b6e] hover:bg-[#2c3b6e]/5 transition-all"
                           >
                              + Добавить характеристику
                           </button>
                        </div>
                     </div>
                  )}

                  {selectedCategory.id !== 'new' && (
                    <>
                      {/* Products section */}
                      <div className="space-y-4 p-4 bg-white border border-[#e3e8ee] rounded-xl">
                         <div className="flex items-center justify-between pb-2 border-b border-[#f7f8f9]">
                            <p className="text-[13px] font-bold text-[#1a1f36]">Товары в этой категории</p>
                            <span className="px-2 py-0.5 bg-[#2c3b6e]/10 text-[#2c3b6e] text-[10px] font-bold rounded-full">
                               {categoryProducts.length} шт
                            </span>
                         </div>
                         
                         {/* Products list */}
                         <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                            {isLoadingCategoryProducts ? (
                               <p className="text-[11px] text-[#4f566b] text-center py-4">Загрузка товаров...</p>
                            ) : categoryProducts.length === 0 ? (
                               <p className="text-[11px] text-[#4f566b] text-center py-4">В этой категории пока нет товаров</p>
                            ) : (
                               categoryProducts.map((prod) => (
                                  <div key={prod.id} className="flex items-center justify-between gap-3 p-2 bg-[#f7f8f9] hover:bg-[#f7f8f9]/80 rounded-lg border border-slate-100 transition-all text-left">
                                     <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                           {prod.image_url ? (
                                              <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                           ) : (
                                              <Tag className="w-3.5 h-3.5 text-[#4f566b]" />
                                           )}
                                        </div>
                                        <div className="min-w-0">
                                           <p className="text-[11px] font-bold text-[#1a1f36] truncate">{prod.name}</p>
                                           <p className="text-[9px] text-[#4f566b]">SKU: {prod.sku || "—"}</p>
                                        </div>
                                     </div>
                                     <button 
                                       onClick={() => handleRemoveProduct(prod.id)}
                                       className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors flex-shrink-0"
                                       title="Убрать из категории"
                                     >
                                        <XCircle className="w-4 h-4" />
                                     </button>
                                  </div>
                               ))
                            )}
                         </div>

                         {/* Add products search */}
                         <div className="space-y-2 pt-2 border-t border-[#f7f8f9]">
                            <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest block">Добавить товары в категорию</label>
                            <div className="relative">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b]" />
                               <input 
                                 type="text" 
                                 placeholder="Поиск товаров для добавления..." 
                                 value={productSearchQuery}
                                 onChange={(e) => handleSearchProducts(e.target.value)}
                                 className="w-full pl-9 pr-4 py-2 bg-[#f7f8f9] border border-[#e3e8ee] focus:border-[#2c3b6e]/30 focus:bg-white rounded-lg text-[12px] outline-none transition-all no-shadow"
                               />
                            </div>
                            
                            {/* Search results */}
                            {productSearchQuery && (
                               <div className="max-h-[150px] overflow-y-auto space-y-2 p-1.5 bg-[#f7f8f9]/50 rounded-lg border border-[#e3e8ee] mt-1 animate-in fade-in duration-200">
                                  {isSearchingProducts ? (
                                     <p className="text-[10px] text-[#4f566b] text-center py-2">Поиск...</p>
                                  ) : searchedProducts.length === 0 ? (
                                     <p className="text-[10px] text-[#4f566b] text-center py-2">Ничего не найдено</p>
                                  ) : (
                                     searchedProducts.map((prod) => (
                                        <div key={prod.id} className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-slate-100 text-left">
                                           <div className="flex items-center gap-2.5 min-w-0">
                                              <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                 {prod.image_url ? (
                                                    <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                                 ) : (
                                                    <Tag className="w-3 h-3 text-[#4f566b]" />
                                                 )}
                                              </div>
                                              <div className="min-w-0">
                                                 <p className="text-[10px] font-bold text-[#1a1f36] truncate">{prod.name}</p>
                                                 <p className="text-[8px] text-[#4f566b]">SKU: {prod.sku || "—"}</p>
                                              </div>
                                           </div>
                                           <button 
                                             onClick={() => handleAssignProduct(prod.id)}
                                             className="flex items-center gap-1 px-2 py-1 bg-[#2c3b6e]/5 hover:bg-[#2c3b6e]/10 text-[#2c3b6e] text-[9px] font-bold rounded transition-colors flex-shrink-0"
                                           >
                                              <Plus className="w-3 h-3" />
                                              Добавить
                                           </button>
                                        </div>
                                     ))
                                  )}
                               </div>
                            )}
                         </div>
                      </div>

                      {/* Merge category section */}
                      <div className="space-y-4 p-4 bg-white border border-[#e3e8ee] rounded-xl text-left">
                         <div>
                            <p className="text-[13px] font-bold text-[#1a1f36]">Объединение категорий</p>
                            <p className="text-[10px] text-[#4f566b] mt-0.5">Перенести все товары из этой категории в другую.</p>
                         </div>
                         
                         <div className="space-y-3">
                            <div className="relative">
                               <select 
                                 value={mergeTargetCategoryId || ""}
                                 onChange={(e) => setMergeTargetCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                                 className="w-full px-4 py-2.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[12px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 appearance-none cursor-pointer"
                               >
                                 <option value="">Выберите целевую категорию...</option>
                                 {categories
                                   .filter((c) => c.id !== selectedCategory.id)
                                   .map((c) => (
                                     <option key={c.id} value={c.id}>
                                       {c.name}
                                     </option>
                                   ))}
                               </select>
                               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f566b] pointer-events-none" />
                            </div>
                            
                            {mergeTargetCategoryId && (
                               <button 
                                 onClick={handleMergeCategory}
                                 disabled={isMerging}
                                 className={cn(
                                   "w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl text-[12px] font-bold transition-all",
                                   isMerging && "opacity-50 cursor-not-allowed"
                                 )}
                               >
                                  {isMerging ? "Перенос товаров..." : "Перенести товары и объединить"}
                               </button>
                            )}
                         </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#f7f8f9] rounded-xl border border-[#e3e8ee]">
                       <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1">Товаров</p>
                       <p className="text-[13px] font-bold text-[#1a1f36]">{selectedCategory.id === 'new' ? 0 : (selectedCategory.product_count || 0)} шт</p>
                    </div>
                    <div className="p-4 bg-[#f7f8f9] rounded-xl border border-[#e3e8ee]">
                       <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1">Статус</p>
                       <p className={cn(
                         "text-[13px] font-bold",
                         selectedCategory.is_active !== false ? "text-[#10b981]" : "text-[#f59e0b]"
                       )}>
                         {selectedCategory.is_active !== false ? "Активна" : "В архиве"}
                       </p>
                    </div>
                  </div>
                  {selectedCategory.id !== 'new' && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                       <p className="text-[12px] font-bold text-emerald-800">Категория синхронизирована</p>
                       <p className="text-[10px] text-emerald-600 mt-1">Все изменения будут автоматически обновлены в основном каталоге.</p>
                    </div>
                  )}
              </div>
              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 sticky bottom-0 flex gap-3">
                 {selectedCategory.id !== 'new' && (
                   <>
                     <button 
                       onClick={() => handleDeleteCategory(selectedCategory.id)}
                       disabled={isDeleting || isSaving}
                       className={cn(
                         "flex items-center justify-center gap-2 px-4 py-3 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#cd5c5c] hover:bg-white transition-all no-shadow",
                         (isDeleting || isSaving) && "opacity-50 cursor-not-allowed"
                       )}
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleToggleArchiveCategory(selectedCategory)}
                       disabled={isDeleting || isSaving}
                       className={cn(
                         "flex items-center justify-center gap-2 px-4 py-3 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#f59e0b] hover:bg-[#f7f8f9] transition-all no-shadow",
                         (isDeleting || isSaving) && "opacity-50 cursor-not-allowed"
                       )}
                     >
                        <Archive className="w-4 h-4" />
                        {selectedCategory.is_active !== false ? "В архив" : "Восст."}
                     </button>
                   </>
                 )}
                 <button 
                   onClick={handleSaveCategory}
                   disabled={isSaving || isDeleting || !editName.trim()}
                   className={cn(
                     "flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all",
                     (isSaving || isDeleting || !editName.trim()) && "opacity-50 cursor-not-allowed"
                   )}
                 >
                    {isSaving ? "Сохранение..." : selectedCategory.id === 'new' ? "Создать" : "Сохранить"}
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete !== null && (
          <>
            <motion.div 
              key="confirm-backdrop" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setCategoryToDelete(null)} 
              className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-sm z-[20000]" 
            />
            <motion.div 
              key="confirm-modal" 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border border-[#e3e8ee] z-[20001] rounded-2xl shadow-2xl p-6 text-left flex flex-col gap-4"
            >
              <div>
                <h3 className="text-[16px] font-bold text-[#1a1f36] mb-1">Удалить категорию?</h3>
                <p className="text-[12px] text-[#4f566b] leading-relaxed">
                  Это действие безвозвратно удалит категорию, все подкатегории и привязанные к ним товары с витрины сайта.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 mt-2">
                <button 
                  onClick={() => setCategoryToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-[#e3e8ee] hover:bg-[#f7f8f9] rounded-lg text-[13px] font-bold text-[#4f566b] transition-all no-shadow"
                >
                  Отмена
                </button>
                <button 
                  onClick={() => confirmDeleteCategory()}
                  disabled={isDeleting}
                  className={cn(
                    "px-4 py-2 bg-[#cd5c5c] hover:bg-[#b04b4b] rounded-lg text-[13px] font-bold text-white transition-all flex items-center gap-1.5",
                    isDeleting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isDeleting ? "Удаление..." : "Да, удалить"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Archive/Restore Confirmation Modal */}
      <AnimatePresence>
        {categoryToArchive !== null && (
          <>
            <motion.div 
              key="archive-backdrop" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setCategoryToArchive(null)} 
              className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-sm z-[20000]" 
            />
            <motion.div 
              key="archive-modal" 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }} 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border border-[#e3e8ee] z-[20001] rounded-2xl shadow-2xl p-6 text-left flex flex-col gap-4"
            >
              <div>
                <h3 className="text-[16px] font-bold text-[#1a1f36] mb-1">
                  {categoryToArchive.is_active !== false ? "Архивировать категорию?" : "Восстановить категорию?"}
                </h3>
                <p className="text-[12px] text-[#4f566b] leading-relaxed">
                  {categoryToArchive.is_active !== false 
                    ? "Все подкатегории и связанные товары также будут скрыты с сайта!"
                    : "Все подкатегории и связанные товары снова появятся на витрине сайта."}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 mt-2">
                <button 
                  onClick={() => setCategoryToArchive(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-[#e3e8ee] hover:bg-[#f7f8f9] rounded-lg text-[13px] font-bold text-[#4f566b] transition-all no-shadow"
                >
                  Отмена
                </button>
                <button 
                  onClick={() => confirmArchiveCategory()}
                  disabled={isDeleting}
                  className={cn(
                    "px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] rounded-lg text-[13px] font-bold text-white transition-all flex items-center gap-1.5",
                    isDeleting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isDeleting ? "Сохранение..." : (categoryToArchive.is_active !== false ? "В архив" : "Восстановить")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-bold tracking-tight">Порядок успешно изменён!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
