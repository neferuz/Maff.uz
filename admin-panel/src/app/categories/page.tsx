"use client";

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

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/categories/?include_inactive=true");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await fetch("/api/v1/categories/sync", { method: "POST" });
      await fetchCategories();
    } catch (error) {
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
        alert("Не удалось удалить категорию");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Ошибка при подключении к серверу");
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
        alert("Не удалось изменить статус категории");
      }
    } catch (error) {
      console.error("Failed to archive/restore category:", error);
      alert("Ошибка при подключении к серверу");
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
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCategory]);

  const handleSaveCategory = async () => {
    if (!selectedCategory || !editName.trim()) return;
    
    try {
      setIsSaving(true);
      const res = await fetch(`/api/v1/categories/${selectedCategory.id}`, {
        method: "PUT",
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
        }),
      });
      if (res.ok) {
        setSelectedCategory(null);
        await fetchCategories();
      } else {
        alert("Не удалось сохранить изменения");
      }
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Ошибка при подключении к серверу");
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
            <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all no-shadow">
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
                   <h2 className="text-[16px] font-bold text-[#1a1f36]">Настройки категории</h2>
                   <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">ID: CAT-{selectedCategory.id}</p>
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
                        <select 
                          value={editParentId || ""}
                          onChange={(e) => setEditParentId(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[13px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 appearance-none cursor-pointer"
                        >
                          <option value="">Без родительской категории (Корневая)</option>
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
                                       alert("Не удалось загрузить иконку");
                                    }
                                 } catch (err) {
                                    console.error("Upload error", err);
                                    alert("Ошибка сети при загрузке");
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#f7f8f9] rounded-xl border border-[#e3e8ee]">
                       <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1">Товаров</p>
                       <p className="text-[13px] font-bold text-[#1a1f36]">{selectedCategory.product_count || 0} шт</p>
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
                 <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[12px] font-bold text-emerald-800">Категория синхронизирована</p>
                    <p className="text-[10px] text-emerald-600 mt-1">Все изменения будут автоматически обновлены в основном каталоге.</p>
                 </div>
              </div>
              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 sticky bottom-0 grid grid-cols-3 gap-3">
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
                 <button 
                   onClick={handleSaveCategory}
                   disabled={isSaving || isDeleting || !editName.trim()}
                   className={cn(
                     "flex items-center justify-center gap-2 px-4 py-3 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all",
                     (isSaving || isDeleting || !editName.trim()) && "opacity-50 cursor-not-allowed"
                   )}
                 >
                    {isSaving ? "Сохранение..." : "Сохранить"}
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
    </>
  );
}
