"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { 
  ChevronRight, 
  SlidersHorizontal, 
  ChevronDown,
  X,
  Filter,
  ArrowUpDown,
  Percent,
  Image as ImageIcon,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ui/product-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const FILTERS = {
  brands: ["AGT", "Barlinek", "Profildoors", "BerryAlloc", "Kaindl"]
};

function OutletContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const isCatalogMode = false;
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryParam ? parseInt(categoryParam) : null
  );
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Популярные");
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 100;

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategoryId(parseInt(categoryParam));
    } else {
      setSelectedCategoryId(null);
    }
  }, [categoryParam]);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await fetch(`/api/v1/categories/?t=${Date.now()}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
        const catData = await catRes.json();
        const safeCategories = Array.isArray(catData) ? catData : [];
        setCategories(safeCategories);
      } catch (err) {
        console.error("Fetch categories failed", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when selectedCategoryId changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = selectedCategoryId
          ? `/api/v1/products/?category_id=${selectedCategoryId}&t=${Date.now()}`
          : `/api/v1/products/?t=${Date.now()}`;
        const prodRes = await fetch(url, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
        const prodData = await prodRes.json();
        const safeProducts = Array.isArray(prodData) ? prodData : [];
        setProducts(safeProducts);

        const uniqueBrands = Array.from(new Set(safeProducts.map((p: any) => p.brand).filter(Boolean))) as string[];
        const cleanBrands = uniqueBrands.filter(b => typeof b === 'string' && !/^[0-9a-f-]{36}$/.test(b)).sort();
        setAvailableBrands(cleanBrands);
      } catch (err) {
        console.error("Fetch products failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId]);

  const getAllChildIds = (catId: number, cats: any[], depth = 0): number[] => {
    if (depth > 10) return [catId];
    const children = cats.filter(c => c && c.parent_id === catId);
    let ids = [catId];
    children.forEach(child => {
      ids = [...ids, ...getAllChildIds(child.id, cats, depth + 1)];
    });
    return ids;
  };

  const filteredProducts = useMemo(() => {
    let result = isCatalogMode ? [...products] : products.filter(p => p.price_outlet && p.price_outlet > 0);
    if (selectedCategoryId) {
      const allRelatedIds = getAllChildIds(selectedCategoryId, categories);
      result = result.filter(p => p.category_id && allRelatedIds.includes(p.category_id));
    }
    if (activeFilters.length > 0) {
      result = result.filter(p => activeFilters.includes(p.brand));
    }
    
    const getPrice = (p: any) => p.price || 0;
    switch (sortBy) {
      case "Сначала дешевле": result.sort((a, b) => getPrice(a) - getPrice(b)); break;
      case "Сначала дороже": result.sort((a, b) => getPrice(b) - getPrice(a)); break;
      case "По названию": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return result;
  }, [products, selectedCategoryId, categories, activeFilters, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const allDoorIds = useMemo(() => {
    const mainDoorCats = categories.filter(c => c && c.name && c.name.toLowerCase().includes('двер'));
    let ids: number[] = [];
    mainDoorCats.forEach(c => {
      ids = [...ids, ...getAllChildIds(c.id, categories)];
    });
    return Array.from(new Set(ids));
  }, [categories]);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage).map(p => {
        const name = p.name || "Безымянный товар";
        const nameParts = name.split(' ');
        
        // Resolve category order-only recursively
        let isOrderOnly = false;
        let isPreorder = false;
        let orderLink = "";
        let currentCat = categories.find(c => c.id === p.category_id);
        const visited = new Set();
        while (currentCat && !visited.has(currentCat.id)) {
          visited.add(currentCat.id);
          if (currentCat.is_order_only) {
            isOrderOnly = true;
          }
          if (currentCat.is_preorder) {
            isPreorder = true;
          }
          if (!orderLink && currentCat.order_link) {
            orderLink = currentCat.order_link;
          }
          if (currentCat.parent_id) {
            currentCat = categories.find(c => c.id === currentCat.parent_id);
          } else {
            break;
          }
        }
        
        return {
          id: p.id,
          title: name,
          country: p.country || (name.toLowerCase().includes('турц') ? "Турция" : name.toLowerCase().includes('росс') ? "Россия" : "Европа"),
          brand: p.brand || nameParts[0] || "MAFF",
          grade: p.grade || (name.includes('33') ? "33 класс" : name.includes('32') ? "32 класс" : "Premium"),
          thickness: p.thickness || name.match(/\d+мм/)?.[0] || "8мм",
          price: Number(p.price || 0),
          priceOutlet: p.price_outlet ? Number(p.price_outlet) : undefined,
          inStock: p.stock > 0,
          isDoor: allDoorIds.includes(p.category_id),
          isOrderOnly: isOrderOnly,
          isPreorder: isPreorder,
          orderLink: orderLink,
          image: (p.image_url && typeof p.image_url === 'string')
            ? (p.image_url.startsWith('http') 
                ? `${p.image_url}?v=3`
                : `${p.image_url.startsWith('/') ? '' : '/'}${p.image_url}?v=3`)
            : "",
          discount: p.price_outlet 
            ? `−${Math.round(((p.price - p.price_outlet) / p.price) * 100)}%` 
            : (p.price < 200000 ? "−20%" : "SALE")
        };
      })
  }, [currentPage, filteredProducts, allDoorIds]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    setCurrentPage(1);
  };

  const getPaginationButtons = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    if (totalPages > 1) range.push(totalPages);

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  const mainCategories = categories.filter(c => !c.parent_id);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    const cat = categories.find(c => c.id === selectedCategoryId);
    return cat ? cat.name : null;
  }, [selectedCategoryId, categories]);

  const FilterContent = (
    <div className="space-y-8">
      <div>
         <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-100 dark:border-white/5">Категории</h3>
         <div className="space-y-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="w-full h-8 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
              ))
            ) : (
              <>
                <button onClick={() => setSelectedCategoryId(null)} className={cn("w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-colors", !selectedCategoryId ? "bg-blue-50 dark:bg-blue-900/30 text-[#2c3b6e] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}>Все товары</button>
                {mainCategories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className={cn("w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-colors", selectedCategoryId === cat.id ? "bg-blue-50 dark:bg-blue-900/30 text-[#2c3b6e] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}>{cat.name}</button>
                ))}
              </>
            )}
         </div>
      </div>
      <div>
         <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6 pb-2 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            Бренды
            {activeFilters.length > 0 && (
              <span className="bg-[#2c3b6e] dark:bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px]">{activeFilters.length}</span>
            )}
         </h3>
         <div className="space-y-1.5">

            {loading ? (

              Array.from({ length: 5 }).map((_, idx) => (

                <div key={idx} className="w-full h-9 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />

              ))

            ) : (

              availableBrands.map(brand => {

                const isSelected = activeFilters.includes(brand);

                const formattedBrand = brand.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

                return (

                  <button 

                    key={brand} 

                    onClick={() => toggleFilter(brand)} 

                    className={cn(

                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",

                      isSelected ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"

                    )}

                  >

                    <div className={cn(

                      "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",

                      isSelected ? "bg-[#2c3b6e] border-[#2c3b6e] dark:bg-blue-600 dark:border-blue-600" : "border-slate-300 dark:border-slate-700 group-hover:border-[#2c3b6e] dark:group-hover:border-blue-500"

                    )}>

                      {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}

                    </div>

                    <span className={cn(

                      "text-[12px] font-bold truncate",

                      isSelected ? "text-[#0f172a] dark:text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"

                    )}>
              {formattedBrand}</span>

                  </button>

                );

              })

            )}

         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[oklch(0.27_0.06_267.62)] transition-colors duration-300 pb-20">
      {/* Breadcrumbs */}
      <div className="w-full bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <Link href="/" className="hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            {isCatalogMode ? (
              <Link href="/catalog" className="hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors">Каталог</Link>
            ) : (
              <Link href="/outlet" className="hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors">Аутлет</Link>
            )}
            {loading && categoryParam ? (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="inline-block w-20 h-3.5 bg-slate-200 dark:bg-slate-800/40 rounded animate-pulse" />
              </>
            ) : selectedCategoryName ? (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-900 dark:text-white">{selectedCategoryName}</span>
              </>
            ) : null}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          {isCatalogMode ? (
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {loading && categoryParam ? (
                <span className="inline-block w-48 h-8 bg-slate-200 dark:bg-slate-800/40 rounded animate-pulse" />
              ) : (
                <>
                  {selectedCategoryName} <span className="text-[#2c3b6e] dark:text-blue-500">MAFF</span>
                </>
              )}
            </h1>
          ) : (
            <>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Аутлет <span className="text-slate-200 dark:text-slate-700">& Распродажа</span>
              </h1>
              {selectedCategoryName && (
                <div className="mt-3.5 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Категория:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-white/5 text-slate-900 dark:text-white rounded-full text-[11px] font-bold">
                    {selectedCategoryName}
                    <button 
                      onClick={() => setSelectedCategoryId(null)} 
                      className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-750 hover:bg-[#e11d48] hover:text-white dark:hover:bg-[#e11d48] flex items-center justify-center transition-all"
                      title="Сбросить фильтр"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
             <div className="sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto pr-4 no-scrollbar">
                {FilterContent}
             </div>
          </aside>

          {/* Main */}
          <main className="flex-grow min-w-0">
            <div className="flex items-center justify-between mb-8 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
               <span className="text-[11px] font-black text-slate-900 dark:text-white ml-2 uppercase tracking-tight">Найдено: {filteredProducts.length}</span>
               <div className="flex items-center gap-2">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none text-slate-900 dark:text-white">
                     {["Популярные", "Сначала дешевле", "Сначала дороже", "По названию"].map(opt => <option key={opt}>{opt}</option>)}
                  </select>
               </div>
            </div>

            {/* GRID */}
            {!loading && currentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
                <div className="w-10 h-10 bg-slate-200/50 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag opacity-80"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                <div className="space-y-1 max-w-xs">
                  <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Нет товаров в наличии</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                    В этой категории товаров пока нет скидок в Аутлете. Пожалуйста, выберите другую категорию или зайдите позже.
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCategoryId(null)}
                  className="px-4 py-1.5 bg-[#e11d48] text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-[#be123c] transition-colors"
                >
                  Сбросить категорию
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                 {loading ? (
                   Array.from({ length: 6 }).map((_, idx) => (
                     <div 
                       key={idx} 
                       className="bg-white dark:bg-[#161d2f] rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-2 lg:p-3 flex flex-col h-full animate-pulse"
                     >
                       {/* Image Area Skeleton */}
                       <div className="aspect-square rounded-xl lg:rounded-[2rem] bg-slate-100 dark:bg-slate-800/80 mb-3 lg:mb-4 w-full" />
                       
                       {/* Content Area Skeleton */}
                       <div className="px-1 lg:px-2 pb-1 lg:pb-2 flex flex-col flex-grow space-y-3">
                          {/* Title */}
                          <div className="h-4 bg-slate-100 dark:bg-slate-800/80 rounded w-3/4" />
                          
                          {/* Specs */}
                          <div className="space-y-1.5 pt-2">
                             <div className="flex justify-between">
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded w-1/4" />
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded w-1/3" />
                             </div>
                             <div className="flex justify-between">
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded w-1/4" />
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded w-1/3" />
                             </div>
                          </div>

                          {/* Price & Button */}
                          <div className="mt-auto pt-4 space-y-2">
                             <div className="h-8 bg-slate-100 dark:bg-slate-800/80 rounded-full w-full" />
                             <div className="h-10 bg-slate-100 dark:bg-slate-800/80 rounded-full w-full" />
                          </div>
                       </div>
                     </div>
                   ))
                 ) : currentProducts.map((product) => (
                   <ProductCard key={product.id} {...product} />
                 ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-wrap justify-center gap-2 items-center pb-10">
                <button 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-4 h-10 rounded-xl font-bold text-[11px] transition-all border",
                    currentPage === 1 
                      ? "opacity-30 cursor-not-allowed border-slate-100 dark:border-slate-800 text-slate-400" 
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-600 dark:text-white hover:border-[#2c3b6e] dark:hover:border-blue-500"
                  )}
                >
                  Назад
                </button>

                {getPaginationButtons().map((p, idx) => (
                  p === '...' ? (
                    <button 
                      key={`dots-${idx}`} 
                      onClick={() => {
                        const target = idx === 1 ? Math.max(1, currentPage - 5) : Math.min(totalPages, currentPage + 5);
                        handlePageChange(target);
                      }}
                      className="px-2 text-slate-400 dark:text-slate-600 font-bold hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors"
                      title="Пропустить 5 страниц"
                    >
                      ...
                    </button>
                  ) : (
                    <button 
                      key={`page-${p}`} 
                      onClick={() => handlePageChange(Number(p))} 
                      className={cn(
                        "w-10 h-10 rounded-xl font-bold text-[11px] transition-all", 
                        p === currentPage 
                          ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg shadow-black/20" 
                          : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:border-[#2c3b6e] dark:hover:border-blue-500 hover:text-[#2c3b6e] dark:hover:text-white"
                      )}
                    >
                      {p}
                    </button>
                  )
                ))}

                <button 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-4 h-10 rounded-xl font-bold text-[11px] transition-all border",
                    currentPage === totalPages 
                      ? "opacity-30 cursor-not-allowed border-slate-100 dark:border-slate-800 text-slate-400" 
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-600 dark:text-white hover:border-[#2c3b6e] dark:hover:border-blue-500"
                  )}
                >
                  Вперед
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3.5 rounded-full font-bold text-[11px] uppercase tracking-widest shadow-2xl flex items-center gap-2 hover:bg-black transition-colors"
        >
          <Filter className="w-4 h-4" />
          Фильтры
          {activeFilters.length > 0 && <span className="bg-[#2c3b6e] dark:bg-white dark:text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">{activeFilters.length}</span>}
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div 
            className="relative w-[300px] sm:w-[350px] h-full bg-white dark:bg-[oklch(0.27_0.06_267.62)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
          >
             <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Фильтры</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5 dark:text-white" />
                </button>
             </div>
             <div className="p-4 overflow-y-auto flex-grow no-scrollbar">
                {FilterContent}
             </div>
             <div className="p-4 border-t border-slate-100 dark:border-white/5">
               <button onClick={() => setIsFilterOpen(false)} className="w-full bg-[#2c3b6e] dark:bg-blue-600 hover:bg-[#1a1a1a] text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-[11px] transition-colors shadow-lg">Показать ({filteredProducts.length})</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OutletPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[oklch(0.27_0.06_267.62)]" />}>
      <OutletContent />
    </Suspense>
  );
}
