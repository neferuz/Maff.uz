"use client";

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
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/categories/");
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCategory]);

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

  const searchedCategories = searchQuery 
    ? categories.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;

  const displayCategories = searchQuery 
    ? searchedCategories.map(cat => ({...cat, depth: 0})) 
    : flattenTree(buildTree(categories));

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
          <div className="relative group flex-1 max-w-md">
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
                {displayCategories.map((cat, idx) => (
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
                            {cat.children && cat.children.length > 0 ? (
                              <Folder className="w-5 h-5 fill-[#2c3b6e]/10" />
                            ) : (
                              <FolderOpen className="w-5 h-5" />
                            )}
                         </div>
                         <span className="text-[14px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        "bg-[#10b981]/10 text-[#10b981]"
                      )}>
                        Активна
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[13px] font-bold text-[#1a1f36]">{cat.product_count || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[12px] font-medium text-[#4f566b]">—</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-colors ml-auto" />
                    </td>
                  </motion.tr>
                ))}
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
                      defaultValue={selectedCategory.name}
                      className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#f7f8f9] rounded-xl border border-[#e3e8ee]">
                       <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1">Товаров</p>
                       <p className="text-[13px] font-bold text-[#1a1f36]">{selectedCategory.product_count || 0} шт</p>
                    </div>
                    <div className="p-4 bg-[#f7f8f9] rounded-xl border border-[#e3e8ee]">
                       <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1">Статус</p>
                       <p className="text-[13px] font-bold text-[#10b981]">Активна</p>
                    </div>
                 </div>
                 <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[12px] font-bold text-emerald-800">Категория синхронизирована</p>
                    <p className="text-[10px] text-emerald-600 mt-1">Все изменения будут автоматически обновлены в основном каталоге.</p>
                 </div>
              </div>
              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 sticky bottom-0 grid grid-cols-2 gap-3">
                 <button className="flex items-center justify-center gap-2 px-4 py-3 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#cd5c5c] hover:bg-white transition-all no-shadow">
                    <Trash2 className="w-4 h-4" />
                    Удалить
                 </button>
                 <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all">
                    Сохранить
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
