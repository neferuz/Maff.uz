"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  X,
  Filter,
  SlidersHorizontal,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Box,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ui/product-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  
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
  const [selectedThicknesses, setSelectedThicknesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 24; // 24 products per page feels more professional than 100

  // Handle query parameter sync
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategoryId(parseInt(categoryParam));
    } else {
      setSelectedCategoryId(null);
    }
    setSelectedThicknesses([]);
    setCurrentPage(1);
  }, [categoryParam]);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await fetch(`/api/v1/categories/?t=${Date.now()}`, { 
          cache: "no-store", 
          headers: { "Cache-Control": "no-cache" } 
        });
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
        
        const prodRes = await fetch(url, { 
          cache: "no-store", 
          headers: { "Cache-Control": "no-cache" } 
        });
        const prodData = await prodRes.json();
        const safeProducts = Array.isArray(prodData) ? prodData : [];
        setProducts(safeProducts);

        // Extract unique brands for this selection
        const uniqueBrands = Array.from(
          new Set(safeProducts.map((p: any) => p.brand).filter(Boolean))
        ) as string[];
        
        const cleanBrands = uniqueBrands
          .filter(b => typeof b === 'string' && !/^[0-9a-f-]{36}$/.test(b))
          .sort();
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

  const allFreePriceCategoryIds = useMemo(() => {
    const mainFreeCats = categories.filter(c => 
      c && c.name && (
        c.id === 8 || c.id === 359 || c.id === 174 || c.id === 13 ||
        c.name.toLowerCase().includes('двер') || 
        c.name.toLowerCase().includes('паркет') || 
        c.name.toLowerCase().includes('подложк') ||
        c.name.toLowerCase().includes('coswick') ||
        c.name.toLowerCase().includes('tarkett') ||
        c.name.toLowerCase().includes('salsa') ||
        c.name.toLowerCase().includes('s.classic') ||
        c.name.toLowerCase().includes('silkwood') ||
        c.name.toLowerCase().includes('stimul') ||
        c.name.toLowerCase().includes('ручк') ||
        c.name.toLowerCase().includes('петл')
      )
    );
    let ids: number[] = [];
    mainFreeCats.forEach(c => {
      ids = [...ids, ...getAllChildIds(c.id, categories)];
    });
    return Array.from(new Set(ids));
  }, [categories]);

  const allDoorIds = useMemo(() => {
    const mainDoorCats = categories.filter(c => c && c.name && c.name.toLowerCase().includes('двер'));
    let ids: number[] = [];
    mainDoorCats.forEach(c => {
      ids = [...ids, ...getAllChildIds(c.id, categories)];
    });
    return Array.from(new Set(ids));
  }, [categories]);

  // Compute filtered and sorted products on client side
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Exclude promotional items with no categories. 
    // We allow doors, parquets and underlayments to have price 0 (calculated on request/samples).
    // For other products, we require price >= 1000 to filter out invalid items.
    result = result.filter(p => {
      if (p.category_id === null || p.category_id === undefined) return false;
      const isFreePriceCategory = allFreePriceCategoryIds.includes(p.category_id);
      return p.price >= 1000 || isFreePriceCategory;
    });
    
    // Category descendant filtering
    if (selectedCategoryId) {
      const allRelatedIds = getAllChildIds(selectedCategoryId, categories);
      result = result.filter(p => p.category_id && allRelatedIds.includes(p.category_id));
    }
    
    // Brand filtering
    if (activeFilters.length > 0) {
      result = result.filter(p => activeFilters.includes(p.brand));
    }
    
    // Thickness filtering
    if (selectedThicknesses.length > 0) {
      result = result.filter(p => {
        const cleanThickness = (t: string) => {
          if (!t) return "";
          const m = t.match(/\d+/);
          return m ? `${m[0]} мм` : "";
        };
        const pt = cleanThickness(p.thickness || p.name.match(/\d+мм/)?.[0] || "");
        return selectedThicknesses.includes(pt);
      });
    }
    
    // Sorting logic
    const getPrice = (p: any) => p.price || 0;
    switch (sortBy) {
      case "Сначала дешевле": 
        result.sort((a, b) => getPrice(a) - getPrice(b)); 
        break;
      case "Сначала дороже": 
        result.sort((a, b) => getPrice(b) - getPrice(a)); 
        break;
      case "По названию": 
        result.sort((a, b) => a.name.localeCompare(b.name)); 
        break;
      default: 
        break;
    }
    return result;
  }, [products, selectedCategoryId, categories, activeFilters, selectedThicknesses, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const parentCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    const cat = categories.find(c => c.id === selectedCategoryId);
    if (!cat || !cat.parent_id) return null;
    return categories.find(c => c.id === cat.parent_id);
  }, [selectedCategoryId, categories]);

  const categoryPath = useMemo(() => {
    if (!selectedCategoryId || categories.length === 0) return [];
    const path = [];
    let current = categories.find(c => c.id === selectedCategoryId);
    while (current) {
      path.unshift(current);
      if (current.parent_id) {
        current = categories.find(c => c.id === current.parent_id);
      } else {
        break;
      }
    }
    return path;
  }, [selectedCategoryId, categories]);

  const isLaminateCategorySelected = useMemo(() => {
    if (!selectedCategoryId) return false;
    const allLaminateIds = getAllChildIds(1, categories);
    return allLaminateIds.includes(selectedCategoryId);
  }, [selectedCategoryId, categories]);



  // Paginated and resolved products
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage).map(p => {
      const name = p.name || "Безымянный товар";
      const nameParts = name.split(' ');
      
      // Resolve category configurations recursively (order-only, pre-order, links)
      let isOrderOnly = false;
      let isPreorder = false;
      let orderLink = "";
      let currentCat = categories.find(c => c.id === p.category_id);
      const visited = new Set();
      while (currentCat && !visited.has(currentCat.id)) {
        visited.add(currentCat.id);
        if (currentCat.is_order_only) isOrderOnly = true;
        if (currentCat.is_preorder) isPreorder = true;
        if (!orderLink && currentCat.order_link) orderLink = currentCat.order_link;
        
        if (currentCat.parent_id) {
          currentCat = categories.find(c => c.id === currentCat.parent_id);
        } else {
          break;
        }
      }
      
      const rawCountry = p.country || (name.toLowerCase().includes('турц') ? "Турция" : name.toLowerCase().includes('росс') ? "Россия" : "");
      const rawBrand = p.brand || "";
      const parsedGrade = p.grade || (name.includes('33') ? "33 класс" : name.includes('32') ? "32 класс" : "");
      const parsedThickness = p.thickness || name.match(/\d+\s*мм/i)?.[0] || name.match(/\d+мм/)?.[0] || "";

      // 1. Format brand name nicely
      let parsedBrand = rawBrand;
      const lowerRawBrand = rawBrand.toLowerCase().trim();
      if (lowerRawBrand === "volkhovets" || lowerRawBrand === "волховец") {
        parsedBrand = "Волховец";
      } else if (lowerRawBrand === "profildoors") {
        parsedBrand = "ProfilDoors";
      } else if (lowerRawBrand === "zadoor") {
        parsedBrand = "Zadoor";
      } else if (lowerRawBrand === "portika") {
        parsedBrand = "Portika";
      } else if (lowerRawBrand === "filomuro") {
        parsedBrand = "Filomuro";
      } else if (lowerRawBrand === "silkroad" || lowerRawBrand === "silk road") {
        parsedBrand = "Silk Road";
      } else if (parsedBrand) {
        parsedBrand = parsedBrand.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }

      // 2. Auto-resolve missing countries based on brands
      let parsedCountry = rawCountry;
      if (!parsedCountry && parsedBrand) {
        const brandCountryMap: Record<string, string> = {
          "волховец": "Россия",
          "volkhovets": "Россия",
          "profildoors": "Россия",
          "zadoor": "Россия",
          "portika": "Россия",
          "porta": "Россия",
          "filomuro": "Италия",
          "frida": "Китай",
          "zuber": "Китай",
          "agt": "Турция",
          "barlinek": "Польша",
          "kronopol": "Польша",
          "coswick": "Беларусь",
          "tarwood": "Беларусь",
          "egger": "Германия",
          "quick-step": "Бельгия",
          "quick step": "Бельгия",
          "alsafloor": "Франция",
          "swiss krono": "Россия",
          "kastamonu": "Россия",
          "joss beaumont": "Россия",
        };
        const lowerBrand = parsedBrand.toLowerCase().trim();
        for (const [b, c] of Object.entries(brandCountryMap)) {
          if (lowerBrand.includes(b) || b.includes(lowerBrand)) {
            parsedCountry = c;
            break;
          }
        }
      }

      return {
        id: p.id,
        title: name,
        country: parsedCountry,
        brand: parsedBrand,
        grade: parsedGrade,
        thickness: parsedThickness,
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
        discount: p.price_outlet && p.price > 0
          ? `−${Math.round(((p.price - p.price_outlet) / p.price) * 100)}%` 
          : undefined
      };
    });
  }, [currentPage, filteredProducts, allDoorIds, categories]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBrandFilter = (brand: string) => {
    setActiveFilters(prev => 
      prev.includes(brand) ? prev.filter(f => f !== brand) : [...prev, brand]
    );
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

  const mainCategories = useMemo(() => {
    return categories.filter(c => !c.parent_id);
  }, [categories]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    const cat = categories.find(c => c.id === selectedCategoryId);
    return cat ? cat.name : null;
  }, [selectedCategoryId, categories]);

  // Nested Category Tree Generator
  const renderCategoryTree = () => {
    return (
      <div className="space-y-1">
        {/* All Products Element */}
        <button
          onClick={() => {
            router.push("/catalog", { scroll: false });
            setIsFilterOpen(false);
          }}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-left transition-all duration-200 group no-shadow border",
            !selectedCategoryId
              ? "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-white/5 text-[#2c3b6e] dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
          )}
        >
          <div className="flex items-center gap-2">
            {!selectedCategoryId && <div className="w-1 h-3.5 rounded-full bg-[#2c3b6e] dark:bg-blue-400 flex-shrink-0" />}
            <Layers className={cn("w-3.5 h-3.5", !selectedCategoryId ? "text-[#2c3b6e] dark:text-blue-400" : "text-current")} />
            <span>Все товары</span>
          </div>
        </button>

        {mainCategories.map(cat => {
          const childCats = categories.filter(c => c.parent_id === cat.id);
          const hasChildren = childCats.length > 0;
          const isActive = selectedCategoryId === cat.id;
          const isChildActive = selectedCategoryId 
            ? getAllChildIds(cat.id, categories).includes(selectedCategoryId) && selectedCategoryId !== cat.id
            : false;
          const isExpanded = isActive || isChildActive;

          return (
            <div key={cat.id} className="space-y-0.5">
              <button
                onClick={() => {
                  router.push(`/catalog?category=${cat.id}`, { scroll: false });
                  if (!hasChildren) {
                    setIsFilterOpen(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-left transition-all duration-200 group no-shadow border",
                  isActive || isChildActive
                    ? "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-white/5 text-[#2c3b6e] dark:text-blue-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                )}
              >
                <div className="flex items-center gap-2">
                  {(isActive || isChildActive) && (
                    <div className={cn(
                      "w-1 h-3.5 rounded-full flex-shrink-0 transition-all duration-200",
                      isActive ? "bg-[#2c3b6e] dark:bg-blue-400" : "bg-[#2c3b6e]/40 dark:bg-blue-400/40"
                    )} />
                  )}
                  <span>{cat.name.replace(/\sMAFF$/i, '')}</span>
                </div>
                {hasChildren && (
                  <ChevronDown 
                    className={cn(
                      "w-3.5 h-3.5 text-current transition-transform duration-200", 
                      isExpanded && "rotate-180"
                    )} 
                  />
                )}
              </button>
              
              {hasChildren && isExpanded && (
                <div className="pl-3.5 pr-1 py-1 border-l border-slate-100 dark:border-white/5 ml-4 mt-0.5 space-y-0.5">
                  {childCats.map(sub => {
                    const isSubActive = selectedCategoryId === sub.id;
                    const grandchildCats = categories.filter(c => c.parent_id === sub.id);
                    const hasGrandchildren = grandchildCats.length > 0;
                    const isGrandchildActive = selectedCategoryId
                      ? getAllChildIds(sub.id, categories).includes(selectedCategoryId) && selectedCategoryId !== sub.id
                      : false;
                    const isSubExpanded = isSubActive || isGrandchildActive;

                    return (
                      <div key={sub.id} className="space-y-0.5">
                        <button
                          key={sub.id}
                          onClick={() => {
                            router.push(`/catalog?category=${sub.id}`, { scroll: false });
                            if (!hasGrandchildren) {
                              setIsFilterOpen(false);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider text-left transition-all duration-200 no-shadow",
                            isSubActive || isGrandchildActive
                              ? "text-[#2c3b6e] dark:text-blue-400 bg-[#2c3b6e]/5 dark:bg-blue-600/10 font-extrabold"
                              : "text-slate-500 dark:text-slate-400 hover:text-[#2c3b6e] dark:hover:text-blue-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-bold"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all duration-200",
                              isSubActive 
                                ? "bg-[#2c3b6e] dark:bg-blue-400 scale-125" 
                                : "bg-slate-300 dark:bg-slate-700"
                            )} />
                            <span className="truncate">{sub.name.replace(/\sMAFF$/i, '')}</span>
                          </div>
                          {hasGrandchildren && (
                            <ChevronDown 
                              className={cn(
                                "w-3 h-3 text-current transition-transform duration-200", 
                                isSubExpanded && "rotate-180"
                              )} 
                            />
                          )}
                        </button>
                        
                        {hasGrandchildren && isSubExpanded && (
                          <div className="pl-3.5 pr-1 py-1 border-l border-slate-100 dark:border-white/5 ml-4 mt-0.5 space-y-0.5">
                            {grandchildCats.map(grand => {
                              const isGrandActive = selectedCategoryId === grand.id;
                              return (
                                <button
                                  key={grand.id}
                                  onClick={() => {
                                    router.push(`/catalog?category=${grand.id}`, { scroll: false });
                                    setIsFilterOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider text-left transition-all duration-200 no-shadow",
                                    isGrandActive
                                      ? "text-[#2c3b6e] dark:text-blue-400 font-extrabold bg-[#2c3b6e]/10 dark:bg-blue-600/20"
                                      : "text-slate-400 dark:text-slate-500 hover:text-[#2c3b6e] dark:hover:text-blue-400 font-bold"
                                  )}
                                >
                                  <div className={cn(
                                    "w-1 h-1 rounded-full transition-all duration-200",
                                    isGrandActive 
                                      ? "bg-[#2c3b6e] dark:bg-blue-400 scale-125" 
                                      : "bg-slate-300/60 dark:bg-slate-700"
                                  )} />
                                  <span className="truncate">{grand.name.replace(/\sMAFF$/i, '')}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const FilterContent = (
    <div className="space-y-8">
      {/* Category Selection Tree */}
      <div>
         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4 pb-2.5 border-b border-slate-100 dark:border-white/5">Каталог</h3>
         {loading && categories.length === 0 ? (
           <div className="space-y-2">
             {Array.from({ length: 5 }).map((_, idx) => (
               <div key={idx} className="w-full h-9 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
             ))}
           </div>
         ) : (
           renderCategoryTree()
         )}
      </div>

      {/* Thickness Filter for Laminates */}
      {isLaminateCategorySelected && (
        <div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4 pb-2.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              Толщина
              {selectedThicknesses.length > 0 && (
                <span className="bg-[#2c3b6e] dark:bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold">{selectedThicknesses.length}</span>
              )}
           </h3>
           <div className="space-y-1">
              {["8 мм", "10 мм", "12 мм"].map(thickness => {
                const isSelected = selectedThicknesses.includes(thickness);
                return (
                  <button 
                    key={thickness} 
                    onClick={() => {
                      setSelectedThicknesses(prev => 
                        prev.includes(thickness) 
                          ? prev.filter(t => t !== thickness) 
                          : [...prev, thickness]
                      );
                      setCurrentPage(1);
                    }} 
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-left no-shadow",
                      isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                      isSelected ? "bg-[#2c3b6e] border-[#2c3b6e] dark:bg-blue-600 dark:border-blue-600" : "border-slate-300 dark:border-slate-700 group-hover:border-[#2c3b6e] dark:group-hover:border-blue-500"
                    )}>
                      {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={cn(
                      "text-[11px] font-bold uppercase tracking-wider",
                      isSelected ? "text-[#2c3b6e] dark:text-blue-400 font-extrabold" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                    )}>
                      {thickness}
                    </span>
                  </button>
                );
              })}
           </div>
        </div>
      )}

      {/* Brand Filters */}
      <div>
         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4 pb-2.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            Бренды
            {activeFilters.length > 0 && (
              <span className="bg-[#2c3b6e] dark:bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold">{activeFilters.length}</span>
            )}
         </h3>
         <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {loading && products.length === 0 ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="w-full h-9 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
              ))
            ) : availableBrands.length === 0 ? (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none">Бренды отсутствуют</span>
            ) : (
              availableBrands.map(brand => {
                const isSelected = activeFilters.includes(brand);
                const formattedBrand = brand.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

                return (
                  <button 
                    key={brand} 
                    onClick={() => toggleBrandFilter(brand)} 
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-left no-shadow",
                      isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                      isSelected ? "bg-[#2c3b6e] border-[#2c3b6e] dark:bg-blue-600 dark:border-blue-600" : "border-slate-300 dark:border-slate-700 group-hover:border-[#2c3b6e] dark:group-hover:border-blue-500"
                    )}>
                      {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={cn(
                      "text-[11px] font-bold uppercase tracking-wider truncate",
                      isSelected ? "text-[#2c3b6e] dark:text-blue-400 font-extrabold" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                    )}>
                      {formattedBrand}
                    </span>
                  </button>
                );
              })
            )}
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 pb-20">
      {/* Custom styled scrollbars for sidebar lists */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(44, 59, 110, 0.15);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(44, 59, 110, 0.4);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.15);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.4);
        }
      `}} />
      {/* ── Breadcrumbs ── */}
      <div className="w-full bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <nav className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <Link href="/" className="hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/catalog" className="hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors">Каталог</Link>
            
            {loading && categoryParam ? (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="inline-block w-20 h-3 bg-slate-200 dark:bg-slate-800/40 rounded animate-pulse" />
              </>
            ) : categoryPath.length > 0 ? (
              categoryPath.map((cat, idx) => {
                const isLast = idx === categoryPath.length - 1;
                return (
                  <React.Fragment key={cat.id}>
                    <ChevronRight className="w-3.5 h-3.5" />
                    {isLast ? (
                      <span className="text-slate-900 dark:text-white">{cat.name.replace(/\sMAFF$/i, '')}</span>
                    ) : (
                      <Link href={`/catalog?category=${cat.id}`} className="hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors">
                        {cat.name.replace(/\sMAFF$/i, '')}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })
            ) : null}
          </nav>
        </div>
      </div>

      {/* ── Header Area ── */}
      <section className="w-full bg-slate-50/30 dark:bg-slate-950/40 py-4 lg:py-5 border-b border-slate-100/80 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 leading-tight">
                {loading && categoryParam ? (
                  <span className="inline-block w-48 h-5 lg:h-7 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
                ) : (
                  selectedCategoryName || <>Каталог <span className="text-[#2c3b6e] dark:text-blue-500">продукции</span></>
                )}
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-[9px] lg:text-[10px] font-bold opacity-80 uppercase tracking-widest leading-none">
                Более 2000 наименований напольных покрытий, дверей и аксессуаров.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Main Catalog Workspace ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* 1. Left Sidebar (Desktop always visible) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
              {FilterContent}
            </div>
          </aside>

          {/* 2. Main content area (Desktop right side) */}
          <main className="flex-grow min-w-0">
            
            {/* Found products stat info and sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-slate-50/50 dark:bg-slate-950/20 px-4 py-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Найдено товаров: <span className="text-[#2c3b6e] dark:text-blue-400 font-extrabold">{filteredProducts.length}</span>
              </span>

              {!loading && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Сортировка:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }} 
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-[11px] font-bold outline-none text-slate-900 dark:text-white flex-grow sm:flex-grow-0"
                  >
                    {["Популярные", "Сначала дешевле", "Сначала дороже", "По названию"].map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Grid list of Products */}
            {!loading && currentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-100 dark:border-white/5 space-y-5">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl flex items-center justify-center">
                  <Box className="w-6 h-6 opacity-80" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Товары не найдены</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-normal uppercase tracking-wide opacity-80">
                    Пожалуйста, сбросьте фильтры или выберите другую подкатегорию в меню.
                  </p>
                </div>
                {(activeFilters.length > 0 || selectedThicknesses.length > 0) && (
                  <button 
                    onClick={() => {
                      setActiveFilters([]);
                      setSelectedThicknesses([]);
                      setCurrentPage(1);
                    }}
                    className="px-6 py-2.5 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-blue-500 transition-colors"
                  >
                    Сбросить все фильтры
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 lg:gap-4.5">
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white dark:bg-[#161d2f] rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-2 lg:p-3 flex flex-col h-full animate-pulse"
                    >
                      {/* Image Area Skeleton */}
                      <div className="aspect-square rounded-xl lg:rounded-[2rem] bg-slate-100 dark:bg-slate-800/85 mb-3 lg:mb-4 w-full" />
                      
                      {/* Content Area Skeleton */}
                      <div className="px-1 lg:px-2 pb-1 lg:pb-2 flex flex-col flex-grow space-y-3">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800/85 rounded w-3/4" />
                        <div className="space-y-1.5 pt-2">
                           <div className="flex justify-between">
                              <div className="h-2.5 bg-slate-100 dark:bg-slate-800/85 rounded w-1/4" />
                              <div className="h-2.5 bg-slate-100 dark:bg-slate-800/85 rounded w-1/3" />
                           </div>
                           <div className="flex justify-between">
                              <div className="h-2.5 bg-slate-100 dark:bg-slate-800/85 rounded w-1/4" />
                              <div className="h-2.5 bg-slate-100 dark:bg-slate-800/85 rounded w-1/3" />
                           </div>
                        </div>
                        <div className="mt-auto pt-4 space-y-2">
                           <div className="h-8 bg-slate-100 dark:bg-slate-800/85 rounded-full w-full" />
                           <div className="h-10 bg-slate-100 dark:bg-slate-800/85 rounded-full w-full" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  currentProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-14 flex flex-wrap justify-center gap-2 items-center pb-6">
                <button 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-4 h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border shadow-none",
                    currentPage === 1 
                      ? "opacity-35 cursor-not-allowed border-slate-100 dark:border-slate-800 text-slate-400" 
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
                      className="px-2.5 text-slate-400 dark:text-slate-500 font-extrabold hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors leading-none"
                      title="Пропустить 5 страниц"
                    >
                      ...
                    </button>
                  ) : (
                    <button 
                      key={`page-${p}`} 
                      onClick={() => handlePageChange(Number(p))} 
                      className={cn(
                        "w-10 h-10 rounded-xl font-bold text-[10px] transition-all no-shadow", 
                        p === currentPage 
                          ? "bg-slate-900 dark:bg-blue-600 text-white" 
                          : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-slate-400 hover:border-[#2c3b6e] dark:hover:border-blue-500 hover:text-[#2c3b6e] dark:hover:text-white"
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
                    "px-4 h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border shadow-none",
                    currentPage === totalPages 
                      ? "opacity-35 cursor-not-allowed border-slate-100 dark:border-slate-800 text-slate-400" 
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-600 dark:text-white hover:border-[#2c3b6e] dark:hover:border-blue-500"
                  )}
                >
                  Вперед
                </button>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* ── 3. Mobile adaptive floating bottom button (strictly center) ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden w-max max-w-[90vw]">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="bg-[#1a2544] dark:bg-blue-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-2xl flex items-center gap-1.5 sm:gap-2 active:scale-95 transition-all duration-300 border border-white/10 whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Каталог и фильтры</span>
          {(activeFilters.length > 0 || selectedThicknesses.length > 0) && (
            <span className="bg-[#f0a400] text-slate-950 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-black ml-0.5 sm:ml-1">
              {(activeFilters.length + selectedThicknesses.length)}
            </span>
          )}
        </button>
      </div>

      {/* ── 4. Mobile slide-out Drawer panel ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-40 flex justify-end pt-[72px] overflow-hidden pointer-events-none">
            {/* Blur backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto" 
              onClick={() => setIsFilterOpen(false)} 
            />
            {/* Sliding Content Container */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col rounded-t-2xl overflow-hidden pointer-events-auto"
            >
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#2c3b6e] dark:text-blue-400" />
                  <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Фильтры</h2>
                </div>
                <button 
                  onClick={() => setIsFilterOpen(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 dark:text-white" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto flex-grow no-scrollbar">
                {FilterContent}
              </div>
              
              <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20">
                <button 
                  onClick={() => setIsFilterOpen(false)} 
                  className="w-full bg-[#2c3b6e] dark:bg-blue-600 hover:bg-[#1a1a1a] text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] transition-colors shadow-lg shadow-[#2c3b6e]/10 dark:shadow-none"
                >
                  Показать ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-900" />}>
      <CatalogContent />
    </Suspense>
  );
}
